/**
 * The launch site: Cape Canaveral at three scales (Florida from altitude, the Cape with its
 * lagoons, pads, VAB and crawlerway, and the pad mound with the concrete apron), a real water
 * surface under the land maps (the ocean, the lagoons and the ponds are holes in the maps, so the
 * sea gets sun glint and moving waves), coastal scrub around the pad, cumulus over the Cape,
 * plus the pad structures for the selected vehicle and a few landmarks. The selected pad is
 * the local origin; the ascent scene swings this group about the Earth's centre as the vehicle
 * flies downrange.
 */
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { PAD_DECK, PAD_MOUND, PAD_SITE, R_EARTH, SITES, capeMap, floridaMap, padHeight, padMap, waterAt, waveNormalTexture } from './capeSite'
import { Birds, Hangar, PadSign, Vab } from './CapeDetail'
import { dustTexture } from './impact'
import { LaunchClouds } from './LaunchClouds'
import { hash2 } from './noise'
import { PadStructures } from './pads'
import { capGeometry } from './terrain'

const KM = 1000
const cache: { florida?: THREE.CanvasTexture; cape: Partial<Record<PadId, THREE.CanvasTexture>>; pad: Partial<Record<PadId, THREE.CanvasTexture>> } = { cape: {}, pad: {} }

function Landmark({ at, origin, children }: { at: [number, number]; origin: [number, number]; children: React.ReactNode }) {
  return <group position={[at[0] - origin[0], 0, at[1] - origin[1]]}>{children}</group>
}

const concrete = new THREE.MeshStandardMaterial({ color: '#9b9a92', roughness: 0.95 })
const vabMat = new THREE.MeshStandardMaterial({ color: '#d8d8d3', roughness: 0.8 })
const steelGrey = new THREE.MeshStandardMaterial({ color: '#6f7479', roughness: 0.65, metalness: 0.5 })

/** the sea: a spherical cap under the land, normal-mapped waves drifting, specular sun glint */
function Water({ y }: { y: number }) {
  const geo = useMemo(() => capGeometry(R_EARTH, 1200 * KM, 64), [])
  const mat = useMemo(() => {
    const normalMap = waveNormalTexture()
    normalMap.repeat.set(9000, 9000) // one tile ≈ 270 m
    return new THREE.MeshStandardMaterial({ color: '#143c5a', roughness: 0.38, metalness: 0.0, normalMap, normalScale: new THREE.Vector2(0.45, 0.45), envMapIntensity: 0.9 })
  }, [])
  useFrame((_, dt) => {
    const m = mat.normalMap!
    m.offset.x = (m.offset.x + dt * 0.012) % 1
    m.offset.y = (m.offset.y + dt * 0.007) % 1
  })
  return <mesh geometry={geo} material={mat} position={[0, y, 0]} receiveShadow />
}

/** low coastal scrub around the pad: instanced flattened blobs, two greens */
function Scrub({ pad, groundY, map }: { pad: PadId; groundY: number; map: THREE.CanvasTexture }) {
  const mesh = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 7, 5)
    const mat = new THREE.MeshStandardMaterial({ color: '#4a6a33', roughness: 1 })
    const n = 1600
    const m = new THREE.InstancedMesh(g, mat, n)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    const inner = pad.startsWith('lc39') ? 430 : 330 // keep the apron and the perimeter road clear
    let k = 0
    for (let i = 0; i < n * 2 && k < n; i++) {
      const a = hash2(i, 21) * Math.PI * 2
      const r = inner + Math.pow(hash2(i, 22), 0.7) * 1700
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      // leave the crawlerway (west) and the road ring clear; nothing grows in the sea
      if (Math.abs(z) < 40 && x < 0) continue
      if (waterAt(map, x, z)) continue
      const s = 1.6 + hash2(i, 23) * 3.2
      o.position.set(x, groundY + s * 0.35, z)
      o.scale.set(s, s * 0.55, s * (0.8 + hash2(i, 24) * 0.5))
      o.rotation.y = hash2(i, 25) * Math.PI
      o.updateMatrix()
      m.setMatrixAt(k, o.matrix)
      col.setHSL(0.25 + hash2(i, 26) * 0.05, 0.35, 0.2 + hash2(i, 27) * 0.1)
      m.setColorAt(k, col)
      k++
    }
    m.count = k
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.castShadow = true
    m.frustumCulled = false
    return m
  }, [pad, groundY, map])
  return <primitive object={mesh} />
}

