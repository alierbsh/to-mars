/**
 * The small things that make the landing site a place: rocks with real shapes (four noise-
 * displaced variants, instanced), wind-blown sand tails, a regolith normal map with ripples,
 * dust devils wandering over the plain, and Spirit's lander — Columbia Memorial Station —
 * with its petals open beside the touchdown point.
 */
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../state/store'
import { SPIRIT_LANDER, dustDevils, type MarsSite, type Rock } from './marsSite'
import { fbm, hash2 } from './noise'
import { canvasTexture } from './terrain'

/** an icosahedron pushed around by low-frequency noise: a boulder with flat faces and a rounded top */
function rockGeometry(seed: number): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 2)
  const pos = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const n = fbm(v.x * 1.3 + seed * 7, v.z * 1.3 + v.y * 0.7 + seed * 3, 3)
    const n2 = fbm(v.y * 2.5 + seed, v.x * 2.5 - seed, 2)
    const k = 0.72 + 0.42 * n + 0.14 * (n2 - 0.5)
    v.multiplyScalar(k)
    // flatten the base: rocks sit in the sand
    if (v.y < -0.35) v.y = -0.35 - (v.y + 0.35) * 0.25
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

let normalCache: THREE.CanvasTexture | null = null
/** tileable regolith normal map: wind ripples (~1.5 m) over fine grain; one tile = 40 m */
export function regolithNormal(): THREE.CanvasTexture {
  if (normalCache) return normalCache
  const n = 512
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(n, n)
  const TAU = Math.PI * 2
  // height field: ripples along one direction, bent by noise, plus grain; periodic in both axes
  const h = (i: number, j: number) => {
    const u = (i / n) * TAU
    const v = (j / n) * TAU
    const bend = 0.6 * Math.sin(u * 2 + 1.0) + 0.4 * Math.sin(v * 3 - 0.5)
    const ripple = Math.sin(v * 26 + bend * 2.5 + 0.3 * Math.sin(u * 7)) // ~1.5 m wavelength at 40 m/tile
    const ripple2 = Math.sin(v * 17 + u * 2 + bend * 1.5 + 2.0)
    const asym = 0.5 + 0.5 * (0.7 * ripple + 0.3 * ripple2) // steeper lee faces: skew
    const grain = Math.sin(u * 61 + v * 37) * Math.sin(u * 23 - v * 53) * 0.25
    const pebbles = Math.sin(u * 97 + 2) * Math.sin(v * 89 + 1) > 0.93 ? 0.6 : 0
    return 0.9 * Math.pow(asym, 1.4) + grain + pebbles
  }
  const amp = 1.6
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const dx = (h((i + 1) % n, j) - h((i - 1 + n) % n, j)) * amp
      const dy = (h(i, (j + 1) % n) - h(i, (j - 1 + n) % n)) * amp
      const len = Math.hypot(dx, dy, 1)
      const k = (j * n + i) * 4
      img.data[k] = 128 + (-dx / len) * 127
      img.data[k + 1] = 128 + (dy / len) * 127
      img.data[k + 2] = 128 + (1 / len) * 127
      img.data[k + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  normalCache = t
  return t
}

/** rocks: four instanced meshes, one per shape variant; colour from basalt grey-brown to dusty tan */
export function Rocks({ rocks }: { rocks: Rock[] }) {
  const meshes = useMemo(() => {
    const groups: Rock[][] = [[], [], [], []]
    for (const r of rocks) groups[r.v].push(r)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    return groups.map((list, v) => {
      const g = rockGeometry(v + 1)
      const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.92, envMapIntensity: 0.25 })
      const m = new THREE.InstancedMesh(g, mat, Math.max(1, list.length))
      list.forEach((rk, i) => {
        o.position.set(rk.p[0], rk.p[1], rk.p[2])
        o.rotation.set(0, rk.r, 0)
        o.scale.set(rk.s * (0.85 + 0.5 * rk.c), rk.s * (0.55 + 0.25 * hash2(i, v)), rk.s * (0.7 + 0.4 * hash2(i, v + 9)))
        o.updateMatrix()
        m.setMatrixAt(i, o.matrix)
        // dark basalt with a dust coat; the larger the rock, the darker and bluer
        const dust = 0.35 + 0.5 * rk.c
        col.setRGB(0.25 + 0.3 * dust, 0.17 + 0.2 * dust, 0.12 + 0.12 * dust)
        if (rk.s > 1.5) col.multiplyScalar(0.8)
        m.setColorAt(i, col)
      })
      m.count = list.length
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor) m.instanceColor.needsUpdate = true
      m.castShadow = true
      m.receiveShadow = true
      m.frustumCulled = false
      return m
    })
  }, [rocks])
  return (
    <group>
      {meshes.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </group>
  )
}

