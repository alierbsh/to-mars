/**
 * Procedural rocket primitives. All parts are built along +Y with their base at y = 0 unless noted.
 * Dimensions in metres (1 unit = 1 m).
 */
import { useMemo } from 'react'
import * as THREE from 'three'

// ---------- materials ----------
export const MAT = {
  stainless: new THREE.MeshStandardMaterial({ color: '#c9ccd0', metalness: 0.85, roughness: 0.42 }),
  stainlessDark: new THREE.MeshStandardMaterial({ color: '#9ea2a7', metalness: 0.85, roughness: 0.5 }),
  heatTint: new THREE.MeshStandardMaterial({ color: '#8a8078', metalness: 0.8, roughness: 0.5 }),
  tiles: new THREE.MeshStandardMaterial({ color: '#2a2b2f', metalness: 0.05, roughness: 0.92 }),
  white: new THREE.MeshStandardMaterial({ color: '#f1f2f3', metalness: 0.05, roughness: 0.55 }),
  offwhite: new THREE.MeshStandardMaterial({ color: '#e6e7e5', metalness: 0.05, roughness: 0.6 }),
  black: new THREE.MeshStandardMaterial({ color: '#141516', metalness: 0.2, roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: '#2b2e33', metalness: 0.4, roughness: 0.6 }),
  foam: new THREE.MeshStandardMaterial({ color: '#d4822f', metalness: 0.0, roughness: 0.85 }),
  foamDark: new THREE.MeshStandardMaterial({ color: '#b86a24', metalness: 0.0, roughness: 0.85 }),
  bell: new THREE.MeshStandardMaterial({ color: '#4a4c50', metalness: 0.7, roughness: 0.45, side: THREE.DoubleSide }),
  bellHot: new THREE.MeshStandardMaterial({ color: '#6b5a4a', metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }),
  /** a bell at full power: the regen-cooled wall glowing orange, brightest at the throat */
  bellGlow: new THREE.MeshStandardMaterial({ color: '#5a4034', emissive: '#ff6a1a', emissiveIntensity: 1.6, metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide }),
  glass: new THREE.MeshStandardMaterial({ color: '#0d1a2b', metalness: 0.4, roughness: 0.15 }),
  titanium: new THREE.MeshStandardMaterial({ color: '#5a5450', metalness: 0.8, roughness: 0.45 }),
  carbon: new THREE.MeshStandardMaterial({ color: '#1d1f23', metalness: 0.3, roughness: 0.5 }),
  blue: new THREE.MeshStandardMaterial({ color: '#1546c2', metalness: 0.1, roughness: 0.6 }),
  cascBlue: new THREE.MeshStandardMaterial({ color: '#1e4ea1', metalness: 0.1, roughness: 0.6 }),
  red: new THREE.MeshStandardMaterial({ color: '#c7281e', metalness: 0.1, roughness: 0.6 }),
  gold: new THREE.MeshStandardMaterial({ color: '#c9a24a', metalness: 0.6, roughness: 0.4 }),
  silver: new THREE.MeshStandardMaterial({ color: '#b8bcc2', metalness: 0.9, roughness: 0.3 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#4a4d50', metalness: 0, roughness: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: '#3a3d42', metalness: 0.6, roughness: 0.6 }),
}

type Mat = THREE.Material

interface TubeProps {
  r: number
  h: number
  y?: number
  rTop?: number
  material?: Mat
  segments?: number
  open?: boolean
  thetaStart?: number
  thetaLength?: number
  x?: number
  z?: number
}

/** Cylinder / frustum with its base at y. */
export function Tube({ r, h, y = 0, rTop, material = MAT.white, segments = 64, open = false, thetaStart = 0, thetaLength = Math.PI * 2, x = 0, z = 0 }: TubeProps) {
  return (
    <mesh position={[x, y + h / 2, z]} material={material} castShadow receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, segments, 1, open, thetaStart, thetaLength]} />
    </mesh>
  )
}

