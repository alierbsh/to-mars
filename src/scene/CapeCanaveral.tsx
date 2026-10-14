/**
 * The launch site: Cape Canaveral at three scales (the Earth and a 2000 km regional tile from
 * altitude — EarthBelow —, the Cape with its lagoons, pads, VAB and crawlerway, and the pad mound
 * with the concrete apron), a real water surface under the Cape map (the ocean, the lagoons and
 * the ponds are holes in the map, so the sea gets sun glint and moving waves), coastal scrub
 * around the pad, cumulus over the Cape, plus the pad structures for the selected vehicle and a
 * few landmarks. Every ground material is seen through the atmosphere and under the cloud deck's
 * shadows. The selected pad is the local origin; the ascent scene swings this group about the
 * Earth's centre as the vehicle flies downrange.
 */
import { useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { PAD_DECK, PAD_MOUND, PAD_SITE, R_EARTH, SITES, ll, padHeight, waveNormalTexture } from './capeSite'
import { applyAerialPerspective } from './atmosphere'
import { EarthBelow, applyCloudShadow, applyEdgeFade } from './EarthBelow'
import { Birds, Hangar, PadSign, Vab } from './CapeDetail'
import { dustTexture } from './impact'
import { LaunchClouds, LaunchDetail } from './LaunchClouds'
import { VEHICLES } from '../data/vehicles'
import { hash2 } from './noise'
import { PadStructures } from './pads'
import { capGeometry } from './terrain'
import { texName } from './quality'
import { useMaps } from './maps'
import { qualityNow, useQuality } from './useQuality'

const KM = 1000
const BASE_URL = import.meta.env.BASE_URL

/** the offline tiles (scripts/cape-assets.py): the ±24 km Cape tile each pad sits in, and the site of its ±4 km / ±1 km tiles */
const CAPE_TILE_CENTRE: Record<'39' | 'ccsfs', [number, number]> = { '39': ll(-80.6041, 28.6083), ccsfs: ll(-80.554, 28.501) }
const TILES: Record<PadId, { cape: '39' | 'ccsfs'; site: string }> = {
  'lc39a-starship': { cape: '39', site: 'lc39a' },
  'lc39a-fss': { cape: '39', site: 'lc39a' },
  'lc39a-lut': { cape: '39', site: 'lc39a' },
  'lc39b-ml': { cape: '39', site: 'lc39b' },
  slc37: { cape: 'ccsfs', site: 'slc37' },
  lc36: { cape: 'ccsfs', site: 'lc36' },
}

/** is (x, z) in pad-local metres water on a tile's alpha image (±half)? */
function waterAt(mask: HTMLImageElement, half: number, x: number, z: number): boolean {
  const img = mask as HTMLImageElement & { __alpha?: Uint8ClampedArray; __n?: number }
  if (!img.__alpha) {
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const ctx = c.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    img.__alpha = ctx.getImageData(0, 0, img.width, img.height).data
    img.__n = img.width
  }
  const n = img.__n!
  const i = Math.round(((x + half) / (2 * half)) * (n - 1))
  const j = Math.round(((z + half) / (2 * half)) * (n - 1))
  if (i < 0 || j < 0 || i >= n || j >= n) return false
  return img.__alpha[(j * n + i) * 4 + 1] < 200
}

/**
 * `depthPush` pushes the tile back in the depth buffer (polygon offset units): the coarser
 * tiers sit a few metres under the finer ones, which the depth buffer cannot resolve at a
 * distance without the logarithmic depth buffer — the push settles who wins where they overlap.
 * Top to bottom: the pad 0, the complex 1, the Cape 2, the sea 3, then EarthBelow's regional
 * tile 4 and the globe 5 (each layer its own, or two of them fight).
 */
function groundMaterial(map: THREE.Texture, alpha: THREE.Texture | null, edgeFade = 0, depthPush = 0): THREE.MeshStandardMaterial {
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = qualityNow().anisotropy
  map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping
  if (alpha) alpha.wrapS = alpha.wrapT = THREE.ClampToEdgeWrapping
  const m = new THREE.MeshStandardMaterial({ map, alphaMap: alpha ?? undefined, transparent: true, roughness: 1, envMapIntensity: 0.15, polygonOffset: depthPush > 0, polygonOffsetFactor: depthPush, polygonOffsetUnits: depthPush * 2 })
  applyAerialPerspective(m)
  applyCloudShadow(m)
  if (edgeFade > 0) applyEdgeFade(m, edgeFade)
  return m
}

function Landmark({ at, origin, children }: { at: [number, number]; origin: [number, number]; children: React.ReactNode }) {
  return <group position={[at[0] - origin[0], 0, at[1] - origin[1]]}>{children}</group>
}

const concrete = new THREE.MeshStandardMaterial({ color: '#9b9a92', roughness: 0.95 })
const vabMat = new THREE.MeshStandardMaterial({ color: '#d8d8d3', roughness: 0.8 })
const steelGrey = new THREE.MeshStandardMaterial({ color: '#6f7479', roughness: 0.65, metalness: 0.5 })

/**
 * The sea: a spherical cap under the land tiles with drifting normal-mapped waves and a specular
 * sun glint, wearing the water colour painted with the Cape tile (turbid lagoons, the shelf
 * deepening offshore); it shows wherever the land tiles are transparent. Its chords sit within
 * centimetres of the sphere, like the tiles above it.
 */
function Water({ y, bounds, map, segments, tile }: { y: number; bounds: { x0: number; x1: number; z0: number; z1: number }; map: THREE.Texture; segments: number; tile: number }) {
  const geo = useMemo(() => capGeometry(R_EARTH, bounds, segments), [bounds, segments])
  const mat = useMemo(() => {
    const normalMap = waveNormalTexture().clone()
    normalMap.repeat.set((bounds.x1 - bounds.x0) / tile, (bounds.z1 - bounds.z0) / tile)
    normalMap.needsUpdate = true
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    // pushed back past the Cape tile (2) in the depth buffer, or without the logarithmic depth
    // buffer (the low tier) the sea a metre below wins over the land from a few kilometres up
    // its square fades out at the edges into the regional tile's sea (the painted lagoons and
    // shallows would otherwise end in a straight line across the water)
    const m = new THREE.MeshStandardMaterial({ map, color: '#ffffff', roughness: 0.42, metalness: 0.0, normalMap, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 0.35, transparent: true, polygonOffset: true, polygonOffsetFactor: 3, polygonOffsetUnits: 6 })
    applyAerialPerspective(m)
    applyCloudShadow(m)
    applyEdgeFade(m, 0.09)
    return m
  }, [bounds, tile, map])
  useFrame((_, dt) => {
    const m = mat.normalMap!
    m.offset.x = (m.offset.x + dt * 0.012) % 1
    m.offset.y = (m.offset.y + dt * 0.007) % 1
  })
  // drawn after the regional tile (1), before the Cape's land (3)
  return <mesh geometry={geo} material={mat} position={[0, y, 0]} receiveShadow renderOrder={2} />
}

/** low coastal scrub around the pad: instanced flattened blobs, two greens */
function Scrub({ pad, groundY, mask }: { pad: PadId; groundY: number; mask: HTMLImageElement }) {
  const mesh = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 7, 5)
    const mat = applyAerialPerspective(new THREE.MeshStandardMaterial({ color: '#4a6a33', roughness: 1 }))
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
      if (waterAt(mask, 4 * KM, x, z)) continue
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
  }, [pad, groundY, mask])
  return <primitive object={mesh} />
}

