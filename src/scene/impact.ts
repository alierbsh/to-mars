/**
 * Deterministic debris and dust for the end of a flight: fragments on ballistic arcs under Mars
 * gravity, dust puffs spreading from a point. Everything is a pure function of the time since the
 * event (sim seconds), so scrubbing the playback replays it exactly.
 */
import * as THREE from 'three'
import { hash2, fbm } from './noise'

export const G_MARS = 3.71

export interface Fragment {
  /** launch velocity m/s */
  v: THREE.Vector3
  /** spin rad/s about a random axis */
  spin: THREE.Vector3
  size: number
  light: boolean
}

export function makeFragments(seed: number, count: number, speed: number, sizeMax: number, forward = 0): Fragment[] {
  const out: Fragment[] = []
  for (let i = 0; i < count; i++) {
    const a = hash2(seed, i) * Math.PI * 2
    const up = 0.25 + hash2(seed + 1, i) * 0.75 // mostly upward
    const sp = speed * (0.35 + hash2(seed + 2, i) * 0.9)
    const horiz = Math.sqrt(Math.max(0, 1 - up * up))
    out.push({
      v: new THREE.Vector3(Math.cos(a) * horiz * sp + forward, up * sp, Math.sin(a) * horiz * sp),
      spin: new THREE.Vector3(hash2(seed + 3, i) - 0.5, hash2(seed + 4, i) - 0.5, hash2(seed + 5, i) - 0.5).multiplyScalar(14),
      size: sizeMax * (0.15 + Math.pow(hash2(seed + 6, i), 2) * 0.85),
      light: hash2(seed + 7, i) > 0.45,
    })
  }
  return out
}

/** position of a fragment at τ seconds after launch from `origin`, resting on the ground at `groundY` */
export function fragmentAt(f: Fragment, tau: number, origin: THREE.Vector3, groundY: number, out: THREE.Vector3, extraVx = 0): boolean {
  // time of ground contact: origin.y + vy τ − ½ g τ² = groundY + size/2
  const h0 = origin.y - groundY - f.size / 2
  const disc = f.v.y * f.v.y + 2 * G_MARS * h0
  const tHit = disc > 0 ? (f.v.y + Math.sqrt(disc)) / G_MARS : 0
  const tt = Math.min(tau, Math.max(tHit, 0))
  out.set(origin.x + (f.v.x + extraVx) * tt, origin.y + f.v.y * tt - 0.5 * G_MARS * tt * tt, origin.z + f.v.z * tt)
  if (tau >= tHit) out.y = groundY + f.size / 2
  return tau >= tHit
}

let dustCache: THREE.CanvasTexture | null = null
/** soft, slightly irregular puff */
export function dustTexture(): THREE.CanvasTexture {
  if (dustCache) return dustCache
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(n, n)
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const dx = (i - n / 2) / (n / 2)
      const dy = (j - n / 2) / (n / 2)
      const r = Math.hypot(dx, dy)
      const lobes = 1 + 0.18 * Math.sin(Math.atan2(dy, dx) * 5 + r * 4) + 0.1 * Math.sin(Math.atan2(dy, dx) * 9)
      const a = Math.max(0, 1 - r / (0.92 * lobes))
      const k = (j * n + i) * 4
      img.data[k] = 255
      img.data[k + 1] = 255
      img.data[k + 2] = 255
      img.data[k + 3] = 255 * a * a
    }
  ctx.putImageData(img, 0, 0)
  dustCache = new THREE.CanvasTexture(c)
  return dustCache
}

let puffCache: THREE.CanvasTexture | null = null
/**
 * A billowing cloud puff for steam and smoke sprites: cauliflower lobes from fbm with a soft
 * edge, lit from above (bright crown, shadowed underside) so a heap of them reads as cumulus
 * rather than a flat veil. White in RGB with the shading baked into the brightness; the sprite's
 * colour tints it.
 */
export function cloudPuffTexture(): THREE.CanvasTexture {
  if (puffCache) return puffCache
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(n, n)
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const dx = (i - n / 2) / (n / 2)
      const dy = (j - n / 2) / (n / 2)
      const r = Math.hypot(dx, dy)
      // lobed outline: the radius wanders with low-frequency noise around the rim
      const ang = Math.atan2(dy, dx)
      const lobes = 0.78 + 0.2 * fbm(Math.cos(ang) * 1.6 + 5, Math.sin(ang) * 1.6 + 9, 3)
      const edge = Math.max(0, Math.min(1, (lobes - r) / 0.22))
      // inner structure: cauliflower lumps
      const lump = fbm(dx * 3.2 + 11, dy * 3.2 + 3, 4)
      const dens = edge * edge * (0.55 + 0.45 * lump)
      // lit from above: bright crown, grey base
      const light = 0.62 + 0.38 * Math.max(0, Math.min(1, 0.5 - dy * 0.6 + (lump - 0.5) * 0.5))
      const k = (j * n + i) * 4
      const v = Math.round(255 * light)
      img.data[k] = v
      img.data[k + 1] = v
      img.data[k + 2] = v
      img.data[k + 3] = Math.round(255 * Math.min(1, dens * 1.25))
    }
  ctx.putImageData(img, 0, 0)
  puffCache = new THREE.CanvasTexture(c)
  return puffCache
}

export interface Puff {
  dir: number
  rate: number
  rise: number
  size: number
  delay: number
}

export function makePuffs(seed: number, count: number): Puff[] {
  const out: Puff[] = []
  for (let i = 0; i < count; i++) out.push({ dir: (i / count) * Math.PI * 2 + hash2(seed, i) * 0.6, rate: 0.6 + hash2(seed + 1, i) * 0.8, rise: 0.4 + hash2(seed + 2, i) * 0.8, size: 0.7 + hash2(seed + 3, i) * 0.6, delay: hash2(seed + 4, i) * 0.6 })
  return out
}