/** Thin ring line on a cylinder surface (weld seam / band). */
export function Band({ r, y, h = 0.08, material = MAT.stainlessDark, segments = 64, x = 0, z = 0 }: { r: number; y: number; h?: number; material?: Mat; segments?: number; x?: number; z?: number }) {
  return (
    <mesh position={[x, y, z]} material={material}>
      <cylinderGeometry args={[r + 0.012, r + 0.012, h, segments, 1, true]} />
    </mesh>
  )
}

function tangentOgivePoints(r: number, L: number, n = 28): THREE.Vector2[] {
  // tangent ogive: radius(y) = sqrt(rho² − y²) + r − rho, y measured from the base (y = 0 → r, y = L → 0)
  const rho = (r * r + L * L) / (2 * r)
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const y = t * L
    const x = Math.sqrt(Math.max(rho * rho - y * y, 0)) + r - rho
    pts.push(new THREE.Vector2(Math.max(x, 0.001), y))
  }
  pts[pts.length - 1] = new THREE.Vector2(0.001, L)
  return pts
}

/** Tangent-ogive nose cone of base radius r and length L, base at y. */
export function Ogive({ r, L, y = 0, material = MAT.white, segments = 64, x = 0, z = 0 }: { r: number; L: number; y?: number; material?: Mat; segments?: number; x?: number; z?: number }) {
  const geom = useMemo(() => new THREE.LatheGeometry(tangentOgivePoints(r, L), segments), [r, L, segments])
  return <mesh position={[x, y, z]} geometry={geom} material={material} castShadow />
}

/** Half (or partial) ogive shell — used for the tiled side of Starship's nose. */
export function OgiveShell({ r, L, y = 0, material = MAT.tiles, thetaStart = 0, thetaLength = Math.PI, segments = 48, scale = 1.012 }: { r: number; L: number; y?: number; material?: Mat; thetaStart?: number; thetaLength?: number; segments?: number; scale?: number }) {
  const geom = useMemo(() => new THREE.LatheGeometry(tangentOgivePoints(r * scale, L * 1.001), segments, thetaStart, thetaLength), [r, L, segments, thetaStart, thetaLength, scale])
  return <mesh position={[0, y, 0]} geometry={geom} material={material} />
}

/** Full-revolution cap for the top `tipLength` metres of an ogive (e.g. Starship's black nose tip). */
export function OgiveTip({ r, L, y = 0, tipLength = 2, material = MAT.tiles, segments = 48, scale = 1.015 }: { r: number; L: number; y?: number; tipLength?: number; material?: Mat; segments?: number; scale?: number }) {
  const geom = useMemo(() => {
    const pts = tangentOgivePoints(r * scale, L * 1.001, 40).filter((p) => p.y >= L - tipLength)
    return new THREE.LatheGeometry(pts, segments)
  }, [r, L, tipLength, segments, scale])
  return <mesh position={[0, y, 0]} geometry={geom} material={material} />
}

/** Rocket engine bell: throat radius rt, exit radius re, height h; sits with its exit plane at y - h (hanging below y). */
export function Bell({ rt, re, h, y = 0, x = 0, z = 0, material = MAT.bell, segments = 32 }: { rt: number; re: number; h: number; y?: number; x?: number; z?: number; material?: Mat; segments?: number }) {
  const geom = useMemo(() => {
    const pts: THREE.Vector2[] = []
    const n = 14
    for (let i = 0; i <= n; i++) {
      const t = i / n // 0 at exit (bottom) → 1 at throat (top)
      const rad = re - (re - rt) * Math.pow(t, 0.55)
      pts.push(new THREE.Vector2(rad, t * h))
    }
    // throat lip + small combustion chamber bulge
    pts.push(new THREE.Vector2(rt * 1.25, h + rt * 0.5))
    pts.push(new THREE.Vector2(rt * 1.25, h + rt * 1.3))
    pts.push(new THREE.Vector2(0.001, h + rt * 1.3))
    return new THREE.LatheGeometry(pts, segments)
  }, [rt, re, h, segments])
  return <mesh position={[x, y - h, z]} geometry={geom} material={material} castShadow />
}

