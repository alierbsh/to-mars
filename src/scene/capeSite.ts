/**
 * Cape Canaveral / Kennedy Space Center as the launch environment: geography in a local frame
 * (x east, z south, metres) centred on the selected pad, drawn into canvas maps at three scales —
 * the Florida peninsula for the view from altitude, the Cape with its lagoons, pads, VAB and
 * crawlerway, and the pad itself. Coordinates are approximate (drawn from public maps, ±200 m
 * locally, ±10 km for the peninsula); the pad positions are the published ones.
 */
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { canvasTexture } from './terrain'
import { fbm, hash2 } from './noise'

export const R_EARTH = 6_371_000
const KM = 1000
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

/** Atlantic shoreline from Playalinda Beach to Patrick SFB (lon, lat), north → south */
const SHORE: Array<[number, number]> = [
  [-80.76, 28.95],
  [-80.72, 28.85],
  [-80.68, 28.76],
  [-80.655, 28.7],
  [-80.63, 28.65],
  [-80.605, 28.615],
  [-80.588, 28.6],
  [-80.572, 28.575],
  [-80.56, 28.545],
  [-80.545, 28.51],
  [-80.533, 28.475],
  [-80.53, 28.46],
  [-80.55, 28.43],
  [-80.585, 28.408],
  [-80.602, 28.395],
  [-80.605, 28.35],
  [-80.6, 28.3],
  [-80.59, 28.2],
]

/** Banana River (between Merritt Island and the Cape) */
const BANANA: Array<[number, number]> = [
  [-80.665, 28.62],
  [-80.655, 28.6],
  [-80.645, 28.56],
  [-80.63, 28.52],
  [-80.615, 28.48],
  [-80.61, 28.44],
  [-80.62, 28.4],
  [-80.63, 28.35],
  [-80.64, 28.25],
  [-80.66, 28.2],
  [-80.69, 28.25],
  [-80.7, 28.35],
  [-80.7, 28.45],
  [-80.705, 28.52],
  [-80.7, 28.58],
  [-80.69, 28.62],
]

/** Indian River (west of Merritt Island) */
const INDIAN: Array<[number, number]> = [
  [-80.78, 28.78],
  [-80.76, 28.7],
  [-80.75, 28.6],
  [-80.745, 28.5],
  [-80.74, 28.4],
  [-80.73, 28.3],
  [-80.72, 28.2],
  [-80.77, 28.2],
  [-80.79, 28.3],
  [-80.8, 28.4],
  [-80.81, 28.5],
  [-80.82, 28.6],
  [-80.83, 28.7],
  [-80.82, 28.78],
]

/** Mosquito Lagoon (north of the Cape, behind the barrier beach) */
const MOSQUITO: Array<[number, number]> = [
  [-80.735, 28.92],
  [-80.7, 28.86],
  [-80.67, 28.78],
  [-80.66, 28.7],
  [-80.655, 28.66],
  [-80.69, 28.66],
  [-80.73, 28.68],
  [-80.76, 28.72],
  [-80.78, 28.8],
  [-80.79, 28.9],
]