let streakCache: THREE.CanvasTexture | null = null
/** a soft, elongated tail for the lee side of a rock */
function streakTexture(): THREE.CanvasTexture {
  if (streakCache) return streakCache
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 32
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 128, 0)
  g.addColorStop(0, 'rgba(255,255,255,0.55)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.quadraticCurveTo(64, 0, 128, 14)
  ctx.lineTo(128, 18)
  ctx.quadraticCurveTo(64, 32, 0, 24)
  ctx.closePath()
  ctx.fill()
  streakCache = canvasTexture(c)
  return streakCache
}

/** bright sand tails behind the bigger rocks, all pointing downwind (the prevailing wind from the north-west) */
export function SandTails({ rocks, site }: { rocks: Rock[]; site: MarsSite }) {
  const mesh = useMemo(() => {
    const big = rocks.filter((r) => r.s > 0.9)
    const g = new THREE.PlaneGeometry(1, 1)
    g.rotateX(-Math.PI / 2)
    g.translate(0.5, 0, 0)
    const mat = new THREE.MeshStandardMaterial({ map: streakTexture(), color: '#e0b98a', transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 })
    const m = new THREE.InstancedMesh(g, mat, Math.max(1, big.length))
    const o = new THREE.Object3D()
    const wind = 0.8 // radians: tails point south-east
    big.forEach((rk, i) => {
      o.position.set(rk.p[0], site.nearHeight(rk.p[0], rk.p[2]) + 0.06, rk.p[2])
      o.rotation.set(0, -wind, 0)
      o.scale.set(rk.s * 7, 1, rk.s * 1.6)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.count = big.length
    m.instanceMatrix.needsUpdate = true
    m.frustumCulled = false
    m.renderOrder = 1
    return m
  }, [rocks, site])
  return <primitive object={mesh} />
}

let devilCache: THREE.CanvasTexture | null = null
function devilTexture(): THREE.CanvasTexture {
  if (devilCache) return devilCache
  const w = 128
  const h = 256
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const u = i / w
      const v = j / h // 0 top, 1 bottom
      const streak = 0.5 + 0.5 * Math.sin(u * Math.PI * 2 * 5 + v * 9) * Math.sin(u * Math.PI * 2 * 3 - v * 4)
      const a = (0.25 + 0.5 * streak) * Math.pow(1 - v, 0.35) * (0.6 + 0.4 * Math.sin(v * 12 + u * 6))
      const k = (j * w + i) * 4
      img.data[k] = 214
      img.data[k + 1] = 170
      img.data[k + 2] = 126
      img.data[k + 3] = Math.max(0, Math.min(255, a * 160))
    }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.RepeatWrapping
  devilCache = t
  return t
}

/** dust devils: translucent tapered columns, spinning, drifting on loops; driven by the mission clock */
export function DustDevils({ site }: { site: MarsSite }) {
  const devils = useMemo(() => dustDevils(), [])
  const refs = useRef<Array<THREE.Mesh | null>>([])
  const tex = useMemo(() => devilTexture(), [])
  useFrame((_, dt) => {
    const t = useAppStore.getState().t
    devils.forEach((d, i) => {
      const m = refs.current[i]
      if (!m) return
      const ph = d.phase + (t / d.period) * Math.PI * 2
      const x = d.x + Math.cos(ph) * d.loop + Math.sin(ph * 2.3) * d.loop * 0.2
      const z = d.z + Math.sin(ph) * d.loop * 0.7
      m.position.set(x, site.midHeight(x, z), z)
      m.rotation.y += dt * 1.2
      // lean a little with the drift
      m.rotation.z = 0.06 * Math.sin(ph)
    })
  })
  return (
    <group>
      {devils.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          position={[d.x, 0, d.z]}
        >
          <cylinderGeometry args={[d.r * 2.2, d.r * 0.6, d.h, 24, 1, true]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} side={THREE.DoubleSide} color="#d9b08a" opacity={0.75} />
        </mesh>
      ))}
    </group>
  )
}