/** Flat fin/flap from a 2-D outline (x = span outward, y = up), extruded by thickness; placed at radius r on the body at angle a (rad). */
export function Fin({ outline, thickness = 0.25, r, a, y, material = MAT.stainless, tilt = 0, proud = 0 }: { outline: Array<[number, number]>; thickness?: number; r: number; a: number; y: number; material?: Mat; tilt?: number; proud?: number }) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape()
    outline.forEach(([px, py], i) => (i === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py)))
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false })
    g.translate(0, 0, -thickness / 2 + proud)
    return g
  }, [outline, thickness, proud])
  return (
    <group rotation={[0, a, 0]} position={[0, y, 0]}>
      <group position={[r, 0, 0]} rotation={[0, 0, tilt]}>
        <mesh geometry={geom} material={material} castShadow />
      </group>
    </group>
  )
}

/** Strake / chine: thin wedge running up the body. */
export function Chine({ r, a, y, h, w = 0.9, material = MAT.stainless }: { r: number; a: number; y: number; h: number; w?: number; material?: Mat }) {
  const geom = useMemo(() => {
    // wedge: wide at the body, thin at the outer edge, tapered at both ends
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(w, h * 0.08)
    shape.lineTo(w, h * 0.92)
    shape.lineTo(0, h)
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.25, bevelSegments: 2 })
    g.translate(0, 0, -0.35)
    return g
  }, [w, h])
  return (
    <group rotation={[0, a, 0]} position={[0, y, 0]}>
      <mesh position={[r - 0.25, 0, 0]} geometry={geom} material={material} castShadow />
    </group>
  )
}

let latticeTex: THREE.CanvasTexture | null = null
function getLattice(): THREE.CanvasTexture {
  if (latticeTex) return latticeTex
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, 128, 128)
  ctx.strokeStyle = '#b9bcc0'
  ctx.lineWidth = 7
  for (let i = 0; i <= 128; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke()
  }
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(128, 128); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(0, 128); ctx.stroke()
  latticeTex = new THREE.CanvasTexture(c)
  latticeTex.wrapS = latticeTex.wrapT = THREE.RepeatWrapping
  return latticeTex
}

/** Grid fin: lattice plate of width w (along the body) and height hh (outward), mounted at radius r, angle a, height y. */
export function GridFin({ r, a, y, w, hh, repeat = [3, 2] }: { r: number; a: number; y: number; w: number; hh: number; repeat?: [number, number] }) {
  const mat = useMemo(() => {
    const t = getLattice().clone()
    t.needsUpdate = true
    t.repeat.set(repeat[0], repeat[1])
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, color: '#d0d3d6', metalness: 0.7, roughness: 0.5, side: THREE.DoubleSide })
  }, [repeat])
  return (
    <group rotation={[0, a, 0]} position={[0, y, 0]}>
      <mesh position={[r + hh / 2, 0, 0]} material={mat}>
        <boxGeometry args={[hh, 0.18, w]} />
      </mesh>
    </group>
  )
}

