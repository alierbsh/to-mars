/**
 * Mars's limb from space: for each sight line that misses the planet, the height of its closest
 * approach decides the glow — a thin butterscotch haze (scale height ~11 km; a dust storm lifts dust
 * far higher), a hint of blue low down in clear air, dark on the night side. Drawn additively on the
 * back faces of a shell ~90 km up, in the shell's own frame (the planet may be moved and scaled):
 * `limbCamera` brings the camera into that frame just before it draws. `kmUnit` is scene units per km
 * (1 in the cruise, 1000 in the metre-scale entry); `gain` fades it (the entry, once inside the air).
 */
import * as THREE from 'three'

export function marsLimbMaterial(radius: number, kmUnit: number, sunDir: THREE.Vector3, dust: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: sunDir }, radius: { value: radius }, uCam: { value: new THREE.Vector3() }, uDust: { value: dust }, uKm: { value: kmUnit }, uGain: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 sunDir; uniform float radius; uniform vec3 uCam; uniform float uDust; uniform float uKm; uniform float uGain;
      varying vec3 vLocal;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 d = normalize(vLocal - uCam);
        float tc = max(0.0, -dot(uCam, d));
        vec3 pc = uCam + d * tc;
        float h = (length(pc) - radius) / uKm;
        if (h < 0.0) discard;
        float day = smoothstep(-0.15, 0.25, dot(normalize(pc), sunDir));
        float H = mix(11.0, 24.0, uDust);
        vec3 col = vec3(0.95, 0.6, 0.38) * exp(-h / H) * (0.45 + 0.55 * uDust) + vec3(0.45, 0.58, 0.9) * exp(-h / 5.0) * 0.18 * (1.0 - uDust);
        gl_FragColor = vec4(col * day * uGain, 1.0);
      }`,
  })
}

/** keeps the limb's camera uniform in the mesh's own frame (call once the mesh exists) */
export function limbCamera(mesh: THREE.Mesh, mat: THREE.ShaderMaterial): void {
  const inv = new THREE.Matrix4()
  mesh.onBeforeRender = (_r, _s, camera) => {
    mat.uniforms.uCam.value.copy(camera.position).applyMatrix4(inv.copy(mesh.matrixWorld).invert())
  }
}
