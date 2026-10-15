/**
 * A scene built ahead of its cut (Scene.tsx: Prewarm) renders into a scene of its own that is never
 * drawn, only compiled: inside it `useWarm()` is true and the scene must stay inert — no camera
 * moves that matter, no shared state written (earthState, the store), no DOM labels.
 */
import { createContext, useContext } from 'react'
import type * as THREE from 'three'

export const Warm = createContext(false)

export function useWarm(): boolean {
  return useContext(Warm)
}

/**
 * The canvas's own environment map (Scene.tsx), captured when it is made: the views that have no
 * environment of their own reflect it, and so must their copies built ahead (the view on screen
 * may have put its own in the canvas's scene meanwhile).
 */
export const globalEnv: { texture: THREE.Texture | null } = { texture: null }

/**
 * Textures shared by more than one live scene (a warm copy and the real one load the same maps
 * from the loader's cache): freed only when the last user lets go.
 */
const users = new Map<object, number>()

export function retainTextures(list: { dispose(): void }[]): () => void {
  for (const t of list) users.set(t, (users.get(t) ?? 0) + 1)
  return () => {
    for (const t of list) {
      const n = (users.get(t) ?? 1) - 1
      if (n > 0) users.set(t, n)
      else {
        users.delete(t)
        t.dispose()
      }
    }
  }
}
