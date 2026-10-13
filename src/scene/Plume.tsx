/**
 * Engine plumes as fire. Each plume is a surface of revolution (a hull) whose vertex shader
 * shapes it — a near-cylindrical sea-level flame with a tapered tail, widening into a bell as
 * the air thins — and whose fragment shader fills it with turbulence: three octaves of value
 * noise scrolling along the axis at exhaust speed, ragged tongues at the tail, a soft silhouette
 * (density falls where the hull turns away from the eye, so it reads as a volume), shock
 * diamonds in the first lengths, and a colour ramp from a white-hot core through yellow to
 * orange, drifting to violet-blue in vacuum. Three layers per plume: a wide faint glow, the
 * flame body (additive) and a bright opaque core, all through the tone mapper so the core
 * overexposes to white the way it does on camera. A warm point light goes with it.
 *
 * `throttle` 0–1 switches and scales it; `expansion` 1 (sea level) → 4 (vacuum) widens it.
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { hash2 } from './noise'

export type PlumeKind = 'methalox' | 'kerolox' | 'hydrolox' | 'solid' | 'hypergolic' | 'plasma'

export function plumeKindFor(label: string): PlumeKind {
  const l = label.toLowerCase()
  if (l.includes('solid')) return 'solid'
  if (l.includes('raptor') || l.includes('be-4') || l.includes('yf-215') || l.includes('archimedes')) return 'methalox'
  if (l.includes('rs-25') || l.includes('rl10') || l.includes('j-2') || l.includes('be-3') || l.includes('yf-75') || l.includes('vinci') || l.includes('vulcain')) return 'hydrolox'
  if (l.includes('draco') || l.includes('aj10') || l.includes('hypergol')) return 'hypergolic'
  return 'kerolox'
}

interface Look {
  core: THREE.Color
  mid: THREE.Color
  outer: THREE.Color
  vac: THREE.Color
  /** overall brightness of the flame body */
  gain: number
  /** how opaque the body is (0 = clear gas) */
  alpha: number
  /** sooty darkening of the tail (kerosene) */
  soot: number
  /** length multiplier */
  length: number
  /** light colour */
  light: string
}

const LOOK: Record<PlumeKind, Look> = {
  methalox: { core: new THREE.Color(1.0, 0.97, 0.9), mid: new THREE.Color(1.0, 0.64, 0.22), outer: new THREE.Color(1.0, 0.36, 0.08), vac: new THREE.Color(0.55, 0.62, 1.0), gain: 1.0, alpha: 0.92, soot: 0.0, length: 1.35, light: '#ffb070' },
  kerolox: { core: new THREE.Color(1.0, 0.92, 0.72), mid: new THREE.Color(1.0, 0.64, 0.2), outer: new THREE.Color(0.92, 0.32, 0.06), vac: new THREE.Color(0.95, 0.62, 0.4), gain: 1.0, alpha: 0.95, soot: 0.55, length: 1.7, light: '#ff9a40' },
  hydrolox: { core: new THREE.Color(0.92, 0.96, 1.0), mid: new THREE.Color(0.75, 0.86, 1.0), outer: new THREE.Color(0.6, 0.75, 1.0), vac: new THREE.Color(0.5, 0.62, 1.0), gain: 0.75, alpha: 0.32, soot: 0.0, length: 0.9, light: '#bcd2ff' },
  solid: { core: new THREE.Color(1.0, 0.96, 0.88), mid: new THREE.Color(1.0, 0.82, 0.52), outer: new THREE.Color(1.0, 0.56, 0.24), vac: new THREE.Color(1.0, 0.7, 0.5), gain: 1.15, alpha: 1.0, soot: 0.35, length: 2.6, light: '#ffc080' },
  hypergolic: { core: new THREE.Color(1.0, 0.92, 0.82), mid: new THREE.Color(1.0, 0.8, 0.6), outer: new THREE.Color(0.95, 0.68, 0.5), vac: new THREE.Color(0.9, 0.8, 0.9), gain: 0.8, alpha: 0.6, soot: 0.0, length: 1.0, light: '#ffd0b0' },
  // the ionised wake of an entry: white-pink at the body, magenta and violet trailing off
  plasma: { core: new THREE.Color(1.0, 0.93, 0.96), mid: new THREE.Color(1.0, 0.62, 0.8), outer: new THREE.Color(0.85, 0.32, 0.62), vac: new THREE.Color(0.7, 0.35, 0.9), gain: 0.9, alpha: 0.55, soot: 0.0, length: 1.0, light: '#ff8ab0' },
}

