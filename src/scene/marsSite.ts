/**
 * The Mars landing site as pure functions (no DOM), shared by the scene component and the
 * texture worker: heightfields for the three terrain tiers and the per-pixel colour of their maps.
 * Data: JPL's 3D-printable DEM of Gusev crater (the Spirit landing site) and of Victoria crater,
 * both decoded from 16-bit heightmaps, plus deterministic procedural craters, dunes and regolith.
 * The touchdown point is the origin; x east, z south, metres.
 */
import { fbm, hash2, sampleHeight, type Heightmap } from './noise'

export const R_MARS = 3_389_500
/** Gusev crater, Columbia Memorial Station (Spirit): 14.57°S 175.47°E */
export const SITE_LAT = -14.57
export const SITE_LON = 175.47
/** the JPL Gusev model covers about 260 km east–west; vertical relief floor→highlands ≈ 3.6 km */
export const REGION_HALF = 130_000
export const REGION_RELIEF = 3600
export const REGION_SEG = 256
/** touchdown pixel in the Gusev map (crater floor, ~3 km WNW of the Columbia Hills) */
export const SITE_U = 0.489
export const SITE_V = 0.558
export const SITE_X = (SITE_U * 2 - 1) * REGION_HALF // touchdown point east of the tile centre
export const SITE_Z = (SITE_V * 2 - 1) * REGION_HALF // and south of it
export const MID_HALF = 8000
export const MID_SEG = 256
export const NEAR_HALF = 1200
export const NEAR_SEG = 240
/** Victoria crater: 940 m model extent, ~75 m deep, placed east-south-east of the touchdown point */
export const VICTORIA_HALF = 470
export const VICTORIA_DEPTH = 75
export const VICTORIA_X = 640
export const VICTORIA_Z = 160
export const GLOBE_HALF = 2_500_000

export type HeightFn = (x: number, z: number) => number
export type PixelFn = (x: number, z: number, out: number[]) => void