/** Simple capsule (truncated cone with a rounded top), base at y. */
export function Capsule({ rBase, rTop, h, y = 0, material = MAT.white, heatShield = MAT.dark }: { rBase: number; rTop: number; h: number; y?: number; material?: Mat; heatShield?: Mat }) {
  return (
    <group position={[0, y, 0]}>
      <mesh position={[0, h / 2, 0]} material={material} castShadow>
        <cylinderGeometry args={[rTop, rBase, h, 48]} />
      </mesh>
      <mesh position={[0, h, 0]} material={material}>
        <sphereGeometry args={[rTop, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={heatShield}>
        <cylinderGeometry args={[rBase * 1.01, rBase * 0.96, 0.25, 48]} />
      </mesh>
    </group>
  )
}

/** Procedural hexagonal tile texture for Starship's heat shield: dark grey tiles, a lighter grout line, per-tile variation, the odd fresh replacement tile. */
let hexTex: THREE.CanvasTexture | null = null
export function getHexTiles(): THREE.CanvasTexture {
  if (hexTex) return hexTex
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#35363a'
  ctx.fillRect(0, 0, 512, 512)
  const s = 14 // hex radius px
  const w = Math.sqrt(3) * s
  const hh = 1.5 * s
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let row = -1; row < 512 / hh + 1; row++) {
    for (let col = -1; col < 512 / w + 1; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0)
      const cy = row * hh
      const fresh = rnd() > 0.985
      const shade = fresh ? 88 : 40 + Math.floor(rnd() * 14)
      ctx.fillStyle = `rgb(${shade},${shade + 1},${shade + 3})`
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const ang = (Math.PI / 3) * k + Math.PI / 6
        const px = cx + (s - 0.9) * Math.cos(ang)
        const py = cy + (s - 0.9) * Math.sin(ang)
        if (k === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
      // a faint highlight on the upper edge of each tile
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
  hexTex = new THREE.CanvasTexture(c)
  hexTex.wrapS = hexTex.wrapT = THREE.RepeatWrapping
  hexTex.colorSpace = THREE.SRGBColorSpace
  hexTex.anisotropy = 8
  return hexTex
}

/**
 * Starship's stainless skin: rolled rings with slightly different sheens, dark weld seams between
 * them, one vertical weld per ring at a different clock angle, fine vertical brushing. One texture
 * holds `rings` rings top to bottom; set repeat.y = height / (rings × ringHeight).
 */
let ringTex: { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } | null = null
export const RING_TEX_RINGS = 40
export function getRingSkin(): { map: THREE.CanvasTexture; rough: THREE.CanvasTexture } {
  if (ringTex) return ringTex
  const w = 512
  const h = 2048
  const ringPx = h / RING_TEX_RINGS
  const mk = () => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    return c
  }
  const cm = mk()
  const cr = mk()
  const ctx = cm.getContext('2d')!
  const rtx = cr.getContext('2d')!
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < RING_TEX_RINGS; i++) {
    const y0 = i * ringPx
    // ring tint: most bright, some darker or warmer (different sheet batches)
    const b = 0.86 + rnd() * 0.14
    const warm = rnd() < 0.25 ? 6 : 0
    const cool = rnd() < 0.2 ? 6 : 0
    const r = Math.round(200 * b + warm)
    const g = Math.round(203 * b)
    const bl = Math.round(208 * b + cool)
    ctx.fillStyle = `rgb(${r},${g},${bl})`
    ctx.fillRect(0, y0, w, ringPx)
    const rough = 0.3 + (1 - b) * 1.6 + rnd() * 0.08
    const rv = Math.round(rough * 255)
    rtx.fillStyle = `rgb(${rv},${rv},${rv})`
    rtx.fillRect(0, y0, w, ringPx)
    // the circumferential weld seam
    ctx.fillStyle = 'rgba(60,62,66,0.9)'
    ctx.fillRect(0, y0, w, 2)
    rtx.fillStyle = '#b4b4b4'
    rtx.fillRect(0, y0, w, 2)
    // one vertical weld per ring
    const vx = Math.floor(rnd() * w)
    ctx.fillStyle = 'rgba(90,92,96,0.8)'
    ctx.fillRect(vx, y0, 2, ringPx)
    rtx.fillStyle = '#a0a0a0'
    rtx.fillRect(vx, y0, 2, ringPx)
  }
  // fine brushing: vertical streaks
  const img = ctx.getImageData(0, 0, w, h)
  for (let x = 0; x < w; x++) {
    const k = 1 + (rnd() - 0.5) * 0.08
    for (let y = 0; y < h; y++) {
      const p = (y * w + x) * 4
      img.data[p] = Math.min(255, img.data[p] * k)
      img.data[p + 1] = Math.min(255, img.data[p + 1] * k)
      img.data[p + 2] = Math.min(255, img.data[p + 2] * k)
    }
  }
  ctx.putImageData(img, 0, 0)
  const map = new THREE.CanvasTexture(cm)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8
  const roughT = new THREE.CanvasTexture(cr)
  roughT.wrapS = roughT.wrapT = THREE.RepeatWrapping
  ringTex = { map, rough: roughT }
  return ringTex
}

/** a stainless material wearing the ring skin over `height` metres of `ringHeight` rings */
export function ringSkinMaterial(height: number, ringHeight: number, opts: { color?: string; metalness?: number } = {}): THREE.MeshStandardMaterial {
  const { map, rough } = getRingSkin()
  const m = map.clone()
  const r = rough.clone()
  const rep = height / (RING_TEX_RINGS * ringHeight)
  m.repeat.set(1, rep)
  r.repeat.set(1, rep)
  m.needsUpdate = true
  r.needsUpdate = true
  return new THREE.MeshStandardMaterial({ map: m, roughnessMap: r, color: opts.color ?? '#ffffff', metalness: opts.metalness ?? 0.9, roughness: 1 })
}

/** Curved decal: text drawn on a canvas, wrapped onto a cylinder segment at radius r, angle a, height y. */
export function Decal({ text, r, a, y, w, h, color = '#111', bg = 'transparent', font = 'bold 60px Helvetica, Arial, sans-serif', rotate = 0 }: { text: string; r: number; a: number; y: number; w: number; h: number; color?: string; bg?: string; font?: string; rotate?: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    const vertical = Math.abs(rotate) > 0.1
    c.width = vertical ? Math.max(64, Math.round((512 * h) / w)) : 512
    c.height = vertical ? 512 : Math.max(64, Math.round((512 * h) / w))
    const ctx = c.getContext('2d')!
    if (bg !== 'transparent') {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, c.width, c.height)
    }
    ctx.fillStyle = color
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // shrink the font until the text fits the available length
    const avail = (vertical ? c.height : c.width) * 0.92
    let size = Number((font.match(/(\d+)px/) ?? [0, 60])[1])
    for (let i = 0; i < 12 && ctx.measureText(text).width > avail; i++) {
      size *= Math.max(0.5, avail / ctx.measureText(text).width)
      ctx.font = font.replace(/\d+px/, `${Math.floor(size)}px`)
    }
    ctx.save()
    ctx.translate(c.width / 2, c.height / 2)
    if (vertical) ctx.rotate(rotate > 0 ? -Math.PI / 2 : Math.PI / 2)
    ctx.fillText(text, 0, 0)
    ctx.restore()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [text, w, h, color, bg, font, rotate])
  // width along the circumference / height along the body
  const cw = Math.abs(rotate) > 0.1 ? h : w
  const chh = Math.abs(rotate) > 0.1 ? w : h
  const theta = Math.min(cw / r, Math.PI * 1.5)
  return (
    <mesh position={[0, y, 0]} rotation={[0, a - Math.PI / 2 - theta / 2 + Math.PI / 2, 0]}>
      <cylinderGeometry args={[r + 0.025, r + 0.025, chh, 32, 1, true, 0, theta]} />
      <meshStandardMaterial map={tex} transparent roughness={0.7} metalness={0} side={THREE.FrontSide} />
    </mesh>
  )
}

