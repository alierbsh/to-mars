/**
 * The cruise, from the ship — one continuous shot; the camera never leaves it (the bird's-eye
 * view of the transfer is the inset in the event card, ui/CruiseInset.tsx).
 *
 * The planets are where the transfer has them (sim/transfer.ts: samples every ~2 days,
 * heliocentric), seen from the ship in a frame turned so that the sun stays where the scene's
 * lighting has it (SUN_DIR) and the ecliptic pole on the scene's north — the stars turn with that
 * frame, so over the months the sun slides across them. Next to a planet its hyperbola takes over
 * (the transfer starts and ends at the planets' centres): leaving, Earth swings from beneath the
 * ship round behind it and shrinks from filling the sky to a marble with the Moon beside it, then
 * to a point of light; arriving, Mars grows from a point of light ahead until it fills the view at
 * the entry interface, swinging beneath the ship. Each body is drawn at its true angular size: a
 * body farther than BACKDROP is brought in to BACKDROP and shrunk by the same factor and drawn as
 * a backdrop (its layers in order, writing no depth); under a few pixels across it is a point of
 * light instead.
 *
 * The camera rides with the ship through four framings, eased into each other (in mission time,
 * then smoothed in real time — the clock crosses days in a fraction of a second at 10×):
 *  - leaving (E): looking back past the ship at Earth, the hull across the frame, the sun above;
 *  - turning (P): the ship and the camera turn together a quarter round the sun's direction —
 *    Earth slides out of the frame — and hold, the ship side-on in sunlight;
 *  - heading out (M): the camera pitches round behind the ship, its nose turned to Mars, a point
 *    of light ahead (the ecliptic's north up);
 *  - arriving (A): the camera rolls to put the sun above and the planet beneath, closing in as
 *    Mars swells and swings under the ship.
 * Drawn in kilometres around the ship (the model ×12, as in orbit).
 */
