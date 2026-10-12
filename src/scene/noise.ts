/**
 * DOM-free helpers shared by the scene and the texture worker: value noise and heightmap sampling.
 */
/** deterministic hash noise in [0,1) */
export function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** smooth value noise in [0,1] */
export function noise2(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

/** fractal Brownian motion, octaves of value noise, in [0,1] */
export function fbm(x: number, y: number, octaves = 5, lacunarity = 2.1, gain = 0.5): number {
  let sum = 0
  let amp = 0.5
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x, y)
    norm += amp
    x *= lacunarity
    y *= lacunarity
    amp *= gain
  }
  return sum / norm
}

export interface Heightmap {
  n: number
  /** normalised 0..1 heights, row 0 = north edge */
  data: Float32Array
}

/** bilinear sample of a heightmap at normalised (u, v), u east 0..1, v north→south 0..1 */
export function sampleHeight(h: Heightmap, u: number, v: number): number {
  const x = Math.min(Math.max(u, 0), 1) * (h.n - 1)
  const y = Math.min(Math.max(v, 0), 1) * (h.n - 1)
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, h.n - 1)
  const y1 = Math.min(y0 + 1, h.n - 1)
  const fx = x - x0
  const fy = y - y0
  const a = h.data[y0 * h.n + x0]
  const b = h.data[y0 * h.n + x1]
  const c = h.data[y1 * h.n + x0]
  const d = h.data[y1 * h.n + x1]
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
}