const NOISE_GLSL = /* glsl */ `
float pHash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = pHash(i), b = pHash(i + vec3(1, 0, 0)), c = pHash(i + vec3(0, 1, 0)), d = pHash(i + vec3(1, 1, 0));
  float e = pHash(i + vec3(0, 0, 1)), g = pHash(i + vec3(1, 0, 1)), h = pHash(i + vec3(0, 1, 1)), k = pHash(i + vec3(1, 1, 1));
  return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}
float fbm3(vec3 p) {
  return vnoise(p) * 0.5 + vnoise(p * 2.03 + 11.0) * 0.3 + vnoise(p * 4.1 + 23.0) * 0.2;
}
`

const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
#include <fog_pars_vertex>
${NOISE_GLSL}
uniform float uTime;
uniform float uLength;
uniform float uRadius;
uniform float uExp;
uniform float uLayer; // 0 glow, 1 body, 2 core
varying float vS;
varying float vA;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;

float profile(float s, float k) {
  // sea level: a slight neck behind the nozzle, then a slow widening and a tapered tail;
  // vacuum: a bell that opens fast behind the nozzle and keeps widening
  float sl = (1.05 + 0.6 * s) * sqrt(max(0.0, 1.0 - pow(s, 2.6)));
  float vac = (0.9 + 2.8 * pow(s, 0.5)) * sqrt(max(0.0, 1.0 - pow(s, 3.0)));
  return mix(sl, vac, k);
}

