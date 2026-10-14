/**
 * The big ground and Earth maps, loaded as KTX2 (Basis Universal ETC1S) so they stay compressed
 * on the GPU: the browser transcodes them to the block format the device reads natively (ETC2
 * on phones, BC1/BC7 on desktops, ASTC where that is all there is) at 4–8 bits per texel instead
 * of the 32 a decoded JPEG takes. The .ktx2 files sit next to the originals
 * (scripts/ktx2.py); if one cannot be read — no WebAssembly, a failed transcode — the original
 * JPEG/PNG/WebP loads instead. `?ktx2=0` forces the originals (for comparisons).
 *
 * The files carry their mipmaps and are stored flipped (compressed textures cannot be flipped at
 * upload), so they line up with the meshes' UVs exactly as the TextureLoader versions did.
 */
import { useLoader, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'

const BASE_URL = import.meta.env.BASE_URL
const KTX2_ON = typeof location === 'undefined' || new URLSearchParams(location.search).get('ktx2') !== '0'

export function ktx2Url(url: string): string {
  return url.replace(/\.(jpg|jpeg|png|webp)$/i, '.ktx2')
}

/** one KTX2 loader for the page: it owns a pool of transcoder workers */
let ktx2: KTX2Loader | null = null
function ktx2Loader(gl: THREE.WebGLRenderer): KTX2Loader {
  if (!ktx2) {
    ktx2 = new KTX2Loader().setTranscoderPath(`${BASE_URL}basis/`).setWorkerLimit(Math.max(2, Math.min(4, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 2)))
    ktx2.detectSupport(gl)
  }
  return ktx2
}

/** KTX2 first, the original image if that fails */
class MapLoader extends THREE.Loader<THREE.Texture> {
  private gl: THREE.WebGLRenderer | null = null
  private images = new THREE.TextureLoader()

  setRenderer(gl: THREE.WebGLRenderer): this {
    this.gl = gl
    return this
  }

  load(url: string, onLoad: (t: THREE.Texture) => void, onProgress?: (e: ProgressEvent) => void, onError?: (e: unknown) => void): void {
    const original = () => {
      this.images.load(url, onLoad, onProgress, onError)
    }
    if (!KTX2_ON || !this.gl) return original()
    ktx2Loader(this.gl).load(ktx2Url(url), onLoad, onProgress, (e) => {
      console.warn(`[maps] KTX2 unavailable for ${url}, using the original`, e)
      original()
    })
  }
}

/**
 * Loads maps by their original URLs (…/region.jpg); suspends like useLoader. The textures are
 * uploaded right away rather than on the first frame that draws them, so a scene change does
 * not hitch.
 */
export function useMaps(urls: string[]): THREE.Texture[] {
  const gl = useThree((s) => s.gl)
  const textures = useLoader(MapLoader, urls, (loader) => {
    ;(loader as MapLoader).setRenderer(gl)
  }) as THREE.Texture[]
  useEffect(() => {
    for (const t of textures) gl.initTexture(t)
  }, [gl, textures])
  return textures
}

/** the bytes a texture takes on the GPU, mipmaps included (an estimate from its format) */
export function gpuBytes(t: THREE.Texture): number {
  const img = t.image as { width?: number; height?: number } | undefined
  const w = img?.width ?? 0
  const h = img?.height ?? 0
  if (!w || !h) return 0
  const compressed = (t as THREE.CompressedTexture).isCompressedTexture
  let bpp = 32
  if (compressed) {
    const f = t.format as number
    // 4 bits per texel: ETC1/ETC2 RGB, BC1 (DXT1), PVRTC 4bpp; 8: ETC2 RGBA, BC3, BC7, ASTC 4×4
    const four: number[] = [THREE.RGB_ETC1_Format, THREE.RGB_ETC2_Format, THREE.RGB_S3TC_DXT1_Format, THREE.RGBA_S3TC_DXT1_Format, THREE.RGB_PVRTC_4BPPV1_Format, THREE.RGBA_PVRTC_4BPPV1_Format]
    bpp = four.includes(f) ? 4 : 8
  }
  return (w * h * bpp) / 8 * 1.333
}
