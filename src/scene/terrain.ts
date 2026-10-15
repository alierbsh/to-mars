/**
 * Terrain helpers shared by the launch site and the Mars landing site:
 * value noise for procedural textures, a spherical "cap" geometry (a patch of planet surface
 * expressed in local tangent coordinates so float precision stays good near the vehicle),
 * and a 16-bit heightmap decoder for the NASA DEM-derived PNGs in public/assets/mars.
 */
import * as THREE from 'three'

export { hash2, noise2, fbm, sampleHeight, type Heightmap } from './noise'
import type { Heightmap } from './noise'

/**
 * Decode an RG-encoded 16-bit heightmap PNG (R high byte, G low byte). The image is decoded off the
 * main thread (`decode()`) and read back from a canvas kept in memory (`willReadFrequently`): a
 * GPU canvas's getImageData waits for the GPU — it was a stall of its own at the cut to orbit.
 */
export function loadHeightmap(url: string): Promise<Heightmap> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = url
  return img
    .decode()
    .catch(() => {
      throw new Error(`heightmap ${url}`)
    })
    .then(() => {
      const n = img.width
      const c = document.createElement('canvas')
      c.width = n
      c.height = img.height
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)
      const px = ctx.getImageData(0, 0, n, img.height).data
      const data = new Float32Array(n * img.height)
      for (let i = 0; i < data.length; i++) data[i] = (px[i * 4] * 256 + px[i * 4 + 1]) / 65535
      return { n, data }
    })
}

export interface CapBounds {
  x0: number
  x1: number
  z0: number
  z1: number
}

/**
 * A rectangular patch of a sphere of radius R (m), with tangent-plane bounds in metres measured
 * from the point directly below the local origin (a number = a square of that half-width).
 * Local x = east, z = south, y up; the curvature is always taken about the local origin, so
 * several patches built with the same R line up exactly where they overlap.
 * `height(x, z)` adds terrain relief along the local normal. UVs run 0..1 across the patch.
 */
export function capGeometry(R: number, bounds: number | CapBounds, segments: number, height?: (x: number, z: number) => number, uvFn?: (x: number, z: number) => [number, number]): THREE.BufferGeometry {
  const b = typeof bounds === 'number' ? { x0: -bounds, x1: bounds, z0: -bounds, z1: bounds } : bounds
  const n = segments + 1
  const pos = new Float32Array(n * n * 3)
  const uv = new Float32Array(n * n * 2)
  const idx: number[] = []
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = b.x0 + (i / segments) * (b.x1 - b.x0)
      const z = b.z0 + (j / segments) * (b.z1 - b.z0)
      const d = Math.hypot(x, z)
      const ang = d / R
      const s = d > 0 ? (R * Math.sin(ang)) / d : 1
      const h = height ? height(x, z) : 0
      // point on the sphere, then push outward along the sphere normal by h
      const px = x * s
      const pz = z * s
      const py = R * (Math.cos(ang) - 1)
      const nx = px / R
      const ny = (py + R) / R
      const nz = pz / R
      const k = (j * n + i) * 3
      pos[k] = px + nx * h
      pos[k + 1] = py + ny * h
      pos[k + 2] = pz + nz * h
      const t = uvFn ? uvFn(x, z) : [i / segments, 1 - j / segments]
      uv[(j * n + i) * 2] = t[0]
      uv[(j * n + i) * 2 + 1] = t[1]
    }
  }
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * n + i
      const b = a + 1
      const c = a + n
      const d = c + 1
      idx.push(a, c, b, b, c, d)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** canvas → texture with sensible defaults for a ground map */
export function canvasTexture(c: HTMLCanvasElement, anisotropy = 8): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = anisotropy
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  t.needsUpdate = true
  return t
}
