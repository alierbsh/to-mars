/**
 * The cruise, in three shots:
 *  - leaving Earth (the first 2.5 days): the ship in the foreground looking back at the planet,
 *    which shrinks from filling the sky to a marble with the Moon beside it — at its true angular
 *    size for the distance along the escape hyperbola (v∞ from the transfer). The clock runs at a
 *    fixed share of the time since the burn (store.ts: effectiveSpeed), so the planet shrinks by
 *    the same share every second; it turns at its true rate under its clouds, the cities lit on
 *    the night side;
 *  - the months between: the heliocentric map — the Sun, both orbits, both planets moving, the
 *    ship on its transfer arc (1 scene unit = 1 million km; planets not to scale);
 *  - closing on Mars (the last 1.5 days): Mars ahead, growing from a dot until it fills the view
 *    at the entry interface, turning to bring Gusev round; a dust storm veils it.
 * The close shots are drawn in kilometres around the ship (the model ×12, as in orbit). A planet
 * farther than 20,000 km is brought in to 20,000 km and shrunk by the same factor — the same
 * angular size — and drawn as a backdrop (its layers in order, writing no depth).
 */
import { Environment, Html, Lightformer, Line } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useT } from '../i18n'
import { julianDate, planetPosition } from '../sim/ephemeris'
import type { MissionResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { APPROACH_SHOT_S, DEPART_SHOT_S } from '../ui/hud'
import { EARTH_R, Earth, SUN_DIR, earthState, moonTexture, starField, sunGlowTexture } from './Earth'
import { limbCamera, marsLimbMaterial } from './marsLimb'
import { SITE_LON } from './marsSite'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { view } from './viewControl'

const BASE_URL = import.meta.env.BASE_URL
const U = 1e-6 // km → map units
/** model metres → km: the ship ×12, as in orbit, so it holds the foreground */
const SCALE = 0.012
/** km: a body farther than this is brought in to here and shrunk to match (a backdrop) */
const BACKDROP = 20_000
const MU_EARTH = 398_600
const MU_MARS = 42_828
const R_MARS_KM = 3389.5
const MOON_R = 1737.4
const MOON_DIST = 384_400
const EARTH_SPIN = (2 * Math.PI) / 86_164
const MARS_SPIN = (2 * Math.PI) / 88_642

const SPACE = new THREE.Color('#02040a')

type Shot = 'depart' | 'map' | 'arrive'

/** which shot the cruise is in at t */
export function cruiseShot(result: MissionResult | null, t: number): Shot {
  const p = result?.phases.find((x) => x.phase === 'cruise')
  if (!p) return 'map'
  if (t - p.start < DEPART_SHOT_S) return 'depart'
  if (p.end - t < APPROACH_SHOT_S) return 'arrive'
  return 'map'
}

/**
 * On a hyperbola (periapsis rp km, excess speed vinf km/s), |t| s from periapsis: the distance
 * from the planet's centre (km) and the flight-path angle (rad, between the velocity and the
 * local horizontal — 0 at periapsis, toward 90° far out, where the planet lies straight behind).
 */
function hyper(t: number, rp: number, vinf: number, mu: number): { r: number; gamma: number } {
  const a = mu / (vinf * vinf)
  const e = 1 + rp / a
  const M = Math.sqrt(mu / (a * a * a)) * Math.abs(t)
  let F = Math.asinh(M / e)
  for (let i = 0; i < 40; i++) {
    const step = (e * Math.sinh(F) - F - M) / (e * Math.cosh(F) - 1)
    F -= step
    if (Math.abs(step) < 1e-12) break
  }
  const den = e * Math.cosh(F) - 1
  const cosNu = (e - Math.cosh(F)) / den
  const sinNu = (Math.sqrt(e * e - 1) * Math.sinh(F)) / den
  return { r: a * den, gamma: Math.atan2(e * sinNu, 1 + e * cosNu) }
}

export default function CruiseScene({ vehicleId }: { vehicleId: string }) {
  const shot = useAppStore((s) => cruiseShot(s.result, s.t))
  const { scene } = useThree()
  // the scene-wide fog is for the other phases: here a planet stands 20,000 km off
  useEffect(() => {
    const fog = scene.fog
    scene.fog = null
    scene.background = SPACE
    return () => {
      scene.fog = fog
    }
  }, [scene])
  if (shot === 'depart')
    return (
      <Suspense fallback={null}>
        <Departure vehicleId={vehicleId} />
      </Suspense>
    )
  if (shot === 'arrive')
    return (
      <Suspense fallback={null}>
        <Approach vehicleId={vehicleId} />
      </Suspense>
    )
  return <CruiseMap />
}

/** the stars, the sun's glow and the light for a close shot; the stars ride with the camera */
function DeepSky({ sunIntensity, glow }: { sunIntensity: number; glow: number }) {
  const sky = useMemo(() => starField(5000, 30_000), [])
  const glowTex = useMemo(() => sunGlowTexture(), [])
  const stars = useRef<THREE.Points>(null)
  const sun = useRef<THREE.Sprite>(null)
  useFrame(({ camera }) => {
    stars.current?.position.copy(camera.position)
    sun.current?.position.copy(camera.position).addScaledVector(SUN_DIR, 30_000)
  })
  return (
    <>
      <points ref={stars} geometry={sky.geo} material={sky.mat} renderOrder={-30} frustumCulled={false} />
      <sprite ref={sun} scale={[glow, glow, 1]} renderOrder={-29}>
        <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      <directionalLight position={SUN_DIR.clone().multiplyScalar(1e4).toArray()} intensity={sunIntensity} color="#fff6e8" />
      <ambientLight intensity={0.04} color="#8fb0e0" />
    </>
  )
}

/** the ship at the origin, ×12 (the shot turns it) */
function ShipModel({ vehicleId, shipRef }: { vehicleId: string; shipRef: React.RefObject<THREE.Group | null> }) {
  const Lm = SPACECRAFT_LENGTH[vehicleId] ?? 30
  return (
    <group ref={shipRef}>
      <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + Lm / 2) * SCALE, 0]}>
        <VehicleRig id={vehicleId} mode="orbit" />
      </group>
    </group>
  )
}

