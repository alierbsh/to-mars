/**
 * The Earth's atmosphere as light: single scattering (Rayleigh + Mie, Nishita 1993) integrated
 * along the view ray, in metres, with the planet centre and the sun direction as shared
 * uniforms. Two uses:
 *  - the sky: a camera-centred sphere whose fragment shader marches the ray to the top of the
 *    atmosphere (blue overhead at the pad, the pale horizon band, the thin blue limb and black
 *    space from 100 km, the sun reddening through the thick air);
 *  - aerial perspective: `applyAerialPerspective(material)` patches any built-in three.js
 *    material so that whatever it draws is seen through the air between it and the camera —
 *    the ground fading to blue haze toward the horizon, the limb of the Earth seen from orbit.
 * A small isotropic term stands in for multiple scattering so the horizon reads white-blue
 * rather than the dark orange of pure single scattering through thick air.
 */
import * as THREE from 'three'

export const R_EARTH_M = 6_371_000
export const R_ATMO_M = 6_471_000

/** uniforms shared by every atmosphere-aware material; the scene updates them per frame */
export const ATMO = {
  center: { value: new THREE.Vector3(0, -R_EARTH_M, 0) },
  sunDir: { value: new THREE.Vector3(0.49, 0.71, 0.33).normalize() },
  /** the sun's radiance scale for the scattering, matched to the scene's directional light
   * (2.4) so the zenith sky is ~0.3 of a sunlit white surface in the blue, as in photographs */
  sunI: { value: 10.0 },
  ambient: { value: 1.0 },
  /** aerial perspective on the ground, 0–1 (debug: ?aerial=0.5) — a little under physical,
   * so the land stays readable from orbit */
  aerial: { value: 0.5 },
  debug: { value: 0 },
}
{
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null
  if (q?.get('aerial')) ATMO.aerial.value = Number(q.get('aerial'))
  if (q?.get('suni')) ATMO.sunI.value = Number(q.get('suni'))
  if (q?.get('atmodebug')) ATMO.debug.value = Number(q.get('atmodebug'))
}

/** GLSL: constants, uniforms and the scattering integral (shared by the sky and the ground) */
export const ATMO_PARS = /* glsl */ `
uniform vec3 uAtmoCenter;
uniform vec3 uAtmoSun;
uniform float uAtmoSunI;
uniform float uAtmoAmbient;
const float ATMO_RE = 6371000.0;
const float ATMO_RA = 6471000.0;
const float ATMO_HR = 8000.0;
const float ATMO_HM = 1200.0;
const vec3 ATMO_BR = vec3(5.8e-6, 13.5e-6, 33.1e-6);
const vec3 ATMO_BM = vec3(12e-6);
const float ATMO_G = 0.76;

vec2 atmoRaySphere(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

vec2 atmoOpticalDepth(vec3 p, vec3 d, float L, int n) {
  float ds = L / float(n);
  vec2 od = vec2(0.0);
  for (int i = 0; i < n; i++) {
    vec3 q = p + d * (ds * (float(i) + 0.5));
    float h = max(0.0, length(q) - ATMO_RE);
    od += exp(-h / vec2(ATMO_HR, ATMO_HM)) * ds;
  }
  return od;
}

/** in-scattered light along the ray from ro (world) in direction rd up to tMax; writes the
 * transmittance of that path into T. nView samples along the view ray, nSun along each sun ray. */
vec3 atmoScatter(vec3 ro, vec3 rd, float tMax, out vec3 T, int nView, int nSun) {
  vec3 p0 = ro - uAtmoCenter;
  vec2 ta = atmoRaySphere(p0, rd, ATMO_RA);
  T = vec3(1.0);
  if (ta.y < 0.0) return vec3(0.0);
  float t0 = max(ta.x, 0.0);
  float t1 = min(ta.y, tMax);
  if (t1 <= t0) return vec3(0.0);
  float ds = (t1 - t0) / float(nView);
  vec2 odView = vec2(0.0);
  vec3 sumR = vec3(0.0);
  vec3 sumM = vec3(0.0);
  for (int i = 0; i < nView; i++) {
    vec3 q = p0 + rd * (t0 + ds * (float(i) + 0.5));
    float h = max(0.0, length(q) - ATMO_RE);
    vec2 dens = exp(-h / vec2(ATMO_HR, ATMO_HM)) * ds;
    odView += dens;
    vec2 ts = atmoRaySphere(q, uAtmoSun, ATMO_RA);
    vec2 odSun = atmoOpticalDepth(q, uAtmoSun, max(ts.y, 0.0), nSun);
    // the planet's shadow: a sun ray that meets the ground carries nothing
    vec2 tg = atmoRaySphere(q, uAtmoSun, ATMO_RE);
    float lit = (tg.x > 0.0) ? 0.0 : 1.0;
    vec3 tau = ATMO_BR * (odView.x + odSun.x) + ATMO_BM * 1.1 * (odView.y + odSun.y);
    vec3 attn = exp(-tau) * lit;
    sumR += attn * dens.x;
    sumM += attn * dens.y;
  }
  float mu = dot(rd, uAtmoSun);
  float phaseR = 3.0 / (16.0 * PI) * (1.0 + mu * mu);
  float g = ATMO_G;
  float phaseM = 3.0 / (8.0 * PI) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
  T = exp(-(ATMO_BR * odView.x + ATMO_BM * 1.1 * odView.y));
  vec3 single = uAtmoSunI * (sumR * ATMO_BR * phaseR + sumM * ATMO_BM * phaseM);
  // multiple scattering stand-in: the air that is not transparent glows sky-coloured
  vec3 multi = (1.0 - T) * vec3(0.30, 0.40, 0.55) * uAtmoAmbient * (uAtmoSunI / 22.0);
  // the sun below the horizon of the sample path dims the ambient too
  float sunUp = clamp(dot(normalize(p0), uAtmoSun) * 4.0 + 0.6, 0.0, 1.0);
  return single + multi * sunUp;
}
`

