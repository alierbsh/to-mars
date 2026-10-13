/**
 * Cape Canaveral / Kennedy Space Center as the launch environment: the pads' positions and decks
 * in a local frame (x east, z south, metres) about LC-39A, the mound profile, and the wave normal
 * map for the water. The ground textures themselves are built offline by scripts/cape-assets.py
 * (public/assets/cape) in the same frame.
 */
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { hash2 } from './noise'

export const R_EARTH = 6_371_000
/** LC-39A, the frame origin for the geography */
const ORIGIN = { lat: 28.6083, lon: -80.6041 }
const M_PER_DEG_LAT = 111_320
const M_PER_DEG_LON = 111_320 * Math.cos((ORIGIN.lat * Math.PI) / 180)

/** lon/lat → local metres east/south of LC-39A */
export function ll(lon: number, lat: number): [number, number] {
  return [(lon - ORIGIN.lon) * M_PER_DEG_LON, -(lat - ORIGIN.lat) * M_PER_DEG_LAT]
}

/** local metres → lat, lon (degrees) */
export function latLonOf(x: number, z: number): [number, number] {
  return [ORIGIN.lat - z / M_PER_DEG_LAT, ORIGIN.lon + x / M_PER_DEG_LON]
}

/** the selected pad's latitude and longitude */
export function padLatLon(pad: PadId): [number, number] {
  const [x, z] = PAD_SITE[pad]
  return latLonOf(x, z)
}

/** published pad coordinates */
export const SITES = {
  lc39a: ll(-80.6041, 28.6083),
  lc39b: ll(-80.6209, 28.6272),
  slc41: ll(-80.583, 28.5834),
  slc40: ll(-80.5772, 28.562),
  slc37: ll(-80.5649, 28.5317),
  lc36: ll(-80.5431, 28.471),
  vab: ll(-80.6511, 28.5861),
  slf: ll(-80.6946, 28.6149), // runway centre, heading 150°/330°
  lcc: ll(-80.6485, 28.5845),
}

export const PAD_SITE: Record<PadId, [number, number]> = {
  'lc39a-starship': SITES.lc39a,
  'lc39b-ml': SITES.lc39b,
  'lc39a-fss': SITES.lc39a,
  lc36: SITES.lc36,
  slc37: SITES.slc37,
  'lc39a-lut': SITES.lc39a,
}

/** height of the launch mount deck above the pad surface (the vehicle base sits at y = 0) */
export const PAD_DECK: Record<PadId, number> = {
  'lc39a-starship': 21,
  'lc39b-ml': 14,
  'lc39a-fss': 5,
  lc36: 6,
  slc37: 8,
  'lc39a-lut': 14,
}

/** the LC-39 pads are 15 m mounds; the CCSFS pads sit nearer grade */
export const PAD_MOUND: Record<PadId, number> = {
  'lc39a-starship': 15,
  'lc39b-ml': 15,
  'lc39a-fss': 15,
  lc36: 4,
  slc37: 5,
  'lc39a-lut': 15,
}

let waveCache: THREE.CanvasTexture | null = null
/** tiling wave normal map: small chop over a longer swell, encoded as a tangent-space normal */
export function waveNormalTexture(): THREE.CanvasTexture {
  if (waveCache) return waveCache
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(n, n)
  // periodic height field: value noise on a wrapped lattice (tiles exactly), three octaves of
  // irregular swell and chop
  const pn = (x: number, y: number, period: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const w = (a: number, b: number) => hash2(((a % period) + period) % period, ((b % period) + period) % period)
    const a = w(xi, yi)
    const b = w(xi + 1, yi)
    const c2 = w(xi, yi + 1)
    const d = w(xi + 1, yi + 1)
    return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v
  }
  const h = (x: number, y: number) => {
    const fx = x / n
    const fy = y / n
    return (pn(fx * 6, fy * 6, 6) - 0.5) * 1.0 + (pn(fx * 14 + 3, fy * 14, 14) - 0.5) * 0.5 + (pn(fx * 31, fy * 31 + 7, 31) - 0.5) * 0.25
  }
  const amp = 4.5
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const dx = (h(i + 1, j) - h(i - 1, j)) * amp
      const dy = (h(i, j + 1) - h(i, j - 1)) * amp
      const len = Math.hypot(dx, dy, 1)
      const k = (j * n + i) * 4
      img.data[k] = 128 + (-dx / len) * 127
      img.data[k + 1] = 128 + (dy / len) * 127
      img.data[k + 2] = 128 + (1 / len) * 127
      img.data[k + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  waveCache = t
  return t
}

/** terrain height around the pad: the mound, flat Florida elsewhere */
export function padHeight(pad: PadId, x: number, z: number): number {
  const lc39 = pad.startsWith('lc39')
  const top = lc39 ? 250 : 200
  const foot = lc39 ? 330 : 260
  const d = Math.hypot(x, z)
  const t = Math.min(1, Math.max(0, (foot - d) / (foot - top)))
  return PAD_MOUND[pad] * t * t * (3 - 2 * t)
}
