import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export type PlumeKind = 'methalox' | 'kerolox' | 'hydrolox' | 'solid' | 'hypergolic'

export function plumeKindFor(label: string): PlumeKind {
  const l = label.toLowerCase()
  if (l.includes('solid')) return 'solid'
  if (l.includes('raptor') || l.includes('be-4') || l.includes('yf-215') || l.includes('archimedes')) return 'methalox'
  if (l.includes('rs-25') || l.includes('rl10') || l.includes('j-2') || l.includes('be-3') || l.includes('yf-75') || l.includes('vinci') || l.includes('vulcain')) return 'hydrolox'
  if (l.includes('draco') || l.includes('aj10') || l.includes('hypergol')) return 'hypergolic'
  return 'kerolox'
}

const COLORS: Record<PlumeKind, { core: string; inner: string; outer: string; length: number; alpha: number }> = {
  methalox: { core: '#8fa6ff', inner: '#f4f7ff', outer: '#5c7cff', length: 1.0, alpha: 0.7 },
  kerolox: { core: '#ff9a2e', inner: '#fff3cf', outer: '#ff7a1a', length: 1.1, alpha: 0.95 },
  hydrolox: { core: '#b9ccff', inner: '#f3f7ff', outer: '#8fb4ff', length: 0.8, alpha: 0.45 },
  solid: { core: '#ffb340', inner: '#fff5d8', outer: '#ff9a2a', length: 1.25, alpha: 1 },
  hypergolic: { core: '#ffc08a', inner: '#fff1dc', outer: '#ffb08a', length: 0.7, alpha: 0.6 },
}

let diamondsCache: THREE.CanvasTexture | null = null
/** bright bands along the flame: the shock-diamond look of an over/under-expanded nozzle */
function diamondsTexture(): THREE.CanvasTexture {
  if (diamondsCache) return diamondsCache
  const w = 16
  const h = 256
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  for (let j = 0; j < h; j++) {
    const v = j / h // 0 at the nozzle (top of the texture = cone base), 1 at the tip
    const bands = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(v * Math.PI * 9)), 3)
    const fade = Math.pow(1 - v, 0.6)
    const a = Math.min(1, bands * fade * 1.15)
    for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4
      img.data[k] = img.data[k + 1] = img.data[k + 2] = 255
      img.data[k + 3] = a * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  diamondsCache = new THREE.CanvasTexture(c)
  return diamondsCache
}

/**
 * Engine plume: a saturated flame cone (reads against sky, cloud and daylight), a white-hot inner
 * core with shock diamonds, and an additive glow sheath, all hanging below y, with flicker.
 * `throttle` 0–1 scales length/brightness; `expansion` widens the plume in vacuum.
 */
export function Plume({ kind, radius, length, y = 0, x = 0, z = 0, throttle = 1, expansion = 1 }: { kind: PlumeKind; radius: number; length: number; y?: number; x?: number; z?: number; throttle?: number; expansion?: number }) {
  const c = COLORS[kind]
  const outer = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  const mats = useMemo(
    () => ({
      outer: new THREE.MeshBasicMaterial({ color: c.outer, transparent: true, opacity: 0.5 * c.alpha, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
      core: new THREE.MeshBasicMaterial({ color: c.core, transparent: true, opacity: Math.min(1, 0.85 * c.alpha + 0.1), depthWrite: false, toneMapped: false }),
      inner: new THREE.MeshBasicMaterial({ color: c.inner, map: diamondsTexture(), transparent: true, opacity: 1, depthWrite: false, toneMapped: false }),
    }),
    [c],
  )
  useFrame(({ clock }) => {
    const f = 0.9 + 0.1 * Math.sin(clock.elapsedTime * 37) * Math.sin(clock.elapsedTime * 23)
    const L = length * c.length * throttle * f
    const w = radius * (0.8 + 0.6 * (expansion - 1)) * (0.9 + 0.2 * f)
    const on = throttle > 0.02
    if (outer.current) {
      outer.current.scale.set(w * 1.15, Math.max(L, 0.01), w * 1.15)
      outer.current.visible = on
    }
    if (core.current) {
      core.current.scale.set(w * 0.75, Math.max(L * 0.75, 0.01), w * 0.75)
      core.current.visible = on
    }
    if (inner.current) {
      inner.current.scale.set(w * 0.42, Math.max(L * 0.5, 0.01), w * 0.42)
      inner.current.visible = on
    }
    if (light.current) light.current.intensity = on ? 6 * throttle * radius * radius * f : 0
  })
  const geom = useMemo(() => {
    // unit cone with its base at y = 0 and apex at y = -1 (points down)
    const g = new THREE.ConeGeometry(1, 1, 24, 1, true)
    g.rotateX(Math.PI)
    g.translate(0, -0.5, 0)
    return g
  }, [])
  // drawn after clouds and dust (transparent, lower renderOrder), so the flame shows through steam
  return (
    <group position={[x, y, z]}>
      <mesh ref={outer} material={mats.outer} geometry={geom} renderOrder={6} />
      <mesh ref={core} material={mats.core} geometry={geom} renderOrder={7} />
      <mesh ref={inner} material={mats.inner} geometry={geom} renderOrder={8} />
      <pointLight ref={light} color={c.outer} distance={radius * 50} decay={2} position={[0, -radius, 0]} />
    </group>
  )
}