/** fair-weather cumulus over the Cape: billboards at 1.2–2 km */
function Cumulus({ groundY }: { groundY: number }) {
  const tex = useMemo(() => dustTexture(), [])
  const clouds = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = hash2(i, 31) * Math.PI * 2
        const r = 2500 + hash2(i, 32) * 26_000
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, y: 1200 + hash2(i, 33) * 900, s: 700 + hash2(i, 34) * 1300, o: 0.55 + hash2(i, 35) * 0.3 }
      }),
    [],
  )
  return (
    <group position={[0, groundY, 0]}>
      {clouds.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.45, 1]}>
          <spriteMaterial map={tex} color="#ffffff" transparent opacity={c.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

export function CapeCanaveral({ pad }: { pad: PadId }) {
  const origin = PAD_SITE[pad]
  const deck = -PAD_DECK[pad]
  const groundY = deck - PAD_MOUND[pad] // grade level around the mound

  const florida = useMemo(() => {
    if (!cache.florida) cache.florida = floridaMap(origin)
    return { tex: cache.florida, geo: capGeometry(R_EARTH, 1200 * KM, 96) }
  }, [origin])
  const cape = useMemo(() => {
    if (!cache.cape[pad]) cache.cape[pad] = capeMap(origin)
    return { tex: cache.cape[pad]!, geo: capGeometry(R_EARTH, 24 * KM, 48) }
  }, [pad, origin])
  const near = useMemo(() => {
    if (!cache.pad[pad]) cache.pad[pad] = padMap(pad)
    return { tex: cache.pad[pad]!, geo: capGeometry(R_EARTH, 1000, 160, (x, z) => padHeight(pad, x, z)) }
  }, [pad])

  return (
    <group>
      <group position={[0, groundY, 0]}>
        <Water y={-2.2} />
        <mesh geometry={florida.geo} position={[0, -6, 0]} receiveShadow>
          <meshStandardMaterial map={florida.tex} roughness={1} envMapIntensity={0.15} alphaTest={0.5} />
        </mesh>
        <mesh geometry={cape.geo} position={[0, -1.5, 0]} receiveShadow>
          <meshStandardMaterial map={cape.tex} roughness={1} envMapIntensity={0.15} alphaTest={0.5} />
        </mesh>
        <mesh geometry={near.geo} receiveShadow>
          <meshStandardMaterial map={near.tex} roughness={1} envMapIntensity={0.15} />
        </mesh>
        {/* landmarks in the 48 km map: the VAB, the LCC, the LC-39 pads' lightning towers */}
        <Landmark at={SITES.vab} origin={origin}>
          <Vab />
          <mesh position={[0, 2, 0]} material={concrete}>
            <boxGeometry args={[700, 4, 600]} />
          </mesh>
        </Landmark>
        <Landmark at={SITES.lcc} origin={origin}>
          <mesh position={[0, 12, 0]} material={vabMat}>
            <boxGeometry args={[150, 24, 100]} />
          </mesh>
        </Landmark>
        {(['lc39a', 'lc39b'] as const).map((p) => {
          const at = SITES[p]
          const mine = Math.hypot(at[0] - origin[0], at[1] - origin[1]) < 100
          if (mine) return null
          return (
            <Landmark key={p} at={at} origin={origin}>
              <mesh position={[0, 7.5, 0]} material={concrete}>
                <cylinderGeometry args={[250, 330, 15, 24]} />
              </mesh>
              {p === 'lc39b' &&
                [0, 1, 2].map((i) => {
                  const a = (i / 3) * Math.PI * 2 + 0.5
                  return (
                    <mesh key={i} position={[Math.cos(a) * 210, 90, Math.sin(a) * 210]} material={steelGrey}>
                      <boxGeometry args={[6, 180, 6]} />
                    </mesh>
                  )
                })}
              {p === 'lc39a' && (
                <mesh position={[-32, 88, 0]} material={steelGrey}>
                  <boxGeometry args={[13, 146, 13]} />
                </mesh>
              )}
            </Landmark>
          )
        })}
      </group>
      <Scrub pad={pad} groundY={groundY} map={cape.tex} />
      <Cumulus groundY={groundY} />
      <Birds groundY={groundY} />
      {/* the pad road leaves west: the number board at the perimeter, the hangar beyond it */}
      <group position={[0, groundY, 0]}>
        <PadSign pad={pad} x={-(pad.startsWith('lc39') ? 470 : 360)} z={-40} y={0} facing={Math.PI / 2} />
        {(pad === 'lc39a-starship' || pad === 'lc39a-fss') && <Hangar x={-720} z={120} />}
      </group>
      {/* the selected pad's structures: the deck is at y = −PAD_DECK, the vehicle base at 0 */}
      <Suspense fallback={null}>
        <PadStructures pad={pad} />
      </Suspense>
      <LaunchClouds deck={deck} />
    </group>
  )
}
