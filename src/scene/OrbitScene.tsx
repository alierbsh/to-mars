/**
 * Earth orbit: the ship (model, not to scale) in the foreground, Earth below; tankers come
 * and go on their docking events; the TMI burn lights the engines.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'

const EARTH_R = 6371 // scene unit = 1 km here; the vehicle model is scaled up for visibility
const ALT = 200

function Earth() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 512
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, '#a9c4e6')
    g.addColorStop(0.15, '#2d5c9c')
    g.addColorStop(0.5, '#1e4f94')
    g.addColorStop(0.85, '#2d5c9c')
    g.addColorStop(1, '#dfe9f5')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 512)
    // land masses: soft blobs
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 26; i++) {
      const x = rnd() * 1024
      const y = 80 + rnd() * 350
      const r = 30 + rnd() * 90
      const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r)
      grad.addColorStop(0, 'rgba(96,110,70,0.95)')
      grad.addColorStop(0.7, 'rgba(96,110,70,0.6)')
      grad.addColorStop(1, 'rgba(96,110,70,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(x, y, r * (0.7 + rnd()), r * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // clouds
    for (let i = 0; i < 160; i++) {
      const x = rnd() * 1024
      const y = rnd() * 512
      const r = 8 + rnd() * 40
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,255,255,0.55)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(x, y, r * 2.2, r * 0.6, rnd() * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group>
      <mesh>
        <sphereGeometry args={[EARTH_R, 96, 64]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.015, 64, 48]} />
        <meshBasicMaterial color="#6fa8ff" transparent opacity={0.18} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

export default function OrbitScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 30
  const SCALE = 0.012 // model metres → km, exaggerated ×12 so the ship is visible against Earth
  const ship = useRef<THREE.Group>(null)
  const tanker = useRef<THREE.Group>(null)
  const { scene } = useThree()
  const state = useMemo(() => ({ ang: 0, init: false }), [])

  useFrame(({ camera }, dt) => {
    const { result, t, playing } = useAppStore.getState()
    scene.background = new THREE.Color('#02040a')
    if (scene.fog) (scene.fog as THREE.Fog).color.set('#02040a')
    if (playing) state.ang += dt * 0.03
    const r = EARTH_R + ALT
    const pos = new THREE.Vector3(Math.cos(state.ang) * r, 0, Math.sin(state.ang) * r)
    if (ship.current) {
      ship.current.position.copy(pos)
      // fly "horizontal": nose along the velocity direction, belly toward Earth
      const vel = new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang))
      const up = pos.clone().normalize()
      const m = new THREE.Matrix4().makeBasis(up.clone().cross(vel).negate(), vel, up)
      ship.current.quaternion.setFromRotationMatrix(m)
    }
    // tanker rendezvous around each docking event
    if (tanker.current && result?.leo) {
      const docks = result.leo.events.filter((e) => e.label.startsWith('Tanker'))
      const next = docks.find((e) => Math.abs(e.t - t) < 2.5 * 86_400)
      if (next && vehicle.refuelable) {
        const f = (t - next.t) / (2.5 * 86_400) // -1 → 1
        const off = f < 0 ? -Math.pow(-f, 1.5) * 6 : Math.pow(f, 1.5) * 6
        tanker.current.visible = true
        const side = pos.clone().normalize().cross(new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang))).normalize()
        tanker.current.position.copy(pos).add(side.multiplyScalar(0.18 + Math.abs(off)))
        tanker.current.quaternion.copy(ship.current!.quaternion)
      } else tanker.current.visible = false
    }
    // chase camera: behind, above and to the side, looking forward along the orbit so the horizon shows
    const dist = L * SCALE * 3.0
    const vel = new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang))
    const upv = pos.clone().normalize()
    const side = upv.clone().cross(vel).normalize()
    const camTarget = pos.clone().add(vel.clone().multiplyScalar(-dist * 0.9)).add(upv.clone().multiplyScalar(dist * 0.5)).add(side.multiplyScalar(dist * 0.7))
    if (!state.init) {
      camera.position.copy(camTarget)
      state.init = true
    } else camera.position.lerp(camTarget, 0.1)
    camera.up.copy(upv)
    camera.lookAt(pos.clone().add(vel.clone().multiplyScalar(dist * 0.3)))
    camera.near = 0.01
    camera.far = 40_000
    camera.updateProjectionMatrix()
  })

  return (
    <group>
      <Earth />
      <group ref={ship}>
        <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
          <VehicleRig id={vehicleId} mode="orbit" />
        </group>
      </group>
      {vehicle.refuelable && (
        <group ref={tanker} visible={false}>
          <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
            <VehicleRig id={vehicleId} mode="orbit" />
          </group>
        </group>
      )}
      <directionalLight position={[20_000, 8_000, 10_000]} intensity={2.5} color="#fff4e6" />
      <directionalLight position={[-8_000, 12_000, -15_000]} intensity={1.2} color="#9fc0ff" />
      <ambientLight intensity={0.35} color="#8fb0e0" />
    </group>
  )
}
