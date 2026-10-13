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
import { dustTexture } from './impact'
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
  methalox: { core: new THREE.Color(1.0, 0.97, 0.9), mid: new THREE.Color(1.0, 0.7, 0.3), outer: new THREE.Color(1.0, 0.4, 0.1), vac: new THREE.Color(0.55, 0.62, 1.0), gain: 1.0, alpha: 0.9, soot: 0.0, length: 1.9, light: '#ffb070' },
  kerolox: { core: new THREE.Color(1.0, 0.92, 0.72), mid: new THREE.Color(1.0, 0.64, 0.2), outer: new THREE.Color(0.92, 0.32, 0.06), vac: new THREE.Color(0.95, 0.62, 0.4), gain: 1.0, alpha: 0.95, soot: 0.55, length: 1.7, light: '#ff9a40' },
  hydrolox: { core: new THREE.Color(0.92, 0.96, 1.0), mid: new THREE.Color(0.75, 0.86, 1.0), outer: new THREE.Color(0.6, 0.75, 1.0), vac: new THREE.Color(0.5, 0.62, 1.0), gain: 0.75, alpha: 0.4, soot: 0.0, length: 1.3, light: '#bcd2ff' },
  solid: { core: new THREE.Color(1.0, 0.96, 0.88), mid: new THREE.Color(1.0, 0.82, 0.52), outer: new THREE.Color(1.0, 0.56, 0.24), vac: new THREE.Color(1.0, 0.7, 0.5), gain: 1.4, alpha: 1.0, soot: 0.35, length: 1.8, light: '#ffc080' },
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
  float sl = (0.92 + 0.55 * s) * sqrt(max(0.0, 1.0 - pow(s, 2.6)));
  float vac = (0.9 + 2.3 * pow(s, 0.55)) * sqrt(max(0.0, 1.0 - pow(s, 3.5)));
  return mix(sl, vac, k);
}

