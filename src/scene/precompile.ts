/**
 * Shader programs built before they are drawn, a little at a time.
 *
 * A material's program is keyed by the lights of the scene it is drawn in (their number and kind,
 * whether they cast shadows), the scene's fog and environment, and the object it sits on — so
 * each view needs its own programs, even for the ship's materials that every view shares, and
 * the first frame of a view used to compile all of them at once: a stall at every cut, seconds on
 * a phone. A Precompiler walks a scene, queues what has not been built for the scene's present
 * lights (hidden objects too: the flames, the tanker, the dust, the debris), and builds a few
 * programs a frame against a stand-in of those lights (`rig`: the same kinds and shadows, the same
 * fog and environment, nothing to traverse), then — once the driver reports each program linked —
 * does its first-use work (the link check and the uniform tables) and uploads the maps, all within
 * a per-frame budget, so the frame the view needs them finds them ready.
 */
import * as THREE from 'three'
import { gpuBytes } from './maps'

type Renderable = THREE.Mesh | THREE.Points | THREE.Line | THREE.Sprite

const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1'
type Program = { isReady(): boolean; getUniforms(): unknown; getAttributes(): unknown }

function isRenderable(o: THREE.Object3D): o is Renderable {
  const r = o as Renderable & { isMesh?: boolean; isPoints?: boolean; isLine?: boolean; isSprite?: boolean }
  return !!(r.isMesh || r.isPoints || r.isLine || r.isSprite)
}

/** a light's kind as the program key sees it; '' for a kind the stand-ins cannot mirror */
function lightKind(l: THREE.Light): string {
  const x = l as THREE.Light & Record<string, unknown>
  const shadow = l.castShadow ? '+s' : ''
  if (x.isSunLight || x.isRectAreaLight) return ''
  if (x.isAmbientLight) return 'amb'
  if (x.isLightProbe) return 'probe'
  if (x.isDirectionalLight) return 'dir' + shadow
  if (x.isSpotLight) return x.map ? '' : 'spot' + shadow
  if (x.isPointLight) return 'point' + shadow
  if (x.isHemisphereLight) return 'hemi'
  return ''
}

function standIn(kind: string): THREE.Light {
  const [k, s] = kind.split('+')
  const l: THREE.Light =
    k === 'amb' ? new THREE.AmbientLight() : k === 'probe' ? new THREE.LightProbe() : k === 'dir' ? new THREE.DirectionalLight() : k === 'spot' ? new THREE.SpotLight() : k === 'point' ? new THREE.PointLight() : new THREE.HemisphereLight()
  l.castShadow = s === 's'
  return l
}

function hasLight(o: THREE.Object3D): boolean {
  let found = false
  o.traverse((c) => {
    if ((c as THREE.Light).isLight) found = true
  })
  return found
}

/**
 * What an object was built with: another material (a swap, like the glowing bells) builds again.
 * Not the material's version: three bumps it twice on every draw of a transparent double-sided
 * material (it draws the back faces, then the front).
 */
function stamp(m: THREE.Material | THREE.Material[]): string {
  return Array.isArray(m) ? m.map((x) => x.uuid).join(',') : m.uuid
}

/** the kinds of the lights `scene` draws with, as a signature (it changes when the programs must) */
export function lightSignature(scene: THREE.Object3D): string {
  const kinds: string[] = []
  scene.traverseVisible((o) => {
    if ((o as THREE.Light).isLight) kinds.push(lightKind(o as THREE.Light) || (o as THREE.Light).type)
  })
  return kinds.sort().join(',')
}

const NOTHING = new THREE.Object3D()

/**
 * Sets up the lights of `scene`'s render state now. A render draws the shadow maps before it sets
 * its lights up, and the depth shaders of the shadow pass are keyed by those lights — so the first
 * frame of a view used the lights of the view before (and a scene's first render, none): a set of
 * depth shaders compiled for nothing, then again. A compile of nothing against the scene only
 * gathers its lights.
 */
export function primeLights(gl: THREE.WebGLRenderer, camera: THREE.Camera, scene: THREE.Scene): void {
  gl.compile(NOTHING, camera, scene)
}

/**
 * Stand-in shadow casters for a prerender: the shadow pass draws every caster with one shared depth
 * material and builds its shader only when it switches between an instanced mesh and a plain one,
 * keyed by whether the caster in hand has a map — so which variants a view needs depends on the
 * order it draws its casters in. These four (just behind the camera, so that only the shadow pass
 * draws them) switch through every combination.
 */