/** Florida and the neighbouring coasts (lon, lat), clockwise from the Georgia border on the Atlantic */
const FLORIDA: Array<[number, number]> = [
  [-81.45, 30.7],
  [-81.4, 30.3],
  [-81.25, 29.9],
  [-81.05, 29.3],
  [-80.85, 28.9],
  [-80.68, 28.75],
  [-80.59, 28.6],
  [-80.53, 28.46],
  [-80.6, 28.4],
  [-80.6, 28.25],
  [-80.5, 27.9],
  [-80.35, 27.5],
  [-80.2, 27.2],
  [-80.05, 26.9],
  [-80.03, 26.7],
  [-80.1, 26.1],
  [-80.12, 25.8],
  [-80.25, 25.4],
  [-80.45, 25.2],
  [-80.9, 25.15],
  [-81.1, 25.3],
  [-81.4, 25.85],
  [-81.8, 26.1],
  [-81.9, 26.5],
  [-82.25, 26.8],
  [-82.55, 27.3],
  [-82.7, 27.6],
  [-82.8, 28.1],
  [-82.75, 28.6],
  [-83.0, 29.1],
  [-83.4, 29.5],
  [-84.0, 30.05],
  [-84.4, 29.95],
  [-85.0, 29.7],
  [-85.4, 29.9],
  [-85.7, 30.1],
  [-86.5, 30.4],
  [-87.2, 30.35],
  [-87.6, 30.3],
  [-87.6, 31.5],
  [-85.0, 32.0],
  [-82.0, 31.8],
  [-81.5, 31.5],
]
const OKEECHOBEE: Array<[number, number]> = [
  [-81.1, 27.2],
  [-80.75, 27.2],
  [-80.62, 27.0],
  [-80.7, 26.75],
  [-81.0, 26.7],
  [-81.15, 26.95],
]
const GRAND_BAHAMA: Array<[number, number]> = [
  [-79.0, 26.55],
  [-78.3, 26.5],
  [-77.9, 26.6],
  [-78.3, 26.72],
  [-78.9, 26.7],
]
const ABACO: Array<[number, number]> = [
  [-77.95, 26.9],
  [-77.6, 26.4],
  [-77.2, 26.0],
  [-77.0, 25.85],
  [-77.2, 26.1],
  [-77.5, 26.6],
  [-77.75, 26.95],
]
const ANDROS: Array<[number, number]> = [
  [-78.4, 25.2],
  [-77.95, 25.2],
  [-77.7, 24.7],
  [-77.75, 24.0],
  [-78.1, 23.75],
  [-78.4, 24.3],
]
const CUBA: Array<[number, number]> = [
  [-84.95, 21.85],
  [-84.0, 22.5],
  [-83.0, 22.95],
  [-82.0, 23.15],
  [-81.0, 23.1],
  [-80.0, 22.95],
  [-79.0, 22.5],
  [-78.0, 22.3],
  [-77.0, 21.7],
  [-76.0, 21.2],
  [-75.5, 20.7],
  [-76.5, 20.0],
  [-77.5, 19.9],
  [-78.5, 20.7],
  [-79.5, 21.5],
  [-80.5, 21.9],
  [-81.5, 21.6],
  [-82.5, 21.9],
  [-83.5, 22.1],
  [-84.5, 21.75],
]

type Ctx = CanvasRenderingContext2D