const ATMO_UNIFORMS = () => ({ uAtmoCenter: ATMO.center, uAtmoSun: ATMO.sunDir, uAtmoSunI: ATMO.sunI, uAtmoAmbient: ATMO.ambient })

/**
 * Patch a built-in material so its output is seen through the atmosphere: per-vertex scattering
 * from the camera to the vertex (8 view samples, 3 sun samples), mixed in before tone mapping.
 * `strength` scales the effect (1 = physical).
 */
export function applyAerialPerspective<T extends THREE.Material>(material: T, strength = 1): T {
  const prev = material.onBeforeCompile
  material.onBeforeCompile = (shader, renderer) => {
    prev?.(shader, renderer)
    Object.assign(shader.uniforms, ATMO_UNIFORMS(), { uAtmoStrength: { value: strength }, uAtmoAerial: ATMO.aerial, uAtmoDebug: ATMO.debug })
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>\n${ATMO_PARS}\nvarying vec3 vAtmoIn;\nvarying vec3 vAtmoT;`,
      )
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        {
          vec4 atmoWp = modelMatrix * vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            atmoWp = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
          #endif
          vec3 atmoRay = atmoWp.xyz - cameraPosition;
          float atmoLen = length(atmoRay);
          vec3 atmoT;
          vAtmoIn = atmoScatter(cameraPosition, atmoRay / max(atmoLen, 1e-3), atmoLen, atmoT, 8, 3);
          vAtmoT = atmoT;
        }`,
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uAtmoStrength;\nuniform float uAtmoAerial;\nuniform float uAtmoDebug;\nvarying vec3 vAtmoIn;\nvarying vec3 vAtmoT;')
      .replace(
        '#include <tonemapping_fragment>',
        `gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vAtmoT + vAtmoIn, uAtmoStrength * uAtmoAerial);
        if (uAtmoDebug > 0.5 && uAtmoDebug < 1.5) gl_FragColor.rgb = vAtmoIn;
        if (uAtmoDebug > 1.5 && uAtmoDebug < 2.5) gl_FragColor.rgb = vAtmoT;
        #include <tonemapping_fragment>`,
      )
  }
  const prevKey = material.customProgramCacheKey
  material.customProgramCacheKey = () => `${prevKey ? prevKey.call(material) : ''}|atmo${strength}`
  material.needsUpdate = true
  return material
}

/** the sky material: a camera-centred sphere; the fragment marches the full ray */
export function skyScatterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: ATMO_UNIFORMS(),
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    // out = inscatter + background × transmittance (alpha carries 1 − T)
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquation: THREE.AddEquation,
    fog: false,
    vertexShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 1.0)).xyz - cameraPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      ${ATMO_PARS}
      varying vec3 vDir;
      void main() {
        #include <logdepthbuf_fragment>
        vec3 rd = normalize(vDir);
        vec3 T;
        // stop at the ground if the ray meets it (the ground draws itself; this keeps the limb clean)
        vec2 tg = atmoRaySphere(cameraPosition - uAtmoCenter, rd, ATMO_RE);
        float tMax = (tg.x > 0.0) ? tg.x : 1e12;
        vec3 col = atmoScatter(cameraPosition, rd, tMax, T, 16, 4);
        // the sun's disc, seen through the air (reddens and dims low down)
        float mu = dot(rd, uAtmoSun);
        float disc = smoothstep(0.99988, 0.99996, mu);
        float glare = pow(max(mu, 0.0), 1800.0) * 0.6 + pow(max(mu, 0.0), 120.0) * 0.08;
        if (tg.x < 0.0) col += (disc * 40.0 + glare * 6.0) * T;
        float a = 1.0 - dot(T, vec3(0.3333));
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
}