/** smooth 0→1 over [a, b] */
export const smooth = (v: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** feather weight: 1 inside, falling to 0 at the tile edge */
export const feather = (x: number, z: number, half: number, band = 0.15) => 1 - smooth(Math.max(Math.abs(x), Math.abs(z)) / half, 1 - band, 1)

/** dip of a coarse tile under the finer tile that covers it */
const dip = (x: number, z: number, half: number, depth: number) => depth * (1 - smooth(Math.max(Math.abs(x), Math.abs(z)) / half, 0.9, 1.0))

interface Crater {
  x: number
  z: number
  r: number
  depth: number
}

/** bowl with a raised rim; returns the height change at distance d from the centre */
function craterProfile(d: number, c: Crater): number {
  const q = d / c.r
  if (q > 1.6) return 0
  const rim = 0.12 * c.depth * Math.exp(-((q - 1) * (q - 1)) / 0.06)
  if (q >= 1) return rim
  const bowl = -c.depth * Math.pow(1 - q * q, 1.4)
  return bowl + rim
}

/** deterministic crater field with a grid index: count craters within `half`, radii rMin..rMax, none within `clear` of the origin */
class CraterField {
  craters: Crater[] = []
  private cell: number
  private buckets = new Map<number, Crater[]>()
  constructor(seed: number, count: number, half: number, rMin: number, rMax: number, clear: number) {
    this.cell = rMax * 3.4
    for (let i = 0; i < count; i++) {
      const x = (hash2(seed, i * 3 + 1) * 2 - 1) * half
      const z = (hash2(seed, i * 3 + 2) * 2 - 1) * half
      const r = rMin * Math.pow(rMax / rMin, Math.pow(hash2(seed, i * 3 + 3), 1.8))
      if (Math.hypot(x, z) < clear + r) continue
      // depth/diameter ≈ 0.1 fresh → 0.03 degraded, large ones shallower
      const c = { x, z, r, depth: Math.min(1200, 2 * r * (0.03 + 0.08 * hash2(seed + 7, i))) }
      this.craters.push(c)
      const i0 = Math.floor((x - r * 1.6) / this.cell)
      const i1 = Math.floor((x + r * 1.6) / this.cell)
      const j0 = Math.floor((z - r * 1.6) / this.cell)
      const j1 = Math.floor((z + r * 1.6) / this.cell)
      for (let I = i0; I <= i1; I++)
        for (let J = j0; J <= j1; J++) {
          const key = I * 100003 + J
          const b = this.buckets.get(key)
          if (b) b.push(c)
          else this.buckets.set(key, [c])
        }
    }
  }
  near(x: number, z: number): Crater[] | undefined {
    return this.buckets.get(Math.floor(x / this.cell) * 100003 + Math.floor(z / this.cell))
  }
  /** height change from all craters at (x, z) */
  height(x: number, z: number): number {
    const b = this.near(x, z)
    if (!b) return 0
    let h = 0
    for (const c of b) {
      const d = Math.hypot(x - c.x, z - c.z)
      if (d < c.r * 1.6) h += craterProfile(d, c)
    }
    return h
  }
  /** floor: 0 outside → 1 at the centre; rim: 1 on the rim crest; for colouring */
  mask(x: number, z: number): { floor: number; rim: number } {
    let floor = 0
    let rim = 0
    const b = this.near(x, z)
    if (b)
      for (const c of b) {
        const q = Math.hypot(x - c.x, z - c.z) / c.r
        if (q < 1) floor = Math.max(floor, 1 - q * q)
        if (q > 0.8 && q < 1.35) rim = Math.max(rim, Math.exp(-((q - 1.02) * (q - 1.02)) / 0.02))
      }
    return { floor, rim }
  }
}

/** a tile's mesh surface, piecewise-bilinear between its grid vertices, so finer tiles meet it exactly at the seam */
function gridSampler(height: HeightFn, x0: number, z0: number, cell: number): HeightFn {
  const cache = new Map<number, number>()
  const vertexH = (I: number, J: number) => {
    const key = I * 4096 + J
    let v = cache.get(key)
    if (v === undefined) {
      v = height(x0 + I * cell, z0 + J * cell)
      cache.set(key, v)
    }
    return v
  }
  return (x, z) => {
    const gi = (x - x0) / cell
    const gj = (z - z0) / cell
    const I = Math.floor(gi)
    const J = Math.floor(gj)
    const fx = gi - I
    const fz = gj - J
    const a = vertexH(I, J)
    const b = vertexH(I + 1, J)
    const c = vertexH(I, J + 1)
    const d = vertexH(I + 1, J + 1)
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz
  }
}

/** base regolith colour with large- and small-scale variation; x, z in metres */
function regolith(x: number, z: number, out: number[], scale = 1) {
  const coarse = fbm(x * 0.0006 * scale + 11, z * 0.0006 * scale, 3)
  const fine = fbm(x * 0.02 * scale, z * 0.02 * scale, 3)
  const dark = smooth(fbm(x * 0.0009 * scale + 40, z * 0.003 * scale + 3, 3), 0.6, 0.72) * 0.8 // wind-streaked basaltic sand
  out[0] = 150 + 40 * (coarse - 0.5) + 26 * (fine - 0.5) - 55 * dark
  out[1] = 88 + 24 * (coarse - 0.5) + 16 * (fine - 0.5) - 32 * dark
  out[2] = 52 + 13 * (coarse - 0.5) + 9 * (fine - 0.5) - 16 * dark
}

export interface MarsSite {
  regionHeight: HeightFn
  midHeight: HeightFn
  nearHeight: HeightFn
  /** colour of the regional map at tile-centred coordinates */
  regionPixel: PixelFn
  midPixel: PixelFn
  nearPixel: PixelFn
}

export function buildSite(gusev: Heightmap, victoria: Heightmap): MarsSite {
  const h0 = sampleHeight(gusev, SITE_U, SITE_V)
  const regionCraters = new CraterField(3, 220, REGION_HALF, 900, 9000, MID_HALF * 1.3)
  const midCraters = new CraterField(11, 140, MID_HALF, 50, 900, NEAR_HALF * 1.4)

  // --- regional: DEM + secondary craters, dipped under the mid tile. The touchdown point must be
  // at height 0 on the *mesh* (bilinear between the 1 km vertices), not on the raw DEM.
  const regionCell = (2 * REGION_HALF) / REGION_SEG
  const demRaw: HeightFn = (x, z) => {
    const u = (x + SITE_X + REGION_HALF) / (2 * REGION_HALF)
    const v = (z + SITE_Z + REGION_HALF) / (2 * REGION_HALF)
    return (sampleHeight(gusev, u, v) - h0) * REGION_RELIEF
  }
  const meshRaw = gridSampler(demRaw, -REGION_HALF - SITE_X, -REGION_HALF - SITE_Z, regionCell)
  const off = meshRaw(0, 0)
  const regionDem: HeightFn = (x, z) => demRaw(x, z) - off
  const regionMesh: HeightFn = (x, z) => meshRaw(x, z) - off
  const regionHeight: HeightFn = (x, z) => regionDem(x, z) + regionCraters.height(x, z) - dip(x, z, MID_HALF, 300)
  const regionPixel: PixelFn = (x, z, out) => {
    const X = x - SITE_X
    const Z = z - SITE_Z
    const u = (x + REGION_HALF) / (2 * REGION_HALF)
    const v = (z + REGION_HALF) / (2 * REGION_HALF)
    const h = sampleHeight(gusev, u, v)
    const e = 1 / 1024
    const slope = Math.min(1, Math.hypot(sampleHeight(gusev, Math.min(u + e, 1), v) - sampleHeight(gusev, Math.max(u - e, 0), v), sampleHeight(gusev, u, Math.min(v + e, 1)) - sampleHeight(gusev, u, Math.max(v - e, 0))) * 60)
    const t = smooth(Math.pow(h, 0.6) * 1.3, 0, 1)
    regolith(x, z, out, 0.02)
    const high = [184, 128, 86]
    const m = regionCraters.mask(X, Z)
    for (let k = 0; k < 3; k++) {
      let c = out[k] + (high[k] - out[k]) * t * 0.9
      c *= 1 - 0.35 * slope
      c *= 1 - 0.2 * m.floor + 0.12 * m.rim
      out[k] = c
    }
  }

  // --- mid: regional mesh surface + small craters + dunes, dipped under the near patch
  const regionWithCraters: HeightFn = (x, z) => regionMesh(x, z) + regionCraters.height(x, z)
  const midDetail: HeightFn = (x, z) => {
    const dunes = (fbm(x * 0.0025 + 3, z * 0.0012, 3) - 0.5) * 14 * smooth(fbm(x * 0.0004, z * 0.0004 + 8, 2), 0.45, 0.65)
    const rough = (fbm(x * 0.008, z * 0.008 + 21, 4) - 0.5) * 6
    // the near patch carries its own detail: fade the mid relief out around the touchdown point
    return (midCraters.height(x, z) + dunes + rough) * smooth(Math.hypot(x, z), 300, 1100)
  }
  const midBase: HeightFn = (x, z) => regionWithCraters(x, z) + feather(x, z, MID_HALF) * midDetail(x, z) + 0.4
  const midHeight: HeightFn = (x, z) => midBase(x, z) - dip(x, z, NEAR_HALF, 150)
  const midPixel: PixelFn = (x, z, out) => {
    regolith(x, z, out, 1)
    const m = midCraters.mask(x, z)
    // dust-devil tracks: thin dark meandering lines
    const track = smooth(Math.abs(fbm(x * 0.003 + 70, z * 0.003, 3) - 0.5), 0.0, 0.012)
    for (let k = 0; k < 3; k++) out[k] *= (1 - 0.22 * m.floor + 0.14 * m.rim) * (0.86 + 0.14 * track)
  }

  // --- near: mid mesh surface + Victoria crater + fine bumps
  const midMesh = gridSampler(midBase, -MID_HALF, -MID_HALF, (2 * MID_HALF) / MID_SEG)
  const plain = sampleHeight(victoria, 0.02, 0.02)
  const craterDepth = (x: number, z: number) => {
    const u = (x - VICTORIA_X + VICTORIA_HALF) / (2 * VICTORIA_HALF)
    const v = (z - VICTORIA_Z + VICTORIA_HALF) / (2 * VICTORIA_HALF)
    if (u < 0 || u > 1 || v < 0 || v > 1) return 0
    return Math.max(0, (plain - sampleHeight(victoria, u, v)) / plain)
  }
  const nearHeight: HeightFn = (x, z) => {
    const flat = smooth(Math.hypot(x, z), 25, 90) // keep the touchdown area level
    const bumps = flat * ((fbm(x * 0.01 + 5, z * 0.01, 4) - 0.5) * 2.4 + (fbm(x * 0.05, z * 0.05 + 9, 3) - 0.5) * 0.5)
    return midMesh(x, z) + feather(x, z, NEAR_HALF) * (bumps - craterDepth(x, z) * VICTORIA_DEPTH) + 0.3
  }
  const nearPixel: PixelFn = (x, z, out) => {
    regolith(x, z, out, 1)
    const fine = fbm(x * 0.25, z * 0.25, 2)
    const d = craterDepth(x, z)
    const wall = smooth(d, 0.15, 0.65)
    const floor = smooth(d, 0.75, 1)
    const ripples = 0.5 + 0.5 * Math.sin((x * 0.9 + z * 0.4) * 0.35 + fine * 6)
    for (let k = 0; k < 3; k++) {
      let c = out[k] * (0.9 + 0.2 * fine)
      c = c * (1 - 0.3 * floor) + [30, 24, 20][k] * wall * (1 - floor)
      c -= [7, 5, 0][k] * ripples * floor
      out[k] = c
    }
  }

  return { regionHeight, midHeight, nearHeight, regionPixel, midPixel, nearPixel }
}

/** rocks around the touchdown point: dense near the crater (ejecta), sparser on the plain */
export function rockField(site: MarsSite): Array<{ p: [number, number, number]; s: number; r: number; c: number }> {
  const rocks: Array<{ p: [number, number, number]; s: number; r: number; c: number }> = []
  for (let i = 0; i < 900; i++) {
    const a = hash2(i, 1) * Math.PI * 2
    const rr = 28 + Math.pow(hash2(i, 2), 0.6) * 1100
    const x = Math.cos(a) * rr
    const z = Math.sin(a) * rr
    const dC = Math.hypot(x - VICTORIA_X, z - VICTORIA_Z)
    if (dC < VICTORIA_HALF * 0.86) continue // not inside the crater
    const ejecta = dC < 700 ? 1.6 : 1
    const s = (0.25 + Math.pow(hash2(i, 3), 2.5) * 2.4) * ejecta
    rocks.push({ p: [x, site.nearHeight(x, z) + s * 0.25, z], s, r: hash2(i, 4) * Math.PI * 2, c: hash2(i, 5) })
  }
  return rocks
}

/** rasterise a map: n×n RGBA over ±half (row 0 = north), finer tiles fading out over their outer band */
export function renderMap(n: number, half: number, px: PixelFn, fade: boolean): Uint8ClampedArray {
  const data = new Uint8ClampedArray(n * n * 4)
  const out = [0, 0, 0]
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 * half - half
      const z = (j / (n - 1)) * 2 * half - half
      px(x, z, out)
      const k = (j * n + i) * 4
      data[k] = out[0]
      data[k + 1] = out[1]
      data[k + 2] = out[2]
      data[k + 3] = fade ? 255 * feather(x, z, half, 0.12) : 255
    }
  }
  return data
}

/** multiply the global-mosaic crop by fine grain so it does not look like a blurry photo up close */
export function grainGlobe(data: Uint8ClampedArray, n: number): void {
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const g = 0.78 + 0.44 * fbm(i * 0.05, j * 0.05, 2) * (0.6 + 0.8 * fbm(i * 0.004, j * 0.004, 2))
      const k = (j * n + i) * 4
      data[k] = Math.min(255, data[k] * g)
      data[k + 1] = Math.min(255, data[k + 1] * g)
      data[k + 2] = Math.min(255, data[k + 2] * g)
    }
  }
}
