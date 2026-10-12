/**
 * Launch pad structures (procedural): lattice towers, launch mounts, swing arms, tank farms,
 * lightning towers; one component per pad environment at the Cape. The vehicle base sits at the
 * local origin, the pad deck at y = −PAD_DECK[pad]. The NASA Mobile Launcher for SLS is a real
 * model (NASA-3D-Resources, public domain).
 */
import { useGLTF } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { PAD_DECK } from './capeSite'

const BASE_URL = import.meta.env.BASE_URL

const steel = new THREE.MeshStandardMaterial({ color: '#2b2e33', roughness: 0.7, metalness: 0.55 })
const steelGrey = new THREE.MeshStandardMaterial({ color: '#6f7479', roughness: 0.65, metalness: 0.5 })
const steelLight = new THREE.MeshStandardMaterial({ color: '#b8bcc0', roughness: 0.6, metalness: 0.4 })
const steelRed = new THREE.MeshStandardMaterial({ color: '#8f3b2a', roughness: 0.7, metalness: 0.4 })
const white = new THREE.MeshStandardMaterial({ color: '#e8e8e4', roughness: 0.55, metalness: 0.1 })
const concrete = new THREE.MeshStandardMaterial({ color: '#8d8c84', roughness: 0.95 })
const dark = new THREE.MeshStandardMaterial({ color: '#1c1e22', roughness: 0.8, metalness: 0.4 })

interface Member {
  p: [number, number, number]
  r: [number, number, number]
  s: [number, number, number]
}

/** square-section lattice tower: corner columns, horizontals every `bay`, X-braces on each face; one instanced draw */
function Lattice({ x = 0, z = 0, y0 = 0, w, h, bay = 10, member = 0.5, material = steel }: { x?: number; z?: number; y0?: number; w: number; h: number; bay?: number; member?: number; material?: THREE.Material }) {
  const mesh = useMemo(() => {
    const members: Member[] = []
    const hw = w / 2
    for (const [cx, cz] of [
      [-hw, -hw],
      [hw, -hw],
      [-hw, hw],
      [hw, hw],
    ]) members.push({ p: [x + cx, y0 + h / 2, z + cz], r: [0, 0, 0], s: [member, h, member] })
    const levels = Math.max(1, Math.round(h / bay))
    const dy = h / levels
    const diagLen = Math.hypot(w, dy)
    const ang = Math.atan2(dy, w)
    for (let i = 0; i <= levels; i++) {
      const y = y0 + i * dy
      members.push({ p: [x, y, z - hw], r: [0, 0, 0], s: [w, member * 0.7, member * 0.7] })
      members.push({ p: [x, y, z + hw], r: [0, 0, 0], s: [w, member * 0.7, member * 0.7] })
      members.push({ p: [x - hw, y, z], r: [0, Math.PI / 2, 0], s: [w, member * 0.7, member * 0.7] })
      members.push({ p: [x + hw, y, z], r: [0, Math.PI / 2, 0], s: [w, member * 0.7, member * 0.7] })
      if (i < levels) {
        const ym = y + dy / 2
        const sgn = i % 2 ? 1 : -1
        members.push({ p: [x, ym, z - hw], r: [0, 0, sgn * ang], s: [diagLen, member * 0.5, member * 0.5] })
        members.push({ p: [x, ym, z + hw], r: [0, 0, -sgn * ang], s: [diagLen, member * 0.5, member * 0.5] })
        members.push({ p: [x - hw, ym, z], r: [sgn * ang, Math.PI / 2, 0], s: [diagLen, member * 0.5, member * 0.5] })
        members.push({ p: [x + hw, ym, z], r: [-sgn * ang, Math.PI / 2, 0], s: [diagLen, member * 0.5, member * 0.5] })
      }
    }
    const g = new THREE.BoxGeometry(1, 1, 1)
    const m = new THREE.InstancedMesh(g, material, members.length)
    const o = new THREE.Object3D()
    members.forEach((mb, i) => {
      o.position.set(...mb.p)
      o.rotation.set(...mb.r)
      o.scale.set(...mb.s)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.castShadow = true
    m.receiveShadow = true
    return m
  }, [x, z, y0, w, h, bay, member, material])
  return <primitive object={mesh} />
}

function Box({ p, s, material = steelGrey, r }: { p: [number, number, number]; s: [number, number, number]; material?: THREE.Material; r?: [number, number, number] }) {
  return (
    <mesh position={p} scale={s} rotation={r} material={material} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  )
}

function Cyl({ p, r, h, material = white, rTop, segments = 24 }: { p: [number, number, number]; r: number; h: number; material?: THREE.Material; rTop?: number; segments?: number }) {
  return (
    <mesh position={p} material={material} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments]} />
    </mesh>
  )
}

