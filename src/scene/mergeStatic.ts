/**
 * Draw-call merging for the procedural models. A model is hundreds of small meshes (33 engine bells,
 * weld bands, vents, struts) that never move relative to each other, and every mesh is a draw call:
 * the per-draw cost — three.js setting up the object, the driver validating the state — was most of
 * a frame's CPU time on a phone. This bakes the static meshes under each animated group into one
 * mesh per material, relative to that group, and hides the originals (React still owns them, so
 * they stay in the graph, frozen: no matrix updates). The merged meshes are children of the same
 * group, so staging offsets, visibility and material swaps (glowing bells, heating tiles) carry over.
 *
 * Not merged: transparent materials (their draw order matters), named objects and anything under a
 * named group listed in `keep` (parts animated by name: landing legs, frost), multi-material and
 * instanced meshes, and a material used by a single mesh (nothing to gain).
 */
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/** the model parts animated by name (EntryScene swings the legs out; VehicleRig fades the frost) */
export const ANIMATED_PARTS = ['frost', 'leg', 'legExt']

/** ?merge=0 keeps the meshes as built, to compare */
export const MERGE = typeof location === 'undefined' || new URLSearchParams(location.search).get('merge') !== '0'

interface Bucket {
  root: THREE.Object3D
  material: THREE.Material
  cast: boolean
  receive: boolean
  meshes: THREE.Mesh[]
}

/**
 * Merges the static meshes under `root`. With `byName` (the vehicles), groups named in `keep` (and
 * `plume:` anchors) are left alone and every other named group is a merge root of its own (it may
 * be moved as a whole); named meshes are skipped. Without it (the pads, whose names come from a
 * model file), names mean nothing: a group that moves is marked `userData.mergeRoot`. Returns a
 * function that undoes it (removes the merged meshes, shows the originals).
 */
export function mergeStatic(root: THREE.Object3D, { keep = [], byName = true }: { keep?: string[]; byName?: boolean } = {}): () => void {
  root.updateMatrixWorld(true)
  const buckets = new Map<string, Bucket>()
  root.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh || (m as THREE.SkinnedMesh).isSkinnedMesh) return
    if ((byName && m.name) || m.userData.merged || m.userData.noMerge || !m.visible) return
    const mat = m.material
    if (Array.isArray(mat) || mat.transparent) return
    const geo = m.geometry
    if (Object.keys(geo.morphAttributes).length) return
    // the nearest named (or marked) ancestor is the merge root; one listed in `keep` rules the mesh out
    let mergeRoot: THREE.Object3D = root
    for (let p = m.parent; p && p !== root; p = p.parent) {
      if (p.userData.mergeRoot) {
        mergeRoot = p
        break
      }
      if (!byName || !p.name) continue
      if (keep.includes(p.name) || p.name.startsWith('plume:')) return
      mergeRoot = p
      break
    }
    const sig = `${Object.keys(geo.attributes).sort().join(',')}|${geo.index ? 'i' : 'n'}`
    const key = `${mergeRoot.uuid}|${mat.uuid}|${m.castShadow}|${m.receiveShadow}|${sig}`
    let b = buckets.get(key)
    if (!b) buckets.set(key, (b = { root: mergeRoot, material: mat, cast: m.castShadow, receive: m.receiveShadow, meshes: [] }))
    b.meshes.push(m)
  })

  const added: THREE.Mesh[] = []
  const hidden: THREE.Mesh[] = []
  const inv = new THREE.Matrix4()
  const rel = new THREE.Matrix4()
  for (const b of buckets.values()) {
    if (b.meshes.length < 2) continue
    inv.copy(b.root.matrixWorld).invert()
    const parts = b.meshes.map((m) => {
      const g = m.geometry.clone()
      g.clearGroups()
      g.applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld))
      return g
    })
    const merged = mergeGeometries(parts, false)
    for (const g of parts) g.dispose()
    if (!merged) continue
    merged.computeBoundingSphere()
    const mesh = new THREE.Mesh(merged, b.material)
    mesh.castShadow = b.cast
    mesh.receiveShadow = b.receive
    mesh.userData.merged = true
    b.root.add(mesh)
    added.push(mesh)
    for (const m of b.meshes) {
      m.visible = false
      // frozen: no matrix work for a hidden mesh every frame
      m.matrixAutoUpdate = false
      m.matrixWorldAutoUpdate = false
      hidden.push(m)
    }
  }

  return () => {
    for (const mesh of added) {
      mesh.removeFromParent()
      mesh.geometry.dispose()
    }
    for (const m of hidden) {
      m.visible = true
      m.matrixAutoUpdate = true
      m.matrixWorldAutoUpdate = true
    }
  }
}
