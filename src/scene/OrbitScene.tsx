/**
 * Earth orbit: the ship (model, not to scale) in the foreground, the Earth below (see Earth.tsx);
 * tankers come and go on their docking events; the departure burn lights the engines.
 *
 * The orbit and the planet's spin are cosmetic (the clock covers days a second here), steered so
 * the shots that matter happen where the scenery holds up close: each docking and the departure
 * burn are flown over the Bahamas — the 0.5 km/px regional tile — in early afternoon, the sun
 * behind the camera. The docking shot dollies in on the pair as the tanker closes; the burn gets
 * its own: the camera tucks in behind and below the engines as they light, then swings out along
 * the hull to a three-quarter view with the planet below and the plume streaming back.
 */
import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { EARTH_R, Earth, SUN_DIR, earthFixed, earthState, sunGlowTexture } from './Earth'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { view } from './viewControl'

const ALT = 200
const DAY = 86_400
/** the parking orbit's angular rate (rad/s), for the burn's real-time stretch */
const OMEGA = Math.sqrt(398_600 / Math.pow(EARTH_R + ALT, 3))
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
/** the parking orbit is inclined 28.5° (the Cape's latitude) */
const INCL = (28.5 * Math.PI) / 180
const TILT = new THREE.Matrix4().makeRotationX(-INCL)
const orbitPoint = (a: number, r = 1) => new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r).applyMatrix4(TILT)
/** the angle along the orbit closest to the sun: noon under the ship */
const SUBSOLAR = (() => {
  const ex = orbitPoint(0)
  const ez = orbitPoint(Math.PI / 2)
  return Math.atan2(ez.dot(SUN_DIR), ex.dot(SUN_DIR))
})()
/** where the close shots are flown: early afternoon — past noon, so the sun is behind the chase
 * camera and lights the ships' faces, the daylit horizon ahead — at 26.5° N on this orbit */
const SHOT_ANG = SUBSOLAR + 0.45
/** …over the Florida Straits off Bimini: Florida on the horizon, the Bahama banks below */
const SHOT_LON = -79
/** the planet's spin that puts SHOT_LON under the ship at SHOT_ANG */
const SHOT_SPIN = (() => {
  const p = orbitPoint(SHOT_ANG)
  const lat = (Math.asin(p.y) * 180) / Math.PI
  const e = earthFixed(lat, SHOT_LON)
  return Math.atan2(-p.z, p.x) - Math.atan2(-e.z, e.x)
})()
/** the departure burn's camera, in ship lengths (along the nose, out to the sunlit side, up):
 * from behind the engines out to a side view — or, on a portrait screen, up over them */
const TMI_START = new THREE.Vector3(-1.0, 0.4, 0.34)
const TMI_END = new THREE.Vector3(0.05, 1.05, 0.12)
const TMI_END_TALL = new THREE.Vector3(-1.3, 0.3, 0.6)

const N_PUFFS = 8

/**
 * The tanker's thrusters through the final approach: brief white puffs from the nose and the tail,
 * fired together on one side as it trims its closing line — real-time flickers (the clock covers
 * the approach in seconds). In the tanker's frame, km: +y the nose, the hull `len` long, `r` round.
 */
