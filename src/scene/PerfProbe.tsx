/**
 * `?debug=1`: logs the renderer's counts once a second — draw calls, triangles, programs, the
 * textures on the GPU with their estimated bytes — and exposes the renderer as window.__gl.
 * Nothing is rendered; the screenshot script collects the console lines.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../state/store'
import { gpuBytes } from './maps'

const ON = typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1'

export function PerfProbe() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const last = useRef(0)
  const frames = useRef(0)
  useFrame(() => {
    if (!ON) return
    frames.current++
    const now = performance.now() / 1000
    if (now - last.current < 1) return
    ;(window as unknown as { __gl: THREE.WebGLRenderer }).__gl = gl
    // the textures referenced by the scene's materials, with a mip-mapped RGBA8 size estimate
    // by source: clones of a texture (the ring skin's per-material repeats) share one GPU copy
    const seen = new Set<unknown>()
    let bytes = 0
    const names: string[] = []
    scene.traverse((o) => {
      const mats = (o as THREE.Mesh).material
      const list = Array.isArray(mats) ? mats : mats ? [mats] : []
      for (const m of list) {
        for (const v of Object.values(m as unknown as Record<string, unknown>)) {
          if (v instanceof THREE.Texture && !seen.has(v.source)) {
            seen.add(v.source)
            const img = v.image as { width?: number; height?: number } | undefined
            if (img?.width && img?.height) {
              bytes += gpuBytes(v)
              names.push(`${img.width}x${img.height}${(v as THREE.CompressedTexture).isCompressedTexture ? 'c' : ''}`)
            }
          }
        }
        const u = (m as THREE.ShaderMaterial).uniforms
        if (u) for (const x of Object.values(u)) {
          const v = (x as { value: unknown }).value
          if (v instanceof THREE.Texture && !seen.has(v.source)) {
            seen.add(v.source)
            const img = v.image as { width?: number; height?: number } | undefined
            if (img?.width && img?.height) {
              bytes += gpuBytes(v)
              names.push(`${img.width}x${img.height}${(v as THREE.CompressedTexture).isCompressedTexture ? 'c' : ''}`)
            }
          }
        }
      }
    })
    const r = gl.info.render
    const m = gl.info.memory
    const size = gl.getSize(new THREE.Vector2())
    const q = useAppStore.getState().quality
    console.log(`[perf] q=${q} fps≈${frames.current} calls=${r.calls} tris=${r.triangles} points=${r.points} programs=${gl.info.programs?.length ?? 0} geoms=${m.geometries} textures=${m.textures} texMB≈${(bytes / 1048576).toFixed(0)} (${names.sort().join(',')}) buffer=${size.x}x${size.y}@${gl.getPixelRatio()} shadows=${gl.shadowMap.enabled} logdepth=${gl.capabilities.logarithmicDepthBuffer}`)
    frames.current = 0
    last.current = now
  })
  return null
}