/** draw a lon/lat polygon in a map of n px over ±half metres centred at (cx, cz) local */
function poly(ctx: Ctx, pts: Array<[number, number]>, n: number, half: number, cx: number, cz: number, close = true) {
  const s = n / (2 * half)
  ctx.beginPath()
  pts.forEach(([lon, lat], i) => {
    const [x, z] = ll(lon, lat)
    const px = (x - cx + half) * s
    const py = (z - cz + half) * s
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  if (close) ctx.closePath()
}

/** draw a local-metre polyline */
function path(ctx: Ctx, pts: Array<[number, number]>, n: number, half: number, cx: number, cz: number, close = false) {
  const s = n / (2 * half)
  ctx.beginPath()
  pts.forEach(([x, z], i) => {
    const px = (x - cx + half) * s
    const py = (z - cz + half) * s
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  if (close) ctx.closePath()
}

/** tileable noise canvas, multiplied over a map for texture */
function grain(n: number, scale: number, amp: number, seed = 0): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(n, n)
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const v = 255 * (1 - amp + amp * 2 * fbm(i * scale + seed, j * scale, 4))
      const k = (j * n + i) * 4
      img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.min(255, v)
      img.data[k + 3] = 255
    }
  ctx.putImageData(img, 0, 0)
  return c
}

function multiplyGrain(ctx: Ctx, n: number, scale: number, amp: number, seed = 0) {
  const g = grain(512, scale, amp, seed)
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  const pat = ctx.createPattern(g, 'repeat')!
  ctx.fillStyle = pat
  ctx.fillRect(0, 0, n, n)
  ctx.restore()
}

/** Florida from altitude: 1024 px over ±1200 km, centred on the pad. Water is transparent — the
 * water surface mesh shows through; the Bahama banks are painted turquoise. The Cape map's own
 * square is cut out so the two never disagree about the coast. */
export function floridaMap(center: [number, number]): THREE.CanvasTexture {
  const n = 1024
  const half = 1200 * KM
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const land = (pts: Array<[number, number]>, fill: string) => {
    poly(ctx, pts, n, half, center[0], center[1])
    ctx.fillStyle = fill
    ctx.fill()
  }
  // paint everything on an opaque base, then keep only the land through a mask
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, n, n)
  // shallow banks (Bahamas): turquoise water, opaque so it reads from orbit
  land([[-79.3, 27.0], [-77.0, 27.2], [-76.5, 25.5], [-77.5, 23.3], [-79.5, 24.0], [-79.5, 26.0]], '#2a7a92')
  land(FLORIDA, '#35502a')
  land(CUBA, '#3e552c')
  land(GRAND_BAHAMA, '#4e5c38')
  land(ABACO, '#4e5c38')
  land(ANDROS, '#4e5c38')
  // Everglades darker
  land([[-81.3, 26.4], [-80.5, 26.3], [-80.4, 25.4], [-80.9, 25.3], [-81.2, 25.8]], '#2c4226')
  multiplyGrain(ctx, n, 0.03, 0.18, 3)
  // the mask: land and banks opaque, everything else (sea, the lake, the Cape map's square) cut away
  const mask = document.createElement('canvas')
  mask.width = mask.height = n
  const mctx = mask.getContext('2d')!
  for (const pts of [[[-79.3, 27.0], [-77.0, 27.2], [-76.5, 25.5], [-77.5, 23.3], [-79.5, 24.0], [-79.5, 26.0]] as Array<[number, number]>, FLORIDA, CUBA, GRAND_BAHAMA, ABACO, ANDROS]) {
    poly(mctx, pts, n, half, center[0], center[1])
    mctx.fillStyle = '#fff'
    mctx.fill()
  }
  mctx.globalCompositeOperation = 'destination-out'
  // the same water the Cape map carries, so the two agree at the seam: the lagoons and the sea east of the shoreline
  for (const w of [OKEECHOBEE, BANANA, INDIAN, MOSQUITO, [...SHORE, [-80.0, 28.0], [-80.0, 29.2]] as Array<[number, number]>]) {
    poly(mctx, w, n, half, center[0], center[1])
    mctx.fill()
  }
  const s = n / (2 * half)
  const capeHalf = 24 * KM * s
  mctx.fillRect(n / 2 - capeHalf, n / 2 - capeHalf, 2 * capeHalf, 2 * capeHalf)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(mask, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  return canvasTexture(c)
}

/** the Cape: 1536 px over ±24 km, centred on the pad */
export function capeMap(center: [number, number]): THREE.CanvasTexture {
  const n = 1536
  const half = 24 * KM
  const [cx, cz] = center
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const s = n / (2 * half)
  // land: coastal scrub and marsh, with sandy scrub patches, wetter darker ground and ponds —
  // computed per pixel at 512² (cheap) and upsampled, so the first frame is not held up
  let ponds: HTMLCanvasElement | null = null
  {
    const m = 768
    const lc = document.createElement('canvas')
    lc.width = lc.height = m
    const lctx = lc.getContext('2d')!
    const img = lctx.createImageData(m, m)
    const pondMask = lctx.createImageData(m, m)
    for (let j = 0; j < m; j++)
      for (let i = 0; i < m; i++) {
        const X = (i / m) * 2 * half - half + cx
        const Z = (j / m) * 2 * half - half + cz
        const wet = fbm(X * 0.00025 + 3, Z * 0.00025, 4)
        const sand = fbm(X * 0.0006 + 40, Z * 0.0006 + 9, 3)
        const pond = fbm(X * 0.0012 + 77, Z * 0.0012 + 5, 3)
        const k = (j * m + i) * 4
        let r = 56 + 40 * (sand - 0.5)
        let g = 74 + 32 * (sand - 0.5)
        let b = 38 + 16 * (sand - 0.5)
        if (wet > 0.55) {
          const w = Math.min(1, (wet - 0.55) / 0.12)
          r = r * (1 - w) + 40 * w
          g = g * (1 - w) + 58 * w
          b = b * (1 - w) + 36 * w
        }
        // ponds and marsh pools: a soft-edged threshold on the noise, so they come out rounded
        const pa = Math.max(0, Math.min(1, (pond - 0.655) / 0.03))
        if (pa > 0) {
          r = r * (1 - pa) + 28 * pa
          g = g * (1 - pa) + 56 * pa
          b = b * (1 - pa) + 78 * pa
          pondMask.data[k] = pondMask.data[k + 1] = pondMask.data[k + 2] = 255
          pondMask.data[k + 3] = 255 * pa
        }
        img.data[k] = r
        img.data[k + 1] = g
        img.data[k + 2] = b
        img.data[k + 3] = 255
      }
    lctx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(lc, 0, 0, n, n)
    lctx.putImageData(pondMask, 0, 0)
    ponds = lc
  }
  // the Atlantic: everything east of the shoreline (painted for the grain pass, cut out at the end)
  const ocean: Array<[number, number]> = [...SHORE, [-80.0, 28.0], [-80.0, 29.2]]
  poly(ctx, ocean, n, half, cx, cz)
  ctx.fillStyle = '#113756'
  ctx.fill()
  // the beach: a sand band along the shore, a wet darker strip at the water line
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#c4b98f'
  ctx.lineWidth = 200 * s
  ctx.stroke()
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#9f9478'
  ctx.lineWidth = 40 * s
  ctx.stroke()
  // lagoons
  for (const w of [BANANA, INDIAN, MOSQUITO]) {
    poly(ctx, w, n, half, cx, cz)
    ctx.fillStyle = '#214a68'
    ctx.fill()
  }
  // water mask: ocean beyond the beach, the lagoons, the ponds
  const mask = document.createElement('canvas')
  mask.width = mask.height = n
  const mctx = mask.getContext('2d')!
  poly(mctx, ocean, n, half, cx, cz)
  mctx.fillStyle = '#fff'
  mctx.fill()
  for (const w of [BANANA, INDIAN, MOSQUITO]) {
    poly(mctx, w, n, half, cx, cz)
    mctx.fill()
  }
  // keep the beach and a band of shallows above the water mesh: pull the ocean back 320 m
  poly(mctx, SHORE, n, half, cx, cz, false)
  mctx.globalCompositeOperation = 'destination-out'
  mctx.strokeStyle = '#000'
  mctx.lineWidth = 640 * s
  mctx.stroke()
  mctx.globalCompositeOperation = 'source-over'
  // the shallows themselves: a lighter, greener band painted on the land map
  poly(ctx, ocean, n, half, cx, cz)
  ctx.save()
  ctx.clip()
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#2f6f8e'
  ctx.lineWidth = 640 * s
  ctx.stroke()
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#3f8aa5'
  ctx.lineWidth = 300 * s
  ctx.stroke()
  ctx.restore()
  // marsh / mangrove darker along the lagoon shores
  for (const w of [BANANA, INDIAN, MOSQUITO]) {
    poly(ctx, w, n, half, cx, cz)
    ctx.strokeStyle = '#2e4426'
    ctx.lineWidth = 500 * s
    ctx.globalAlpha = 0.6
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  multiplyGrain(ctx, n, 0.02, 0.22, 5)
  // roads: crawlerway VAB → 39A / 39B, Kennedy Parkway, NASA causeway, Phillips Parkway
  const road = (pts: Array<[number, number]>, w: number, col: string) => {
    path(ctx, pts, n, half, cx, cz)
    ctx.strokeStyle = col
    ctx.lineWidth = Math.max(2, w * s)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }
  const vab = SITES.vab
  const a = SITES.lc39a
  const b = SITES.lc39b
  const split: [number, number] = [vab[0] + 2500, vab[1] - 300]
  road([[vab[0] + 200, vab[1]], split, [a[0] - 900, a[1] + 200], [a[0] - 300, a[1]]], 40, '#9a9478')
  road([[split[0], split[1]], [b[0] - 1500, b[1] + 600], [b[0] - 300, b[1]]], 40, '#9a9478')
  road([[vab[0] - 1500, vab[1] - 16000], [vab[0] - 1500, vab[1] + 12000]], 14, '#7d7f78') // Kennedy Parkway
  road([[vab[0] - 7000, vab[1] + 7500], [a[0] + 2200, a[1] + 6000], [SITES.slc41[0] + 1500, SITES.slc41[1] + 1000]], 12, '#7d7f78') // NASA causeway → CCSFS
  road([[SITES.slc41[0] - 800, SITES.slc41[1]], [SITES.slc40[0] - 800, SITES.slc40[1]], [SITES.slc37[0] - 800, SITES.slc37[1]], [SITES.lc36[0] - 600, SITES.lc36[1]]], 10, '#7d7f78') // ICBM road
  road([[a[0] - 2000, a[1] - 2500], [a[0] - 1400, a[1]], [a[0] - 1200, a[1] + 2500]], 8, '#7d7f78')
  // the Shuttle Landing Facility: 4.6 km × 90 m, heading 150°
  const hdg = (150 * Math.PI) / 180
  const r = SITES.slf
  road([[r[0] - Math.sin(hdg) * 2300, r[1] + Math.cos(hdg) * 2300], [r[0] + Math.sin(hdg) * 2300, r[1] - Math.cos(hdg) * 2300]], 90, '#8e8f8a')
  // pads: concrete aprons on their mounds
  const pad = (p: [number, number], radius: number, light: string) => {
    ctx.beginPath()
    ctx.arc((p[0] - cx + half) * s, (p[1] - cz + half) * s, radius * s, 0, Math.PI * 2)
    ctx.fillStyle = light
    ctx.fill()
  }
  pad(a, 420, '#8b8a80')
  pad(b, 420, '#8b8a80')
  pad(SITES.slc41, 260, '#8b8a80')
  pad(SITES.slc40, 260, '#8b8a80')
  pad(SITES.slc37, 240, '#8b8a80')
  pad(SITES.lc36, 240, '#8b8a80')
  // VAB and the industrial area
  const box = (p: [number, number], w: number, h: number, col: string) => {
    ctx.fillStyle = col
    ctx.fillRect((p[0] - w / 2 - cx + half) * s, (p[1] - h / 2 - cz + half) * s, w * s, h * s)
  }
  box(vab, 218, 158, '#c9c9c4')
  box([vab[0] + 600, vab[1] + 200], 900, 700, '#6f726a') // VAB apron / turn basin area
  box(SITES.lcc, 150, 100, '#b8b8b2')
  box([vab[0] - 1200, vab[1] + 2200], 1600, 1200, '#5f6558') // industrial area
  // water becomes transparent: the water surface mesh shows through
  if (ponds) {
    mctx.imageSmoothingEnabled = true
    mctx.drawImage(ponds, 0, 0, n, n)
  }
  ctx.globalCompositeOperation = 'destination-out'
  ctx.drawImage(mask, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  // the surf: a broken white foam line just inside the water's edge, drawn over the hole
  {
    const foam = document.createElement('canvas')
    foam.width = foam.height = n
    const fctx = foam.getContext('2d')!
    poly(fctx, SHORE, n, half, cx, cz, false)
    fctx.strokeStyle = '#ffffff'
    fctx.lineWidth = 55 * s
    fctx.lineCap = 'round'
    fctx.stroke()
    // break the line up with noise
    const img = fctx.getImageData(0, 0, n, n)
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const k = (j * n + i) * 4
        if (!img.data[k + 3]) continue
        const v = fbm(i * 0.09, j * 0.09, 3)
        img.data[k + 3] = Math.max(0, Math.min(255, (v - 0.35) * 600))
      }
    fctx.putImageData(img, 0, 0)
    // shift the foam 90 m seaward of the shoreline polyline (the beach band lies landward)
    ctx.globalAlpha = 0.85
    ctx.drawImage(foam, 90 * s * 0.7, 90 * s * 0.7)
    ctx.globalAlpha = 1
  }
  return canvasTexture(c, 16)
}

/** is (x, z) in local metres around `center` water on the Cape map? (reads the map's alpha) */
export function waterAt(tex: THREE.CanvasTexture, x: number, z: number): boolean {
  const c = tex.image as HTMLCanvasElement
  const n = c.width
  const half = 24 * KM
  const i = Math.round(((x + half) / (2 * half)) * (n - 1))
  const j = Math.round(((z + half) / (2 * half)) * (n - 1))
  if (i < 0 || j < 0 || i >= n || j >= n) return false
  const data = (c as HTMLCanvasElement & { __alpha?: Uint8ClampedArray }).__alpha ?? ((c as HTMLCanvasElement & { __alpha?: Uint8ClampedArray }).__alpha = c.getContext('2d')!.getImageData(0, 0, n, n).data)
  const k = (j * n + i) * 4
  return data[k + 3] < 128 || (data[k + 2] > data[k] + 25 && data[k + 2] > data[k + 1])
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

/** the pad itself: 1536 px over ±1 km. The vehicle stands at the centre. */
export function padMap(pad: PadId): THREE.CanvasTexture {
  const n = 1536
  const half = 1000
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const s = n / (2 * half)
  const m = (x: number) => (x + half) * s
  ctx.fillStyle = '#3a4c29'
  ctx.fillRect(0, 0, n, n)
  multiplyGrain(ctx, n, 0.05, 0.25, 7)
  const lc39 = pad.startsWith('lc39')
  // the mound slope: sandy, lighter
  ctx.beginPath()
  ctx.arc(m(0), m(0), (lc39 ? 330 : 260) * s, 0, Math.PI * 2)
  ctx.fillStyle = '#7a7a5c'
  ctx.fill()
  multiplyGrain(ctx, n, 0.08, 0.15, 2)
  // concrete apron
  ctx.beginPath()
  ctx.arc(m(0), m(0), (lc39 ? 250 : 200) * s, 0, Math.PI * 2)
  ctx.fillStyle = '#85847c'
  ctx.fill()
  multiplyGrain(ctx, n, 0.35, 0.07, 11)
  // crawlerway / access road leaving west
  ctx.fillStyle = '#9a9478'
  ctx.fillRect(m(-half), m(-20), (half - 200) * s, 40 * s)
  // flame trench (north–south) and the deflector
  ctx.fillStyle = '#4a4a46'
  ctx.fillRect(m(-18), m(-140), 36 * s, 280 * s)
  ctx.fillStyle = '#2d2d2c'
  ctx.fillRect(m(-10), m(-30), 20 * s, 60 * s)
  // expansion joints
  ctx.strokeStyle = '#8c8b83'
  ctx.lineWidth = 1
  for (let i = -246; i <= 246; i += 6) {
    ctx.beginPath()
    ctx.moveTo(m(i), m(-260))
    ctx.lineTo(m(i), m(260))
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(m(-260), m(i))
    ctx.lineTo(m(260), m(i))
    ctx.stroke()
  }
  // perimeter road and the tank farms' pads
  ctx.strokeStyle = '#7d7f78'
  ctx.lineWidth = 10 * s
  ctx.beginPath()
  ctx.arc(m(0), m(0), (lc39 ? 420 : 320) * s, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#8e8d86'
  ctx.fillRect(m(180), m(-400), 120 * s, 120 * s)
  ctx.fillRect(m(180), m(280), 120 * s, 120 * s)
  // blast scorch on the concrete
  const g = ctx.createRadialGradient(m(0), m(0), 10 * s, m(0), m(0), 70 * s)
  g.addColorStop(0, 'rgba(30,30,30,0.6)')
  g.addColorStop(1, 'rgba(30,30,30,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, n, n)
  return canvasTexture(c, 16)
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
