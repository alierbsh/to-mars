/**
 * Earth orbit: the ship (model, not to scale) in the foreground, the Earth below (see Earth.tsx);
 * tankers come and go on their docking events; the TMI burn lights the engines.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { EARTH_R, Earth, SUN_DIR } from './Earth'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { view } from './viewControl'

const ALT = 200
const DAY = 86_400
const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}
/** the parking orbit is inclined 28.5° (the Cape's latitude): the ship passes over varied latitudes */
const INCL = (28.5 * Math.PI) / 180
/** the angle along the (tilted) parking orbit closest to the sun: noon under the ship */
const SUBSOLAR = Math.atan2(-Math.sin(INCL) * SUN_DIR.y + Math.cos(INCL) * SUN_DIR.z, SUN_DIR.x)
/** where a docking is shown: early afternoon — past noon, so the sun is behind the chase camera
 * and lights the faces of the two ships, with the daylit horizon ahead */
const DOCK_ANG = SUBSOLAR + 0.45

export default function OrbitScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 30
  const SCALE = 0.012 // model metres → km, exaggerated ×12 so the ship is visible against Earth
  const ship = useRef<THREE.Group>(null)
  const tanker = useRef<THREE.Group>(null)
  const { scene } = useThree()
  const state = useMemo(() => ({ ang: 0, init: false }), [])

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
    // start where the clock says (a 90-minute orbit), then drift slowly in real time; a docking
    // is shown in daylight: the orbit (cosmetic — the clock is covering days here) swings round
    // to the point under the sun, at most 0.8 rad per real second
    if (!state.init) state.ang = dockK > 0.5 ? DOCK_ANG : ((t / 5400) % 1) * Math.PI * 2
    if (playing) state.ang += dt * 0.03
    if (dockK > 0.001) {
      let d = DOCK_ANG - state.ang
      d = Math.atan2(Math.sin(d), Math.cos(d))
      state.ang += Math.sign(d) * Math.min(Math.abs(d) * (1 - Math.exp(-dt * 2.5)), 0.8 * dt) * dockK
    }
    const r = EARTH_R + ALT
    const tilt = new THREE.Matrix4().makeRotationX(INCL)
    const pos = new THREE.Vector3(Math.cos(state.ang) * r, 0, Math.sin(state.ang) * r).applyMatrix4(tilt)
    const velDir = new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang)).applyMatrix4(tilt)
    if (ship.current) {
      ship.current.position.copy(pos)
      // fly "horizontal": nose along the velocity direction, belly toward Earth
      const vel = velDir.clone()
      const up = pos.clone().normalize()
      const m = new THREE.Matrix4().makeBasis(up.clone().cross(vel).negate(), vel, up)
      ship.current.quaternion.setFromRotationMatrix(m)
    }
    // the tanker closes from behind, beside and a little below over the last day and a half (the
    // clock crawls through this — see hud.ts: momentsAt), holds docked for a few hours, then
    // backs away
    const tankerPos = new THREE.Vector3()
    if (tanker.current) {
      if (next) {
        const a = dDays < 0 ? -dDays : Math.max(0, dDays - 0.3) // the approach measure; docked for 0.3 d after
        // km off the slot: a gentle quadratic close over the last 1.5 days, far before that
        const off = 1.0 * Math.pow(Math.min(a, 1.5) / 1.5, 2) + 5 * Math.pow(Math.max(0, a - 1.5), 2)
        const side = pos.clone().normalize().cross(velDir).normalize()
        tankerPos
          .copy(pos)
          .add(side.multiplyScalar(0.18 + off))
          .add(velDir.clone().multiplyScalar(-0.5 * off))
          .add(pos.clone().normalize().multiplyScalar(-0.15 * off))
        tanker.current.visible = true
        tanker.current.position.copy(tankerPos)
        tanker.current.quaternion.copy(ship.current!.quaternion)
      } else tanker.current.visible = false
    }
    // chase camera: behind, above and to the side, looking forward along the orbit so the horizon
    // shows; for a docking it dollies in and swings to the far side, looking at the pair
    // through a docking the distance follows the pair's separation, so both stay in frame as the
    // tanker closes and the shot tightens with it
    const sep = dockK > 0 ? tankerPos.distanceTo(pos) : 0
    const dockDist = L * SCALE * 2.1 + sep * 1.0
    const dist = (L * SCALE * 3.0 * (1 - dockK) + dockDist * dockK) * view.zoom
    const vel = velDir.clone()
    const upv = pos.clone().normalize()
    const side = upv.clone().cross(vel).normalize()
    // the chase offset, swung about the local vertical by the viewer's drag; the docking shot
    // comes round to the far side and drops a little, looking ~24° down across the pair so the
    // daylit limb sits in the upper third (from straight above, the low-resolution cloud map
    // reads as grey fog)
    const horiz = vel
      .clone()
      .multiplyScalar(-0.9 + 0.1 * dockK)
      .add(side.clone().multiplyScalar(0.7 - 1.3 * dockK))
      .normalize()
      .applyAxisAngle(upv, -view.az)
    const camTarget = pos.clone().add(horiz.multiplyScalar(dist * (1.14 - 0.3 * dockK) * Math.cos(view.el))).add(upv.clone().multiplyScalar(dist * (0.5 - 0.12 * dockK + 1.1 * Math.sin(view.el))))
    if (!state.init) {
      camera.position.copy(camTarget)
      state.init = true
    } else camera.position.lerp(camTarget, 1 - Math.exp(-Math.min(dt, 0.5) * (view.dragging ? 24 : 6)))
    camera.up.copy(upv)
    // look ahead along the orbit; through a docking, at the point between the two ships
    const ahead = pos.clone().add(vel.clone().multiplyScalar(dist * 0.3))
    const pair = pos.clone().lerp(tankerPos, 0.5)
    const look = ahead.lerp(pair, dockK)
    // on a wide screen the verdict card covers the right third: aim right of the pair so it
    // sits left of centre
    const aspect = (camera as THREE.PerspectiveCamera).aspect ?? 1
    if (dockK > 0 && aspect > 1.2) {
      const right = look.clone().sub(camera.position).normalize().cross(upv).normalize()
      look.addScaledVector(right, dist * 0.1 * dockK)
    }
    camera.lookAt(look)
    camera.near = 0.01
    camera.far = 40_000
    camera.updateProjectionMatrix()
  })

  const sun = SUN_DIR.clone().multiplyScalar(30_000)
  return (
    <group>
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
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
        </group>
      )}
      <directionalLight position={sun.toArray()} intensity={3.2} color="#fff6e8" />
      {/* earthshine on the ship's underside, faint night side */}
      <directionalLight position={[-sun.x, -sun.y, -sun.z]} intensity={0.25} color="#7fa6d8" />
      <ambientLight intensity={0.08} color="#8fb0e0" />
    </group>
  )
}
