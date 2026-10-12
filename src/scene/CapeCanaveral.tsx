/**
 * The launch site: Cape Canaveral at three scales (Florida from altitude, the Cape with its
 * lagoons, pads, VAB and crawlerway, and the pad mound with the concrete apron), plus the pad
 * structures for the selected vehicle and a few landmarks (VAB, LC-39B lightning towers, the
 * other pads). The selected pad is the local origin; the ascent scene swings this group about
 * the Earth's centre as the vehicle flies downrange.
 */
import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { PAD_DECK, PAD_MOUND, PAD_SITE, R_EARTH, SITES, capeMap, floridaMap, padHeight, padMap } from './capeSite'
import { LaunchClouds } from './LaunchClouds'
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
        <mesh geometry={florida.geo} position={[0, -6, 0]} receiveShadow>
          <meshStandardMaterial map={florida.tex} roughness={1} envMapIntensity={0.15} />
        </mesh>
        <mesh geometry={cape.geo} position={[0, -1.5, 0]} receiveShadow>
          <meshStandardMaterial map={cape.tex} roughness={1} envMapIntensity={0.15} />
        </mesh>
        <mesh geometry={near.geo} receiveShadow>
          <meshStandardMaterial map={near.tex} roughness={1} envMapIntensity={0.15} />
        </mesh>
        {/* landmarks in the 48 km map: the VAB, the LCC, the LC-39 pads' lightning towers */}
        <Landmark at={SITES.vab} origin={origin}>
          <mesh position={[0, 80, 0]} material={vabMat} castShadow>
            <boxGeometry args={[218, 160, 158]} />
          </mesh>
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
      {/* the selected pad's structures: the deck is at y = −PAD_DECK, the vehicle base at 0 */}
      <Suspense fallback={null}>
        <PadStructures pad={pad} />
      </Suspense>
      <LaunchClouds deck={deck} />
    </group>
  )
}
