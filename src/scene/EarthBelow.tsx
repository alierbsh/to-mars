/**
 * The Earth under the launch, for the whole climb from the pad to orbit:
 *  - the globe itself (NASA Blue Marble, 4k, water mask → roughness for the sun glint), a child
 *    of the ground group so it swings with the Cape as the vehicle flies downrange, oriented so
 *    the pad's latitude and longitude sit at the local origin;
 *  - a 2000 km regional tile (public/assets/cape/region.jpg, built by scripts/cape-assets.py from
 *    the Blue Marble and Natural Earth) draped over it at ~0.5 km/px, edges feathered into the
 *    globe, with its own roughness map;
 *  - a cloud deck 2.2 km up from the same build (Florida's afternoon cumulus, sea-breeze lines,
 *    trade cumulus at sea), whose shadows fall on every ground tile;
 *  - the sky as single scattering (atmosphere.ts) and the Hipparcos stars that come out as the
 *    air thins.
 * Everything that is ground gets aerial perspective, so the land fades into blue haze toward the
 * horizon and the limb glows seen from above.
 */
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PadId } from '../sim/types'
import { useAppStore } from '../state/store'
import { ascentAt } from '../ui/hud'
import { ATMO, R_EARTH_M, applyAerialPerspective, skyScatterMaterial } from './atmosphere'
import { PAD_SITE, padLatLon } from './capeSite'
import { capGeometry } from './terrain'
import { texName } from './quality'
import { useMaps } from './maps'
import { useQuality } from './useQuality'

const BASE_URL = import.meta.env.BASE_URL
const KM = 1000
const HIDE = new Set((typeof location !== 'undefined' ? new URLSearchParams(location.search).get('hide') ?? '' : '').split(','))
export const REGION_HALF = 1000 * KM
export const CLOUD_HEIGHT = 2200

/** rotation that brings the globe's (lat, lon) to the local origin with x east, z south */
export function globeQuaternion(latDeg: number, lonDeg: number): THREE.Quaternion {
  const lat = (latDeg * Math.PI) / 180
  const lon = (lonDeg * Math.PI) / 180
  const up = new THREE.Vector3(Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon))
  const east = new THREE.Vector3(-Math.sin(lon), 0, -Math.cos(lon))
  const north = new THREE.Vector3(-Math.sin(lat) * Math.cos(lon), Math.cos(lat), Math.sin(lat) * Math.sin(lon))
  const basis = new THREE.Matrix4().makeBasis(east, up, north.clone().negate())
  return new THREE.Quaternion().setFromRotationMatrix(basis.transpose())
}

/** shared cloud-shadow uniforms (the regional frame in pad-local metres) */
const CLOUD = {
  map: { value: null as THREE.Texture | null },
  centre: { value: new THREE.Vector2() },
  half: { value: REGION_HALF },
  height: { value: CLOUD_HEIGHT },
  strength: { value: 0.75 },
}