/** propellant storage: vertical tanks (Starship GSE) or spheres (LC-39 LOX/LH2) */
function TankFarm({ x, z, kind }: { x: number; z: number; kind: 'vertical' | 'spheres' | 'horizontal' }) {
  if (kind === 'spheres')
    return (
      <group>
        <mesh position={[x, 11, z]} material={white} castShadow>
          <sphereGeometry args={[10.5, 24, 16]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <Cyl key={i} p={[x + Math.cos((i / 8) * Math.PI * 2) * 7, 2.5, z + Math.sin((i / 8) * Math.PI * 2) * 7]} r={0.5} h={5} material={steelGrey} segments={8} />
        ))}
      </group>
    )
  if (kind === 'horizontal')
    return (
      <group>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[x, 3.2, z + i * 9]} rotation={[0, 0, Math.PI / 2]} material={white} castShadow>
            <capsuleGeometry args={[2.8, 18, 6, 16]} />
          </mesh>
        ))}
      </group>
    )
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <Cyl key={i} p={[x + (i % 2) * 11, 14, z + i * 11]} r={4.6} h={28} material={white} />
      ))}
      <Box p={[x + 5, 0.3, z + 33]} s={[40, 0.6, 90]} material={concrete} />
    </group>
  )
}

/** the LC-39 water tower: 88 m, a sphere on a slender shaft */
function WaterTower({ x, z }: { x: number; z: number }) {
  return (
    <group>
      <Cyl p={[x, 38, z]} r={2.2} h={76} material={white} segments={16} />
      <mesh position={[x, 80, z]} material={white} castShadow>
        <sphereGeometry args={[8, 20, 14]} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => (
        <Box key={i} p={[x + Math.cos((i / 4) * Math.PI * 2) * 7, 2.5, z + Math.sin((i / 4) * Math.PI * 2) * 7]} s={[1, 5, 1]} material={steelGrey} />
      ))}
      <Box p={[x, 5.5, z]} s={[20, 1, 20]} material={steelGrey} />
    </group>
  )
}

/** lightning protection: a lattice with a fibreglass mast and a catenary spur */
function LightningTower({ x, z, h = 120 }: { x: number; z: number; h?: number }) {
  return (
    <group>
      <Lattice x={x} z={z} w={6} h={h * 0.8} bay={8} member={0.35} material={steelGrey} />
      <Cyl p={[x, h * 0.9, z]} r={0.35} h={h * 0.2} material={white} segments={8} />
    </group>
  )
}

function SwingArm({ x, z, y, len, toward = 1, material = white, h = 2.6, w = 3 }: { x: number; z: number; y: number; len: number; toward?: number; material?: THREE.Material; h?: number; w?: number }) {
  return <Box p={[x + (toward * len) / 2, y, z]} s={[len, h, w]} material={material} />
}

