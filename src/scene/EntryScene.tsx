/**
 * Mars entry, descent and landing: the spacecraft at the origin (belly-first or heat-shield-first),
 * plasma glow scaled by heat flux, the flip to vertical for the landing burn, the NASA-DEM Mars
 * surface (MarsSurface) sliding under the vehicle and rising to meet it, a butterscotch sky near
 * the surface. A crash ends in a flash.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { entryAt } from '../ui/hud'
import { MarsSurface } from './MarsSurface'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'

const SKY_HIGH = new THREE.Color('#02040a')
const SKY_LOW = new THREE.Color('#b8864f')
const R_MARS = 3_389_500

/** Mars sky dome: horizon butterscotch → zenith dark tan/black, blended in by `haze` (0 in space, 1 at the surface) */
function skyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { haze: { value: 0 } },
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    fog: false,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float haze; varying vec3 vDir;
      void main(){
        float up = clamp(vDir.y, -0.2, 1.0);
        vec3 horizon = vec3(0.86, 0.64, 0.40);
        vec3 zenith = vec3(0.36, 0.25, 0.16);
        vec3 c = mix(horizon, zenith, smoothstep(0.0, 0.55, up));
        float a = haze * (up > -0.02 ? 1.0 : 0.0);
        gl_FragColor = vec4(c, a);
      }`,
  })
}

let plasmaCache: THREE.CanvasTexture | null = null
/** soft radial gradient, white-hot core to transparent */
function plasmaTexture(): THREE.CanvasTexture {
  if (plasmaCache) return plasmaCache
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,220,180,0.85)')
  g.addColorStop(0.5, 'rgba(255,150,80,0.35)')
  g.addColorStop(1, 'rgba(255,100,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  plasmaCache = new THREE.CanvasTexture(c)
  return plasmaCache
}

export default function EntryScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 20
  const isShip = vehicle.spacecraft.entry?.kind === 'ship'
  const rig = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const wake = useRef<THREE.Sprite>(null)
  const sky = useRef<THREE.Mesh>(null)
  const skyMat = useMemo(() => skyMaterial(), [])
  const plasmaTex = useMemo(() => plasmaTexture(), [])
  const ground = useRef<THREE.Group>(null)
  const flash = useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  const st = useMemo(() => ({ az: 0.4, flip: 0, init: false }), [])
  const bg = useMemo(() => new THREE.Color(), [])
  const bellyFirst = useMemo(() => {
    // model +Y (nose) → world +X (downrange), model +Z (tiles) → world -Y (into the flow)
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0))
    return new THREE.Quaternion().setFromRotationMatrix(m)
  }, [])
  const upright = useMemo(() => new THREE.Quaternion(), [])
  const capsuleTilt = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.35)), [])

  useFrame(({ camera }, dt) => {
    const { result, t, playing } = useAppStore.getState()
    const e = result ? entryAt(result, t) : undefined
    const phase = result?.phases.find((p) => p.phase === 'entry')
    const alt = e?.alt ?? 125_000
    const ended = phase ? t >= phase.end : false
    const crashed = !!result?.entry && !result.entry.landed
    // attitude
    if (rig.current) {
      const flipTarget = isShip ? (e?.burning || (ended && !crashed) ? 1 : 0) : 1
      st.flip += (flipTarget - st.flip) * Math.min(1, dt * 1.5)
      const q = isShip ? bellyFirst.clone().slerp(upright, st.flip) : capsuleTilt.clone().slerp(upright, ended ? 1 : 0.2)
      rig.current.quaternion.copy(q)
      rig.current.visible = !(ended && crashed)
      rig.current.position.y = isShip ? (st.flip > 0.5 ? 0 : L / 2) : 0
    }
    if (ground.current) {
      // The touchdown point lies ahead by the range still to fly. The surface group is centred on
      // it, so swing it about the planet's centre: far away it sits below the horizon, as it should.
      const tel = result?.entry?.telemetry
      const total = tel && tel.length ? tel[tel.length - 1].downrange : 0
      const range = e ? Math.max(0, total - e.downrange) * 1000 : 0
      const d = range / R_MARS
      const drop = -Math.max(alt, 0) - (isShip && st.flip < 0.5 ? L / 2 : 0)
      ground.current.position.set(R_MARS * Math.sin(d), drop - R_MARS * (1 - Math.cos(d)), 0)
      ground.current.rotation.z = -d
    }
    // plasma from heating: a sheath on the windward side and a wake behind
    if (glow.current && wake.current && result?.entry) {
      const q = e?.heatFlux ?? 0
      const limit = vehicle.spacecraft.entry?.tpsLimit ?? 50
      const k = Math.min(1.3, q / (0.5 * limit))
      const on = k > 0.04 && !(ended && crashed)
      glow.current.visible = on
      wake.current.visible = on
      ;(glow.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.85 * k)
      ;(wake.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.5 * k)
      const belly = isShip ? 1 - st.flip : 1
      const cy = rig.current ? rig.current.position.y : 0 // the vehicle's centre
      glow.current.scale.set(L * (isShip ? 1.25 : 2.2), L * (isShip ? 0.55 : 1.6), 1)
      glow.current.position.set(0, cy - (isShip ? L * 0.12 * belly : L * 0.3), 0)
      wake.current.scale.set(L * (isShip ? 2.6 : 4), L * (isShip ? 0.5 : 1.2), 1)
      wake.current.position.set(-L * (isShip ? 1.2 : 2.2), cy - (isShip ? L * 0.05 : L * 0.1), 0)
    }
    // crash flash
    if (flash.current) {
      const dtc = phase ? t - phase.end : -1
      if (crashed && dtc >= 0 && dtc < 12) {
        flash.current.visible = true
        const f = dtc / 12
        flash.current.scale.setScalar(L * (0.5 + 4 * f))
        ;(flash.current.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - f)
      } else flash.current.visible = false
    }
    // sky: black above the atmosphere, butterscotch dust haze near the ground; the haze thins with altitude
    const f = Math.min(1, Math.max(0, 1 - alt / 70_000))
    bg.copy(SKY_HIGH).lerp(SKY_LOW, f * f)
    scene.background = bg
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog
      fog.color.copy(bg)
      fog.far = 60_000 + alt * 40
      fog.near = fog.far * 0.35
    }
    if (sky.current) {
      // gradient dome: butterscotch horizon, darker zenith; fades out with altitude
      sky.current.position.copy(camera.position)
      const m = sky.current.material as THREE.ShaderMaterial
      m.uniforms.haze.value = f * f
    }
    // camera
    if (playing) st.az += dt * 0.08
    const dist = Math.max(L * 3.2, 26)
    const target = new THREE.Vector3(Math.cos(st.az) * dist, L * 0.35, Math.sin(st.az) * dist)
    if (!st.init) {
      camera.position.copy(target)
      st.init = true
    } else camera.position.lerp(target, 0.08)
    camera.lookAt(0, isShip && st.flip > 0.5 ? L / 2 : 0, 0)
    camera.near = 0.5
    camera.far = 6_000_000
    camera.updateProjectionMatrix()
  })

  return (
    <group>
      <group ref={rig}>
        <group position={[0, -(SPACECRAFT_BASE[vehicleId] ?? 0), 0]}>
          <VehicleRig id={vehicleId} mode="entry" />
        </group>
      </group>
      <mesh ref={sky} material={skyMat} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[200_000, 32, 16]} />
      </mesh>
      <sprite ref={glow} visible={false}>
        <spriteMaterial map={plasmaTex} color="#ffb278" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={wake} visible={false}>
        <spriteMaterial map={plasmaTex} color="#ff9a60" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh ref={flash} visible={false}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ffcc88" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={ground}>
        <Suspense fallback={null}>
          <MarsSurface />
        </Suspense>
      </group>
      <directionalLight position={[300, 400, 200]} intensity={1.7} color="#ffe2c4" />
      <hemisphereLight args={['#c9a27a', '#3b2418', 0.45]} />
    </group>
  )
}

