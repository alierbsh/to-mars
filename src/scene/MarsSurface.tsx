/**
 * The Mars landing site, built from NASA data (public domain, NASA-3D-Resources):
 *  - the planet itself as a 5000 km spherical cap textured with the NASA/JPL global colour mosaic,
 *  - a 260 km regional tile of Gusev crater (the Spirit landing site) from the JPL 3D-printable
 *    MOLA/HRSC-derived DEM, decoded from a 16-bit heightmap, with procedural secondary craters,
 *  - a 16 km mid tile with procedural small craters, dunes and dust-devil tracks,
 *  - a 2.4 km near-field patch with the HiRISE-derived DEM of Victoria crater placed next to the
 *    touchdown point, fine regolith, and a field of instanced rocks.
 * Each finer tier sits on the coarser one (same vertex interpolation at the seam) and the coarser
 * tier dips underneath it, so holes like the crater are not covered. Heights are built here; the
 * colour maps are rasterised in a worker and arrive a few seconds later (flat colour until then).
 * The touchdown point is the local origin; the entry scene swings this group about the planet's
 * centre under the vehicle.
 */
import { useLoader } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { DustDevils, Rocks, SandTails, SpiritLander, regolithNormal } from './MarsDetail'
import { GLOBE_HALF, MID_HALF, MID_SEG, NEAR_HALF, NEAR_SEG, R_MARS, REGION_HALF, REGION_SEG, SITE_LAT, SITE_LON, SITE_X, SITE_Z, buildSite, rockField, type MarsSite } from './marsSite'
import type { MapsWorkerRequest, MapsWorkerResponse } from './marsMaps.worker'
import { canvasTexture, capGeometry, loadHeightmap, type Heightmap } from './terrain'
import { qualityNow, useQuality } from './useQuality'

const BASE_URL = import.meta.env.BASE_URL
const GLOBE_N = 1536

/**
 * The DEMs, decoded once for the session: prewarmMars starts on them after the climb, and the
 * entry's copy built ahead (Prewarm.tsx) and the real one then find them ready — with the site
 * and its meshes, built once too, so the cut to the entry does not stall on them.
 */
const heightmaps = new Map<string, Promise<Heightmap>>()
const decoded = new Map<string, Heightmap>()
function heightmap(url: string): Promise<Heightmap> {
  let p = heightmaps.get(url)
  if (!p) {
    p = loadHeightmap(url).then((h) => {
      decoded.set(url, h)
      return h
    })
    p.catch(() => heightmaps.delete(url))
    heightmaps.set(url, p)
  }
  return p
}

function useHeightmap(url: string): Heightmap | null {
  const [h, setH] = useState<Heightmap | null>(() => decoded.get(url) ?? null)
  useEffect(() => {
    if (h) return
    let live = true
    heightmap(url)
      .then((v) => live && setH(v))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [url, h])
  return h
}

let rockCache: { site: MarsSite; rocks: ReturnType<typeof rockField> } | null = null
function rocksFor(site: MarsSite) {
  if (rockCache?.site !== site) rockCache = { site, rocks: rockField(site) }
  return rockCache.rocks
}

let siteCache: { gusev: Heightmap; victoria: Heightmap; site: MarsSite } | null = null
function siteFor(gusev: Heightmap, victoria: Heightmap): MarsSite {
  if (siteCache?.gusev !== gusev || siteCache.victoria !== victoria) siteCache = { gusev, victoria, site: buildSite(gusev, victoria) }
  return siteCache.site
}

type SiteGeometry = { regionGeo: THREE.BufferGeometry; midGeo: THREE.BufferGeometry; nearGeo: THREE.BufferGeometry }
let geoCache: { site: MarsSite; mesh: number; geo: SiteGeometry } | null = null
function siteGeometry(site: MarsSite, mesh: number): SiteGeometry {
  if (geoCache?.site !== site || geoCache.mesh !== mesh) {
    geoCache?.geo.regionGeo.dispose()
    geoCache?.geo.midGeo.dispose()
    geoCache?.geo.nearGeo.dispose()
    const seg = (n: number) => Math.max(32, Math.round(n * mesh))
    const regionGeo = capGeometry(R_MARS, { x0: -REGION_HALF - SITE_X, x1: REGION_HALF - SITE_X, z0: -REGION_HALF - SITE_Z, z1: REGION_HALF - SITE_Z }, seg(REGION_SEG), site.regionHeight)
    const midGeo = capGeometry(R_MARS, MID_HALF, seg(MID_SEG), site.midHeight)
    const nearGeo = capGeometry(R_MARS, NEAR_HALF, seg(NEAR_SEG), site.nearHeight)
    geoCache = { site, mesh, geo: { regionGeo, midGeo, nearGeo } }
  }
  return geoCache.geo
}

/** the planet: a 5000 km cap (the whole entry ground track plus the horizon) */
let globeCache: { geo: THREE.BufferGeometry; box: { lon0: number; lon1: number; lat0: number; lat1: number } } | null = null
function globeCap() {
  if (!globeCache) {
    const lat0 = (SITE_LAT * Math.PI) / 180
    const lon0 = (SITE_LON * Math.PI) / 180
    const dLat = GLOBE_HALF / R_MARS
    const dLon = GLOBE_HALF / (R_MARS * Math.cos(lat0))
    const geo = capGeometry(R_MARS, GLOBE_HALF, 128, undefined, (x, z) => [(x / GLOBE_HALF + 1) / 2, (1 - z / GLOBE_HALF) / 2])
    globeCache = { geo, box: { lon0: lon0 - dLon, lon1: lon0 + dLon, lat0: lat0 - dLat, lat1: lat0 + dLat } }
  }
  return globeCache
}

function textureFromPixels(data: Uint8ClampedArray, n: number, anisotropy = 8): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  ctx.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, n, n), 0, 0)
  return canvasTexture(c, anisotropy)
}

