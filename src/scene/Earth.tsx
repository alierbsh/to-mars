/**
 * Earth for the orbit scene (scene unit = 1 km, the planet at the origin), built to hold up in the
 * close shots of the dockings and the departure burn:
 *  - the globe: NASA Blue Marble (4k) with a roughness map for the sun's glint on the oceans, the
 *    city lights (NASA Black Marble; sodium orange, broken into districts close up) coming on
 *    across the night side, a ruddy band where the sun sets, the ground darkened under the clouds;
 *  - the real cloud cover (NASA Blue Marble clouds, 4k) on a shell 8 km up, its edges broken by
 *    noise close up so the 10 km texels do not read as blur;
 *  - over Florida, the Gulf and the Bahamas the ascent's 2000 km regional tile (0.5 km/px) and its
 *    cumulus deck, whose shadows fall on it — the dockings and the burn are shown over it;
 *  - the limb (each sight line's closest approach to the ground decides its glow, ruddy at the
 *    terminator, the airglow's green line at night), a faint blue veil over the disc, crisp stars that fade when the sunlit planet
 *    fills the frame (a camera exposed for the day side does not see them), the sun's glow and
 *    the Moon at its true angular size.
 * The planet's spin and the clouds' drift are cosmetic; OrbitScene sets them (`earthState`) so the
 * close shots happen over the regional tile in daylight.
 * Assets: public/assets/earth (the day and roughness maps from scripts/cape-assets.py region, the
 * clouds and lights from scripts/orbit-earth-assets.py) and public/assets/cape/region* (cape-assets.py region).
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { applyEdgeFade, globeQuaternion } from './EarthBelow'
import { texName } from './quality'
import { useMaps } from './maps'
import { capGeometry } from './terrain'
import { useQuality } from './useQuality'

export const EARTH_R = 6371
const BASE_URL = import.meta.env.BASE_URL
/** sun direction (unit) and distance of the glow sprite */
export const SUN_DIR = new THREE.Vector3(0.72, 0.3, 0.62).normalize()

/** the regional tile: the azimuthal-equidistant square about LC-39A that cape-assets.py paints */
export const REGION = { lat: 28.6083, lon: -80.6041, half: 1000, cloudHeight: 2.2 }
const CLOUD_SHELL = 8

/** set by OrbitScene every frame: the planet's rotation about its axis and the cloud shell's */
export const earthState = { spin: 0, clouds: 0 }

/** a point on the planet (Earth-fixed frame, unit length) — the frame the Blue Marble wraps */
export function earthFixed(latDeg: number, lonDeg: number): THREE.Vector3 {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  return new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon))
}

/** shared GLSL: the cloud cover curve (the map's grey level → opacity) */
const CLOUD_SHAPE = 'float cloudShape(float c) { return smoothstep(0.06, 0.62, c); }'

