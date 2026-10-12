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
import { fbm } from './noise'

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

/** Florida from altitude: 1024 px over ±1200 km, centred on the pad */
export function floridaMap(center: [number, number]): THREE.CanvasTexture {
  const n = 1024
  const half = 1200 * KM
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#12304f'
  ctx.fillRect(0, 0, n, n)
  // shallow banks (Bahamas) and the Gulf shelf, a lighter blue
  ctx.fillStyle = '#1f4a74'
  poly(ctx, [[-79.3, 27.0], [-77.0, 27.2], [-76.5, 25.5], [-77.5, 23.3], [-79.5, 24.0], [-79.5, 26.0]], n, half, center[0], center[1])
  ctx.fill()
  poly(ctx, [[-83.0, 29.3], [-84.0, 30.2], [-86.0, 30.5], [-85.0, 28.8], [-83.5, 27.5], [-83.0, 26.0], [-82.0, 24.8], [-81.5, 25.5]], n, half, center[0], center[1])
  ctx.fill()
  const land = (pts: Array<[number, number]>, fill: string) => {
    poly(ctx, pts, n, half, center[0], center[1])
    ctx.fillStyle = fill
    ctx.fill()
  }
  land(FLORIDA, '#35502a')
  land(CUBA, '#3e552c')
  land(GRAND_BAHAMA, '#4e5c38')
  land(ABACO, '#4e5c38')
  land(ANDROS, '#4e5c38')
  // Everglades darker, the lake
  poly(ctx, [[-81.3, 26.4], [-80.5, 26.3], [-80.4, 25.4], [-80.9, 25.3], [-81.2, 25.8]], n, half, center[0], center[1])
  ctx.fillStyle = '#2c4226'
  ctx.fill()
  land(OKEECHOBEE, '#1a3d66')
  multiplyGrain(ctx, n, 0.03, 0.18, 3)
  // cloud streaks, faint
  ctx.save()
  ctx.globalAlpha = 0.18
  const g = grain(512, 0.012, 0.5, 9)
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = ctx.createPattern(g, 'repeat')!
  ctx.fillRect(0, 0, n, n)
  ctx.restore()
  return canvasTexture(c)
}

/** the Cape: 2048 px over ±24 km, centred on the pad */
export function capeMap(center: [number, number]): THREE.CanvasTexture {
  const n = 2048
  const half = 24 * KM
  const [cx, cz] = center
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const s = n / (2 * half)
  // land: coastal scrub and marsh, with sandy scrub patches, wetter darker ground and ponds
  ctx.fillStyle = '#4a5f33'
  ctx.fillRect(0, 0, n, n)
  {
    const img = ctx.getImageData(0, 0, n, n)
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const X = (i / n) * 2 * half - half + cx
        const Z = (j / n) * 2 * half - half + cz
        const wet = fbm(X * 0.00025 + 3, Z * 0.00025, 4)
        const sand = fbm(X * 0.0006 + 40, Z * 0.0006 + 9, 3)
        const pond = fbm(X * 0.0012 + 77, Z * 0.0012 + 5, 3)
        const k = (j * n + i) * 4
        let r = 56 + 40 * (sand - 0.5)
        let g = 74 + 32 * (sand - 0.5)
        let b = 38 + 16 * (sand - 0.5)
        if (wet > 0.55) {
          const w = Math.min(1, (wet - 0.55) / 0.12)
          r = r * (1 - w) + 40 * w
          g = g * (1 - w) + 58 * w
          b = b * (1 - w) + 36 * w
        }
        if (pond > 0.66) {
          r = 28
          g = 56
          b = 78
        }
        img.data[k] = r
        img.data[k + 1] = g
        img.data[k + 2] = b
      }
    ctx.putImageData(img, 0, 0)
  }
  // the Atlantic: everything east of the shoreline
  const ocean: Array<[number, number]> = [...SHORE, [-80.0, 28.0], [-80.0, 29.2]]
  poly(ctx, ocean, n, half, cx, cz)
  ctx.fillStyle = '#113756'
  ctx.fill()
  // surf line / beach
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#255d82'
  ctx.lineWidth = 320 * s
  ctx.stroke()
  poly(ctx, SHORE, n, half, cx, cz, false)
  ctx.strokeStyle = '#c4b98f'
  ctx.lineWidth = 160 * s
  ctx.stroke()
  // lagoons
  for (const w of [BANANA, INDIAN, MOSQUITO]) {
    poly(ctx, w, n, half, cx, cz)
    ctx.fillStyle = '#214a68'
    ctx.fill()
  }
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
  return canvasTexture(c, 16)
}

/** the pad itself: 2048 px over ±1 km. The vehicle stands at the centre. */
export function padMap(pad: PadId): THREE.CanvasTexture {
  const n = 2048
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