import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { MissionResult, TransferResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { APPROACH_SHOT_S, DEPART_SHOT_S } from '../ui/hud'
import { EARTH_R, Earth, SUN_DIR, earthState, moonTexture, starField, sunGlowTexture } from './Earth'
import { limbCamera, marsLimbMaterial } from './marsLimb'
import { SITE_LON } from './marsSite'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { view } from './viewControl'
import { useWarm } from './warm'

const BASE_URL = import.meta.env.BASE_URL
/** model metres → km: the ship ×12, as in orbit, so it holds the foreground */
const SCALE = 0.012
/** km: a body farther than this is brought in to here and shrunk to match (a backdrop) */
const BACKDROP = 20_000
/** km: where the points of light are drawn (in front of the backdrops) */
const DOTS = 19_000
const MU_EARTH = 398_600
const MU_MARS = 42_828
const R_MARS_KM = 3389.5
const MOON_R = 1737.4
const MOON_DIST = 384_400
const MOON_MONTH = 27.32 * 86_400
const EARTH_SPIN = (2 * Math.PI) / 86_164
const MARS_SPIN = (2 * Math.PI) / 88_642
const AU = 149_597_870.7
const DAY = 86_400
/** the ecliptic's pole, heliocentric */
const ECL_Z = new THREE.Vector3(0, 0, 1)

const SPACE = new THREE.Color('#02040a')

export default function CruiseScene({ vehicleId }: { vehicleId: string }) {
  const { scene } = useThree()
  // the scene-wide fog is for the other phases: here a planet stands 20,000 km off (before the
  // first frame: the shaders are built with or without fog)
  useLayoutEffect(() => {
    const fog = scene.fog
    scene.fog = null
    scene.background = SPACE
    return () => {
      scene.fog = fog
    }
  }, [scene])
  const result = useAppStore((s) => s.result)
  const cruise = result?.phases.find((p) => p.phase === 'cruise')
  if (!result?.transfer || !cruise) return null
  return <Voyage vehicleId={vehicleId} result={result} transfer={result.transfer} cruise={cruise} />
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

/** seconds before periapsis that the arrival hyperbola crosses the entry interface (125 km up) */
function entryInterfaceTime(vinf: number): number {
  const rp = R_MARS_KM + 30
  let lo = 0
  let hi = 7200
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (hyper(mid, rp, vinf, MU_MARS).r < R_MARS_KM + 125) lo = mid
    else hi = mid
  }
  return lo
}

/** 0 → 1 as x goes from a to b (either way round), eased */
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

type Body = 'ship' | 'earth' | 'mars'

/**
 * The transfer seen from the ship: the bodies' heliocentric positions along the cruise
 * (Catmull-Rom through the samples) and the turn that carries heliocentric directions into the
 * scene — the sun (from the ship) onto SUN_DIR, the ecliptic pole onto the scene's north.
 */
export class CruiseGeometry {
  private readonly pts: Record<Body, THREE.Vector3[]>
  private readonly sceneBasis = new THREE.Matrix3()
  private readonly m = new THREE.Matrix3()
  private readonly a = new THREE.Vector3()
  private readonly b = new THREE.Vector3()
  private readonly c = new THREE.Vector3()
  /** heliocentric (unturned): the escape asymptote leaving Earth and "up" there (the sun's side) */
  readonly uH = new THREE.Vector3()
  readonly upEH = new THREE.Vector3()
  /** heliocentric: the approach asymptote (ship → Mars, far out) and "up" there (the sun's side) */
  readonly fwdH = new THREE.Vector3()
  readonly upAH = new THREE.Vector3()
  /** heliocentric: Earth → Moon at the burn (where the departure framing wants it) */
  readonly moonH = new THREE.Vector3()

  constructor(tr: TransferResult) {
    const v = (p: [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2])
    this.pts = { ship: tr.samples.map((s) => v(s.ship)), earth: tr.samples.map((s) => v(s.earth)), mars: tr.samples.map((s) => v(s.mars)) }
    const y1 = SUN_DIR.clone().normalize()
    const y2 = new THREE.Vector3(0, 1, 0).addScaledVector(y1, -y1.y).normalize()
    const y3 = y1.clone().cross(y2)
    this.sceneBasis.set(y1.x, y2.x, y3.x, y1.y, y2.y, y3.y, y1.z, y2.z, y3.z)
    const n = tr.samples.length - 1
    const p = this.pts
    // a sample in, the ship has drifted from Earth along v∞ (the ballistic arc starts at Earth's
    // centre); a sample from the end, Mars lies ahead of it along the relative velocity
    this.uH.copy(p.ship[1]).sub(p.earth[1]).normalize()
    const sun0 = p.ship[0].clone().negate().normalize()
    this.upEH.copy(sun0).addScaledVector(this.uH, -sun0.dot(this.uH)).normalize()
    this.fwdH.copy(p.mars[n - 1]).sub(p.ship[n - 1]).normalize()
    const sun1 = p.ship[n].clone().negate().normalize()
    this.upAH.copy(sun1).addScaledVector(this.fwdH, -sun1.dot(this.fwdH)).normalize()
    // the Moon beyond the planet and to its left, as the camera looking back sees it
    const right = this.uH.clone().negate().cross(this.upEH).normalize()
    this.moonH.copy(this.uH).multiplyScalar(-0.77).addScaledVector(right, -0.62).addScaledVector(this.upEH, 0.15).normalize()
  }

  /** a body's heliocentric position (km) at fraction f (0–1) of the cruise */
  at(body: Body, f: number, out: THREE.Vector3): THREE.Vector3 {
    const p = this.pts[body]
    const n = p.length - 1
    const x = Math.min(n, Math.max(0, f * n))
    const i = Math.min(n - 1, Math.floor(x))
    const t = x - i
    const p0 = p[Math.max(0, i - 1)]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[Math.min(n, i + 2)]
    const t2 = t * t
    const t3 = t2 * t
    // Catmull-Rom
    return out
      .copy(p1)
      .multiplyScalar(2)
      .addScaledVector(this.a.copy(p2).sub(p0), t)
      .addScaledVector(this.a.copy(p0).multiplyScalar(2).addScaledVector(p1, -5).addScaledVector(p2, 4).sub(p3), t2)
      .addScaledVector(this.a.copy(p1).multiplyScalar(3).sub(p0).addScaledVector(p2, -3).add(p3), t3)
      .multiplyScalar(0.5)
  }

  /** heliocentric → scene at fraction f: the sun (from the ship) onto SUN_DIR, the ecliptic pole onto the north */
  turn(f: number, out: THREE.Matrix3): THREE.Matrix3 {
    const x1 = this.at('ship', f, this.b).negate().normalize()
    const x2 = this.c.set(0, 0, 1).addScaledVector(x1, -x1.z).normalize()
    const x3 = this.a.copy(x1).cross(x2)
    // rows: the heliocentric basis (its transpose takes a vector into it)
    this.m.set(x1.x, x1.y, x1.z, x2.x, x2.y, x2.z, x3.x, x3.y, x3.z)
    return out.multiplyMatrices(this.sceneBasis, this.m)
  }
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

/** the planet the steel reflects: which, where and how large (its angular radius, rad) */
interface Refl {
  planet: 'earth' | 'mars' | null
  dir: [number, number, number]
  rho: number
}
const NO_REFL: Refl = { planet: null, dir: [0, 1, 0], rho: 0 }
/** angular radii (rad) at which the reflection is captured again as a planet grows */
const REFL_LEVELS = [1.5, 4, 10, 25, 50].map((d) => (d * Math.PI) / 180)

/**
 * What the steel reflects out here: black space, the sun — a bright disc, spread by the hull's
 * roughness into the broad sheen of sunlit steel — and the planet nearby, a blue-white or
 * butterscotch disc where it stands, as large as it looks. Captured again (the same map: the
 * materials keep their programs) when the scene's frame hands it a new one through `api`.
 */
function SpaceReflections({ api }: { api: React.RefObject<((r: Refl) => void) | null> }) {
  const [r, setR] = useState<Refl>(NO_REFL)
  useLayoutEffect(() => {
    api.current = setR
    return () => {
      api.current = null
    }
  }, [api])
  const sun = SUN_DIR.clone().multiplyScalar(10).toArray()
  const pos = new THREE.Vector3(...r.dir).multiplyScalar(10).toArray()
  return (
    <Environment resolution={64}>
      <Lightformer form="circle" intensity={16} color="#fff4e2" position={sun} scale={2.4} />
      <Lightformer form="circle" intensity={r.planet === 'earth' ? 0.9 : r.planet === 'mars' ? 0.7 : 0} color={r.planet === 'mars' ? '#d9925c' : '#bcd4f2'} position={pos} scale={20 * Math.tan(Math.min(r.rho, 1.3))} />
    </Environment>
  )
}

/** `v` turned on screen by (right, up) degrees, for a camera whose up is `up` (into `out`) */
function offAxisTo(out: THREE.Vector3, v: THREE.Vector3, up: THREE.Vector3, rightDeg: number, upDeg: number): THREE.Vector3 {
  const r = T.a.copy(v).cross(up).normalize()
  const u = T.b.copy(r).cross(v).normalize()
  return out
    .copy(v)
    .addScaledVector(r, Math.tan((rightDeg * Math.PI) / 180))
    .addScaledVector(u, Math.tan((upDeg * Math.PI) / 180))
    .normalize()
}

/** the camera's turn that looks along `view` with `up` up */
function aim(out: THREE.Quaternion, viewDir: THREE.Vector3, up: THREE.Vector3): THREE.Quaternion {
  return out.setFromRotationMatrix(T.m.lookAt(T.o, viewDir, up))
}

/** the direction (dx, dy) degrees right and up of the middle of the frame of a camera turned by `cam` */
function screenDir(out: THREE.Vector3, cam: THREE.Quaternion, dx: number, dy: number): THREE.Vector3 {
  return out.set(Math.tan((dx * Math.PI) / 180), Math.tan((dy * Math.PI) / 180), -1).normalize().applyQuaternion(cam)
}

/** the ship's turn with its nose along `nose` and the tiles (the model's +z) away from the camera: it sees steel */
function shipTurnTo(out: THREE.Quaternion, nose: THREE.Vector3, toShip: THREE.Vector3): THREE.Quaternion {
  const z = T.c.copy(toShip).addScaledVector(nose, -toShip.dot(nose)).normalize()
  const x = T.d.copy(nose).cross(z)
  return out.setFromRotationMatrix(T.m.makeBasis(x, nose, z))
}

/** scratch for the helpers above */
const T = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3(), o: new THREE.Vector3(), m: new THREE.Matrix4() }

/** a unit vector part way from a to b along the great circle (into `out`, which may be either) */
function slerpDir(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3): THREE.Vector3 {
  const ang = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1))
  if (ang < 1e-6) return out.copy(t < 0.5 ? a : b)
  const s = Math.sin(ang)
  const wa = Math.sin((1 - t) * ang) / s
  const wb = Math.sin(t * ang) / s
  return out.set(a.x * wa + b.x * wb, a.y * wa + b.y * wb, a.z * wa + b.z * wb).normalize()
}