/** SpaceX Starship pad at LC-39A: orbital launch mount, the 146 m integration tower with its catch arms, GSE tank farm */
function StarshipPad() {
  const deck = -PAD_DECK['lc39a-starship']
  const tx = -32
  return (
    <group>
      {/* orbital launch mount: hexagonal table on six legs */}
      <mesh position={[0, -2.2, 0]} material={steel} castShadow receiveShadow>
        <cylinderGeometry args={[12.5, 12.5, 4.4, 6, 1, false]} />
      </mesh>
      <mesh position={[0, -2.2, 0]} material={dark}>
        <cylinderGeometry args={[5.4, 5.4, 4.6, 32, 1, true]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        return <Cyl key={i} p={[Math.cos(a) * 10.5, (deck - 4.4) / 2, Math.sin(a) * 10.5]} r={1.6} h={-deck - 4.4} material={steel} segments={12} />
      })}
      <Box p={[0, deck + 0.6, 0]} s={[46, 1.2, 46]} material={concrete} />
      {/* deluge / flame diverter plate under the mount */}
      <Box p={[0, deck + 1.4, 0]} s={[28, 0.4, 28]} material={steelGrey} />
      {/* the tower */}
      <Lattice x={tx} z={0} y0={deck} w={13} h={146} bay={12} member={0.9} material={steel} />
      <Box p={[tx, deck + 147, 0]} s={[15, 2, 15]} material={steel} />
      <Cyl p={[tx, deck + 160, 0]} r={0.4} h={24} material={white} segments={8} />
      {/* chopstick carriage and the two catch arms, open around the stack at the booster/ship interface */}
      <Box p={[tx + 7.5, 66, 0]} s={[3, 10, 14]} material={steel} />
      <Box p={[tx + 9 + 17, 66, -9.5]} s={[36, 3.2, 2.4]} material={steel} r={[0, 0.12, 0]} />
      <Box p={[tx + 9 + 17, 66, 9.5]} s={[36, 3.2, 2.4]} material={steel} r={[0, -0.12, 0]} />
      {/* ship quick-disconnect arm */}
      <SwingArm x={tx + 7} z={-2} y={79} len={20} material={steel} h={3} w={4} />
      {/* booster QD at the mount */}
      <Box p={[tx + 14, -1, 0]} s={[22, 3, 4]} material={steel} />
      <TankFarm x={-150} z={-120} kind="vertical" />
      <WaterTower x={-210} z={90} />
    </group>
  )
}

/** NASA's Mobile Launcher (real model) on LC-39B with the three lightning towers */
function MobileLauncherPad() {
  const deck = -PAD_DECK['lc39b-ml']
  const gltf = useGLTF(`${BASE_URL}assets/pad/mobile-launcher.glb`, `${BASE_URL}draco/`)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  useLayoutEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
  }, [scene])
  // the node is scaled 0.01 in the file (2.46 units tall); ×47 gives the real 116 m, base 48 × 41 m
  const k = 47
  return (
    <group>
      <group position={[0, deck, 0]} scale={[k, k, k]}>
        <primitive object={scene} />
      </group>
      {/* pad surface, the flame trench */}
      <Box p={[0, deck - 0.6, 0]} s={[60, 1.2, 150]} material={concrete} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5
        return <LightningTower key={i} x={Math.cos(a) * 210} z={Math.sin(a) * 210} h={180} />
      })}
      <WaterTower x={-240} z={-60} />
      <TankFarm x={200} z={-330} kind="spheres" />
      <TankFarm x={200} z={330} kind="spheres" />
    </group>
  )
}

/** LC-39A for Falcon Heavy: the fixed service structure with the crew access arm, the transporter-erector strongback */
function FssPad() {
  const deck = -PAD_DECK['lc39a-fss']
  const fx = -36
  return (
    <group>
      <Lattice x={fx} z={-8} y0={deck} w={12} h={81} bay={9} member={0.6} material={steelGrey} />
      <Box p={[fx, deck + 82, -8]} s={[14, 2, 14]} material={steelGrey} />
      <Cyl p={[fx, deck + 95, -8]} r={0.5} h={26} material={white} segments={8} />
      {/* crew access arm + white room at the capsule hatch */}
      <SwingArm x={fx + 6} z={-6} y={62} len={22} material={white} h={3.2} w={3.6} />
      <Box p={[fx + 29, 62, -6]} s={[4, 4, 4]} material={white} />
      {/* transporter-erector: strongback against the rocket, launch mount at the base */}
      <Lattice x={0} z={9.5} y0={deck} w={6} h={70} bay={7} member={0.45} material={dark} />
      <Box p={[0, deck + 2.5, 2]} s={[16, 5, 22]} material={steelGrey} />
      <Box p={[0, deck + 4, 0]} s={[3, 3, 3]} material={dark} />
      {[14, 30, 46, 60].map((y) => (
        <Box key={y} p={[0, y, 5]} s={[9, 1.2, 3]} material={dark} />
      ))}
      <Box p={[0, deck + 0.6, 0]} s={[70, 1.2, 70]} material={concrete} />
      <WaterTower x={-230} z={70} />
      <TankFarm x={220} z={-330} kind="spheres" />
      <TankFarm x={220} z={330} kind="spheres" />
    </group>
  )
}