/**
 * What the steel reflects out here: black space, the sun — a bright disc, spread by the hull's
 * roughness into the broad sheen of sunlit steel — and the planet nearby, a blue-white or
 * butterscotch disc where it stands.
 */
function SpaceReflections({ planet, color, size, intensity }: { planet: THREE.Vector3; color: string; size: number; intensity: number }) {
  const sun = SUN_DIR.clone().multiplyScalar(10).toArray()
  const pl = planet.clone().normalize().multiplyScalar(10).toArray()
  return (
    <Environment resolution={64}>
      <Lightformer form="circle" intensity={16} color="#fff4e2" position={sun} scale={2.4} />
      <Lightformer form="circle" intensity={intensity} color={color} position={pl} scale={size} />
    </Environment>
  )
}

/** `v` turned on screen by (right, up) degrees, for a camera whose up is `up` */
function offAxis(v: THREE.Vector3, up: THREE.Vector3, rightDeg: number, upDeg: number): THREE.Vector3 {
  const r = v.clone().cross(up).normalize()
  const u = r.clone().cross(v).normalize()
  return v
    .clone()
    .addScaledVector(r, Math.tan((rightDeg * Math.PI) / 180))
    .addScaledVector(u, Math.tan((upDeg * Math.PI) / 180))
    .normalize()
}

/**
 * A close shot's composition: the camera looks along `view`, the ship sits `dist` ship lengths off
 * along `toShip` and is turned by `q`. Wide screens keep the subjects in the left two-thirds (the
 * verdict card covers the rest); a portrait screen stacks them.
 */