/** crop of the global mosaic around the site (equirectangular → the cap's UV square) */
function globeCrop(img: HTMLImageElement, box: { lon0: number; lon1: number; lat0: number; lat1: number }): Uint8ClampedArray {
  const n = GLOBE_N
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const W = img.width
  const H = img.height
  // u = lon/2π + 0.5 (lon −π..π), v = 0.5 − lat/π (row 0 = north)
  const sx = ((box.lon0 / (2 * Math.PI) + 0.5) % 1) * W
  const sw = ((box.lon1 - box.lon0) / (2 * Math.PI)) * W
  const sy = (0.5 - box.lat1 / Math.PI) * H
  const sh = ((box.lat1 - box.lat0) / Math.PI) * H
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  if (sx + sw <= W) ctx.drawImage(img, sx, sy, sw, sh, 0, 0, n, n)
  else {
    // the box straddles the antimeridian (Gusev is at 175°E): draw it in two pieces
    const w1 = W - sx
    const n1 = Math.round((w1 / sw) * n)
    ctx.drawImage(img, sx, sy, w1, sh, 0, 0, n1, n)
    ctx.drawImage(img, 0, sy, sw - w1, sh, n1, 0, n - n1, n)
  }
  return ctx.getImageData(0, 0, n, n).data
}

interface Maps {
  region?: THREE.CanvasTexture
  mid?: THREE.CanvasTexture
  near?: THREE.CanvasTexture
  globe?: THREE.CanvasTexture
}

/** the textures live for the whole session: entering the EDL phase a second time is instant */
let mapCache: Maps = {}
let mapWorker: Worker | null = null
const listeners = new Set<(m: Maps) => void>()
function requestMaps(gusev: Heightmap, victoria: Heightmap, globe: Uint8ClampedArray | null) {
  if (mapWorker) return
  mapWorker = new Worker(new URL('./marsMaps.worker.ts', import.meta.url), { type: 'module' })
  mapWorker.onmessage = (e: MessageEvent<MapsWorkerResponse>) => {
    const { kind, n, data } = e.data
    mapCache = { ...mapCache, [kind]: textureFromPixels(data, n, kind === 'near' ? 16 : 8) }
    listeners.forEach((l) => l(mapCache))
  }
  // progressive: coarse maps within a second, then the globe grain, then full resolution
  const coarse: MapsWorkerRequest = {
    type: 'maps',
    gusev,
    victoria,
    maps: [
      { kind: 'near', n: 384, half: NEAR_HALF },
      { kind: 'mid', n: 384, half: MID_HALF },
      { kind: 'region', n: 256, half: REGION_HALF },
    ],
  }
  mapWorker.postMessage(coarse)
  if (globe) {
    const req: MapsWorkerRequest = { type: 'globe', n: GLOBE_N, data: globe }
    mapWorker.postMessage(req, [globe.buffer])
  }
  // the full maps: half size on the low tier (a quarter of the pixels to rasterise and to hold)
  const k = qualityNow().textures === 'half' ? 0.5 : 1
  const full: MapsWorkerRequest = {
    type: 'maps',
    gusev,
    victoria,
    maps: [
      { kind: 'near', n: 1536 * k, half: NEAR_HALF },
      { kind: 'mid', n: 1536 * k, half: MID_HALF },
      { kind: 'region', n: 1024 * k, half: REGION_HALF },
    ],
  }
  mapWorker.postMessage(full)
}