/** Solid-colour curved patch (for flags, logos). */
function Patch({ r, a, y, w, h, color, offset = 0, dz = 0 }: { r: number; a: number; y: number; w: number; h: number; color: string; offset?: number; dz?: number }) {
  const theta = w / r
  return (
    <mesh position={[0, y, 0]} rotation={[0, a - theta / 2 + dz / r + offset, 0]}>
      <cylinderGeometry args={[r + 0.03 + offset * 0, r + 0.03, h, 24, 1, true, 0, theta]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

/** Flag decals (USA / PRC) as curved colour patches. */
export function FlagUSA({ r, a, y, w = 1.6 }: { r: number; a: number; y: number; w?: number }) {
  const h = w * 0.53
  return (
    <group>
      <Patch r={r} a={a} y={y} w={w} h={h} color="#b8302a" />
      {[0.42, 0.14, -0.14, -0.42].map((f) => (
        <Patch key={f} r={r + 0.005} a={a} y={y + h * f} w={w} h={h * 0.09} color="#f2f2f2" />
      ))}
      <Patch r={r + 0.01} a={a} y={y + h * 0.25} w={w * 0.4} h={h * 0.5} color="#1f2d6b" dz={w * 0.3} />
    </group>
  )
}

export function FlagPRC({ r, a, y, w = 1.6 }: { r: number; a: number; y: number; w?: number }) {
  const h = w * 0.67
  return (
    <group>
      <Patch r={r} a={a} y={y} w={w} h={h} color="#de2910" />
      <Patch r={r + 0.005} a={a} y={y + h * 0.2} w={h * 0.3} h={h * 0.3} color="#ffde00" dz={w * 0.28} />
    </group>
  )
}