void main() {
  float s = uv.y;
  float a = uv.x * 6.2831853;
  float k = clamp((uExp - 1.0) / 3.0, 0.0, 1.0);
  // the silhouette flickers: slow lumps near the nozzle, fast ragged motion toward the tail
  float wob = 1.0 + (fbm3(vec3(cos(a) * 1.2, sin(a) * 1.2, s * 5.0 - uTime * 2.2)) - 0.5) * (0.12 + 0.5 * s * s) * (1.0 - 0.6 * k);
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
  vec3 q = vec3(cos(vA) * 1.6, sin(vA) * 1.6, vS * (6.0 - 3.0 * k) - uTime * 2.6);
  float n = fbm3(q);
  float streak = fbm3(vec3(cos(vA) * 4.5, sin(vA) * 4.5, vS * 2.2 - uTime * 4.0) + 7.0);
  float n2 = vnoise(q * 3.1 + vec3(0.0, 0.0, uTime * 2.0));
  // ragged tongues at the tail; thinner, longer in vacuum
  float tail = smoothstep(1.0, 0.6 + 0.2 * k, vS + (n - 0.5) * 0.5 + (streak - 0.5) * 0.25);
  // a volume: dense where the hull faces the eye, nothing at the silhouette
  float facing = abs(dot(normalize(vN), normalize(vV)));
  float rim = pow(facing, uLayer < 0.5 ? 3.0 : uLayer < 1.5 ? 1.3 : 1.0);
  // shock diamonds: bright knots along the first lengths, strongest at sea level
  float period = max(2.4 * uRadius, 1.0);
  float dia = 1.0 + (0.7 - 0.55 * k) * exp(-vS * 4.5) * pow(0.5 + 0.5 * cos(vS * uLength / period * 6.2831853), 2.0) * (uLayer > 1.5 ? 1.6 : 0.7);
  float turb = (0.3 + 2.4 * pow(n, 2.0)) * (0.6 + 0.9 * pow(streak, 1.5)) * (0.75 + 0.5 * n2);
  float d = tail * rim * turb;
  // colour: core → yellow → orange along the plume and outward; cooler and thinner in vacuum
  vec3 col = mix(uCore, uMid, smoothstep(0.0, 0.25, vS + 0.25 * (1.0 - facing)));
  col = mix(col, uOuter, smoothstep(0.2, 0.8, vS + 0.35 * (1.0 - facing)));
  col = mix(col, uVac, k * (0.5 + 0.5 * smoothstep(0.0, 0.4, vS)));
  // soot: kerosene tails darken in streaks
  col *= 1.0 - uSoot * smoothstep(0.35, 0.95, vS) * smoothstep(0.4, 0.8, streak);
  float I;
  if (uLayer < 0.5) {
    I = 0.14 * (1.0 - 0.92 * k);                          // glow: faint halo
  } else if (uLayer < 1.5) {
    I = (1.4 * exp(-vS * 2.0) + 0.5) * (1.0 - 0.8 * k);   // body: yellow-orange, turbulent
  } else {
    I = (3.0 * exp(-vS * 3.0) + 0.35) * (1.0 - 0.75 * k); // core: overexposes near the nozzle
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
    float a = clamp(d * (1.5 + 2.0 * exp(-vS * 5.0)), 0.0, 1.0) * uAlpha * (1.0 - 0.65 * k) * (1.0 - fogK);
    gl_FragColor = vec4(col * I, a);
  } else {
    float a = clamp(d * (1.2 + 1.5 * exp(-vS * 5.0)), 0.0, 1.0) * uAlpha * (1.0 - 0.6 * k) * (1.0 - fogK);
    gl_FragColor = vec4(col * I, a);                                         // the core
  }
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function plumeMaterial(look: Look, layer: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uLength: { value: 10 },
      uRadius: { value: 1 },
      uExp: { value: 1 },
      uThrottle: { value: 1 },
      uLayer: { value: layer },
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

const N_SPLASH = 14

/**
 * Engine plume hanging below y (pointing −y). `throttle` 0–1; `expansion` 1 (sea level) → 4
 * (vacuum). `floorDist` is the distance from the nozzle to the pad deck below it (Infinity in
 * flight): the flame is cut there and splashes sideways as a fireball while the vehicle is low.
 */
export function Plume({ kind, radius, length, y = 0, x = 0, z = 0, throttle = 1, expansion = 1, floor }: { kind: PlumeKind; radius: number; length: number; y?: number; x?: number; z?: number; throttle?: number; expansion?: number; floor?: { current: number } }) {
  const look = LOOK[kind]
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const splash = useRef<THREE.Group>(null)
  const splashLight = useRef<THREE.PointLight>(null)
  const mats = useMemo(() => [plumeMaterial(look, 0), plumeMaterial(look, 1), plumeMaterial(look, 2)], [look])
  const geo = useMemo(() => hull(), [])
  const tex = useMemo(() => dustTexture(), [])
  const splashes = useMemo(() => Array.from({ length: N_SPLASH }, (_, i) => ({ a: (i / N_SPLASH) * Math.PI * 2 + hash2(i, 61) * 0.4, r: 0.6 + hash2(i, 62) * 0.9, s: 0.8 + hash2(i, 63) * 0.8, ph: hash2(i, 64) * 6.28, up: 0.3 + hash2(i, 65) * 0.7 })), [])
  useFrame(({ clock }) => {
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
    // the fireball at the deck: strongest with the nozzle just above it, gone once the flame
    // no longer reaches it
    const hit = on && floorDist < Lfree * 0.9 ? Math.min(1, Math.max(0, 1 - floorDist / (Lfree * 0.9))) : 0
    if (splash.current) {
      splash.current.visible = hit > 0.01
      if (hit > 0.01) {
        splash.current.position.y = -floorDist
        const spread = radius * (3 + 11 * Math.sqrt(hit))
        splash.current.children.forEach((c, i) => {
          const sp = c as THREE.Sprite
          const p = splashes[i]
          const roll = (T * 1.3 + p.ph) % 1
          const rr = spread * p.r * (0.5 + 0.6 * roll)
          sp.position.set(Math.cos(p.a) * rr, radius * (0.4 + p.up * 2.5 * roll), Math.sin(p.a) * rr)
          const sz = radius * p.s * (3.0 + 4.5 * roll) * (0.6 + 0.6 * hit)
          sp.scale.set(sz, sz * 0.75, 1)
          const m = sp.material as THREE.SpriteMaterial
          const flicker = 0.75 + 0.25 * Math.sin(T * 31 + p.ph * 7) * Math.sin(T * 17 + p.ph)
          m.opacity = hit * (1 - roll) * flicker * throttle
          m.rotation = p.ph + roll * 1.5
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
      </group>
      <group ref={splash} visible={false}>
        {splashes.map((_, i) => (
          <sprite key={i} renderOrder={7}>
            <spriteMaterial map={tex} color={i % 3 === 0 ? look.core : i % 3 === 1 ? look.mid : look.outer} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        ))}
      </group>
      <pointLight ref={light} color={look.light} distance={radius * 60} decay={2} position={[0, -radius * 1.5, 0]} />
      <pointLight ref={splashLight} color={look.light} distance={radius * 90} decay={2} visible={false} />
    </group>
  )
}