let standInCasters: THREE.Object3D[] | null = null
function shadowCasters(): THREE.Object3D[] {
  if (!standInCasters) {
    const geo = new THREE.BoxGeometry(0.01, 0.01, 0.01)
    const dot = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1)
    dot.needsUpdate = true
    const plain = new THREE.MeshBasicMaterial()
    const mapped = new THREE.MeshBasicMaterial({ map: dot })
    standInCasters = ([
      [true, plain],
      [false, mapped],
      [true, mapped],
      [false, plain],
    ] as const).map(([instanced, mat]) => {
      const m = instanced ? new THREE.InstancedMesh(geo, mat, 1) : new THREE.Mesh(geo, mat)
      m.castShadow = true
      m.position.set(0, 0, 2)
      return m
    })
  }
  return standInCasters
}

/** the budget left in this frame, shared by every Precompiler stepped in it */
export interface Budget {
  /** performance.now() past which nothing more starts */
  until: number
  /** new programs to start compiling */
  programs: number
  /** linked programs to take through their first use */
  finish: number
  /** bytes of maps to upload (one map is always allowed) */
  bytes: number
}

export class Precompiler {
  /** the stand-in lights, fog and environment: a compile against it traverses nothing big */
  private readonly rig = new THREE.Scene()
  private sig: string | null = null
  /** a light the stand-ins cannot mirror: compile against the scene itself */
  private direct = false
  private built = new WeakMap<THREE.Object3D, string>()
  private readonly queue: Renderable[] = []
  private readonly queued = new Set<THREE.Object3D>()
  /** objects with lights inside them: built with one compile of the whole scene */
  private whole = false
  private readonly maps: THREE.Texture[] = []
  private readonly mapsSeen = new WeakSet<THREE.Texture>()
  private readonly linking: Program[] = []
  /** scans in a row that found nothing new */
  quiet = 0
  /** objects built so far */
  count = 0
  /** `count` when the scene was last drawn (prerender) */
  private drawn = 0

  constructor(readonly scene: THREE.Scene) {}

  /** for ?debug=1 */
  stats(): string {
    return `queued ${this.queue.length}${this.whole ? '+whole' : ''}, built ${this.count}, linking ${this.linking.length}, maps ${this.maps.length}, lights ${this.sig}${this.direct ? ' (direct)' : ''}`
  }

  get idle(): boolean {
    return this.queue.length === 0 && !this.whole && this.maps.length === 0 && this.linking.length === 0
  }

  /** queue what is new: everything again when the lights changed */
  scan(): void {
    const kinds: string[] = []
    this.scene.traverseVisible((o) => {
      if ((o as THREE.Light).isLight) kinds.push(lightKind(o as THREE.Light))
    })
    kinds.sort()
    const sig = kinds.join(',')
    if (sig !== this.sig) {
      if (DEBUG && this.sig !== null) console.log(`[warm] ${this.scene.name || 'main'}: lights ${this.sig} → ${sig}`)
      this.sig = sig
      this.built = new WeakMap()
      this.direct = kinds.includes('')
      this.rig.clear()
      if (!this.direct) for (const k of kinds) this.rig.add(standIn(k))
    }
    this.rig.fog = this.scene.fog
    this.rig.environment = this.scene.environment
    let found = 0
    this.scene.traverse((o) => {
      // (the meshes merged away are never drawn: their materials are the merged mesh's)
      if (!isRenderable(o) || !o.material || o.userData.mergedAway || this.queued.has(o)) return
      if (this.built.get(o) === stamp(o.material)) return
      found++
      if (DEBUG && this.built.has(o) && found < 4) console.log(`[warm] ${this.scene.name || 'main'}: again ${o.type} ${o.name} ${(o.material as THREE.Material).type} ${this.built.get(o)} → ${stamp(o.material)}`)
      if (o.children.length && hasLight(o)) {
        this.whole = true
        this.built.set(o, stamp(o.material))
        return
      }
      this.queued.add(o)
      this.queue.push(o)
    })
    this.quiet = found ? 0 : this.quiet + 1
  }