let prewarmed = false
/** Start decoding the DEMs and rasterising the maps early (Scene calls it once the climb is over), so the EDL scene opens textured. */
export function prewarmMars() {
  if (prewarmed) return
  prewarmed = true
  Promise.all([heightmap(`${BASE_URL}assets/mars/gusev-height.png`), heightmap(`${BASE_URL}assets/mars/victoria-height.png`)])
    .then(([gusev, victoria]) => {
      const img = new Image()
      img.onload = () => {
        const lat0 = (SITE_LAT * Math.PI) / 180
        const lon0 = (SITE_LON * Math.PI) / 180
        const dLat = GLOBE_HALF / R_MARS
        const dLon = GLOBE_HALF / (R_MARS * Math.cos(lat0))
        requestMaps(gusev, victoria, globeCrop(img, { lon0: lon0 - dLon, lon1: lon0 + dLon, lat0: lat0 - dLat, lat1: lat0 + dLat }))
      }
      img.src = `${BASE_URL}assets/mars/mars-global.jpg`
    })
    .catch(() => {})
}

export function MarsSurface() {
  const gusev = useHeightmap(`${BASE_URL}assets/mars/gusev-height.png`)
  const victoria = useHeightmap(`${BASE_URL}assets/mars/victoria-height.png`)
  const globeImg = useLoader(THREE.TextureLoader, `${BASE_URL}assets/mars/mars-global.jpg`)
  globeImg.colorSpace = THREE.SRGBColorSpace
  const [maps, setMaps] = useState<Maps>(mapCache)

  const globe = globeCap()

  // heightfields and geometry on the main thread, once (see heightmap()); the colour maps from the worker
  const site = useMemo(() => (gusev && victoria ? siteFor(gusev, victoria) : null), [gusev, victoria])
  const mesh = useQuality().mesh
  const geo = useMemo(() => (site ? siteGeometry(site, mesh) : null), [site, mesh])

  useEffect(() => {
    if (!gusev || !victoria) return
    const onMaps = (m: Maps) => setMaps(m)
    listeners.add(onMaps)
    if (!mapCache.near) requestMaps(gusev, victoria, mapCache.globe ? null : globeCrop(globeImg.image as HTMLImageElement, globe.box))
    return () => {
      listeners.delete(onMaps)
    }
  }, [gusev, victoria, globeImg, globe])

  const rocks = useMemo(() => (site ? rocksFor(site) : null), [site])

  // materials are created once and re-targeted when a map arrives (a map change needs a recompile)
  const mats = useMemo(() => {
    // depthPush (polygon offset units) settles the overlap of the tiers without the logarithmic depth buffer
    const mk = (transparent: boolean, normal?: THREE.Texture, repeat = 1, strength = 0, depthPush = 0) => {
      const m = new THREE.MeshStandardMaterial({ color: '#8a5234', roughness: 1, envMapIntensity: 0.2, transparent, polygonOffset: depthPush > 0, polygonOffsetFactor: depthPush, polygonOffsetUnits: depthPush * 2 })
      if (normal) {
        const n = normal.clone()
        n.repeat.set(repeat, repeat)
        n.needsUpdate = true
        m.normalMap = n
        m.normalScale = new THREE.Vector2(strength, strength)
      }
      return m
    }
    const nrm = regolithNormal()
    // one tile = 40 m: the near patch (2.4 km) repeats 60×, the mid tile (16 km) 400× (grain only, faint)
    return { globe: new THREE.MeshStandardMaterial({ map: globeImg, roughness: 1, envMapIntensity: 0.2, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 8 }), region: mk(false, undefined, 1, 0, 3), mid: mk(true, nrm, 400, 0.3, 1), near: mk(true, nrm, 60, 0.6) }
  }, [globeImg])
  // before the first frame: a map changes the shader (a frame without it would build it twice)
  useLayoutEffect(() => {
    for (const k of ['globe', 'region', 'mid', 'near'] as const) {
      const tex = maps[k]
      const m = mats[k]
      if (tex && m.map !== tex) {
        m.map = tex
        m.color.set('#ffffff')
        m.needsUpdate = true
      }
    }
  }, [maps, mats])

  return (
    <group>
      <mesh geometry={globe.geo} position={[0, -2500, 0]} material={mats.globe} />
      {geo && (
        <>
          <mesh geometry={geo.regionGeo} renderOrder={-3} material={mats.region} />
          <mesh geometry={geo.midGeo} renderOrder={-2} material={mats.mid} receiveShadow />
          <mesh geometry={geo.nearGeo} renderOrder={-1} material={mats.near} receiveShadow />
        </>
      )}
      {site && rocks && (
        <>
          <Rocks rocks={rocks} />
          <SandTails rocks={rocks} site={site} />
          <DustDevils site={site} />
          <SpiritLander site={site} />
        </>
      )}
    </group>
  )
}