function RcsPuffs({ active, len, r }: { active: { current: number }; len: number; r: number }) {
  const tex = useMemo(() => sunGlowTexture(), [])
  const group = useRef<THREE.Group>(null)
  const puffs = useMemo(() => Array.from({ length: N_PUFFS }, () => ({ age: 9, pos: new THREE.Vector3(), dir: new THREE.Vector3() })), [])
  const next = useRef(0)
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const T = clock.elapsedTime
    // a new pair every ~0.3 s while the approach is on
    if (active.current > 0.5 && T > next.current) {
      next.current = T + 0.18 + Math.random() * 0.3
      // nose and tail thrusters on the same side together: a sideways trim of the closing line
      const ang = Math.floor(Math.random() * 4) * (Math.PI / 2) + 0.4
      for (const y of [0.36, -0.4]) {
        const p = puffs.find((x) => x.age > 0.6)
        if (!p) break
        p.dir.set(Math.cos(ang), 0, Math.sin(ang))
        p.pos.set(Math.cos(ang) * r, y * len, Math.sin(ang) * r)
        p.age = 0
      }
    }
    group.current?.children.forEach((c, i) => {
      const p = puffs[i]
      p.age += dt
      const sp = c as THREE.Sprite
      const on = p.age < 0.6
      sp.visible = on
      if (!on) return
      const f = p.age / 0.6
      // a bright jet that blooms and thins out within a few hull radii
      sp.position.copy(p.pos).addScaledVector(p.dir, r * (0.5 + 3 * Math.sqrt(f)))
      const size = r * (0.7 + 2.4 * Math.sqrt(f))
      sp.scale.set(size, size, 1)
      ;(sp.material as THREE.SpriteMaterial).opacity = 0.9 * (1 - f) * (1 - f) * Math.min(1, p.age * 30)
    })
  })
  return (
    <group ref={group}>
      {puffs.map((_, i) => (
        <sprite key={i} visible={false}>
          <spriteMaterial map={tex} color="#eef4ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

export default function OrbitScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 30
  const SCALE = 0.012 // model metres → km, exaggerated ×12 so the ship is visible against Earth
  const ship = useRef<THREE.Group>(null)
  const tanker = useRef<THREE.Group>(null)
  /** the tanker's thrusters: on through its final approach */
  const rcs = useRef(0)
  const bounce = useRef<THREE.DirectionalLight>(null)
  const sunLight = useRef<THREE.DirectionalLight>(null)
  const { scene } = useThree()
  const state = useMemo(() => ({ ang: 0, spin: SHOT_SPIN, drift: 0, init: false, tmiK: 0, camRel: new THREE.Vector3() }), [])
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), up: new THREE.Vector3(0, 1, 0) }), [])
  // the reflections are turned with the ship; the scenes after the orbit expect them upright
  useEffect(
    () => () => {
      scene.environmentRotation.set(0, 0, 0)
      scene.environmentIntensity = 1
    },
    [scene],
  )

  useFrame(({ camera }, rawDt) => {
    // a background tab hands back a huge delta on return: never let one frame jump far
    const dt = Math.min(rawDt, 0.1)
    const { result, t, playing } = useAppStore.getState()
    scene.background = new THREE.Color('#02040a')
    if (scene.fog) (scene.fog as THREE.Fog).color.set('#02040a')
    // the docking in progress, if any: days from it, and the weight of the docking shot (in
    // from 1.7 days before to a day after, eased at both ends)
    const docks = vehicle.refuelable && result?.leo ? result.leo.events.filter((e) => e.label.startsWith('Tanker')) : []
    const next = docks.find((e) => Math.abs(e.t - t) < 2.5 * DAY)
    const dDays = next ? (t - next.t) / DAY : 0
    const dockK = next ? smooth((dDays + 1.7) / 0.4) * smooth((1.0 - dDays) / 0.3) : 0
    // the departure burn's shot: on from a few hours before ignition (the clock is slowing into
    // the moment then) to the end of the burn, eased in real time — the clock runs at days a
    // second on the way in, a second a second through ignition
    const tmi = result?.phases.find((p) => p.phase === 'tmi')
    const tmiOn = !!tmi && t > tmi.start - 0.12 * DAY && t <= tmi.end
    state.tmiK += ((tmiOn ? 1 : 0) - state.tmiK) * (1 - Math.exp(-dt * 2.2))
    if (!state.init && tmiOn) state.tmiK = 1
    const tmiK = smooth(state.tmiK)
    const shotK = Math.max(dockK, tmiK)
    // the shot's angle along the orbit: fixed through a docking (the clock covers a day a second
    // there), moving at the orbit's true rate through the burn
    const burnSec = tmi ? Math.min(Math.max(t - tmi.start, -30), tmi.end - tmi.start) : 0
    const shotAng = SHOT_ANG + (tmiK > dockK ? OMEGA * burnSec : 0)

    // start where the clock says (a 90-minute orbit), then drift slowly in real time; a shot
    // swings the orbit round to its point (at most 0.8 rad per real second)
    if (!state.init) state.ang = shotK > 0.5 ? shotAng : ((t / 5400) % 1) * Math.PI * 2
    if (playing) state.ang += dt * 0.03 * (1 - shotK)
    if (shotK > 0.001) {
      const d = wrap(shotAng - state.ang)
      state.ang += Math.sign(d) * Math.min(Math.abs(d) * (1 - Math.exp(-dt * 2.5)), 0.8 * dt) * Math.max(shotK, 0.35)
    }
    // the planet turns slowly in real time and comes round to put the Bahamas under a shot
    if (!state.init) state.spin = shotK > 0.5 ? SHOT_SPIN : SHOT_SPIN + 2.2
    if (playing) state.spin += dt * 0.004 * (1 - shotK)
    if (shotK > 0.001) {
      const d = wrap(SHOT_SPIN - state.spin)
      state.spin += Math.sign(d) * Math.min(Math.abs(d) * (1 - Math.exp(-dt * 2.5)), 0.5 * dt) * Math.max(shotK, 0.35)
    }
    state.drift += dt * 0.0015
    earthState.spin = state.spin
    earthState.clouds = state.spin + state.drift

    const r = EARTH_R + ALT
    const pos = orbitPoint(state.ang, r)
    const velDir = new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang)).applyMatrix4(TILT)
    const upv = pos.clone().normalize()
    if (ship.current) {
      ship.current.position.copy(pos)
      // fly "horizontal": nose along the velocity direction, belly toward Earth
      const m = new THREE.Matrix4().makeBasis(upv.clone().cross(velDir).negate(), velDir, upv)
      ship.current.quaternion.setFromRotationMatrix(m)
    }
    // light thrown back by the planet below: from underneath, bluish, as strong as the ground
    // under the ship is sunlit
    if (bounce.current) {
      bounce.current.position.copy(upv).multiplyScalar(-1e4)
      bounce.current.intensity = 0.05 + 0.75 * THREE.MathUtils.smoothstep(upv.dot(SUN_DIR), -0.1, 0.5)
    }
    // eclipse: past the terminator the ray from the ship to the sun skims the planet, `graze` km
    // above it at its lowest. Under ~45 km it crosses the air edge-on and arrives reddened (the
    // orbital sunset, a few seconds after the ground below has gone dark); under ~10 km nothing
    // gets through (the sun's disc and refraction soften the edge over a few km) and the hull goes dark
    if (sunLight.current) {
      const along = pos.dot(SUN_DIR)
      const graze = along > 0 ? 1e4 : Math.sqrt(Math.max(0, pos.lengthSq() - along * along)) - EARTH_R
      const red = 1 - THREE.MathUtils.smoothstep(graze, 8, 45)
      sunLight.current.intensity = 3.2 * THREE.MathUtils.smoothstep(graze, -6, 14)
      sunLight.current.color.setRGB(1, 0.92 - 0.66 * red, 0.81 - 0.75 * red) // #fff6e8 → deep orange
    }
    // reflections: the environment (the planet below, black above) turned to the ship's up, and
    // as bright as the ground under the ship is lit (a night pass reflects almost nothing)
    tmp.q.setFromUnitVectors(tmp.up.set(0, 1, 0), upv)
    scene.environmentRotation.setFromQuaternion(tmp.q)
    scene.environmentIntensity = 0.03 + 0.97 * THREE.MathUtils.smoothstep(upv.dot(SUN_DIR), -0.12, 0.3)

    // the tanker closes from behind, beside and a little below over the last day and a half (the
    // clock crawls through this — see hud.ts: momentsAt), holds docked for a few hours, then
    // backs away
    const tankerPos = new THREE.Vector3()
    if (tanker.current) {
      if (next) {
        const a = dDays < 0 ? -dDays : Math.max(0, dDays - 0.3) // the approach measure; docked for 0.3 d after
        // km off the slot: a gentle quadratic close over the last 1.5 days, far before that
        const off = 1.0 * Math.pow(Math.min(a, 1.5) / 1.5, 2) + 5 * Math.pow(Math.max(0, a - 1.5), 2)
        const side = upv.clone().cross(velDir).normalize()
        tankerPos
          .copy(pos)
          .add(side.multiplyScalar(0.18 + off))
          .add(velDir.clone().multiplyScalar(-0.5 * off))
          .add(upv.clone().multiplyScalar(-0.15 * off))
        tanker.current.visible = true
        rcs.current = dDays > -1.3 && dDays < -0.01 ? 1 : 0
        tanker.current.position.copy(tankerPos)
        tanker.current.quaternion.copy(ship.current!.quaternion)
      } else {
        tanker.current.visible = false
        rcs.current = 0
      }
    }
    const vel = velDir.clone()
    const side = upv.clone().cross(vel).normalize()
    const shipLen = L * SCALE
    // a portrait screen (a phone) is narrow: the close shots stand back so the ship fits across it
    const aspect = (camera as THREE.PerspectiveCamera).aspect ?? 1
    const portrait = aspect < 1 ? Math.min(2.2, 0.95 / aspect) : 1
    // chase camera: behind, above and to the side, looking forward along the orbit so the horizon
    // shows; for a docking it dollies in and swings to the far side, looking at the pair; through
    // a docking the distance follows the pair's separation, so both stay in frame as the tanker
    // closes and the shot tightens with it
    const sep = dockK > 0 ? tankerPos.distanceTo(pos) : 0
    const dockDist = (shipLen * 2.1 + sep * 1.0) * portrait
    const dist = (shipLen * 3.0 * (1 - dockK) + dockDist * dockK) * view.zoom
    // the chase offset, swung about the local vertical by the viewer's drag; the docking shot
    // comes round to the far side and drops a little, looking ~24° down across the pair so the
    // daylit horizon sits in the upper third
    const horiz = vel
      .clone()
      .multiplyScalar(-0.9 + 0.1 * dockK)
      .add(side.clone().multiplyScalar(0.7 - 1.3 * dockK))
      .normalize()
      .applyAxisAngle(upv, -view.az)
    const chase = pos.clone().add(horiz.multiplyScalar(dist * (1.14 - 0.3 * dockK) * Math.cos(view.el))).add(upv.clone().multiplyScalar(dist * (0.5 - 0.12 * dockK + 1.1 * Math.sin(view.el))))
    // look ahead along the orbit (on a narrow screen, at the ship: ahead would put it out of the
    // frame); through a docking, at the point between the two ships
    const ahead = pos.clone().add(vel.clone().multiplyScalar(dist * (aspect < 1 ? 0.04 : 0.3)))
    const pair = pos.clone().lerp(tankerPos, 0.5)
    const look = ahead.lerp(pair, dockK)

    // the burn: in behind and above the engines as they light (the bells, the plume streaming
    // back past the lens, the planet beyond), then out along the hull to the sunward side with
    // the limb behind — the 12 s the clock holds at 1×. A portrait screen cannot hold the ship
    // side-on: it rises instead, high over the engines, the hull running up the frame to the horizon
    const camTarget = chase
    if (tmiK > 0.001) {
      // 0 → 1 across the shot, by the mission clock (which holds at 1× through the first 14 s)
      const s = smooth((t - (tmi?.start ?? t) - 1) / 11)
      // offsets in ship lengths: (along the nose, out to the side, up from the planet)
      const o = (aspect < 1 ? TMI_START.clone().lerp(TMI_END_TALL, s).multiplyScalar(Math.min(1.6, 0.75 / aspect)) : TMI_START.clone().lerp(TMI_END, s)).multiplyScalar(shipLen * view.zoom)
      const sideSun = side.dot(SUN_DIR) >= 0 ? 1 : -1 // the side the sun lights
      // the viewer's drag swings the burn camera about the ship too
      const rel = new THREE.Vector3().addScaledVector(vel, o.x).addScaledVector(side, o.y * sideSun).addScaledVector(upv, o.z).applyAxisAngle(upv, -view.az)
      rel.addScaledVector(upv, Math.sin(view.el) * shipLen * 1.5)
      const burnLook = pos.clone().addScaledVector(vel, shipLen * (0.05 - 0.35 * (1 - s))).addScaledVector(upv, -shipLen * 0.05)
      camTarget.lerp(pos.clone().add(rel), tmiK)
      look.lerp(burnLook, tmiK)
    }
    // the camera is smoothed in the ship's frame: the ship itself moves at kilometres a second
    // (the orbit's drift, the burn at the true orbital rate), which a world-space lag would trail
    const camRel = camTarget.sub(pos)
    if (!state.init) {
      state.camRel.copy(camRel)
      state.init = true
    } else state.camRel.lerp(camRel, 1 - Math.exp(-Math.min(dt, 0.5) * (view.dragging ? 24 : 6)))
    camera.position.copy(pos).add(state.camRel)
    camera.up.copy(upv)
    // on a wide screen the verdict card covers the right third: aim right of the subject so it
    // sits left of centre
    if (shotK > 0 && aspect > 1.2) {
      const right = look.clone().sub(camera.position).normalize().cross(upv).normalize()
      look.addScaledVector(right, dist * 0.1 * shotK)
    }
    camera.lookAt(look)
    // the near plane as far out as the subject allows: depth precision for the clouds and the
    // regional tile over the globe (the low tier has no logarithmic depth buffer)
    camera.near = THREE.MathUtils.clamp(camera.position.distanceTo(pos) * 0.04, 0.01, 2)
    camera.far = 40_000
    camera.updateProjectionMatrix()
  })

  const sun = SUN_DIR.clone().multiplyScalar(30_000)
  return (
    <group>
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      {/* what the steel reflects: the planet filling the sky below (bright, blue-white, brightest
          toward the horizon), black space above — turned to each ship's up every frame */}
      <Environment resolution={64}>
        <Lightformer form="circle" intensity={1.1} color="#9db9e2" position={[0, -10, 0]} rotation-x={-Math.PI / 2} scale={22} />
        <Lightformer form="ring" intensity={1.6} color="#c9dcf5" position={[0, -2.4, 0]} rotation-x={-Math.PI / 2} scale={18} />
      </Environment>
      <group ref={ship}>
        <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
          <VehicleRig id={vehicleId} mode="orbit" />
        </group>
      </group>
      {vehicle.refuelable && (
        <group ref={tanker} visible={false}>
          <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
            <VehicleRig id={vehicleId} mode="orbit" />
          </group>
          <RcsPuffs active={rcs} len={L * SCALE} r={4.6 * SCALE} />
        </group>
      )}
      <directionalLight ref={sunLight} position={sun.toArray()} intensity={3.2} color="#fff6e8" />
      {/* earthshine: light thrown up by the planet below */}
      <directionalLight ref={bounce} intensity={0.5} color="#a9c5ef" />
      <ambientLight intensity={0.04} color="#8fb0e0" />
    </group>
  )
}