  /** a slice of the work, within the frame's budget */
  step(gl: THREE.WebGLRenderer, camera: THREE.Camera, b: Budget): void {
    // a render target bound (an environment being captured): the programs would be keyed for it
    if (gl.getRenderTarget() !== null) return
    const programs = gl.info.programs as unknown as Program[] | null
    // linked programs: their first use now, not in the frame that draws them
    for (let i = 0; i < this.linking.length && b.finish > 0 && performance.now() < b.until; ) {
      const p = this.linking[i]
      // released meanwhile (its materials gone): nothing to do
      if (programs && !programs.includes(p)) {
        this.linking.splice(i, 1)
        continue
      }
      if (!p.isReady()) {
        i++
        continue
      }
      p.getUniforms()
      p.getAttributes()
      this.linking.splice(i, 1)
      b.finish--
    }
    const before = programs && (this.queue.length || this.whole) ? new Set(programs) : null
    const target = this.direct ? this.scene : this.rig
    while (this.queue.length && b.programs > 0 && performance.now() < b.until) {
      const o = this.queue.shift()!
      this.queued.delete(o)
      if (!attached(o, this.scene) || !o.material) continue
      const n = programs?.length ?? 0
      gl.compile(o, camera, target)
      this.built.set(o, stamp(o.material))
      this.count++
      if (programs && programs.length > n) b.programs -= programs.length - n
      this.collectMaps(gl, o.material)
    }
    if (this.whole && !this.queue.length && b.programs > 0 && performance.now() < b.until) {
      this.whole = false
      gl.compile(this.scene, camera)
      b.programs--
    }
    if (programs && before) for (const p of programs) if (!before.has(p)) this.linking.push(p)
    // the maps: uploaded now rather than by the first frame that draws them
    let first = true
    while (this.maps.length && performance.now() < b.until && (first || b.bytes > 0)) {
      const t = this.maps.shift()!
      const props = gl.properties.get(t) as { __version?: number }
      if (t.version === 0 || props.__version === t.version) continue
      gl.initTexture(t)
      b.bytes -= gpuBytes(t)
      first = false
    }
  }

  /** built since the scene was last drawn */
  get undrawn(): boolean {
    return this.count !== this.drawn
  }

  /**
   * One draw of the whole scene — its hidden parts too, but no hidden lights (that would change
   * the programs) and not the meshes merged away — into a single pixel of the canvas, before the
   * frame that paints over it: what a first draw does beyond compiling (the driver's pipeline
   * state for each program and blend mode, the buffers and maps going up) happens now too.
   */
  prerender(gl: THREE.WebGLRenderer, camera: THREE.Camera): void {
    if (gl.getRenderTarget() !== null) return
    this.drawn = this.count
    const shown: THREE.Object3D[] = []
    const culled: THREE.Object3D[] = []
    let shadows = false
    this.scene.traverse((o) => {
      if (!o.visible && !o.userData.mergedAway && !hasLight(o)) {
        o.visible = true
        shown.push(o)
      }
      if (o.frustumCulled) {
        o.frustumCulled = false
        culled.push(o)
      }
      if ((o as THREE.Light).isLight && o.castShadow) shadows = true
    })
    // a copy built ahead (its camera at the origin looking down −z): every depth shader variant too
    const extra = shadows && camera.position.lengthSq() === 0 ? shadowCasters() : []
    for (const c of extra) this.scene.add(c)
    const box = gl.getScissor(new THREE.Vector4())
    const test = gl.getScissorTest()
    gl.setScissorTest(true)
    gl.setScissor(0, 0, 1, 1)
    primeLights(gl, camera, this.scene)
    gl.render(this.scene, camera)
    gl.setScissor(box)
    gl.setScissorTest(test)
    for (const c of extra) this.scene.remove(c)
    for (const o of shown) o.visible = false
    for (const o of culled) o.frustumCulled = true
  }

  /** every map a material's program reads (its uniforms, after the compile: patched ones too) */
  private collectMaps(gl: THREE.WebGLRenderer, m: THREE.Material | THREE.Material[]): void {
    for (const x of Array.isArray(m) ? m : [m]) {
      const u = (gl.properties.get(x) as { uniforms?: Record<string, { value: unknown }> }).uniforms
      if (!u) continue
      for (const k in u) {
        const v = u[k]?.value
        const list = Array.isArray(v) ? v : [v]
        for (const t of list) {
          const tex = t as THREE.Texture | null
          if (!tex || !tex.isTexture || this.mapsSeen.has(tex) || (tex as THREE.Texture & { isRenderTargetTexture?: boolean }).isRenderTargetTexture) continue
          this.mapsSeen.add(tex)
          this.maps.push(tex)
        }
      }
    }
  }
}

function attached(o: THREE.Object3D, root: THREE.Object3D): boolean {
  let p: THREE.Object3D | null = o
  while (p) {
    if (p === root) return true
    p = p.parent
  }
  return false
}
