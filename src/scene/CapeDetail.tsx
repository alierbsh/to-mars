/**
 * The things that make the Cape the Cape: the VAB with its flag and meatball, the launch
 * control center, the SpaceX hangar at 39A, the big pad-number signs, a flock of birds that
 * scatters at ignition (every launch broadcast has one), and the surf line along the beach.
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { useAppStore } from '../state/store'
import { hash2 } from './noise'
import { canvasTexture } from './terrain'

/** the south face of the Vehicle Assembly Building: grey panels, the 64 m flag, the 34 m meatball */
function vabFacade(): THREE.CanvasTexture {
  const w = 1024
  const h = 768 // 218 × 160 m → 4.7 px/m
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const px = (m: number) => (m / 218) * w
  const py = (m: number) => (m / 160) * h
  ctx.fillStyle = '#d9d9d4'
  ctx.fillRect(0, 0, w, h)
  // vertical panel joints and the horizontal band lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 2
  for (let x = 0; x < 218; x += 6.1) {
    ctx.beginPath()
    ctx.moveTo(px(x), 0)
    ctx.lineTo(px(x), h)
    ctx.stroke()
  }
  for (let y = 0; y < 160; y += 10) {
    ctx.beginPath()
    ctx.moveTo(0, py(y))
    ctx.lineTo(w, py(y))
    ctx.stroke()
  }
  // the flag: 64 m tall × 34 m wide (painted 1976), on the left half, upper two thirds
  const fx = px(22)
  const fy = py(28)
  const fw = px(34)
  const fh = py(64)
  // stripes
  for (let i = 0; i < 13; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#b31942'
    ctx.fillRect(fx, fy + (fh * i) / 13, fw, fh / 13 + 1)
  }
  // union
  ctx.fillStyle = '#0a3161'
  ctx.fillRect(fx, fy, fw * 0.4, (fh * 7) / 13)
  ctx.fillStyle = '#fff'
  for (let r = 0; r < 9; r++)
    for (let col = 0; col < (r % 2 ? 5 : 6); col++) {
      const sx = fx + (fw * 0.4 * (col + 0.5 + (r % 2 ? 0.5 : 0))) / 6
      const sy = fy + ((fh * 7) / 13) * ((r + 0.5) / 9)
      ctx.beginPath()
      ctx.arc(sx, sy, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  // the meatball: a 34 m blue disc with the red chevron and the white orbit, on the right
  const mx = px(150)
  const my = py(60)
  const mr = px(17)
  ctx.fillStyle = '#0b3d91'
  ctx.beginPath()
  ctx.arc(mx, my, mr, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 24; i++) {
    ctx.beginPath()
    ctx.arc(mx + (hash2(i, 1) - 0.5) * mr * 1.7, my + (hash2(i, 2) - 0.5) * mr * 1.7, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = Math.max(2, mr * 0.06)
  ctx.beginPath()
  ctx.ellipse(mx, my, mr * 1.05, mr * 0.42, -0.5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#fc3d21'
  ctx.beginPath()
  ctx.moveTo(mx - mr * 0.95, my + mr * 0.22)
  ctx.quadraticCurveTo(mx, my - mr * 0.5, mx + mr * 0.95, my + mr * 0.22)
  ctx.quadraticCurveTo(mx, my - mr * 0.05, mx - mr * 0.95, my + mr * 0.22)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.round(mr * 0.5)}px Helvetica, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('NASA', mx, my + mr * 0.2)
  return canvasTexture(c)
}

const grey = new THREE.MeshStandardMaterial({ color: '#d9d9d4', roughness: 0.85 })
const darkGrey = new THREE.MeshStandardMaterial({ color: '#6e7175', roughness: 0.8 })
const signWhite = new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6 })

/** the VAB: 218 × 158 m footprint, 160 m tall, the painted south face toward the LCC (+z) */
export function Vab() {
  const facade = useMemo(() => vabFacade(), [])
  const mats = useMemo(() => {
    const painted = new THREE.MeshStandardMaterial({ map: facade, roughness: 0.85 })
    return [grey, grey, grey, grey, painted, grey] // +x, −x, +y, −y, +z (south), −z
  }, [facade])
  return (
    <group>
      <mesh position={[0, 80, 0]} material={mats} castShadow>
        <boxGeometry args={[218, 160, 158]} />
      </mesh>
      {/* the low bay on the east side and the transfer aisle doors */}
      <mesh position={[150, 32, 0]} material={grey} castShadow>
        <boxGeometry args={[82, 64, 140]} />
      </mesh>
      {/* the high-bay door seams at the corners of the south face */}
      {[-98, 98].map((x) => (
        <mesh key={x} position={[x, 70, 80]} material={darkGrey}>
          <boxGeometry args={[14, 140, 1.2]} />
        </mesh>
      ))}
    </group>
  )
}

/** SpaceX's horizontal integration facility at the foot of LC-39A: a 90 × 50 m hangar */
export function Hangar({ x, z, w = 90, d = 50, h = 22 }: { x: number; z: number; w?: number; d?: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} material={darkGrey} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <mesh position={[0, h + 1.5, 0]} material={grey} castShadow>
        <boxGeometry args={[w + 2, 3, d + 2]} />
      </mesh>
    </group>
  )
}

let signCache: Record<string, THREE.CanvasTexture> = {}
function signTexture(text: string): THREE.CanvasTexture {
  if (signCache[text]) return signCache[text]
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f2f2ee'
  ctx.fillRect(0, 0, 512, 256)
  ctx.fillStyle = '#1a1c1f'
  ctx.font = 'bold 190px Helvetica, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 138)
  signCache[text] = canvasTexture(c)
  return signCache[text]
}

/** the big white pad-number board by the pad road, as in every launch photo */
export function PadSign({ pad, x, z, y, facing = 0 }: { pad: PadId; x: number; z: number; y: number; facing?: number }) {
  const text = pad.startsWith('lc39a') ? '39A' : pad === 'lc39b-ml' ? '39B' : pad === 'lc36' ? '36' : '37'
  const tex = useMemo(() => signTexture(text), [text])
  return (
    <group position={[x, y, z]} rotation={[0, facing, 0]}>
      <mesh position={[0, 6, 0]} castShadow>
        <boxGeometry args={[12, 6, 0.4]} />
        <meshStandardMaterial map={tex} roughness={0.6} />
      </mesh>
      {[-4, 4].map((dx) => (
        <mesh key={dx} position={[dx, 1.5, 0]} material={signWhite}>
          <boxGeometry args={[0.5, 3, 0.5]} />
        </mesh>
      ))}
    </group>
  )
}

const N_BIRDS = 70

/** a flock in the scrub that takes off at ignition and scatters; a pure function of the clock */
export function Birds({ groundY }: { groundY: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const birds = useMemo(
    () =>
      Array.from({ length: N_BIRDS }, (_, i) => {
        const a = hash2(i, 41) * Math.PI * 2
        const r = 260 + hash2(i, 42) * 220
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, dir: a + (hash2(i, 43) - 0.5) * 1.2, speed: 11 + hash2(i, 44) * 9, climb: 6 + hash2(i, 45) * 10, flap: hash2(i, 46) * Math.PI * 2, delay: hash2(i, 47) * 1.5 }
      }),
    [],
  )
  const o = useMemo(() => new THREE.Object3D(), [])
  useFrame(() => {
    const m = mesh.current
    if (!m) return
    const { result, t, intro } = useAppStore.getState()
    const phase = result?.phases[0]
    const tau = phase && !intro ? t - phase.start : -1
    const on = tau >= 0.3 && tau < 40
    m.visible = on
    if (!on) return
    birds.forEach((b, i) => {
      const tt = Math.max(0, tau - 0.3 - b.delay)
      const d = b.speed * tt
      const y = Math.min(60, b.climb * Math.sqrt(tt) * 2) + 1.5
      const flap = Math.sin(tt * 14 + b.flap)
      o.position.set(b.x + Math.cos(b.dir) * d, y, b.z + Math.sin(b.dir) * d)
      o.rotation.set(0, -b.dir, flap * 0.5)
      o.scale.set(2.2, 2.2, 2.2 * (0.6 + 0.4 * Math.abs(flap)))
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  const geo = useMemo(() => {
    // a chevron: two thin wings
    const g = new THREE.BufferGeometry()
    const v = new Float32Array([-0.9, 0, 0.15, 0, 0, -0.15, 0, 0, 0.15, 0.9, 0, 0.15, 0, 0, -0.15, 0, 0, 0.15])
    g.setAttribute('position', new THREE.BufferAttribute(v, 3))
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group position={[0, groundY, 0]}>
      <instancedMesh ref={mesh} args={[geo, undefined, N_BIRDS]} visible={false} frustumCulled={false}>
        <meshBasicMaterial color="#1a1a1a" side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
}