/** a ground material (the globe, the regional tile) given night lights, the clouds' shade, the dusk band */
function applyOrbitGround(material: THREE.MeshStandardMaterial, u: { night: { value: THREE.Texture | null }; clouds: { value: THREE.Texture | null }; cloudShift: { value: number } }, globeUvAttr: boolean): THREE.MeshStandardMaterial {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uNight: u.night, uCloudMap: u.clouds, uCloudShift: u.cloudShift, uSunDir: { value: SUN_DIR } })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWorldN;\nvarying vec2 vGlobeUv;${globeUvAttr ? '\nattribute vec2 globeUv;' : ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>\nvWorldN = normalize(mat3(modelMatrix) * objectNormal);\nvGlobeUv = ${globeUvAttr ? 'globeUv' : 'uv'};`)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D uNight; uniform sampler2D uCloudMap; uniform float uCloudShift; uniform vec3 uSunDir;
        varying vec3 vWorldN; varying vec2 vGlobeUv;
        ${CLOUD_SHAPE}
        float hash2(vec2 p) { p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
        float vnoise2(vec2 x) {
          vec2 i = floor(x); vec2 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
        }`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float cover = cloudShape(texture2D(uCloudMap, vec2(vGlobeUv.x - uCloudShift, vGlobeUv.y)).g);
        float sunDot = dot(normalize(vWorldN), uSunDir);
        // the ground under a cloud is in its shade; where the sun sets, the light comes reddened
        diffuseColor.rgb *= 1.0 - 0.35 * cover;
        float dusk = smoothstep(0.32, 0.0, sunDot) * smoothstep(-0.14, 0.02, sunDot);
        diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.7, 0.5), 0.8 * dusk);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          // the cities come on as the ground passes into the night, sodium orange, whiter where
          // they are brightest; cloud dims them
          float night = smoothstep(0.05, -0.14, sunDot);
          float li = texture2D(uNight, vGlobeUv).g;
          // a texel of the map is a whole town (~9 km): close up, break it into lit districts and
          // dark ones, each octave faded out before it gets finer than a pixel (it would sparkle)
          vec2 cell = vGlobeUv * vec2(16384.0, 8192.0);
          float fw = max(fwidth(cell.x), fwidth(cell.y));
          float k1 = 1.0 - smoothstep(0.3, 0.8, fw);
          float k2 = 1.0 - smoothstep(0.3, 0.8, fw * 3.3);
          float n = mix(0.5, vnoise2(cell), k1) * 0.62 + mix(0.5, vnoise2(cell * 3.3 + 17.0), k2) * 0.38;
          li *= 4.2 * pow(n, 2.2);
          vec3 tint = mix(vec3(1.0, 0.56, 0.22), vec3(1.0, 0.83, 0.6), smoothstep(0.3, 1.2, li));
          totalEmissiveRadiance += tint * li * 1.3 * night * (1.0 - 0.85 * cover);
        }`,
      )
  }
  material.customProgramCacheKey = () => `orbitground|${globeUvAttr}`
  return material
}

/**
 * The cloud shell: the cover shaped into opacity; close up, its edges broken by noise in the
 * shell's own space (two or three octaves by tier); thinned over the regional tile, whose deck is
 * sharper.
 */
function cloudMaterial(map: THREE.Texture, u: { region: { value: THREE.Vector3 } }, octaves: number): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ color: '#ffffff', alphaMap: map, transparent: true, depthWrite: false, roughness: 1, metalness: 0, envMapIntensity: 0.12 })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uRegion: u.region })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vShell; varying float vNear;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vShell = position;
        vNear = 1.0 - smoothstep(500.0, 2200.0, length(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz));`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uRegion; varying vec3 vShell; varying float vNear;
        ${CLOUD_SHAPE}
        float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float vnoise(vec3 x) {
          vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
                     mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
        }`,
      )
      .replace(
        '#include <alphamap_fragment>',
        `float cov = texture2D(alphaMap, vAlphaMapUv).g;
        if (vNear > 0.0) {
          // km-scale structure the 4k map cannot hold: lumps along the edges, holes in thin cover
          vec3 p = vShell / 14.0;
          float n = vnoise(p) * 0.6 + vnoise(p * 2.7) * 0.3${octaves > 2 ? ' + vnoise(p * 7.1) * 0.15' : ''};
          cov += (n - 0.5) * 0.42 * vNear * (1.0 - cov * 0.6);
        }
        float region = smoothstep(cos(950.0 / ${EARTH_R.toFixed(1)}), cos(700.0 / ${EARTH_R.toFixed(1)}), dot(normalize(vShell), uRegion));
        diffuseColor.a *= cloudShape(cov) * (1.0 - 0.82 * region);`,
      )
  }
  m.customProgramCacheKey = () => `orbitclouds|${octaves}`
  return m
}

function atmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: SUN_DIR.clone() }, color: { value: new THREE.Color('#4f8fe0') } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vNormal; varying vec3 vView; varying vec3 vWorldN;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldN = normalize(mat3(modelMatrix) * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 sunDir; uniform vec3 color; varying vec3 vNormal; varying vec3 vView; varying vec3 vWorldN;
      void main() {
        #include <logdepthbuf_fragment>
        // a faint blue veil over the disc, thickening toward the horizon
        float rim = 1.0 - abs(dot(vNormal, vView));
        float day = smoothstep(-0.3, 0.3, dot(vWorldN, sunDir));
        float glow = pow(rim, 1.6) * 0.22;
        gl_FragColor = vec4(color * glow * (0.12 + 0.88 * day), glow * (0.15 + 0.85 * day));
      }`,
  })
}

/**
 * The limb: for each sight line that misses the planet, the height of its closest approach to
 * the surface decides the glow — bright and pale where it grazes the ground, deep blue and
 * fading over a few scale heights above (the air thins exponentially), reddened where the
 * closest point lies near the terminator (sunset seen edge-on), dark in the planet's night but
 * for the airglow's thin green line. Drawn on the back faces of a shell 105 km up (scene unit
 * 1 km; the planet at the origin).
 */
function limbMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: SUN_DIR.clone() }, radius: { value: EARTH_R } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorld;
      void main() {
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 sunDir; uniform float radius; varying vec3 vWorld;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 d = normalize(vWorld - cameraPosition);
        float tc = max(0.0, -dot(cameraPosition, d));      // along the ray to its closest approach
        vec3 pc = cameraPosition + d * tc;
        float h = length(pc) - radius;                      // km above the ground there
        if (h < 0.0) discard;                               // the ray meets the planet
        float sd = dot(normalize(pc), sunDir);
        float day = smoothstep(-0.18, 0.22, sd);
        // two scale heights: a bright layer hugging the ground, a fainter blue above it
        float low = exp(-h / 7.0);
        float high = exp(-h / 22.0);
        vec3 col = vec3(0.78, 0.88, 1.0) * low * 1.1 + vec3(0.22, 0.45, 1.0) * high * 0.55;
        // at the terminator the light has crossed the whole atmosphere: orange under, violet over
        float dusk = smoothstep(0.24, 0.0, sd) * smoothstep(-0.2, -0.03, sd);
        col = mix(col, vec3(1.0, 0.46, 0.16) * low * 1.3 + vec3(0.42, 0.3, 0.8) * high * 0.45, dusk);
        col *= 0.04 + 0.96 * max(day, dusk);
        // the night limb's airglow: a thin green line ~94 km up (atomic oxygen, 557.7 nm), seen edge-on
        col += vec3(0.4, 0.95, 0.38) * exp(-pow((h - 94.0) / 5.0, 2.0)) * 0.1 * (1.0 - day);
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
}

