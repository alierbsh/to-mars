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
const FIRE = new THREE.Color('#ffa24a')

interface Puff {
  /** azimuth of the lobe (±z along the trench) plus spread */
  dir: number
  rate: number
  rise: number
  size: number
  delay: number
  lobe: boolean
}

const N_FLAKES = 60

/**
 * The pad in the last seconds and the first: propellant venting from the vehicle during the
 * countdown (white vapour at the nose and the quick-disconnect), the deluge coming up at T−5,
 * and frost shedding off the tanks as the vehicle starts to move. All functions of the clock.
 */
export function LaunchDetail({ deck, height }: { deck: number; height: number }) {
  const tex = useMemo(() => dustTexture(), [])
  const vents = useRef<THREE.Group>(null)
  const deluge = useRef<THREE.Group>(null)
  const flakes = useRef<THREE.InstancedMesh>(null)
  const o = useMemo(() => new THREE.Object3D(), [])
  const flake = useMemo(
    () =>
      Array.from({ length: N_FLAKES }, (_, i) => ({ spawn: hash2(i, 51) * 7, y: 4 + hash2(i, 52) * (height * 0.55), a: hash2(i, 53) * Math.PI * 2, size: 0.3 + hash2(i, 54) * 0.6, push: 0.5 + hash2(i, 55) * 1.5 })),
    [height],
  )
  useFrame(({ clock }) => {
    const { result, t, intro, countdown } = useAppStore.getState()
    const phase = result?.phases[0]
    const tau = phase && !intro ? t - phase.start : -1
    const preIgnition = intro === 'countdown'
    // vents: through the countdown and the first 2 s
    if (vents.current) {
      const on = preIgnition || (tau >= 0 && tau < 2)
      vents.current.visible = on
      if (on) {
        const T = clock.elapsedTime
        vents.current.children.forEach((c, i) => {
          const sp = c as THREE.Sprite
          const f = (T * 0.45 + i * 0.37) % 1 // each puff drifts up and fades on its own loop
          const base = i < 3 ? height - 2 : deck + 18
          sp.position.set((i < 3 ? 4.8 : 5.2) + f * 6, base + f * 7 + (i % 3) * 1.5, (i % 3) - 1 + f * 2)
          const size = 3 + f * 9
          sp.scale.set(size, size * 0.8, 1)
          ;(sp.material as THREE.SpriteMaterial).opacity = 0.55 * (1 - f) * (tau >= 0 ? 1 - tau / 2 : 1)
        })
      }
    }
    // the deluge: water fans up from the plate from T−5, drowned in the steam after ignition
    if (deluge.current) {
      const on = (preIgnition && countdown <= 5) || (tau >= 0 && tau < 12)
      deluge.current.visible = on
      if (on) {
        const T = clock.elapsedTime
        const k = tau >= 0 ? Math.max(0, 1 - tau / 12) : 1
        deluge.current.children.forEach((c, i) => {
          const sp = c as THREE.Sprite
          const f = (T * 0.9 + i * 0.23) % 1
          const a = (i / deluge.current!.children.length) * Math.PI * 2
          const r = 9 + f * 26
          sp.position.set(Math.cos(a) * r, deck + 1 + Math.sin(f * Math.PI) * 9, Math.sin(a) * r)
          const size = 5 + f * 10
          sp.scale.set(size, size * 0.6, 1)
          ;(sp.material as THREE.SpriteMaterial).opacity = 0.5 * (1 - f) * k
        })
      }
    }
    // frost shedding: flakes let go as the vehicle starts to climb, fall past the plume
    if (flakes.current) {
      const on = tau >= 0 && tau < 12
      flakes.current.visible = on
      if (on) {
        flake.forEach((fl, i) => {
          const age = tau - fl.spawn
          const alive = age > 0 && age < 3
          const fall = alive ? 0.5 * 9.81 * age * age : 1e4
          o.position.set(Math.cos(fl.a) * (4.6 + fl.push * age), fl.y - fall + (alive ? 0 : -1e4), Math.sin(fl.a) * (4.6 + fl.push * age))
          o.rotation.set(age * 3, age * 2, fl.a)
          o.scale.setScalar(alive ? fl.size : 0.0001)
          o.updateMatrix()
          flakes.current!.setMatrixAt(i, o.matrix)
        })
        flakes.current.instanceMatrix.needsUpdate = true
      }
    }
  })
  return (
    <group>
      <group ref={vents} visible={false}>
        {Array.from({ length: 6 }, (_, i) => (
          <sprite key={i}>
            <spriteMaterial map={tex} color="#ffffff" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <group ref={deluge} visible={false}>
        {Array.from({ length: 18 }, (_, i) => (
          <sprite key={i}>
            <spriteMaterial map={tex} color="#eef3f8" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <instancedMesh ref={flakes} args={[undefined, undefined, N_FLAKES]} visible={false} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#f4f6f8" side={THREE.DoubleSide} />
      </instancedMesh>
    </group>
  )
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
      // lit from inside by the flame for the first seconds: the nearer the pad, the more orange
      const lit = Math.max(0, 1 - tau / 9) * Math.max(0, 1 - r / 90) * (0.7 + 0.3 * Math.sin(tau * 23 + i))
      col.lerp(FIRE, Math.min(1, lit * 1.1))
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
