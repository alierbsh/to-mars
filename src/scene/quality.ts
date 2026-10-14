/**
 * Graphics quality tiers. The site has to run on a phone without cooking it and on an office
 * laptop without stuttering, and the same scene can cost ten times more or less depending on a
 * handful of knobs: the pixel ratio the canvas renders at, multisampling, shadow maps, the
 * logarithmic depth buffer (which writes gl_FragDepth and so defeats the early depth test —
 * on a tile-based mobile GPU that means every fragment of every overlapping surface is
 * shaded), the sky's ray-march sample counts, the flame's layers and noise octaves, the steam
 * sprite count, the terrain mesh density, and the texture resolution (the Cape at 4096² takes
 * ~85 MB of GPU memory per map; the full set was ~430 MB).
 *
 * The tier is picked from the device (`?quality=high|medium|low` or a saved choice win), and
 * the opening screens measure the frame time and step down a tier if the device cannot keep up.
 */
export type Quality = 'high' | 'medium' | 'low'

export interface QualitySettings {
  /** the canvas's device-pixel-ratio cap */
  dpr: number
  antialias: boolean
  /** shadow map size; 0 turns shadows off */
  shadowMap: number
  /** the logarithmic depth buffer (precise across the 0.5 m … 8000 km range; costs early-Z) */
  logDepth: boolean
  /** the sky's ray march: samples along the view ray, and toward the sun per sample */
  skySamples: [number, number]
  /** flame: the wide additive glow layer, the number of tongues under the mount, noise octaves */
  plumeGlow: boolean
  tongues: number
  fbmOctaves: 2 | 3
  /** flame hull resolution (around × along) for the column and for a tongue: the shape is set in
   *  the vertex shader, and a 33-engine liftoff with its tongues was ~300k triangles at 48 × 72 */
  plumeMesh: [number, number]
  tongueMesh: [number, number]
  /** the flames light the vehicle, the pad and the steam (point lights: every lit surface pays per light) */
  plumeLights: boolean
  /** steam and dust sprite counts, as a fraction of the full set */
  sprites: number
  /** terrain mesh density, as a fraction of the full segment counts */
  mesh: number
  /** texture set: the full-resolution maps or the half-size variants */
  textures: 'full' | 'half'
  /** anisotropic filtering on the ground maps */
  anisotropy: number
  /** frame-rate cap while the mission plays, and while the opening screens are up */
  fps: number
  fpsIdle: number
}

export const QUALITY: Record<Quality, QualitySettings> = {
  high: { dpr: 1.5, antialias: true, shadowMap: 2048, logDepth: true, skySamples: [16, 4], plumeGlow: true, tongues: 14, fbmOctaves: 3, plumeMesh: [48, 72], tongueMesh: [24, 36], plumeLights: true, sprites: 1, mesh: 1, textures: 'full', anisotropy: 16, fps: 60, fpsIdle: 30 },
  medium: { dpr: 1.25, antialias: true, shadowMap: 1024, logDepth: true, skySamples: [10, 3], plumeGlow: true, tongues: 10, fbmOctaves: 3, plumeMesh: [40, 60], tongueMesh: [20, 30], plumeLights: true, sprites: 0.7, mesh: 0.75, textures: 'full', anisotropy: 8, fps: 60, fpsIdle: 24 },
  low: { dpr: 1, antialias: false, shadowMap: 0, logDepth: false, skySamples: [6, 2], plumeGlow: false, tongues: 7, fbmOctaves: 2, plumeMesh: [28, 44], tongueMesh: [14, 20], plumeLights: false, sprites: 0.5, mesh: 0.5, textures: 'half', anisotropy: 4, fps: 30, fpsIdle: 15 },
}

const KEY = 'occupy-mars:quality'
const ORDER: Quality[] = ['high', 'medium', 'low']

function isQuality(v: unknown): v is Quality {
  return v === 'high' || v === 'medium' || v === 'low'
}

/** the viewer's saved choice, if they made one (null = automatic) */
export function savedQuality(): Quality | null {
  try {
    const v = localStorage.getItem(KEY)
    return isQuality(v) ? v : null
  } catch {
    return null
  }
}

export function saveQuality(q: Quality | null) {
  try {
    if (q) localStorage.setItem(KEY, q)
    else localStorage.removeItem(KEY)
  } catch {
    /* private mode */
  }
}

/** a phone or tablet: touch-first with a small screen, or a mobile UA */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true
  // iPadOS reports as a Mac; touch points give it away
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true
  return false
}

/** the tier the device starts on: the URL, then the saved choice, then a guess from the hardware */
export function detectQuality(): Quality {
  if (typeof location !== 'undefined') {
    const q = new URLSearchParams(location.search).get('quality')
    if (isQuality(q)) return q
  }
  const saved = savedQuality()
  if (saved) return saved
  if (isMobileDevice()) return 'low'
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = navigator.hardwareConcurrency ?? 4
  const mem = nav.deviceMemory ?? 8
  if (cores <= 4 || mem <= 4) return 'medium'
  // a very high-density display on a laptop: 1.5× of a 4k panel is a lot of pixels
  if (window.devicePixelRatio >= 2 && window.innerWidth * window.innerHeight > 3_000_000) return 'medium'
  return 'high'
}

/** one tier down (or the same if already at the bottom) */
export function lowerQuality(q: Quality): Quality {
  return ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(q) + 1)]
}

/** texture file name for the tier: the half-size variants carry a suffix before the extension */
export function texName(base: string, textures: 'full' | 'half'): string {
  if (textures === 'full') return base
  const dot = base.lastIndexOf('.')
  return `${base.slice(0, dot)}-half${base.slice(dot)}`
}
