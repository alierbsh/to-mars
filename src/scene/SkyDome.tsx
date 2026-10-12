/**
 * A gradient sky dome that follows the camera: horizon colour → zenith colour, faded in by the
 * `haze` uniform (0 in space, 1 at the surface). It hides the star field while in the atmosphere.
 * The parent scene positions it on the camera and sets `haze` every frame through the ref.
 */
import { useMemo, type Ref } from 'react'
import * as THREE from 'three'

export function skyMaterial(horizon: string, zenith: string): THREE.ShaderMaterial {
  const h = new THREE.Color(horizon)
  const z = new THREE.Color(zenith)
  return new THREE.ShaderMaterial({
    uniforms: { haze: { value: 0 }, horizon: { value: new THREE.Vector3(h.r, h.g, h.b) }, zenith: { value: new THREE.Vector3(z.r, z.g, z.b) } },
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float haze; uniform vec3 horizon; uniform vec3 zenith; varying vec3 vDir;
      void main(){
        float up = clamp(vDir.y, -0.2, 1.0);
        vec3 c = mix(horizon, zenith, smoothstep(0.0, 0.6, up));
        float a = haze * (up > -0.015 ? 1.0 : 0.0);
        gl_FragColor = vec4(c, a);
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
