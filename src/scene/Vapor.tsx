/**
 * Condensation at transonic speed. Nearing Mach 1 the air accelerating over a shoulder of the body
 * (the nose, the interstage) expands and cools below its dew point, and a collar of fog wraps the
 * vehicle there, trailing back as a cone — the "vapor cone" of every launch from a humid coast.
 * Drawn as an open frustum around the body: streaky along the flow, densest where it is seen
 * edge-on (a thin shell of fog), fading downstream; lit by the sun on one side. `strength` (a ref,
 * 0–1) is set by the rig from the Mach number and the height.
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const vert = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
  #include <logdepthbuf_vertex>
}
`

const frag = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform float uK;
uniform float uTime;
uniform vec3 uSun;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vView;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y);
}
void main() {
  #include <logdepthbuf_fragment>
  float v = vUv.y; // 1 at the shoulder, 0 at the trailing edge
  // fine streaks around the body, drawn out along the flow and drifting aft; the u wrap is seamless
  // because the streak count is a whole number
  vec2 q = vec2(vUv.x * 36.0, v * 3.0 + uTime * 1.7);
  float n = vn(q) * 0.55 + vn(vec2(vUv.x * 90.0, v * 7.0 + uTime * 2.9) + 3.0) * 0.3 + vn(vec2(vUv.x * 12.0, v * 1.4 + uTime * 0.6) + 9.0) * 0.15;
  // a sharp front at the shoulder, thinning out downstream; ragged trailing edge
  float shape = smoothstep(1.0, 0.94, v) * smoothstep(0.0, 0.75, v + (n - 0.5) * 0.5);
  vec3 nrm = normalize(gl_FrontFacing ? vN : -vN);
  float edge = 1.0 - abs(dot(nrm, vView));
  float a = uK * shape * (0.42 + 0.58 * edge) * (0.4 + 1.05 * n);
  float lit = 0.7 + 0.4 * max(0.0, dot(nrm, uSun));
  gl_FragColor = vec4(vec3(lit), clamp(a, 0.0, 0.88));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export function VaporCollar({ y, r, length, strength, sun }: { y: number; r: number; length: number; strength: { current: number }; sun: THREE.Vector3 }) {
  const mesh = useRef<THREE.Mesh>(null)
  const geo = useMemo(() => new THREE.CylinderGeometry(r * 1.05, r * 2.3, length, 48, 4, true), [r, length])
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uK: { value: 0 }, uTime: { value: 0 }, uSun: { value: sun } },
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [sun],
  )
  useFrame(({ clock }) => {
    const k = strength.current
    if (mesh.current) mesh.current.visible = k > 0.01
    mat.uniforms.uK.value = k
    mat.uniforms.uTime.value = clock.elapsedTime
  })
  return <mesh ref={mesh} geometry={geo} material={mat} position={[0, y - length / 2, 0]} renderOrder={5} visible={false} frustumCulled={false} />
}
