/**
 * Ignition and liftoff clouds at the pad: steam from the deluge and exhaust billowing out of the
 * flame trench (two lobes along the trench) and over the pad, white at first, greying and thinning
 * as it drifts. A pure function of sim seconds since liftoff, so scrubbing replays it. A warm light
 * at the base lights the pad and the cloud for the first seconds.
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../state/store'
import { dustTexture } from './impact'
import { hash2 } from './noise'

const N = 30
const WHITE = new THREE.Color('#f1efe9')
const GREY = new THREE.Color('#b9b5ad')

interface Puff {
  /** azimuth of the lobe (±z along the trench) plus spread */
  dir: number
  rate: number
  rise: number
  size: number
  delay: number
  lobe: boolean
}

export function LaunchClouds({ deck, trenchAxis = 'z' }: { deck: number; trenchAxis?: 'x' | 'z' }) {
  const group = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const tex = useMemo(() => dustTexture(), [])
  const puffs = useMemo<Puff[]>(() => {
    const out: Puff[] = []
    for (let i = 0; i < N; i++) {
      const lobe = i < 22
      const side = i % 2 ? 1 : -1
      const axis = trenchAxis === 'z' ? Math.PI / 2 : 0
      const dir = lobe ? axis * side + (side < 0 ? Math.PI : 0) + (hash2(3, i) - 0.5) * 1.1 : hash2(4, i) * Math.PI * 2
      out.push({ dir, rate: lobe ? 0.7 + hash2(5, i) * 0.8 : 0.2 + hash2(5, i) * 0.3, rise: 0.3 + hash2(6, i) * 0.9, size: 0.7 + hash2(7, i) * 0.7, delay: hash2(8, i) * 1.5, lobe })
    }
    return out
  }, [trenchAxis])
  const col = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const { result, t, intro } = useAppStore.getState()
    const g = group.current
    if (!g) return
    const phase = result?.phases[0]
    const tau = phase && t < phase.end && !intro ? t - phase.start : -1
    const on = tau >= 0 && tau < 60
    g.visible = on
    if (light.current) {
      light.current.visible = tau >= 0 && tau < 20
      light.current.intensity = tau >= 0 ? 40_000 * Math.max(0, 1 - tau / 20) : 0
    }
    if (!on) return
    const fade = tau < 18 ? 1 : Math.max(0, 1 - (tau - 18) / 40)
    g.children.forEach((c, i) => {
      const p = puffs[i]
      const s = c as THREE.Sprite
      const tt = Math.max(0, tau - p.delay)
      const grow = Math.sqrt(tt)
      const r = (p.lobe ? 12 : 5) + (p.lobe ? 48 : 16) * p.rate * grow
      const h = 4 + 16 * p.rise * grow * (p.lobe ? 1 : 1.6)
      s.position.set(Math.cos(p.dir) * r, h, Math.sin(p.dir) * r)
      const size = (14 + 26 * grow) * p.size
      s.scale.set(size, size * 0.85, 1)
      const m = s.material as THREE.SpriteMaterial
      m.opacity = (tt > 0 ? 0.92 : 0) * fade * Math.min(1, 3 / (1 + grow * 0.6))
      m.rotation = p.dir + grow * 0.15
      col.copy(WHITE).lerp(GREY, Math.min(1, tau / 40))
      m.color.copy(col)
    })
  })

  return (
    <group position={[0, deck, 0]}>
      <pointLight ref={light} position={[0, 6, 0]} color="#ffb070" distance={600} decay={2} intensity={0} />
      <group ref={group} visible={false}>
        {Array.from({ length: N }, (_, i) => (
          <sprite key={i}>
            <spriteMaterial map={tex} color="#f1efe9" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
    </group>
  )
}