/**
 * A framing: the camera's turn, where the ship sits on screen (degrees right and up of the
 * middle — on a wide screen in the left two-thirds, the event card covers the rest; on a portrait
 * one in the upper half), how far off it is (ship lengths) and the ship's own turn.
 */
interface Key {
  cam: THREE.Quaternion
  dx: number
  dy: number
  dist: number
  ship: THREE.Quaternion
  /** the ship's turn as the camera sees it (blended between framings, so it turns smoothly on screen) */
  rel: THREE.Quaternion
}
const newKey = (): Key => ({ cam: new THREE.Quaternion(), dx: 0, dy: 0, dist: 1, ship: new THREE.Quaternion(), rel: new THREE.Quaternion() })
const relTurn = (k: Key) => k.rel.copy(k.cam).invert().multiply(k.ship)

let dotCache: THREE.CanvasTexture | null = null
/** a point of light: a crisp core and a short glow */
function dotTexture(): THREE.CanvasTexture {
  if (dotCache) return dotCache
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.22, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.42, 'rgba(255,255,255,0.3)')
  g.addColorStop(0.7, 'rgba(255,255,255,0.06)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  dotCache = new THREE.CanvasTexture(c)
  return dotCache
}

/** a planet as a point of light, for when its disc is smaller than a few pixels */
function Dot({ dotRef, color }: { dotRef: React.RefObject<THREE.Sprite | null>; color: string }) {
  const tex = useMemo(() => dotTexture(), [])
  return (
    <sprite ref={dotRef} renderOrder={-18} visible={false}>
      <spriteMaterial map={tex} color={color} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
    </sprite>
  )
}