function moonTexture(): THREE.CanvasTexture {
  const n = 256
  const c = document.createElement('canvas')
  c.width = n * 2
  c.height = n
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#9a9890'
  ctx.fillRect(0, 0, n * 2, n)
  let seed = 3
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 9; i++) {
    // maria: darker patches
    const x = rnd() * n * 2
    const y = n * 0.2 + rnd() * n * 0.5
    const r = 20 + rnd() * 50
    const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r)
    g.addColorStop(0, 'rgba(70,72,78,0.8)')
    g.addColorStop(1, 'rgba(70,72,78,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r)
  }
  for (let i = 0; i < 300; i++) {
    const x = rnd() * n * 2
    const y = rnd() * n
    const r = 1 + rnd() * 6
    ctx.fillStyle = `rgba(${60 + rnd() * 40},${60 + rnd() * 40},${65 + rnd() * 40},0.7)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(200,200,195,0.5)'
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

let glowCache: THREE.CanvasTexture | null = null
function sunGlowTexture(): THREE.CanvasTexture {
  if (glowCache) return glowCache
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.08, 'rgba(255,250,235,1)')
  g.addColorStop(0.2, 'rgba(255,230,190,0.55)')
  g.addColorStop(0.5, 'rgba(255,200,150,0.12)')
  g.addColorStop(1, 'rgba(255,180,120,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  glowCache = new THREE.CanvasTexture(c)
  return glowCache
}

/** stars as points (a texture sky turns into blocks at a telephoto field of view): a few bright, most faint, slightly tinted */
function starField(n: number, radius: number): { geo: THREE.BufferGeometry; mat: THREE.PointsMaterial } {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(1 - u * u)
    pos.set([r * Math.cos(a) * radius, u * radius, r * Math.sin(a) * radius], i * 3)
    const b = 0.2 + 0.8 * Math.pow(rnd(), 2.6)
    const warm = rnd()
    col.set([b * (0.85 + 0.15 * warm), b * (0.88 + 0.08 * warm), b * (1.0 - 0.12 * warm)], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  const mat = new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, toneMapped: false })
  return { geo, mat }
}

/** the regional tile's caps (ground and cumulus deck), with each vertex's place on the globe's map */
function regionCap(R: number, segments: number): THREE.BufferGeometry {
  const g = capGeometry(R, REGION.half, segments)
  const qInv = globeQuaternion(REGION.lat, REGION.lon).invert()
  const p = g.getAttribute('position') as THREE.BufferAttribute
  const uv = new Float32Array(p.count * 2)
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i) + R, p.getZ(i)).applyQuaternion(qInv).normalize()
    const lat = Math.asin(v.y)
    const lon = Math.atan2(-v.z, v.x)
    uv[i * 2] = (lon + Math.PI) / (2 * Math.PI)
    uv[i * 2 + 1] = 0.5 + lat / Math.PI
  }
  g.setAttribute('globeUv', new THREE.BufferAttribute(uv, 2))
  return g
}

export function Earth() {
  const q = useQuality()
  const textures = useMaps([
    `${BASE_URL}assets/earth/${texName('earth-day-4k.jpg', q.textures)}`,
    `${BASE_URL}assets/earth/${texName('earth-rough-4k.jpg', q.textures)}`,
    `${BASE_URL}assets/earth/${texName('earth-clouds-4k-alpha.jpg', q.textures)}`,
    `${BASE_URL}assets/earth/${texName('earth-night-4k.jpg', q.textures)}`,
    `${BASE_URL}assets/cape/${texName('region.jpg', q.textures)}`,
    `${BASE_URL}assets/cape/${texName('region-rough.jpg', q.textures)}`,
    `${BASE_URL}assets/cape/${texName('region-clouds.webp', q.textures)}`,
  ])
  const [day, rough, clouds, night, region, regionRough, regionClouds] = textures
  // free the GPU copies when the orbit is left (the images stay cached for the next mission)
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  useMemo(() => {
    for (const t of [day, night, region, regionClouds]) t.colorSpace = THREE.SRGBColorSpace
    day.anisotropy = 8
    region.anisotropy = q.anisotropy
    regionClouds.anisotropy = Math.min(8, q.anisotropy)
    clouds.anisotropy = 4
    clouds.wrapS = THREE.RepeatWrapping // the cloud shell drifts in longitude
    for (const t of [region, regionRough, regionClouds]) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
  }, [day, night, clouds, region, regionRough, regionClouds, q.anisotropy])

  const u = useMemo(() => ({ night: { value: night as THREE.Texture | null }, clouds: { value: clouds as THREE.Texture | null }, cloudShift: { value: 0 }, region: { value: new THREE.Vector3() }, regionSun: { value: new THREE.Vector3(0, 1, 0) }, regionDeck: { value: regionClouds as THREE.Texture | null } }), [night, clouds, regionClouds])

  const mats = useMemo(() => {
    // the globe pushed back in the depth buffer under the regional tile and the clouds (the low
    // tier has no logarithmic depth buffer; on the others the offset changes nothing)
    const globe = applyOrbitGround(new THREE.MeshStandardMaterial({ map: day, roughnessMap: rough, roughness: 1, metalness: 0.02, envMapIntensity: 0.15, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 8 }), u, false)
    // the regional tile: its own roughness, the global lights and cover by the globe's map, the
    // cumulus deck's shadows offset along the sun, feathered into the globe at its edges
    const tile = applyOrbitGround(new THREE.MeshStandardMaterial({ map: region, roughnessMap: regionRough, roughness: 1, metalness: 0.02, envMapIntensity: 0.15, transparent: true, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 4 }), u, true)
    const ground = tile.onBeforeCompile
    tile.onBeforeCompile = (shader, renderer) => {
      ground(shader, renderer)
      Object.assign(shader.uniforms, { uDeck: u.regionDeck, uRegionSun: u.regionSun, uEdge: { value: 0.035 } })
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D uDeck; uniform vec3 uRegionSun; uniform float uEdge;')
        .replace(
          'diffuseColor.rgb *= 1.0 - 0.35 * cover;',
          `diffuseColor.rgb *= 1.0 - 0.35 * cover;
          {
            // where the sun ray through this point crosses the cumulus deck (tile frame: x east, y up, z south)
            vec2 off = vec2(uRegionSun.x, -uRegionSun.z) * (${REGION.cloudHeight.toFixed(2)} / max(uRegionSun.y, 0.08)) / ${(2 * REGION.half).toFixed(1)};
            diffuseColor.rgb *= 1.0 - 0.6 * texture2D(uDeck, vMapUv + off).a;
          }`,
        )
        .replace(
          '#include <alphamap_fragment>',
          `#include <alphamap_fragment>
          {
            float e = min(min(vMapUv.x, 1.0 - vMapUv.x), min(vMapUv.y, 1.0 - vMapUv.y));
            diffuseColor.a *= smoothstep(0.0, uEdge, e);
          }`,
        )
    }
    const deck = applyEdgeFade(new THREE.MeshStandardMaterial({ map: regionClouds, transparent: true, depthWrite: false, roughness: 1, metalness: 0, envMapIntensity: 0.1 }), 0.03)
    const shell = cloudMaterial(clouds, u, q.fbmOctaves === 3 ? 3 : 2)
    return { globe, tile, deck, shell }
  }, [day, rough, region, regionRough, regionClouds, clouds, u, q.fbmOctaves])

  const geos = useMemo(() => {
    const k = q.mesh
    return {
      globe: new THREE.SphereGeometry(EARTH_R, Math.round(160 * Math.max(k, 0.6)), Math.round(96 * Math.max(k, 0.6))),
      shell: new THREE.SphereGeometry(EARTH_R + CLOUD_SHELL, Math.round(160 * Math.max(k, 0.6)), Math.round(96 * Math.max(k, 0.6))),
      tile: regionCap(EARTH_R, Math.round(180 * Math.max(k, 0.5))),
      deck: capGeometry(EARTH_R + REGION.cloudHeight, REGION.half, Math.round(150 * Math.max(k, 0.5))),
    }
  }, [q.mesh])
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos])

  const atmo = useMemo(() => limbMaterial(), [])
  const haze = useMemo(() => atmosphereMaterial(), [])
  const moonTex = useMemo(() => moonTexture(), [])
  const glow = useMemo(() => sunGlowTexture(), [])
  const stars = useMemo(() => starField(6000, 30_000), [])
  const earth = useRef<THREE.Group>(null)
  const cloud = useRef<THREE.Mesh>(null)
  const regionQ = useMemo(() => globeQuaternion(REGION.lat, REGION.lon).invert(), [])
  const regionUp = useMemo(() => earthFixed(REGION.lat, REGION.lon), [])
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), v: new THREE.Vector3(), cam: new THREE.Vector3() }), [])

  useFrame(({ camera }) => {
    const { spin, clouds: cloudSpin } = earthState
    if (earth.current) earth.current.rotation.y = spin
    if (cloud.current) cloud.current.rotation.y = cloudSpin
    u.cloudShift.value = (cloudSpin - spin) / (2 * Math.PI)
    // the region's centre in the cloud shell's own frame (the shell turns against the ground)
    u.region.value.copy(regionUp).applyAxisAngle(THREE.Object3D.DEFAULT_UP, spin - cloudSpin)
    // the sun in the regional tile's frame: world → planet (undo the spin) → tile (the region's rotation)
    tmp.q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, -spin)
    u.regionSun.value.copy(SUN_DIR).applyQuaternion(tmp.q).applyQuaternion(tmp.q.copy(regionQ).invert())
    // exposure: a camera over the day side, with the lit planet in frame, does not see stars
    camera.getWorldDirection(tmp.v)
    tmp.cam.copy(camera.position).normalize()
    const overDay = THREE.MathUtils.smoothstep(tmp.cam.dot(SUN_DIR), -0.15, 0.25)
    const lookDown = THREE.MathUtils.smoothstep(-tmp.v.dot(tmp.cam), -0.2, 0.35)
    stars.mat.opacity = 1 - 0.85 * overDay * lookDown
  })

  const sunPos = SUN_DIR.clone().multiplyScalar(36_000)
  const moonPos = new THREE.Vector3(-0.55, 0.2, -0.8).normalize().multiplyScalar(33_000)
  return (
    <group>
      <points geometry={stars.geo} material={stars.mat} renderOrder={-10} frustumCulled={false} />
      <sprite position={sunPos.toArray()} scale={[9000, 9000, 1]}>
        <spriteMaterial map={glow} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </sprite>
      <mesh position={moonPos.toArray()}>
        <sphereGeometry args={[33_000 * 0.00452, 32, 24]} />
        <meshStandardMaterial map={moonTex} roughness={1} />
      </mesh>
      {/* the planet */}
      <group ref={earth}>
        <mesh geometry={geos.globe} material={mats.globe} />
        <group quaternion={regionQ}>
          <mesh geometry={geos.tile} material={mats.tile} position={[0, EARTH_R + 0.3, 0]} renderOrder={1} />
          <mesh geometry={geos.deck} material={mats.deck} position={[0, EARTH_R + REGION.cloudHeight, 0]} renderOrder={2} />
        </group>
      </group>
      <mesh ref={cloud} geometry={geos.shell} material={mats.shell} renderOrder={3} />
      {/* the limb's shell reaches 105 km (the airglow's height) — it has to stay under the orbit */}
      <mesh material={atmo}>
        <sphereGeometry args={[EARTH_R + 105, 96, 72]} />
      </mesh>
      <mesh material={haze}>
        <sphereGeometry args={[EARTH_R * 1.006, 96, 72]} />
      </mesh>
    </group>
  )
}