/** Apollo-era LC-39A: the mobile launcher platform with the red launch umbilical tower and its nine swing arms */
function LutPad() {
  const deck = -PAD_DECK['lc39a-lut']
  const tx = -30
  return (
    <group>
      {/* platform on its six pedestals */}
      <Box p={[-8, deck + 3.8, 0]} s={[49, 7.6, 41]} material={steelGrey} />
      {[-20, 0, 20].flatMap((x) => [-16, 16].map((z) => <Box key={`${x}${z}`} p={[x - 8, deck / 2, z]} s={[2.5, -deck, 2.5]} material={concrete} />))}
      <Lattice x={tx} z={0} y0={deck + 7.6} w={12} h={110} bay={10} member={0.7} material={steelRed} />
      <Box p={[tx, deck + 120, 0]} s={[24, 3, 4]} material={steelRed} r={[0, 0.3, 0]} />
      {[deck + 20, 24, 36, 48, 60, 72, 84, 96, 104].map((y, i) => (
        <SwingArm key={i} x={tx + 6} z={i % 2 ? 2 : -2} y={y} len={18} material={white} h={2.2} w={2.6} />
      ))}
      <Box p={[0, deck + 0.6, 0]} s={[80, 1.2, 80]} material={concrete} />
      <WaterTower x={-230} z={70} />
      <TankFarm x={220} z={-330} kind="spheres" />
      <TankFarm x={220} z={330} kind="spheres" />
    </group>
  )
}

/** LC-36 for New Glenn: strongback against the rocket on the mount, a lightning tower and horizontal tanks */
function Lc36Pad() {
  const deck = -PAD_DECK.lc36
  return (
    <group>
      <Box p={[0, deck + 3, 0]} s={[26, 6, 26]} material={steelGrey} />
      <Lattice x={0} z={-12} y0={deck} w={9} h={92} bay={8} member={0.6} material={dark} />
      {[20, 44, 68, 86].map((y) => (
        <Box key={y} p={[0, y, -6]} s={[10, 1.4, 4]} material={dark} />
      ))}
      <LightningTower x={-90} z={60} h={110} />
      <LightningTower x={90} z={-70} h={110} />
      <Box p={[0, deck + 0.6, 0]} s={[90, 1.2, 90]} material={concrete} />
      <TankFarm x={180} z={-40} kind="horizontal" />
      <WaterTower x={-200} z={-120} />
    </group>
  )
}

/** a generic umbilical tower (used for the notional Cape pad of Long March 10) */
function UmbilicalPad() {
  const deck = -PAD_DECK.slc37
  const tx = -26
  return (
    <group>
      <Box p={[0, deck + 4, 0]} s={[24, 8, 24]} material={steelGrey} />
      <Lattice x={tx} z={0} y0={deck} w={11} h={96} bay={9} member={0.6} material={steelLight} />
      {[18, 34, 50, 66, 80].map((y, i) => (
        <SwingArm key={y} x={tx + 5.5} z={i % 2 ? 2 : -2} y={y} len={16} material={white} />
      ))}
      <Box p={[tx, deck + 98, 0]} s={[13, 2, 13]} material={steelLight} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4
        return <LightningTower key={i} x={Math.cos(a) * 150} z={Math.sin(a) * 150} h={100} />
      })}
      <Box p={[0, deck + 0.6, 0]} s={[80, 1.2, 80]} material={concrete} />
      <TankFarm x={200} z={-200} kind="spheres" />
      <WaterTower x={-200} z={120} />
    </group>
  )
}

export function PadStructures({ pad }: { pad: PadId }) {
  switch (pad) {
    case 'lc39a-starship':
      return <StarshipPad />
    case 'lc39b-ml':
      return <MobileLauncherPad />
    case 'lc39a-fss':
      return <FssPad />
    case 'lc39a-lut':
      return <LutPad />
    case 'lc36':
      return <Lc36Pad />
    case 'slc37':
      return <UmbilicalPad />
  }
}

useGLTF.preload(`${BASE_URL}assets/pad/mobile-launcher.glb`, `${BASE_URL}draco/`)