/**
 * A point of light where a planet is: shown as its disc falls under a few pixels across
 * (crossfading with the disc between 1.5 and 5 px), at least `px` across, `alpha` at most.
 */
function placeDot(dot: THREE.Sprite | null, dir: THREE.Vector3, discPx: number, px: number, alpha: number, worldPerPx: number) {
  if (!dot) return
  const k = 1 - smooth(1.5, 5, discPx)
  dot.visible = k > 0.01
  if (!dot.visible) return
  dot.position.copy(dir).multiplyScalar(DOTS)
  const s = Math.max(px, discPx) * 2.2 * worldPerPx
  dot.scale.set(s, s, 1)
  ;(dot.material as THREE.SpriteMaterial).opacity = alpha * k
}

/** Mars: the global mosaic, veiled by a dust storm; the dusty limb (in its own frame, like Earth's) */
function MarsBody({ root, spin, veil, dust }: { root: React.RefObject<THREE.Group | null>; spin: React.RefObject<THREE.Group | null>; veil: number; dust: number }) {
  const tex = useLoader(THREE.TextureLoader, `${BASE_URL}assets/mars/mars-global.jpg`)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
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
        <mesh material={mat} renderOrder={-20} name="marsGlobe">
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

function Voyage({ vehicleId, result, transfer, cruise }: { vehicleId: string; result: MissionResult; transfer: TransferResult; cruise: { start: number; end: number } }) {
  const L = (SPACECRAFT_LENGTH[vehicleId] ?? 30) * SCALE
  const warm = useWarm()
  const storm = result.weather?.storm
  // a global storm leaves the darkest albedo marks (Syrtis, the southern highlands) only as shadows of themselves
  const veil = storm === 'global' ? 0.66 : storm === 'regional' ? 0.28 : 0
  const dust = storm === 'global' ? 1 : storm === 'regional' ? 0.4 : 0
  const geo = useMemo(() => new CruiseGeometry(transfer), [transfer])
  const tEI = useMemo(() => entryInterfaceTime(transfer.vInfArr), [transfer])
  // the planet's turn that has the sunlit Atlantic off Florida under the ship at the burn
  const spin0 = useMemo(() => {
    const up = geo.upEH.clone().applyMatrix3(geo.turn(0, new THREE.Matrix3()))
    return Math.atan2(-up.z, up.x) + (60 * Math.PI) / 180
  }, [geo])

  const earthRoot = useRef<THREE.Group>(null)
  const moon = useRef<THREE.Mesh>(null)
  const marsRoot = useRef<THREE.Group>(null)
  const marsSpin = useRef<THREE.Group>(null)
  const ship = useRef<THREE.Group>(null)
  const bounce = useRef<THREE.DirectionalLight>(null)
  const sunLight = useRef<THREE.DirectionalLight>(null)
  const sunGlow = useRef<THREE.Sprite>(null)
  const stars = useRef<THREE.Points>(null)
  const earthDot = useRef<THREE.Sprite>(null)
  const moonDot = useRef<THREE.Sprite>(null)
  const marsDot = useRef<THREE.Sprite>(null)
  const sky = useMemo(() => starField(5000, 30_000), [])
  const glowTex = useMemo(() => sunGlowTexture(), [])
  const moonTex = useMemo(() => moonTexture(), [])
  // close in, the 0.5 km/px regional tile still helps; past ~9,000 km its palette shows as a square
  const [detail, setDetail] = useState(true)
  const reflect = useRef<((r: Refl) => void) | null>(null)

  const st = useMemo(
    () => ({
      init: false,
      refl: { planet: null as Refl['planet'], level: -1, dir: new THREE.Vector3() },
      a: 0,
      b: 0,
      c: 0,
      // the viewer's drag, eased (the camera is placed exactly from the framing: a lagging camera
      // would let the ship drift on screen while the framing turns)
      az: 0,
      el: 0,
      zoom: 1,
      R: new THREE.Matrix3(),
      R4: new THREE.Matrix4(),
      s: new THREE.Vector3(),
      rel: new THREE.Vector3(),
      u: new THREE.Vector3(),
      upE: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      upA: new THREE.Vector3(),
      pole: new THREE.Vector3(),
      dirE: new THREE.Vector3(),
      helioM: new THREE.Vector3(),
      axisM: new THREE.Vector3(),
      dirM: new THREE.Vector3(),
      moonDir: new THREE.Vector3(),
      moonPos: new THREE.Vector3(),
      v1: new THREE.Vector3(),
      v2: new THREE.Vector3(),
      v3: new THREE.Vector3(),
      v4: new THREE.Vector3(),
      v5: new THREE.Vector3(),
      yaw: new THREE.Quaternion(),
      qi: new THREE.Quaternion(),
      E: newKey(),
      P: newKey(),
      M: newKey(),
      A: newKey(),
      K: newKey(),
    }),
    [],
  )

  useFrame(({ camera, size }, rawDt) => {
    // built ahead of the cut: the planet's turn (earthState) and the camera belong to the scene on screen
    if (warm) return
    const dt = Math.min(rawDt, 0.1)
    // (the clock's own cap: on a slow device the framings keep pace with it)
    const dtClock = Math.min(rawDt, 0.3)
    const { t } = useAppStore.getState()
    const dur = Math.max(1, cruise.end - cruise.start)
    const tau = Math.min(dur, Math.max(0, t - cruise.start))
    const left = dur - tau
    const frac = tau / dur
    const cam = camera as THREE.PerspectiveCamera
    const tall = cam.aspect < 1
    const R = geo.turn(frac, st.R)
    // the two ends' frames and the ecliptic's pole, turned into the scene
    const u = st.u.copy(geo.uH).applyMatrix3(R)
    const upE = st.upE.copy(geo.upEH).applyMatrix3(R)
    const fwd = st.fwd.copy(geo.fwdH).applyMatrix3(R)
    const upA = st.upA.copy(geo.upAH).applyMatrix3(R)
    const pole = st.pole.copy(ECL_Z).applyMatrix3(R)
    const ship0 = geo.at('ship', frac, st.s)

    // Earth: where the transfer has it; the first days the escape hyperbola instead — beneath the
    // ship at the burn, swinging round behind it as it climbs out
    const De = geo.at('earth', frac, st.rel).sub(ship0).length()
    const dirE = st.dirE.copy(st.rel).applyMatrix3(R).normalize()
    const hE = hyper(tau + 53, EARTH_R + 200, transfer.vInfDep, MU_EARTH)
    const wE = smooth(2.5 * DAY, 6 * DAY, tau)
    slerpDir(st.v1.copy(u).multiplyScalar(-Math.sin(hE.gamma)).addScaledVector(upE, -Math.cos(hE.gamma)), dirE, wE, dirE)
    const dE = hE.r + (De - hE.r) * wE
    // Mars likewise: the last days on the arrival hyperbola, ahead far out, beneath at the entry
    const Dm = geo.at('mars', frac, st.rel).sub(ship0).length()
    const helioM = st.helioM.copy(st.rel).applyMatrix3(R).normalize()
    const hM = hyper(tEI + left, R_MARS_KM + 30, transfer.vInfArr, MU_MARS)
    const wM = smooth(4 * DAY, 1.5 * DAY, left)
    const dirM = slerpDir(helioM, st.v1.copy(fwd).multiplyScalar(Math.sin(hM.gamma)).addScaledVector(upA, -Math.cos(hM.gamma)), wM, st.dirM)
    // where the shot looks for it: where it is, then the asymptote it comes in along
    const axisM = slerpDir(helioM, fwd, wM, st.axisM)
    const dM = hM.r + (Dm - hM.r) * (1 - wM)

    // their sizes in pixels
    const fov = THREE.MathUtils.degToRad(cam.fov)
    const pxPerRad = size.height / fov
    const worldPerPx = (2 * DOTS * Math.tan(fov / 2)) / Math.max(1, size.height)
    const earthPx = ((2 * EARTH_R) / dE) * pxPerRad
    const marsPx = ((2 * R_MARS_KM) / dM) * pxPerRad

    // Earth: a backdrop while it is a disc, a point of light after
    if (earthRoot.current) {
      const d = Math.min(dE, BACKDROP)
      earthRoot.current.position.copy(dirE).multiplyScalar(d)
      earthRoot.current.scale.setScalar(d / dE)
      earthRoot.current.visible = earthPx > 1.5
    }
    if (detail !== dE < 9000) setDetail(dE < 9000)
    earthState.spin = spin0 + EARTH_SPIN * tau
    earthState.clouds = earthState.spin + 0.3 + tau * 2e-6
    // the Moon beside it, going round it once a month
    const moonDir = st.moonDir
      .copy(geo.moonH)
      .applyAxisAngle(ECL_Z, (2 * Math.PI * tau) / MOON_MONTH)
      .applyMatrix3(R)
    const mPos = st.moonPos.copy(dirE).multiplyScalar(dE).addScaledVector(moonDir, MOON_DIST)
    const dMoon = mPos.length()
    const moonPx = ((2 * MOON_R) / dMoon) * pxPerRad
    if (moon.current) {
      const d = Math.min(dMoon, BACKDROP * 1.15)
      moon.current.position.copy(mPos).multiplyScalar(d / dMoon)
      moon.current.scale.setScalar((MOON_R * d) / dMoon)
      moon.current.visible = moonPx > 1.5
    }
    placeDot(earthDot.current, dirE, earthPx, 4, 1, worldPerPx)
    placeDot(moonDot.current, st.v2.copy(mPos).normalize(), moonPx, 2.4, 0.5, worldPerPx)

    // Mars likewise, turning to bring Gusev round under the ship at the entry
    if (marsRoot.current) {
      const d = Math.min(dM, BACKDROP)
      marsRoot.current.position.copy(dirM).multiplyScalar(d)
      marsRoot.current.scale.setScalar(d / dM)
      marsRoot.current.visible = marsPx > 1.5
    }
    if (marsSpin.current) {
      // Mars turns at its own rate (the longitude under the ship falls as it turns east); at the
      // entry the ground below is ~20° short of Gusev
      const subLon = ((SITE_LON - 20) * Math.PI) / 180 + MARS_SPIN * left
      marsSpin.current.rotation.y = Math.atan2(dirM.z, -dirM.x) - subLon
    }
    placeDot(marsDot.current, dirM, marsPx, 4, 1, worldPerPx)

    // the sun: brighter and larger at 1 AU than at 1.5; the stars turn with the heliocentric frame
    const au = ship0.length() / AU
    if (sunLight.current) sunLight.current.intensity = 3.2 / Math.pow(au, 0.7)
    if (sunGlow.current) {
      const g = 6000 / au
      sunGlow.current.scale.set(g, g, 1)
    }
    // the planet's light on the ship while it fills a good part of the sky
    if (bounce.current) {
      const ke = Math.pow(Math.min(1, EARTH_R / dE), 2)
      const km = Math.pow(Math.min(1, R_MARS_KM / dM), 2)
      const towardEarth = ke >= km
      bounce.current.position.copy(towardEarth ? dirE : dirM).multiplyScalar(1e4)
      bounce.current.color.set(towardEarth ? '#a9c5ef' : '#e2a878')
      bounce.current.intensity = towardEarth ? 1.2 * ke : 0.9 * km
    }
    // what the steel reflects: the planet that looks larger, captured again as it grows or swings round
    {
      const rhoE = Math.asin(Math.min(1, EARTH_R / dE))
      const rhoM = Math.asin(Math.min(1, R_MARS_KM / dM))
      const rho = Math.max(rhoE, rhoM)
      const level = REFL_LEVELS.filter((x) => rho >= x).length
      const planet = level === 0 ? null : rhoE >= rhoM ? 'earth' : 'mars'
      const dir = planet === 'mars' ? dirM : dirE
      const r = st.refl
      if (reflect.current && (level !== r.level || planet !== r.planet || (planet && dir.angleTo(r.dir) > 0.2))) {
        r.level = level
        r.planet = planet
        r.dir.copy(dir)
        reflect.current({ planet, dir: [dir.x, dir.y, dir.z], rho })
      }
    }

    // —— the framings ——
    const { E, P, M, A, K } = st
    // E: off the ship's flank, looking back past it at Earth — at first its limb low in the frame,
    // then the whole disc rising and shrinking above the ship; a slow pull back
    {
      const v = offAxisTo(st.v1, st.v2.copy(u).negate(), upE, tall ? 0 : -2, tall ? -11 : -10)
      aim(E.cam, v, upE)
      E.dx = tall ? 0 : -8
      E.dy = tall ? 1 : -7
      // the hull across the frame, nose to the left and a little toward the lens
      const r = st.v3.copy(v).cross(upE).normalize()
      const uu = st.v4.copy(r).cross(v).normalize()
      const nose = st.v5.copy(r).multiplyScalar(-0.9).addScaledVector(uu, 0.2).addScaledVector(v, -0.35).normalize()
      shipTurnTo(E.ship, nose, screenDir(st.v2, E.cam, E.dx, E.dy))
      E.dist = (tall ? 3.6 : 1.6) * (1 + 0.15 * Math.min(1, tau / DEPART_SHOT_S))
    }
    // P: the same, the ship and the camera turned together about the sun's direction until the
    // camera looks along the ecliptic's pole — the nose now along the ecliptic, toward Mars's side
    {
      const S = SUN_DIR
      const from = st.v1.copy(u).negate().addScaledVector(S, u.dot(S)).normalize()
      const to = st.v2.copy(pole).addScaledVector(S, -pole.dot(S)).normalize()
      const ang = Math.atan2(st.v3.copy(from).cross(to).dot(S), from.dot(to))
      st.yaw.setFromAxisAngle(S, ang)
      P.cam.copy(E.cam).premultiply(st.yaw)
      P.ship.copy(E.ship).premultiply(st.yaw)
      P.dx = E.dx
      P.dy = E.dy
      P.dist = tall ? 4 : 2
    }
    // M: Mars a point of light ahead, up and right of the middle (above, on a portrait screen); the
    // ship below it, side-on, its nose toward the planet on screen; the ecliptic's north up. (Seen
    // side-on the steel mirrors the sun behind the camera — Mars is near opposition for months —
    // as a bright band; seen from behind it would be dark.)
    {
      const v = offAxisTo(st.v1, axisM, pole, tall ? 0 : -6, tall ? -13 : -6)
      aim(M.cam, v, pole)
      M.dx = tall ? 0 : -11
      M.dy = tall ? -1 : -2
      const toShip = screenDir(st.v2, M.cam, M.dx, M.dy)
      // along the great circle through the ship and Mars — on screen, the line from one to the other — 80° off the line of sight
      const nose = slerpDir(toShip, axisM, (80 * Math.PI) / 180 / Math.max(toShip.angleTo(axisM), 1e-3), st.v3)
      shipTurnTo(M.ship, nose, toShip)
      M.dist = tall ? 4.2 : 2.6
    }
    // A: behind the ship past its engines, Mars ahead a little left of the middle and up, the sun
    // above — tilting down with the planet as it swings beneath on the way in, closing a little
    {
      const v = offAxisTo(st.v1, fwd, upA, tall ? 0 : 4, tall ? -10 : -5)
      const toShip = offAxisTo(st.v2, v, upA, tall ? 0 : -11, tall ? 1 : -5)
      const look = st.v3.copy(v).addScaledVector(dirM, (tall ? 0.18 : 0.45) * (1 - Math.sin(hM.gamma))).normalize()
      aim(A.cam, look, upA)
      // the ship stays where the untilted view had it
      const loc = st.v4.copy(toShip).applyQuaternion(st.qi.copy(A.cam).invert())
      A.dx = THREE.MathUtils.radToDeg(Math.atan2(loc.x, -loc.z))
      A.dy = THREE.MathUtils.radToDeg(Math.atan2(loc.y, -loc.z))
      shipTurnTo(A.ship, fwd, toShip)
      A.dist = (tall ? 2.8 : 1.6) * (1.1 - 0.15 * (1 - Math.min(1, left / APPROACH_SHOT_S)))
    }
    // how far along: in mission time, eased in real time (at 10× the clock crosses these windows
    // in a fraction of a second)
    const aT = smooth(1.5 * DAY, 8 * DAY, tau)
    const bT = smooth(0.05, 0.25, frac)
    const cT = smooth(15 * DAY, 4 * DAY, left)
    if (!st.init) {
      st.a = aT
      st.b = bT
      st.c = cT
    } else {
      const k = 1 - Math.exp(-dtClock * 1.6)
      st.a += (aT - st.a) * k
      st.b += (bT - st.b) * k
      st.c += (cT - st.c) * k
    }
    const mix = (e: number, p: number, m: number, a: number) => {
      const x = e + (p - e) * st.a
      const y = x + (m - x) * st.b
      return y + (a - y) * st.c
    }
    K.cam.copy(E.cam).slerp(P.cam, st.a).slerp(M.cam, st.b).slerp(A.cam, st.c)
    // the ship's turn blended as the camera sees it: between framings it turns on screen, never
    // showing its tiles or swinging its nose at the lens on the way
    K.rel.copy(relTurn(E)).slerp(relTurn(P), st.a).slerp(relTurn(M), st.b).slerp(relTurn(A), st.c)
    K.ship.copy(K.cam).multiply(K.rel)
    K.dx = mix(E.dx, P.dx, M.dx, A.dx)
    K.dy = mix(E.dy, P.dy, M.dy, A.dy)
    K.dist = mix(E.dist, P.dist, M.dist, A.dist)

    ship.current?.quaternion.copy(K.ship)
    // the camera, `dist` ship lengths off the ship where the framing puts it on screen; the
    // viewer's drag swings it about the ship
    const kd = st.init ? 1 - Math.exp(-dt * (view.dragging ? 24 : 4)) : 1
    st.az += (view.az - st.az) * kd
    st.el += (view.el - st.el) * kd
    st.zoom += (view.zoom - st.zoom) * kd
    st.init = true
    const up = st.v1.set(0, 1, 0).applyQuaternion(K.cam)
    screenDir(st.v2, K.cam, K.dx, K.dy)
      .multiplyScalar(-K.dist * L * st.zoom)
      .applyAxisAngle(up, st.az)
      .addScaledVector(up, Math.sin(st.el) * L * 1.5)
    camera.position.copy(st.v2)
    camera.quaternion.copy(st.qi.setFromAxisAngle(up, st.az).multiply(K.cam))
    cam.near = 0.02
    cam.far = 40_000
    cam.updateProjectionMatrix()
    camera.updateMatrixWorld()

    // the sky rides with the camera
    if (sunGlow.current) sunGlow.current.position.copy(camera.position).addScaledVector(SUN_DIR, 30_000)
    if (stars.current) {
      stars.current.position.copy(camera.position)
      stars.current.quaternion.setFromRotationMatrix(st.R4.setFromMatrix3(R))
    }
  })

  return (
    <group>
      <points ref={stars} geometry={sky.geo} material={sky.mat} renderOrder={-30} frustumCulled={false} />
      <sprite ref={sunGlow} renderOrder={-29}>
        <spriteMaterial map={glowTex} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      <directionalLight ref={sunLight} position={SUN_DIR.clone().multiplyScalar(1e4).toArray()} intensity={3.2} color="#fff6e8" />
      <ambientLight intensity={0.04} color="#8fb0e0" />
      <directionalLight ref={bounce} intensity={0} color="#a9c5ef" />
      <SpaceReflections api={reflect} />
      <Suspense fallback={null}>
        <Earth sky={false} far detail={detail} root={earthRoot} />
      </Suspense>
      <mesh ref={moon} renderOrder={-22}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial map={moonTex} roughness={1} depthWrite={false} transparent />
      </mesh>
      <Suspense fallback={null}>
        <MarsBody root={marsRoot} spin={marsSpin} veil={veil} dust={dust} />
      </Suspense>
      <Dot dotRef={earthDot} color="#d6e6ff" />
      <Dot dotRef={moonDot} color="#e8e4dc" />
      <Dot dotRef={marsDot} color="#ffb98a" />
      <ShipModel vehicleId={vehicleId} shipRef={ship} />
    </group>
  )
}