interface Layout {
  view: THREE.Vector3
  toShip: THREE.Vector3
  dist: number
  q: THREE.Quaternion
}

function shipTurn(nose: THREE.Vector3, toShip: THREE.Vector3): THREE.Quaternion {
  // the tiles (the model's +z) turned away from the camera: it sees steel
  const z = toShip.clone().addScaledVector(nose, -toShip.dot(nose)).normalize()
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(nose.clone().cross(z), nose, z))
}

function Departure({ vehicleId }: { vehicleId: string }) {
  const L = (SPACECRAFT_LENGTH[vehicleId] ?? 30) * SCALE
  const earthRoot = useRef<THREE.Group>(null)
  const moon = useRef<THREE.Mesh>(null)
  const ship = useRef<THREE.Group>(null)
  const bounce = useRef<THREE.DirectionalLight>(null)
  const moonTex = useMemo(() => moonTexture(), [])
  // close in, the 0.5 km/px regional tile still helps; past ~9,000 km its palette shows as a square
  const [detail, setDetail] = useState(true)
  // the frame: the ship heads along u (its course out, fixed); the sun 70° off that line, so the
  // planet left behind ends a little over half lit, the cities on its night side. At periapsis —
  // the burn — the planet lies straight "down" (d), the ground under the ship in daylight; as the
  // ship climbs out the planet swings round behind it (the flight-path angle opening toward 90°)
  const f = useMemo(() => {
    const w = new THREE.Vector3(0, 1, 0).cross(SUN_DIR).normalize()
    const u = SUN_DIR.clone().multiplyScalar(Math.cos(1.22)).addScaledVector(w, Math.sin(1.22)).normalize()
    const up = SUN_DIR.clone().addScaledVector(u, -SUN_DIR.dot(u)).normalize() // away from the planet at periapsis
    const right = u.clone().negate().cross(up).normalize() // the camera's right, looking back
    // the Moon: 384,400 km out, beyond the planet and to its left — a dozen degrees off it by the
    // end, toward the frame's middle
    const moonDir = u.clone().multiplyScalar(-0.77).addScaledVector(right, -0.62).addScaledVector(up, 0.15).normalize()
    // the planet's turn that has the sunlit Atlantic off Florida under the ship at the burn
    const spin0 = Math.atan2(-up.z, up.x) + (60 * Math.PI) / 180
    return { u, up, right, moonDir, spin0 }
  }, [])
  // the planet ends up a little above the ship and left of the middle (wide), or straight above it (tall)
  const layouts = useMemo(() => {
    const end = f.u.clone().negate()
    const make = (tall: boolean): Layout => {
      // on a phone the lower half is the verdict and the clock: both subjects go in the upper half
      const view = offAxis(end, f.up, tall ? 0 : -2, tall ? -11 : -10)
      const toShip = offAxis(view, f.up, tall ? 0 : -8, tall ? 1 : -7)
      const r = view.clone().cross(f.up).normalize()
      const u = r.clone().cross(view).normalize()
      // the hull across the frame, nose to the left and a little toward the lens
      const nose = r.clone().multiplyScalar(-0.9).addScaledVector(u, 0.2).addScaledVector(view, -0.35).normalize()
      return { view, toShip, dist: tall ? 3.6 : 1.6, q: shipTurn(nose, toShip) }
    }
    return { wide: make(false), tall: make(true) }
  }, [f])
  const st = useMemo(() => ({ init: false, cam: new THREE.Vector3(), tmp: new THREE.Vector3(), dir: new THREE.Vector3(), look: new THREE.Vector3() }), [])

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const { result, t } = useAppStore.getState()
    const cruise = result?.phases.find((p) => p.phase === 'cruise')
    const tau = cruise ? Math.max(0, t - cruise.start) : 0
    const vinf = result?.transfer?.vInfDep ?? 3.5
    // out along the escape hyperbola: periapsis at the middle of the burn, ~53 s before it ended
    const { r: D, gamma } = hyper(tau + 53, EARTH_R + 200, vinf, MU_EARTH)
    // where the planet is from the ship: below at periapsis, swinging round behind
    const dir = st.dir.copy(f.u).multiplyScalar(-Math.sin(gamma)).addScaledVector(f.up, -Math.cos(gamma))
    if (earthRoot.current) {
      const d = Math.min(D, BACKDROP)
      earthRoot.current.position.copy(dir).multiplyScalar(d)
      earthRoot.current.scale.setScalar(d / D)
    }
    if (detail !== D < 9000) setDetail(D < 9000)
    earthState.spin = f.spin0 + EARTH_SPIN * tau
    earthState.clouds = earthState.spin + 0.3 + tau * 2e-6
    if (moon.current) {
      const m = st.tmp.copy(dir).multiplyScalar(D).addScaledVector(f.moonDir, MOON_DIST)
      const dm = m.length()
      const d = Math.min(dm, BACKDROP * 1.15)
      moon.current.position.copy(m).multiplyScalar(d / dm)
      moon.current.scale.setScalar((MOON_R * d) / dm)
    }
    // the planet's light on the ship, while it fills a good part of the sky
    if (bounce.current) {
      bounce.current.position.copy(dir).multiplyScalar(1e4)
      bounce.current.intensity = 1.2 * Math.pow(Math.min(1, EARTH_R / D), 2)
    }
    // the camera: off the ship's flank, looking back past it at the planet — at first its limb low
    // in the frame, then the whole disc rising and shrinking above the ship; a slow pull back; the
    // viewer's drag swings it about the ship
    const lay = (camera as THREE.PerspectiveCamera).aspect < 1 ? layouts.tall : layouts.wide
    ship.current?.quaternion.copy(lay.q)
    const s = Math.min(1, tau / DEPART_SHOT_S)
    const target = st.tmp
      .copy(lay.toShip)
      .multiplyScalar(-lay.dist * L * view.zoom * (1 + 0.15 * s))
      .applyAxisAngle(f.up, view.az)
      .addScaledVector(f.up, Math.sin(view.el) * L * 1.5)
    if (!st.init) {
      st.cam.copy(target)
      st.init = true
    } else st.cam.lerp(target, 1 - Math.exp(-dt * (view.dragging ? 24 : 4)))
    camera.position.copy(st.cam)
    camera.up.copy(f.up)
    camera.lookAt(st.look.copy(lay.view).applyAxisAngle(f.up, view.az).multiplyScalar(10 * L).add(st.cam))
    camera.near = 0.02
    camera.far = 40_000
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return (
    <group>
      <DeepSky sunIntensity={3.2} glow={6000} />
      <SpaceReflections planet={f.u.clone().negate()} color="#bcd4f2" size={7} intensity={0.9} />
      <directionalLight ref={bounce} intensity={0} color="#a9c5ef" />
      <Earth sky={false} far detail={detail} root={earthRoot} />
      <mesh ref={moon} renderOrder={-22}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial map={moonTex} roughness={1} depthWrite={false} transparent />
      </mesh>
      <ShipModel vehicleId={vehicleId} shipRef={ship} />
    </group>
  )
}