void main() {
  float s = uv.y;
  float a = uv.x * 6.2831853;
  float k = clamp((uExp - 1.0) / 3.0, 0.0, 1.0);
  // the silhouette boils: slow lumps near the nozzle, big ragged motion toward the tail
  float wob = 1.0 + (fbm3(vec3(cos(a) * 1.2, sin(a) * 1.2, s * 3.5 - uTime * 2.2)) - 0.5) * (0.16 + 0.7 * s * s) * (1.0 - 0.6 * k);
  float r = uRadius * profile(s, k) * wob;
  vec3 p = vec3(cos(a) * r, -s * uLength, sin(a) * r);
  vec3 n = normalize(vec3(cos(a), 0.25 * s, sin(a)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vS = s;
  vA = a;
  vN = normalize(normalMatrix * n);
  vV = normalize(-mv.xyz);
  vP = p;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
  vec4 mvPosition = mv;
  #include <fog_vertex>
}
`

const FRAG = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
#include <fog_pars_fragment>
${NOISE_GLSL}
uniform float uTime;
uniform float uLength;
uniform float uRadius;
uniform float uExp;
uniform float uThrottle;
uniform float uLayer;
uniform float uSeed;
uniform float uGain;
uniform float uAlpha;
uniform float uSoot;
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uOuter;
uniform vec3 uVac;
varying float vS;
varying float vA;
varying vec3 vN;
varying vec3 vV;
varying vec3 vP;

void main() {
  #include <logdepthbuf_fragment>
  float k = clamp((uExp - 1.0) / 3.0, 0.0, 1.0);
  // turbulence scrolling down the plume (seamless around the axis through cos/sin): lumps, and
  // streaks drawn out along the axis by the exhaust
  vec3 q = vec3(cos(vA) * 2.0, sin(vA) * 2.0, vS * (7.0 - 3.5 * k) - uTime * 3.0 + uSeed);
  float n = fbm3(q);
  float streak = fbm3(vec3(cos(vA) * 4.5, sin(vA) * 4.5, vS * 2.2 - uTime * 5.0 + uSeed) + 7.0);
  float n2 = vnoise(q * 3.1 + vec3(0.0, 0.0, uTime * 2.0));
  // high-contrast lumps and axial streaks: these show in the brightness as well as the density,
  // so the flame reads as fire rather than a tinted tube even where it is opaque
  float lumps = smoothstep(0.3, 0.75, n);
  float st = smoothstep(0.35, 0.8, streak);
  // ragged tongues at the tail; thinner, longer in vacuum
  float tail = smoothstep(1.0, 0.6 - 0.2 * k, vS + (n - 0.5) * 0.5 + (streak - 0.5) * 0.25);
  // a volume: dense where the hull faces the eye, nothing at the silhouette
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float rim = pow(facing, uLayer < 0.5 ? 3.0 : uLayer < 1.5 ? 1.3 : 1.0);
  // shock diamonds: bright knots along the first lengths, strongest at sea level
  float period = max(2.4 * uRadius, 1.0);
  float dia = 1.0 + (0.7 - 0.55 * k) * exp(-vS * 4.5) * pow(0.5 + 0.5 * cos(vS * uLength / period * 6.2831853), 2.0) * (uLayer > 1.5 ? 1.6 : 0.7);
  float turb = 0.45 + 0.95 * lumps + 0.6 * st * lumps + 0.3 * n2;
  float d = tail * rim * turb;
  float lit = 0.5 + 0.75 * lumps + 0.25 * st;
  // colour: core → yellow → orange along the plume and outward; cooler and thinner in vacuum
  vec3 col = mix(uCore, uMid, smoothstep(0.0, 0.25, vS + 0.25 * (1.0 - facing)));
  col = mix(col, uOuter, smoothstep(0.2, 0.8, vS + 0.35 * (1.0 - facing)));
  col = mix(col, uVac, k * (0.5 + 0.5 * smoothstep(0.0, 0.4, vS)));
  // cooler gas between the lumps toward the tail; kerosene tails darken in sooty streaks
  col *= 1.0 - 0.35 * smoothstep(0.45, 1.0, vS) * (1.0 - lumps) * (1.0 - k);
  col *= 1.0 - uSoot * smoothstep(0.35, 0.95, vS) * smoothstep(0.4, 0.8, streak);
  float I;
  if (uLayer < 0.5) {
    I = 0.16 * (1.0 - 0.85 * k) * (0.7 + 0.6 * lumps);              // glow: faint halo
  } else if (uLayer < 1.5) {
    I = (1.5 * exp(-vS * 2.6) + 0.38) * (1.0 - 0.65 * k) * lit;      // body: yellow-orange, turbulent
  } else {
    I = (3.0 * exp(-vS * 3.0) + 0.35) * (1.0 - 0.6 * k) * (0.8 + 0.3 * lumps); // core: overexposes near the nozzle
  }
  I *= uGain * uThrottle * dia;
  float fogK = 0.0;
  #ifdef USE_FOG
    fogK = smoothstep(fogNear, fogFar, vFogDepth);
  #endif
  if (uLayer < 0.5) {
    gl_FragColor = vec4(col * I * d * (1.0 - fogK), 1.0);                  // additive glow
  } else if (uLayer < 1.5) {
    // the body: solid behind the nozzle, opening into tongues down the tail
    float a = clamp(d * (1.5 + 1.4 * exp(-vS * 4.0)), 0.0, 1.0) * uAlpha * (1.0 - 0.55 * k) * (1.0 - fogK);
    gl_FragColor = vec4(col * I, a);
  } else {
    float a = clamp(d * (1.1 + 1.3 * exp(-vS * 5.0)), 0.0, 1.0) * uAlpha * (1.0 - 0.6 * k) * (1.0 - fogK);
    gl_FragColor = vec4(col * I, a);                                         // the core
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function plumeMaterial(look: Look, layer: number, seed = 0): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLength: { value: 10 },
      uRadius: { value: 1 },
      uExp: { value: 1 },
      uThrottle: { value: 1 },
      uLayer: { value: layer },
      uSeed: { value: seed },
      uGain: { value: look.gain },
      uAlpha: { value: look.alpha },
      uSoot: { value: look.soot },
      uCore: { value: look.core },
      uMid: { value: look.mid },
      uOuter: { value: look.outer },
      uVac: { value: look.vac },
      fogColor: { value: new THREE.Color() },
      fogNear: { value: 1 },
      fogFar: { value: 1e9 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: layer === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
    fog: true,
  })
}

let hullCache: THREE.BufferGeometry | null = null
/** unit hull: uv.x angle (0..1), uv.y station (0 nozzle → 1 tip); positions are set in the shader */
function hull(): THREE.BufferGeometry {
  if (hullCache) return hullCache
  const ra = 48
  const along = 72
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  for (let j = 0; j <= along; j++) {
    const s = j / along
    for (let i = 0; i <= ra; i++) {
      const u = i / ra
      pos.push(Math.cos(u * Math.PI * 2), -s, Math.sin(u * Math.PI * 2))
      uv.push(u, s)
    }
  }
  for (let j = 0; j < along; j++)
    for (let i = 0; i < ra; i++) {
      const a = j * (ra + 1) + i
      const b = a + 1
      const c = a + ra + 1
      const d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  // the shader moves the vertices well beyond the unit hull: never cull it
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -0.5, 0), 1e6)
  hullCache = g
  return g
}

let glowCache: THREE.CanvasTexture | null = null
/** a soft radial glow for the end-on view of a plume */
function glowTexture(): THREE.CanvasTexture {
  if (glowCache) return glowCache
  const n = 128
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.75)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.22)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, n, n)
  glowCache = new THREE.CanvasTexture(c)
  return glowCache
}

const N_TONGUES = 14

/**
 * Engine plume hanging below y (pointing −y). `throttle` 0–1; `expansion` 1 (sea level) → 4
 * (vacuum). `floorDist` is the distance from the nozzle to the pad deck below it (Infinity in
 * flight): the flame is cut there and bursts out sideways as a ring of tongues while the vehicle
 * is low — the fireball under the launch mount.
 */
export function Plume({ kind, radius, length, y = 0, x = 0, z = 0, throttle = 1, expansion = 1, floor }: { kind: PlumeKind; radius: number; length: number; y?: number; x?: number; z?: number; throttle?: number; expansion?: number; floor?: { current: number } }) {
  const look = LOOK[kind]
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const splash = useRef<THREE.Group>(null)
  const splashLight = useRef<THREE.PointLight>(null)
  const mats = useMemo(() => [plumeMaterial(look, 0), plumeMaterial(look, 1), plumeMaterial(look, 2)], [look])
  const geo = useMemo(() => hull(), [])
  const endGlow = useRef<THREE.Sprite>(null)
  const glowTex = useMemo(() => glowTexture(), [])
  const tmpV = useMemo(() => ({ axis: new THREE.Vector3(), origin: new THREE.Vector3(), toCam: new THREE.Vector3() }), [])
  // the tongues: around the impact point, pointing outward and a little up, each its own size
  const tongues = useMemo(
    () =>
      Array.from({ length: N_TONGUES }, (_, i) => {
        const a = (i / N_TONGUES) * Math.PI * 2 + hash2(i, 71) * 0.5
        const up = 0.12 + hash2(i, 72) * 0.4 // radians above the deck
        const dir = new THREE.Vector3(Math.cos(a) * Math.cos(up), Math.sin(up), Math.sin(a) * Math.cos(up))
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
        return { a, q, size: 0.7 + hash2(i, 73) * 0.6, len: 0.7 + hash2(i, 74) * 0.7, ph: hash2(i, 75) * 6.28, mats: [plumeMaterial(look, 1, i * 3.7), plumeMaterial(look, 2, i * 3.7)] }
      }),
    [look],
  )
  useFrame(({ clock, camera }) => {
    const T = clock.elapsedTime
    // 20–40 Hz flicker of the length and brightness, plus a slow breathing
    const f = 0.94 + 0.045 * Math.sin(T * 41.0) * Math.sin(T * 27.3) + 0.03 * Math.sin(T * 3.1)
    const k = Math.min(1, Math.max(0, (expansion - 1) / 3))
    const Lfree = length * look.length * (0.55 + 0.45 * throttle) * f * (1 + 1.3 * k)
    const floorDist = floor?.current ?? Infinity
    // the deck below: the flame is cut a little past it (it goes on into the trench)
    const cut = Math.min(Lfree, floorDist + radius * 1.5)
    const L = cut
    const on = throttle > 0.02
    if (group.current) group.current.visible = on
    const scales = [1.6, 1.0, 0.45]
    const lens = [1.05, 1.0, 0.5]
    mats.forEach((m, i) => {
      const u = m.uniforms
      u.uTime.value = T
      u.uLength.value = L * lens[i]
      u.uRadius.value = radius * scales[i] * (0.92 + 0.08 * f)
      u.uExp.value = expansion
      u.uThrottle.value = throttle
    })
    if (light.current) light.current.intensity = on ? 9 * throttle * radius * radius * f * (1 - 0.7 * k) : 0
    // seen along its axis the hull is all silhouette and nearly vanishes: a glow at the throat
    // stands in for the fire you look into (the landing burn from below, the booster from the pad)
    if (endGlow.current && group.current) {
      const sp = endGlow.current
      sp.visible = on
      if (on) {
        group.current.getWorldPosition(tmpV.origin)
        tmpV.axis.set(0, -1, 0).transformDirection(group.current.matrixWorld)
        tmpV.toCam.copy(camera.position).sub(tmpV.origin).normalize()
        const endOn = Math.abs(tmpV.axis.dot(tmpV.toCam))
        const w = Math.max(0, (endOn - 0.45) / 0.55)
        const m = sp.material as THREE.SpriteMaterial
        m.opacity = 0.9 * throttle * w * w * (1 - 0.6 * k) * (0.9 + 0.1 * Math.sin(T * 37))
        const sz = radius * (2.6 + 0.6 * k) * (0.95 + 0.05 * f)
        sp.scale.set(sz, sz, 1)
        sp.position.set(0, -radius * 1.2, 0)
      }
    }
    // the fireball at the deck: strongest with the nozzle just above it, gone once the flame
    // no longer reaches it
    const hit = on && floorDist < Lfree * 0.9 ? Math.min(1, Math.max(0, 1 - floorDist / (Lfree * 0.9))) : 0
    if (splash.current) {
      splash.current.visible = hit > 0.01
      if (hit > 0.01) {
        splash.current.position.y = -floorDist
        splash.current.children.forEach((c, i) => {
          const tg = tongues[i]
          const g = c as THREE.Group
          // each tongue breathes on its own; roots just outside the column's footprint
          const pulse = 0.8 + 0.2 * Math.sin(T * 9 + tg.ph) * Math.sin(T * 5.3 + tg.ph * 2)
          const tl = radius * (3 + 7 * hit) * tg.len * pulse * f
          const tr = radius * (0.6 + 0.4 * hit) * tg.size
          g.position.set(Math.cos(tg.a) * radius * 0.7, radius * 0.35, Math.sin(tg.a) * radius * 0.7)
          g.quaternion.copy(tg.q)
          tg.mats.forEach((m, j) => {
            const u = m.uniforms
            u.uTime.value = T + tg.ph
            u.uLength.value = tl * (j === 1 ? 0.55 : 1)
            u.uRadius.value = tr * (j === 1 ? 0.5 : 1)
            u.uExp.value = 1
            u.uThrottle.value = throttle * Math.min(1, 0.5 + hit)
          })
        })
      }
    }
    if (splashLight.current) {
      splashLight.current.visible = hit > 0.01
      splashLight.current.position.y = -floorDist + radius
      splashLight.current.intensity = 30 * hit * radius * radius * throttle * f
    }
  })
  // drawn after clouds and dust (transparent, lower renderOrder), so the flame shows through steam
  return (
    <group position={[x, y, z]}>
      <group ref={group}>
        <mesh geometry={geo} material={mats[0]} renderOrder={6} frustumCulled={false} />
        <mesh geometry={geo} material={mats[1]} renderOrder={7} frustumCulled={false} />
        <mesh geometry={geo} material={mats[2]} renderOrder={8} frustumCulled={false} />
        <sprite ref={endGlow} renderOrder={9} visible={false}>
          <spriteMaterial map={glowTex} color={look.core} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>
      <group ref={splash} visible={false}>
        {tongues.map((tg, i) => (
          <group key={i}>
            <mesh geometry={geo} material={tg.mats[0]} renderOrder={7} frustumCulled={false} />
            <mesh geometry={geo} material={tg.mats[1]} renderOrder={8} frustumCulled={false} />
          </group>
        ))}
      </group>
      <pointLight ref={light} color={look.light} distance={radius * 60} decay={2} position={[0, -radius * 1.5, 0]} />
      <pointLight ref={splashLight} color={look.light} distance={radius * 90} decay={2} visible={false} />
    </group>
  )
}