const lander = {
  gold: new THREE.MeshStandardMaterial({ color: '#b89550', roughness: 0.4, metalness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2e3034', roughness: 0.7, metalness: 0.3 }),
  bag: new THREE.MeshStandardMaterial({ color: '#c9b79a', roughness: 1 }),
  white: new THREE.MeshStandardMaterial({ color: '#d8d6cc', roughness: 0.8 }),
}

/**
 * Columbia Memorial Station: the tetrahedral MER lander with its three petals folded flat and
 * the deflated airbags around it. 2.65 m across the base platform; the petals reach ~5 m.
 */
export function SpiritLander({ site }: { site: MarsSite }) {
  const { x, z, heading } = SPIRIT_LANDER
  const y = site.nearHeight(x, z)
  const petal = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-1.35, 0)
    shape.lineTo(1.35, 0)
    shape.lineTo(0, 2.3)
    shape.closePath()
    const g = new THREE.ShapeGeometry(shape)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  const label = useRef<HTMLDivElement>(null)
  const group = useRef<THREE.Group>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    if (!group.current || !label.current) return
    // the label only when the ship is down to the last few hundred metres
    const d = camera.position.distanceTo(group.current.getWorldPosition(tmp))
    label.current.style.opacity = d < 900 ? '1' : '0'
  })
  return (
    <group ref={group} position={[x, y, z]} rotation={[0, heading, 0]} scale={1.3}>
      {/* base platform: a low triangular prism */}
      <mesh position={[0, 0.3, 0]} material={lander.gold} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 3]} />
      </mesh>
      {/* the three petals, open and flat */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 3
        return <mesh key={i} geometry={petal} material={lander.gold} position={[Math.cos(a) * 1.3, 0.12, Math.sin(a) * 1.3]} rotation={[0, -a + Math.PI / 2, 0]} receiveShadow castShadow />
      })}
      {/* deflated airbags around the petals */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.2
        const r = 2.9 + 0.5 * hash2(i, 3)
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.22, Math.sin(a) * r]} scale={[1.1 + 0.4 * hash2(i, 4), 0.35, 0.8 + 0.4 * hash2(i, 5)]} material={lander.bag} castShadow receiveShadow>
            <sphereGeometry args={[1, 12, 8]} />
          </mesh>
        )
      })}
      {/* low-gain antenna mast and the camera calibration target left on the deck */}
      <mesh position={[0.4, 0.9, 0.3]} material={lander.dark}>
        <cylinderGeometry args={[0.03, 0.03, 0.9, 6]} />
      </mesh>
      <mesh position={[-0.5, 0.5, -0.2]} material={lander.white}>
        <boxGeometry args={[0.25, 0.1, 0.25]} />
      </mesh>
      <Html position={[0, 2.2, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={label} className="label3d label3d--site">
          <span className="label3d__title">Columbia Memorial Station</span>
          <span className="label3d__sub">Spirit's lander · 4 January 2004</span>
        </div>
      </Html>
    </group>
  )
}