/** Mars: the global mosaic, veiled by a dust storm; the dusty limb (in its own frame, like Earth's) */
function MarsBody({ root, spin, veil, dust }: { root: React.RefObject<THREE.Group | null>; spin: React.RefObject<THREE.Group | null>; veil: number; dust: number }) {
  const tex = useLoader(THREE.TextureLoader, `${BASE_URL}assets/mars/mars-global.jpg`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const globe = useRef<THREE.Mesh>(null)
  const limb = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0, envMapIntensity: 0, depthWrite: false, transparent: true })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uVeil = { value: veil }
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uVeil;').replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        // a dust storm hides the ground under a butterscotch veil
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.58, 0.31, 0.13), uVeil);`,
      )
    }
    m.customProgramCacheKey = () => 'marsglobe'
    return m
  }, [tex, veil])
  const limbMat = useMemo(() => marsLimbMaterial(R_MARS_KM, 1, SUN_DIR, dust), [dust])
  useEffect(() => {
    if (limb.current) limbCamera(limb.current, limbMat)
  }, [limbMat])
  return (
    <group ref={root}>
      <group ref={spin}>
        <mesh ref={globe} material={mat} renderOrder={-20} name="marsGlobe">
          <sphereGeometry args={[R_MARS_KM, 128, 80]} />
        </mesh>
      </group>
      {/* the limb works in the root's frame, unturned, where the sun's direction holds */}
      <mesh ref={limb} material={limbMat} renderOrder={-19}>
        <sphereGeometry args={[R_MARS_KM + 90, 96, 64]} />
      </mesh>
    </group>
  )
}

function Approach({ vehicleId }: { vehicleId: string }) {
  const L = (SPACECRAFT_LENGTH[vehicleId] ?? 30) * SCALE
  const result = useAppStore((s) => s.result)
  const storm = result?.weather?.storm
  // a global storm leaves the darkest albedo marks (Syrtis, the southern highlands) only as shadows of themselves
  const veil = storm === 'global' ? 0.66 : storm === 'regional' ? 0.28 : 0
  const dust = storm === 'global' ? 1 : storm === 'regional' ? 0.4 : 0
  const marsRoot = useRef<THREE.Group>(null)
  const marsSpin = useRef<THREE.Group>(null)
  const ship = useRef<THREE.Group>(null)
  // the frame: the ship comes in along fwd; far out Mars lies straight ahead, and as it closes
  // the planet swings down under the ship (the flight-path angle closing toward the ~11° of the
  // entry). The sun 60° off the line back to the ship: a gibbous disc, the terminator on one side
  const f = useMemo(() => {
    const w = new THREE.Vector3(0, 1, 0).cross(SUN_DIR).normalize()
    const back = SUN_DIR.clone().multiplyScalar(Math.cos(1.05)).addScaledVector(w, -Math.sin(1.05)).normalize() // Mars → ship, far out
    const fwd = back.clone().negate()
    // "down" at the entry: toward the planet across the course, on its sunlit side
    const up = SUN_DIR.clone().addScaledVector(fwd, -SUN_DIR.dot(fwd)).normalize()
    const right = fwd.clone().cross(up).normalize()
    return { fwd, up, right }
  }, [])
  // the entry interface (125 km up) on the arrival hyperbola, as time before periapsis
  const tEI = useMemo(() => {
    const vinf = result?.transfer?.vInfArr ?? 2.8
    const rp = R_MARS_KM + 30
    let lo = 0
    let hi = 7200
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2
      if (hyper(mid, rp, vinf, MU_MARS).r < R_MARS_KM + 125) lo = mid
      else hi = mid
    }
    return lo
  }, [result])
  // Mars ahead a little left of the middle and up (wide), or above the ship (tall); the ship below
  // and left, seen from behind its engines
  const layouts = useMemo(() => {
    const make = (tall: boolean): Layout => {
      // on a phone: the ship's silhouette against the disc, both in the upper half
      const view = offAxis(f.fwd, f.up, tall ? 0 : 4, tall ? -10 : -5)
      const toShip = offAxis(view, f.up, tall ? 0 : -13, tall ? 1 : -10)
      return { view, toShip, dist: tall ? 2.8 : 1.45, q: shipTurn(f.fwd, toShip) }
    }
    return { wide: make(false), tall: make(true) }
  }, [f])
  const st = useMemo(() => ({ init: false, cam: new THREE.Vector3(), tmp: new THREE.Vector3(), dir: new THREE.Vector3(), look: new THREE.Vector3() }), [])

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const { result: r, t } = useAppStore.getState()
    const cruise = r?.phases.find((p) => p.phase === 'cruise')
    const left = cruise ? Math.max(0, cruise.end - t) : 0
    const vinf = r?.transfer?.vInfArr ?? 2.8
    const { r: D, gamma } = hyper(tEI + left, R_MARS_KM + 30, vinf, MU_MARS)
    // where Mars is from the ship: ahead far out, swinging down beneath it on the way in
    const dir = st.dir.copy(f.fwd).multiplyScalar(Math.sin(gamma)).addScaledVector(f.up, -Math.cos(gamma))
    if (marsRoot.current) {
      const d = Math.min(D, BACKDROP)
      marsRoot.current.position.copy(dir).multiplyScalar(d)
      marsRoot.current.scale.setScalar(d / D)
    }
    if (marsSpin.current) {
      // Mars turns at its own rate (the longitude under the ship falls as it turns east); at the
      // entry the ground below is ~20° short of Gusev
      const subLon = ((SITE_LON - 20) * Math.PI) / 180 + MARS_SPIN * left
      marsSpin.current.rotation.y = Math.atan2(dir.z, -dir.x) - subLon
    }
    // the camera: behind the ship, past its engines, Mars ahead — tilting down with the planet as
    // it swings beneath on the way in, closing a little as it grows; the drag swings it about the ship
    const lay = (camera as THREE.PerspectiveCamera).aspect < 1 ? layouts.tall : layouts.wide
    ship.current?.quaternion.copy(lay.q)
    const s = 1 - Math.min(1, left / APPROACH_SHOT_S)
    const target = st.tmp
      .copy(lay.toShip)
      .multiplyScalar(-lay.dist * L * view.zoom * (1.1 - 0.15 * s))
      .applyAxisAngle(f.up, view.az)
      .addScaledVector(f.up, Math.sin(view.el) * L * 1.5)
    if (!st.init) {
      st.cam.copy(target)
      st.init = true
    } else st.cam.lerp(target, 1 - Math.exp(-dt * (view.dragging ? 24 : 4)))
    camera.position.copy(st.cam)
    camera.up.copy(f.up)
    const tall = (camera as THREE.PerspectiveCamera).aspect < 1
    st.look.copy(lay.view).addScaledVector(dir, (tall ? 0.18 : 0.45) * (1 - Math.sin(gamma))).normalize().applyAxisAngle(f.up, view.az)
    camera.lookAt(st.look.multiplyScalar(10 * L).add(st.cam))
    camera.near = 0.02
    camera.far = 40_000
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return (
    <group>
      {/* at 1.5 AU the sun is two-fifths as bright and two-thirds the size */}
      <DeepSky sunIntensity={2.4} glow={4200} />
      <SpaceReflections planet={f.fwd} color="#d9925c" size={5} intensity={0.7} />
      <MarsBody root={marsRoot} spin={marsSpin} veil={veil} dust={dust} />
      <ShipModel vehicleId={vehicleId} shipRef={ship} />
    </group>
  )
}

/** Heliocentric map: the Sun, the orbits of Earth and Mars, both planets moving, and the ship on its arc. */
function CruiseMap() {
  const L = useT()
  const result = useAppStore((s) => s.result)
  const tr = result?.transfer ?? null
  const earth = useRef<THREE.Group>(null)
  const mars = useRef<THREE.Group>(null)
  const ship = useRef<THREE.Group>(null)
  const stars = useRef<THREE.Points>(null)
  const { scene } = useThree()
  const init = useRef(false)
  const sky = useMemo(() => starField(4000, 3000), [])
  const glowTex = useMemo(() => sunGlowTexture(), [])

  const orbits = useMemo(() => {
    const jd0 = julianDate(new Date('2026-01-01T00:00:00Z'))
    const e: THREE.Vector3[] = []
    const m: THREE.Vector3[] = []
    for (let i = 0; i <= 120; i++) {
      const pe = planetPosition('earth', jd0 + (i / 120) * 365.25)
      e.push(new THREE.Vector3(pe[0] * U, pe[2] * U, -pe[1] * U))
      const pm = planetPosition('mars', jd0 + (i / 120) * 687)
      m.push(new THREE.Vector3(pm[0] * U, pm[2] * U, -pm[1] * U))
    }
    return { e, m }
  }, [])
  const path = useMemo(() => (tr ? tr.samples.map((s) => new THREE.Vector3(s.ship[0] * U, s.ship[2] * U, -s.ship[1] * U)) : []), [tr])

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    scene.background = SPACE
    if (!tr) return
    const { t } = useAppStore.getState()
    const cruise = result!.phases.find((p) => p.phase === 'cruise')!
    const f = Math.max(0, Math.min(1, (t - cruise.start) / Math.max(cruise.end - cruise.start, 1)))
    const idx = Math.min(tr.samples.length - 1, Math.floor(f * (tr.samples.length - 1)))
    const s = tr.samples[idx]
    const toV = (p: [number, number, number]) => new THREE.Vector3(p[0] * U, p[2] * U, -p[1] * U)
    earth.current?.position.copy(toV(s.earth))
    mars.current?.position.copy(toV(s.mars))
    ship.current?.position.copy(toV(s.ship))
    // camera high above the ecliptic, framing the inner solar system; the viewer can tilt and swing it
    const R = 775 * view.zoom
    const tilt = Math.max(0.25, Math.min(1.5, 1.39 - view.el))
    const target = new THREE.Vector3(Math.sin(view.az) * R * Math.cos(tilt), R * Math.sin(tilt), Math.cos(view.az) * R * Math.cos(tilt) + 140 * Math.cos(tilt))
    if (!init.current) {
      camera.position.copy(target)
      init.current = true
    } else camera.position.lerp(target, 1 - Math.exp(-Math.min(dt, 0.5) * (view.dragging ? 24 : 3)))
    camera.up.set(0, 1, 0)
    camera.lookAt(0, 0, -20)
    camera.near = 0.5
    camera.far = 5000
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
    stars.current?.position.copy(camera.position)
  })

  if (!tr) return null
  return (
    <group>
      <points ref={stars} geometry={sky.geo} material={sky.mat} renderOrder={-30} frustumCulled={false} />
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#ffd978" />
      </mesh>
      <sprite scale={[70, 70, 1]}>
        <spriteMaterial map={glowTex} color="#ffe2a8" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      <pointLight intensity={4} distance={2000} decay={0.5} color="#fff2d0" />
      <Line points={orbits.e} color="#4f7fb8" lineWidth={1} transparent opacity={0.7} />
      <Line points={orbits.m} color="#a8482a" lineWidth={1} transparent opacity={0.7} />
      {path.length > 1 && <Line points={path} color="#e6edf3" lineWidth={1.2} dashed dashSize={3} gapSize={2} />}
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[4.5, 24, 24]} />
          <meshStandardMaterial color="#3f7fd6" roughness={0.7} />
        </mesh>
        <Html center distanceFactor={600} className="label3d">{L.ui.scene.earth}</Html>
      </group>
      <group ref={mars}>
        <mesh>
          <sphereGeometry args={[3.6, 24, 24]} />
          <meshStandardMaterial color="#c8552f" roughness={0.9} />
        </mesh>
        <Html center distanceFactor={600} className="label3d">{L.ui.scene.mars}</Html>
      </group>
      <group ref={ship}>
        <mesh>
          <sphereGeometry args={[2.2, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* above its dot: the planets' names sit below theirs, so the two never cover each other */}
        <Html center distanceFactor={600} className="label3d label3d--above">{L.ui.scene.ship}</Html>
      </group>
      <ambientLight intensity={0.25} />
    </group>
  )
}