/** darken a ground material where the cloud deck shadows it (sun-offset lookup in the deck) */
export function applyCloudShadow<T extends THREE.Material>(material: T): T {
  const prev = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer)
    Object.assign(shader.uniforms, { uCloudMap: CLOUD.map, uCloudCentre: CLOUD.centre, uCloudHalf: CLOUD.half, uCloudHeight: CLOUD.height, uCloudStrength: CLOUD.strength, uCloudSun: ATMO.sunDir })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vCloudXZ;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvCloudXZ = transformed.xz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uCloudMap; uniform vec2 uCloudCentre; uniform float uCloudHalf; uniform float uCloudHeight; uniform float uCloudStrength; uniform vec3 uCloudSun; varying vec2 vCloudXZ;')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          // where the sun ray through this point crosses the deck (sun x east, y up, z south)
          vec2 at = vCloudXZ + uCloudSun.xz * (uCloudHeight / max(uCloudSun.y, 0.05));
          vec2 cuv = (at - uCloudCentre + uCloudHalf) / (2.0 * uCloudHalf);
          cuv.y = 1.0 - cuv.y;
          float inside = step(0.0, cuv.x) * step(cuv.x, 1.0) * step(0.0, cuv.y) * step(cuv.y, 1.0);
          float shade = texture2D(uCloudMap, cuv).a * inside;
          diffuseColor.rgb *= 1.0 - uCloudStrength * shade;
        }`,
      )
  }
  const prevKey = material.customProgramCacheKey
  material.customProgramCacheKey = () => `${prevKey ? prevKey.call(material) : ''}|cloudshadow`
  material.needsUpdate = true
  return material
}

/** fade a tile's alpha over its outer `width` of UV so it blends into what lies under it */
export function applyEdgeFade<T extends THREE.Material>(material: T, width: number): T {
  const prev = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer)
    shader.uniforms.uEdgeFade = { value: width }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uEdgeFade;')
      .replace(
        '#include <alphamap_fragment>',
        `#include <alphamap_fragment>
        {
          float e = min(min(vMapUv.x, 1.0 - vMapUv.x), min(vMapUv.y, 1.0 - vMapUv.y));
          diffuseColor.a *= smoothstep(0.0, uEdgeFade, e);
        }`,
      )
  }
  const prevKey = material.customProgramCacheKey
  material.customProgramCacheKey = () => `${prevKey ? prevKey.call(material) : ''}|edge${width}`
  material.needsUpdate = true
  return material
}

/**
 * Globe + regional tile + cloud deck. Rendered inside the ground group (pad-local frame, grade
 * level at `groundY`).
 */
export function EarthBelow({ pad, groundY }: { pad: PadId; groundY: number }) {
  const q = useQuality()
  // the globe only shows beyond the regional tile, a thousand kilometres out: the 2k map does
  const textures = useMaps([
    `${BASE_URL}assets/earth/earth-day-4k-half.jpg`,
    `${BASE_URL}assets/earth/earth-rough-4k-half.jpg`,
    `${BASE_URL}assets/cape/${texName('region.jpg', q.textures)}`,
    `${BASE_URL}assets/cape/${texName('region-rough.jpg', q.textures)}`,
    `${BASE_URL}assets/cape/${texName('region-clouds.webp', q.textures)}`,
  ])
  const [day, rough, region, regionRough, clouds] = textures
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])
  const origin = PAD_SITE[pad]
  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace
    region.colorSpace = THREE.SRGBColorSpace
    region.anisotropy = q.anisotropy
    clouds.anisotropy = Math.min(8, q.anisotropy)
    for (const t of [day, rough, region, regionRough, clouds]) t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    CLOUD.map.value = clouds
    CLOUD.centre.value.set(-origin[0], -origin[1])
  }, [day, rough, region, regionRough, clouds, origin, q.anisotropy])

  const globe = useMemo(() => {
    const geo = new THREE.SphereGeometry(R_EARTH_M, Math.round(256 * q.mesh), Math.round(128 * q.mesh))
    const mat = new THREE.MeshStandardMaterial({ map: day, roughnessMap: rough, roughness: 1, metalness: 0, envMapIntensity: 0.25, polygonOffset: true, polygonOffsetFactor: 5, polygonOffsetUnits: 10 })
    applyAerialPerspective(mat)
    const [lat, lon] = padLatLon(pad)
    return { geo, mat, q: globeQuaternion(lat, lon) }
  }, [day, rough, pad, q.mesh])

  const tile = useMemo(() => {
    const b = { x0: -origin[0] - REGION_HALF, x1: -origin[0] + REGION_HALF, z0: -origin[1] - REGION_HALF, z1: -origin[1] + REGION_HALF }
    const geo = capGeometry(R_EARTH_M, b, Math.round(200 * q.mesh))
    const mat = new THREE.MeshStandardMaterial({ map: region, roughnessMap: regionRough, roughness: 1, metalness: 0, envMapIntensity: 0.25, transparent: true, depthWrite: true, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 8 })
    applyAerialPerspective(mat)
    applyCloudShadow(mat)
    applyEdgeFade(mat, 0.04)
    const deck = capGeometry(R_EARTH_M + CLOUD_HEIGHT, b, Math.round(160 * q.mesh))
    const deckMat = new THREE.MeshBasicMaterial({ map: clouds, transparent: true, depthWrite: false, color: '#ffffff' })
    applyAerialPerspective(deckMat)
    applyEdgeFade(deckMat, 0.03)
    return { geo, mat, deck, deckMat }
  }, [origin, region, regionRough, clouds, q.mesh])

  return (
    <group position={[0, groundY, 0]}>
      {!HIDE.has('globe') && <mesh geometry={globe.geo} material={globe.mat} quaternion={globe.q} position={[0, -R_EARTH_M - 40, 0]} frustumCulled={false} />}
      {!HIDE.has('region') && <mesh geometry={tile.geo} material={tile.mat} position={[0, -12, 0]} renderOrder={1} frustumCulled={false} />}
      {!HIDE.has('deck') && <mesh geometry={tile.deck} material={tile.deckMat} position={[0, -12, 0]} renderOrder={5} frustumCulled={false} />}
    </group>
  )
}

/** the sky and the stars, centred on the camera; placed at the scene root */
export function AscentSky() {
  const sky = useRef<THREE.Mesh>(null)
  const starPts = useRef<THREE.Points>(null)
  const q = useQuality()
  const skyMat = useMemo(() => skyScatterMaterial(q.skySamples), [q.skySamples])
  // 5000 stars on the celestial sphere, a few bright, most faint, slightly tinted
  const stars = useMemo(() => {
    const n = 5000
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1
      const a = rnd() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      pos[i * 3] = r * Math.cos(a) * 3_000_000
      pos[i * 3 + 1] = u * 3_000_000
      pos[i * 3 + 2] = r * Math.sin(a) * 3_000_000
      const m = Math.pow(rnd(), 2.5) // magnitude: most are faint
      const warm = rnd()
      const b = 0.25 + 0.75 * m
      col[i * 3] = b * (0.85 + 0.15 * warm)
      col[i * 3 + 1] = b * (0.88 + 0.08 * warm)
      col[i * 3 + 2] = b * (1.0 - 0.12 * warm)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, fog: false, toneMapped: false })
    return { geo, mat }
  }, [])
  useFrame(({ camera }) => {
    const { result, t } = useAppStore.getState()
    const alt = (result && ascentAt(result, t)?.alt) || 0
    if (sky.current) sky.current.position.copy(camera.position)
    if (starPts.current) {
      starPts.current.position.copy(camera.position)
      // the stars come out between 35 and 90 km, as the scattered light goes
      const f = Math.min(1, Math.max(0, (alt - 35_000) / 55_000))
      stars.mat.opacity = f * f
      starPts.current.visible = f > 0.001
    }
  })
  return (
    <group>
      <points ref={starPts} geometry={stars.geo} material={stars.mat} renderOrder={-30} frustumCulled={false} />
      {!HIDE.has('sky') && (
        <mesh ref={sky} material={skyMat} renderOrder={-20} frustumCulled={false}>
          <sphereGeometry args={[4_000_000, 48, 24]} />
        </mesh>
      )}
    </group>
  )
}
