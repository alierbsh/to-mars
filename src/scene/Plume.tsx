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

const COLORS: Record<PlumeKind, { core: string; outer: string; length: number; alpha: number }> = {
  methalox: { core: '#eef2ff', outer: '#6f8cff', length: 1.0, alpha: 0.75 },
  kerolox: { core: '#fff1c2', outer: '#ff8a2a', length: 1.1, alpha: 0.9 },
  hydrolox: { core: '#e9f1ff', outer: '#9fc0ff', length: 0.8, alpha: 0.35 },
  solid: { core: '#fff3d0', outer: '#ffb347', length: 1.2, alpha: 0.95 },
  hypergolic: { core: '#ffe9d0', outer: '#ffb08a', length: 0.7, alpha: 0.6 },
}

/**
 * Engine plume: two additive cones (bright core + translucent outer) hanging below y, with
 * flicker. `throttle` 0–1 scales length/brightness; `expansion` widens the plume in vacuum.
 */
export function Plume({ kind, radius, length, y = 0, x = 0, z = 0, throttle = 1, expansion = 1 }: { kind: PlumeKind; radius: number; length: number; y?: number; x?: number; z?: number; throttle?: number; expansion?: number }) {
  const c = COLORS[kind]
  const outer = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  const mats = useMemo(
    () => ({
      outer: new THREE.MeshBasicMaterial({ color: c.outer, transparent: true, opacity: 0.35 * c.alpha, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      core: new THREE.MeshBasicMaterial({ color: c.core, transparent: true, opacity: 0.8 * c.alpha, blending: THREE.AdditiveBlending, depthWrite: false }),
    }),
    [c],
  )
  useFrame(({ clock }) => {
    const f = 0.9 + 0.1 * Math.sin(clock.elapsedTime * 37) * Math.sin(clock.elapsedTime * 23)
    const L = length * c.length * throttle * f
    const w = radius * (0.8 + 0.6 * (expansion - 1)) * (0.9 + 0.2 * f)
    if (outer.current) {
      outer.current.scale.set(w, Math.max(L, 0.01), w)
      outer.current.visible = throttle > 0.02
    }
    if (core.current) {
      core.current.scale.set(w * 0.45, Math.max(L * 0.6, 0.01), w * 0.45)
      core.current.visible = throttle > 0.02
    }
    if (light.current) light.current.intensity = throttle > 0.02 ? 4 * throttle * radius * radius * f : 0
  })
  const geom = useMemo(() => {
    // unit cone with its base at y = 0 and apex at y = -1 (points down)
    const g = new THREE.ConeGeometry(1, 1, 24, 1, true)
    g.rotateX(Math.PI)
    g.translate(0, -0.5, 0)
    return g
  }, [])
  return (
    <group position={[x, y, z]}>
      <mesh ref={outer} material={mats.outer} geometry={geom} />
      <mesh ref={core} material={mats.core} geometry={geom} />
      <pointLight ref={light} color={c.outer} distance={radius * 40} decay={2} position={[0, -radius, 0]} />
    </group>
  )
}
