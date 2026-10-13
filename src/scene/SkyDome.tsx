/**
 * A gradient sky dome that follows the camera: horizon colour → zenith colour, faded in by the
 * `haze` uniform (0 in space, 1 at the surface). It hides the star field while in the atmosphere.
 * The parent scene positions it on the camera and sets `haze` every frame through the ref.
 */
import { useMemo, type Ref } from 'react'
import * as THREE from 'three'
import { SKY_LOGDEPTH_PARS, SKY_LOGDEPTH_VERTEX } from './atmosphere'

export function skyMaterial(horizon: string, zenith: string): THREE.ShaderMaterial {
  const h = new THREE.Color(horizon)
  const z = new THREE.Color(zenith)
  return new THREE.ShaderMaterial({
    uniforms: { haze: { value: 0 }, horizon: { value: new THREE.Vector3(h.r, h.g, h.b) }, zenith: { value: new THREE.Vector3(z.r, z.g, z.b) } },
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    fog: false,
    vertexShader: `
      #include <common>
      ${SKY_LOGDEPTH_PARS}
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        ${SKY_LOGDEPTH_VERTEX}
      }`,
    fragmentShader: `
      #include <common>
      uniform float haze; uniform vec3 horizon; uniform vec3 zenith; varying vec3 vDir;
      void main(){
        float up = clamp(vDir.y, -0.2, 1.0);
        // horizon colour held for the first degrees, then up to the zenith; below the horizontal
        // the dome keeps the horizon colour, so the fogged ground meets it without a seam
        vec3 c = mix(horizon, zenith, smoothstep(0.04, 0.7, up));
        gl_FragColor = vec4(c, haze);
        // through the tone mapper and into the output colour space like every lit material, or
        // the dome comes out far darker than its colours and seams against the fogged ground
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
}

export function SkyDome({ horizon, zenith, radius = 200_000, ref }: { horizon: string; zenith: string; radius?: number; ref: Ref<THREE.Mesh> }) {
  const mat = useMemo(() => skyMaterial(horizon, zenith), [horizon, zenith])
  return (
    <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[radius, 32, 16]} />
    </mesh>
  )
}

/** per-frame update helper */
export function setSky(mesh: THREE.Mesh | null, camera: THREE.Camera, haze: number, horizon?: THREE.Color, zenith?: THREE.Color) {
  if (!mesh) return
  mesh.position.copy(camera.position)
  const u = (mesh.material as THREE.ShaderMaterial).uniforms
  u.haze.value = haze
  if (horizon) u.horizon.value.set(horizon.r, horizon.g, horizon.b)
  if (zenith) u.zenith.value.set(zenith.r, zenith.g, zenith.b)
}