/** the three ground tiles around the pad (the Cape, the launch complex, the pad itself) and the scrub that reads the complex tile's water */
function CapeTiles({ pad, groundY }: { pad: PadId; groundY: number }) {
  const cfg = TILES[pad]
  const origin = PAD_SITE[pad]
  const q = useQuality()
  const textures = useMaps([
    `${BASE_URL}assets/cape/${texName(`cape-${cfg.cape}.jpg`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`cape-${cfg.cape}-alpha.png`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`cape-${cfg.cape}-water.jpg`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`complex-${cfg.site}.jpg`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`complex-${cfg.site}-alpha.png`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`pad-${pad}.jpg`, q.textures)}`,
    `${BASE_URL}assets/cape/${texName(`pad-${pad}-alpha.png`, q.textures)}`,
  ])
  const [capeMap, capeAlpha, waterMap, complexMap, complexAlpha, padMap, padAlpha] = textures
  // the scrub reads the complex's water mask on the CPU: the PNG itself, not the GPU texture
  const complexMask = useLoader(THREE.ImageLoader, `${BASE_URL}assets/cape/complex-${cfg.site}-alpha.png`)
  // the GPU copies go when the Cape leaves the stage (the loader keeps the images; they are
  // re-uploaded if a new mission brings the pad back)
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  const tiles = useMemo(() => {
    const c = CAPE_TILE_CENTRE[cfg.cape]
    const cx = c[0] - origin[0]
    const cz = c[1] - origin[1]
    const bounds = { x0: cx - 24 * KM, x1: cx + 24 * KM, z0: cz - 24 * KM, z1: cz + 24 * KM }
    const seg = (n: number) => Math.max(16, Math.round(n * q.mesh))
    const capeGeo = capGeometry(R_EARTH, bounds, seg(96))
    const complexGeo = capGeometry(R_EARTH, 4 * KM, seg(64))
    const padGeo = capGeometry(R_EARTH, 1000, seg(160), (x, z) => padHeight(pad, x, z))
    // the finer tiles fade out at their edges into the coarser one beneath
    return { bounds, capeGeo, complexGeo, padGeo, capeMat: groundMaterial(capeMap, capeAlpha, 0.09, 2), complexMat: groundMaterial(complexMap, complexAlpha, 0.06, 1), padMat: groundMaterial(padMap, padAlpha, 0.08) }
  }, [pad, cfg, origin, capeMap, capeAlpha, complexMap, complexAlpha, padMap, padAlpha, q.mesh])
  return (
    <group>
      <group position={[0, groundY, 0]}>
        {/* the water under the tiles' transparent open water, with the Cape tile's frame */}
        <Water y={-2.5} bounds={tiles.bounds} map={waterMap} segments={Math.max(24, Math.round(96 * q.mesh))} tile={270} />
        <mesh geometry={tiles.capeGeo} material={tiles.capeMat} position={[0, -1.5, 0]} receiveShadow renderOrder={3} />
        <mesh geometry={tiles.complexGeo} material={tiles.complexMat} position={[0, -0.6, 0]} receiveShadow renderOrder={4} />
        <mesh geometry={tiles.padGeo} material={tiles.padMat} receiveShadow renderOrder={5} />
      </group>
      <Scrub pad={pad} groundY={groundY} mask={complexMask} />
    </group>
  )
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

  return (
    <group>
      <Suspense fallback={null}>
        <EarthBelow pad={pad} groundY={groundY} />
      </Suspense>
      <Suspense fallback={null}>
        <CapeTiles pad={pad} groundY={groundY} />
      </Suspense>
      <group position={[0, groundY, 0]}>
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
      <LaunchDetail deck={deck} height={VEHICLES.find((v) => v.launchSite.pad === pad)?.height ?? 100} />
    </group>
  )
}
