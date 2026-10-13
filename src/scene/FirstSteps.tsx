/**
 * After a ship lands with its crew alive: the first steps on Mars. The hatch opens, a crew
 * elevator rides down the side on its cables, suited figures step off and walk out, the flag goes
 * up in the lee of the legs, crates come down, an inflatable habitat swells and three solar
 * blankets unroll. Everything is a function of the seconds since the "First steps" phase began,
 * so scrubbing replays it. Coordinates are the landing frame: the ship's centre at the origin,
 * +X downrange (the tiles face it), the ground at `groundY`.
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../state/store'
import { hash2 } from './noise'

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}

const SUIT = new THREE.MeshStandardMaterial({ color: '#e9e9e4', roughness: 0.75 })
const SUIT_DARK = new THREE.MeshStandardMaterial({ color: '#8d9096', roughness: 0.7 })
const VISOR = new THREE.MeshStandardMaterial({ color: '#c9962b', metalness: 0.9, roughness: 0.2 })
const CAGE = new THREE.MeshStandardMaterial({ color: '#6a6d72', roughness: 0.6, metalness: 0.5 })
const CRATE = new THREE.MeshStandardMaterial({ color: '#d8d6cf', roughness: 0.8 })
const CRATE_STRAP = new THREE.MeshStandardMaterial({ color: '#2b2e33', roughness: 0.8 })
const POLE = new THREE.MeshStandardMaterial({ color: '#bfc3c8', metalness: 0.7, roughness: 0.4 })
const HAB = new THREE.MeshStandardMaterial({ color: '#f1efe8', roughness: 0.85 })
const HAB_RING = new THREE.MeshStandardMaterial({ color: '#c8c4b8', roughness: 0.85 })
const PANEL = new THREE.MeshStandardMaterial({ color: '#13203a', roughness: 0.35, metalness: 0.3 })
const PANEL_EDGE = new THREE.MeshStandardMaterial({ color: '#9aa0a8', roughness: 0.5, metalness: 0.5 })
const CABLE = new THREE.MeshStandardMaterial({ color: '#2a2a2a' })

/** a suited figure, 1.9 m tall, origin at the feet; limbs named for the walk cycle */
function Astronaut() {
  return (
    <group>
      {/* torso */}
      <mesh position={[0, 1.18, 0]} material={SUIT} castShadow>
        <capsuleGeometry args={[0.24, 0.5, 4, 10]} />
      </mesh>
      {/* backpack */}
      <mesh position={[0, 1.22, -0.3]} material={SUIT_DARK} castShadow>
        <boxGeometry args={[0.46, 0.62, 0.26]} />
      </mesh>
      {/* helmet and visor */}
      <mesh position={[0, 1.7, 0]} material={SUIT} castShadow>
        <sphereGeometry args={[0.19, 14, 10]} />
      </mesh>
      <mesh position={[0, 1.7, 0.09]} material={VISOR}>
        <sphereGeometry args={[0.14, 12, 8]} />
      </mesh>
      {/* arms */}
      <group name="armL" position={[-0.32, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} material={SUIT} castShadow>
          <capsuleGeometry args={[0.075, 0.42, 3, 8]} />
        </mesh>
      </group>
      <group name="armR" position={[0.32, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} material={SUIT} castShadow>
          <capsuleGeometry args={[0.075, 0.42, 3, 8]} />
        </mesh>
      </group>
      {/* legs */}
      <group name="legL" position={[-0.13, 0.85, 0]}>
        <mesh position={[0, -0.42, 0]} material={SUIT} castShadow>
          <capsuleGeometry args={[0.1, 0.62, 3, 8]} />
        </mesh>
        <mesh position={[0, -0.82, 0.05]} material={SUIT_DARK}>
          <boxGeometry args={[0.2, 0.1, 0.32]} />
        </mesh>
      </group>
      <group name="legR" position={[0.13, 0.85, 0]}>
        <mesh position={[0, -0.42, 0]} material={SUIT} castShadow>
          <capsuleGeometry args={[0.1, 0.62, 3, 8]} />
        </mesh>
        <mesh position={[0, -0.82, 0.05]} material={SUIT_DARK}>
          <boxGeometry args={[0.2, 0.1, 0.32]} />
        </mesh>
      </group>
    </group>
  )
}

interface Walk {
  /** waypoints (x, z) on the ground, with the time (s into the phase) the figure arrives */
  path: Array<[number, number, number]>
  /** time the figure steps off the elevator (appears) */
  appear: number
}

function flagTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 160
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f3f1ea'
  ctx.fillRect(0, 0, 256, 160)
  const g = ctx.createRadialGradient(128, 80, 10, 128, 80, 52)
  g.addColorStop(0, '#e8926f')
  g.addColorStop(0.55, '#c8552f')
  g.addColorStop(1, '#6a2514')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(128, 80, 52, 0, Math.PI * 2)
  ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * The sequence. `groundY` is the ground height in the scene; `hatchY` the hatch height above the
 * ground; `shipR` the ship's radius. The phase 'done' with label 'First steps' drives it.
 */
export function FirstSteps({ groundY, hatchY, shipR, crew }: { groundY: number; hatchY: number; shipR: number; crew: number }) {
  const root = useRef<THREE.Group>(null)
  const hatch = useRef<THREE.Group>(null)
  const cage = useRef<THREE.Group>(null)
  const cables = useRef<THREE.Mesh[]>([])
  const figures = useRef<THREE.Group[]>([])
  const flag = useRef<THREE.Group>(null)
  const cloth = useRef<THREE.Mesh>(null)
  const hab = useRef<THREE.Group>(null)
  const panels = useRef<THREE.Group[]>([])
  const crates = useRef<THREE.Group[]>([])
  const flagTex = useMemo(() => flagTexture(), [])
  const n = Math.max(2, Math.min(6, crew))
  // the hatch is on the -X side of the ship (the side away from the tiles), the elevator below it
  const hx = -shipR - 0.3
  const walks = useMemo<Walk[]>(() => {
    const out: Walk[] = []
    const spots: Array<[number, number]> = [
      [-24, 7],
      [-27, -2],
      [-38, -14],
      [-30, 14],
      [-44, -6],
      [-22, -10],
    ]
    for (let i = 0; i < n; i++) {
      const appear = 70 + i * 14
      const [sx, sz] = spots[i]
      const wander = i % 2 ? 1 : -1
      out.push({
        appear,
        path: [
          [hx - 2.2, 0, appear],
          [hx - 8, 2 * wander, appear + 9],
          [sx, sz, appear + 32],
          [sx + 4 * wander, sz + 5, appear + 60],
          [sx - 3, sz - 4 * wander, appear + 95],
          [sx + 2, sz + 2, appear + 140],
        ],
      })
    }
    return out
  }, [n, hx])

  useFrame(({ clock }) => {
    const { result, t } = useAppStore.getState()
    const phase = result?.phases.find((p) => p.phase === 'done' && p.label === 'First steps')
    const g = root.current
    if (!g) return
    if (!phase || t < phase.start) {
      g.visible = false
      return
    }
    g.visible = true
    const tau = t - phase.start
    const T = clock.elapsedTime
    // the hatch swings open from 30 s
    if (hatch.current) hatch.current.rotation.y = -1.9 * smooth((tau - 30) / 6)
    // the elevator: first ride down 40–62 s, then a cycle every 70 s (up 20 s, wait, down 20 s)
    let cageY = hatchY
    if (tau >= 40) {
      const first = smooth((tau - 40) / 22)
      if (tau < 62 + 30) cageY = hatchY * (1 - first)
      else {
        const c = (tau - 92) % 70
        const up = c < 20 ? smooth(c / 20) : c < 45 ? 1 : 1 - smooth((c - 45) / 20)
        cageY = hatchY * up
      }
    }
    if (cage.current) {
      cage.current.position.set(hx - 1.6, groundY + cageY + 1.4, 0)
      cage.current.visible = tau >= 36
    }
    for (const c of cables.current) {
      if (!c) continue
      const len = Math.max(0.1, hatchY + 2 - cageY - 1.4)
      c.scale.y = len
      c.position.y = groundY + cageY + 2.8 + len / 2
      c.visible = tau >= 36
    }
    // the crew: walk the waypoints, bob and swing the limbs while moving, idle looking about
    figures.current.forEach((f, i) => {
      if (!f) return
      const w = walks[i]
      if (!w || tau < w.appear) {
        f.visible = false
        return
      }
      f.visible = true
      const p = w.path
      let k = 0
      while (k < p.length - 1 && tau > p[k + 1][2]) k++
      const a = p[k]
      const b = p[Math.min(k + 1, p.length - 1)]
      const span = Math.max(0.1, b[2] - a[2])
      const u = Math.min(1, Math.max(0, (tau - a[2]) / span))
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1])
      // walk at ~0.9 m/s, then wait at the waypoint
      const walkT = dist / 0.9
      const uu = Math.min(1, (tau - a[2]) / Math.max(walkT, 0.1))
      const moving = uu < 1 && k < p.length - 1 && dist > 0.1
      const x = a[0] + (b[0] - a[0]) * (moving ? uu : 1)
      const z = a[1] + (b[1] - a[1]) * (moving ? uu : 1)
      const bob = moving ? Math.abs(Math.sin(T * 7 + i)) * 0.06 : 0
      f.position.set(x, groundY + bob, z)
      if (moving) f.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1])
      else f.rotation.y += Math.sin(T * 0.3 + i) * 0.002
      const swing = moving ? Math.sin(T * 7 + i) * 0.55 : Math.sin(T * 0.8 + i) * 0.04
      f.traverse((o) => {
        if (o.name === 'legL') o.rotation.x = swing
        else if (o.name === 'legR') o.rotation.x = -swing
        else if (o.name === 'armL') o.rotation.x = -swing * 0.7
        else if (o.name === 'armR') o.rotation.x = swing * 0.7
      })
      void u
    })
    // the flag: raised at 112–120 s; the cloth sways a little in the thin wind
    if (flag.current) {
      const up = smooth((tau - 112) / 8)
      flag.current.visible = tau >= 112
      flag.current.position.set(-25, groundY - 2.6 + 2.6 * up, 8)
      if (cloth.current) cloth.current.rotation.y = 0.12 * Math.sin(T * 1.1) + 0.06 * Math.sin(T * 2.7)
    }
    // the habitat: inflates 165–195 s
    if (hab.current) {
      const k = smooth((tau - 165) / 30)
      hab.current.visible = tau >= 165
      hab.current.scale.set(0.15 + 0.85 * k, 0.1 + 0.9 * k, 0.15 + 0.85 * k)
      hab.current.position.set(-46, groundY, 16)
    }
    // the solar blankets unroll 215–245 s, one after another
    panels.current.forEach((pn, i) => {
      if (!pn) return
      const k = smooth((tau - 215 - i * 9) / 18)
      pn.visible = tau >= 215 + i * 9
      pn.scale.set(Math.max(0.01, k), 1, 1)
    })
    // crates: two per elevator cycle, set down beside the cage
    crates.current.forEach((c, i) => {
      if (!c) return
      const cycle = 92 + Math.floor(i / 2) * 70 + 65
      c.visible = tau >= cycle
    })
  })

  const cratePositions = useMemo(() => Array.from({ length: 8 }, (_, i) => [hx - 4.5 - (i % 4) * 1.6, 0, -3 + Math.floor(i / 4) * 1.5 + (hash2(i, 7) - 0.5) * 0.4] as [number, number, number]), [hx])

  return (
    <group ref={root} visible={false}>
      {/* the hatch: a panel on the ship's -X side at the crew deck, hinged on its forward edge */}
      <group position={[hx + 0.3, groundY + hatchY + 1.2, 0.7]}>
        <group ref={hatch}>
          <mesh position={[0, 0, -0.7]} material={SUIT_DARK} castShadow>
            <boxGeometry args={[0.12, 2.2, 1.4]} />
          </mesh>
        </group>
      </group>
      {/* the elevator boom, cables and cage */}
      <mesh position={[hx - 1.0, groundY + hatchY + 2.9, 0]} material={CAGE} castShadow>
        <boxGeometry args={[3.2, 0.3, 0.3]} />
      </mesh>
      {[-0.9, 0.9].map((z, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) cables.current[i] = m
          }}
          position={[hx - 1.6, groundY + hatchY, z]}
          material={CABLE}
        >
          <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
        </mesh>
      ))}
      <group ref={cage} visible={false}>
        <mesh material={CAGE} castShadow>
          <boxGeometry args={[2.4, 0.16, 2.4]} />
        </mesh>
        <mesh position={[0, 1.3, 0]} material={CAGE}>
          <boxGeometry args={[2.5, 2.6, 2.5]} />
        </mesh>
        <mesh position={[0, 1.3, 0]} material={new THREE.MeshStandardMaterial({ color: '#2a2d33', transparent: true, opacity: 0.35, roughness: 0.3 })}>
          <boxGeometry args={[2.3, 2.4, 2.3]} />
        </mesh>
      </group>
      {/* the crew */}
      {Array.from({ length: n }, (_, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) figures.current[i] = g
          }}
          visible={false}
        >
          <Astronaut />
        </group>
      ))}
      {/* the flag */}
      <group ref={flag} visible={false}>
        <mesh position={[0, 1.3, 0]} material={POLE} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 2.6, 8]} />
        </mesh>
        <mesh position={[0, 2.6, 0]} material={POLE}>
          <cylinderGeometry args={[0.02, 0.02, 1.3, 6]} />
        </mesh>
        <mesh ref={cloth} position={[0.62, 2.2, 0]} castShadow>
          <planeGeometry args={[1.2, 0.76, 8, 4]} />
          <meshStandardMaterial map={flagTex} side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      </group>
      {/* the habitat: an inflatable dome on a ring, with an airlock */}
      <group ref={hab} visible={false}>
        <mesh position={[0, 0.2, 0]} material={HAB_RING}>
          <cylinderGeometry args={[5.4, 5.6, 0.4, 32]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} material={HAB} castShadow receiveShadow>
          <sphereGeometry args={[5.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        {[1.2, 2.4, 3.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={HAB_RING}>
            <torusGeometry args={[Math.sqrt(Math.max(0.1, 5.2 * 5.2 - (y - 0.4) ** 2)), 0.06, 6, 48]} />
          </mesh>
        ))}
        <mesh position={[5.2, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} material={HAB_RING} castShadow>
          <cylinderGeometry args={[1.1, 1.1, 2.6, 16]} />
        </mesh>
      </group>
      {/* three roll-out solar blankets */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) panels.current[i] = g
          }}
          position={[-34, groundY + 0.5, -24 - i * 3.2]}
          visible={false}
        >
          <mesh position={[-7, 0, 0]} rotation={[-Math.PI / 2 + 0.2, 0, 0]} material={PANEL} castShadow>
            <planeGeometry args={[14, 2.2]} />
          </mesh>
          <mesh position={[0, 0, 0]} material={PANEL_EDGE}>
            <boxGeometry args={[0.3, 0.5, 2.4]} />
          </mesh>
        </group>
      ))}
      {/* crates */}
      {cratePositions.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) crates.current[i] = g
          }}
          position={[p[0], groundY + 0.5, p[2]]}
          rotation={[0, hash2(i, 9) * 0.6, 0]}
          visible={false}
        >
          <mesh material={CRATE} castShadow>
            <boxGeometry args={[1.3, 1.0, 1.1]} />
          </mesh>
          <mesh material={CRATE_STRAP}>
            <boxGeometry args={[1.34, 0.08, 1.14]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
