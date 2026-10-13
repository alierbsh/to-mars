/**
 * Earth for the orbit scene (scene unit = 1 km): the NASA relief map reworked into a day map
 * (deep sea, muted land, ice sheets), a roughness map so the sun glints off the oceans, a
 * procedural cloud layer drifting over it, a fresnel atmosphere that glows on the sunlit limb,
 * the Hipparcos star map as the sky, a sun glow and the Moon at its true angular size.
 * Assets: public/assets/earth (built by scripts/earth-assets.py from NASA-3D-Resources).
 */
import { useFrame, useLoader } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export const EARTH_R = 6371
const BASE_URL = import.meta.env.BASE_URL
/** sun direction (unit) and distance of the glow sprite */
export const SUN_DIR = new THREE.Vector3(0.72, 0.3, 0.62).normalize()

function atmosphereMaterial(halo: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: SUN_DIR.clone() }, color: { value: new THREE.Color(halo ? '#6fb1ff' : '#4f8fe0') }, halo: { value: halo ? 1 : 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: halo ? THREE.BackSide : THREE.FrontSide,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vNormal; varying vec3 vView; varying vec3 vWorldN;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldN = normalize(mat3(modelMatrix) * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 sunDir; uniform vec3 color; uniform float halo; varying vec3 vNormal; varying vec3 vView; varying vec3 vWorldN;
      void main() {
        #include <logdepthbuf_fragment>
        float rim = 1.0 - abs(dot(vNormal, vView));
        float day = smoothstep(-0.3, 0.3, dot(vWorldN, sunDir));
        // halo: back faces beyond the planet's silhouette, brightest right at the limb
        // haze: a faint blue veil over the disc, thickening toward the horizon
        float glow = halo > 0.5 ? pow(rim, 2.2) * 1.6 + pow(rim, 9.0) * 0.9 : pow(rim, 1.6) * 0.22;
        gl_FragColor = vec4(color * glow * (0.12 + 0.88 * day), glow * (0.15 + 0.85 * day));
      }`,
  })
}

function moonTexture(): THREE.CanvasTexture {
  const n = 256
  const c = document.createElement('canvas')
  c.width = n * 2
  c.height = n
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#9a9890'
  ctx.fillRect(0, 0, n * 2, n)
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 9; i++) {
    // maria: darker patches
    const x = rnd() * n * 2
    const y = n * 0.2 + rnd() * n * 0.5
    const r = 20 + rnd() * 50
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r)
    g.addColorStop(0, 'rgba(70,72,78,0.8)')
    g.addColorStop(1, 'rgba(70,72,78,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r)
  }
  for (let i = 0; i < 300; i++) {
    const x = rnd() * n * 2
    const y = rnd() * n
    const r = 1 + rnd() * 6
    ctx.fillStyle = `rgba(${60 + rnd() * 40},${60 + rnd() * 40},${65 + rnd() * 40},0.7)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(200,200,195,0.5)'
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

let glowCache: THREE.CanvasTexture | null = null
function sunGlowTexture(): THREE.CanvasTexture {
  if (glowCache) return glowCache
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.08, 'rgba(255,250,235,1)')
  g.addColorStop(0.2, 'rgba(255,230,190,0.55)')
  g.addColorStop(0.5, 'rgba(255,200,150,0.12)')
  g.addColorStop(1, 'rgba(255,180,120,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  glowCache = new THREE.CanvasTexture(c)
  return glowCache
}

export function Earth() {
  const [day, rough, clouds, stars] = useLoader(THREE.TextureLoader, [`${BASE_URL}assets/earth/earth-day-4k.jpg`, `${BASE_URL}assets/earth/earth-rough-4k.jpg`, `${BASE_URL}assets/earth/earth-clouds.png`, `${BASE_URL}assets/earth/stars.jpg`])
  day.colorSpace = THREE.SRGBColorSpace
  day.anisotropy = 8
  stars.colorSpace = THREE.SRGBColorSpace
  clouds.anisotropy = 4
  const atmo = useMemo(() => atmosphereMaterial(true), [])
  const haze = useMemo(() => atmosphereMaterial(false), [])
  const moonTex = useMemo(() => moonTexture(), [])
  const glow = useMemo(() => sunGlowTexture(), [])
  const earth = useRef<THREE.Group>(null)
  const cloud = useRef<THREE.Mesh>(null)

  useFrame((_, dt) => {
    // a slow real-time drift: the day side turns, the clouds slide over it
    if (earth.current) earth.current.rotation.y += dt * 0.004
    if (cloud.current) cloud.current.rotation.y += dt * 0.0055
  })

  const sunPos = SUN_DIR.clone().multiplyScalar(36_000)
  const moonPos = new THREE.Vector3(-0.55, 0.2, -0.8).normalize().multiplyScalar(33_000)
  return (
    <group>
      {/* sky */}
      <mesh frustumCulled={false}>
        <sphereGeometry args={[38_000, 48, 32]} />
        <meshBasicMaterial map={stars} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <sprite position={sunPos.toArray()} scale={[9000, 9000, 1]}>
        <spriteMaterial map={glow} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      <mesh position={moonPos.toArray()}>
        <sphereGeometry args={[33_000 * 0.00452, 32, 24]} />
        <meshStandardMaterial map={moonTex} roughness={1} />
      </mesh>
      {/* the planet */}
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[EARTH_R, 128, 96]} />
          <meshStandardMaterial map={day} roughnessMap={rough} roughness={1} metalness={0.02} envMapIntensity={0.15} />
        </mesh>
        <mesh ref={cloud}>
          <sphereGeometry args={[EARTH_R * 1.004, 96, 72]} />
          <meshStandardMaterial map={clouds} transparent depthWrite={false} roughness={1} envMapIntensity={0.1} />
        </mesh>
      </group>
      <mesh material={atmo}>
        <sphereGeometry args={[EARTH_R * 1.014, 96, 72]} />
      </mesh>
      <mesh material={haze}>
        <sphereGeometry args={[EARTH_R * 1.006, 96, 72]} />
      </mesh>
    </group>
  )
}
