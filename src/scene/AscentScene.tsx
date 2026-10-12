/**
 * Launch & ascent: the vehicle stays at the origin, pitched by the simulated pitch; the ground
 * falls away at true scale and the sky darkens with altitude. A chase camera orbits slowly.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { ascentAt } from '../ui/hud'
import { VehicleRig } from './VehicleRig'

const SKY_LOW = new THREE.Color('#2a4a73')
const SKY_MID = new THREE.Color('#0f1d33')
const SKY_HIGH = new THREE.Color('#02040a')

export default function AscentScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const h = vehicle.height
  const rig = useRef<THREE.Group>(null)
  const ground = useRef<THREE.Group>(null)
  const { scene } = useThree()
  const camState = useMemo(() => ({ az: 0.6, init: false }), [])
  const bg = useMemo(() => new THREE.Color(), [])
  const cores = useMemo(() => vehicle.stages.filter((st) => st.role !== 'booster'), [vehicle])

  useFrame(({ camera }, dt) => {
    const { result, t, playing } = useAppStore.getState()
    const s = result ? ascentAt(result, t) : undefined
    const alt = s?.alt ?? 0
    const pitch = s ? (s.pitch * Math.PI) / 180 : 0
    if (rig.current) {
      // tilt toward +X (downrange); keep the pivot near the vehicle's centre of mass
      rig.current.rotation.z = -pitch
    }
    if (ground.current) ground.current.position.y = -alt
    // sky: pre-dawn blue at the pad → black above ~60 km
    const f = Math.min(1, alt / 60_000)
    bg.copy(f < 0.35 ? SKY_LOW.clone().lerp(SKY_MID, f / 0.35) : SKY_MID.clone().lerp(SKY_HIGH, (f - 0.35) / 0.65))
    scene.background = bg
    if (scene.fog) {
      ;(scene.fog as THREE.Fog).color.copy(bg)
    }
    // camera: slow orbit; frame whatever is still attached (zoom in after staging)
    if (playing) camState.az += dt * 0.06
    let bottom = 0
    if (result) {
      const p = result.phases.find((x) => x.phase === 'ascent')!
      const ta = t - p.start
      let acc = 0
      for (const st of cores) {
        const sep = result.ascent.stageTimes.find((x) => x.id === st.id)
        if (sep && ta > sep.sep + 6) {
          acc += st.length
          bottom = acc
        } else break
      }
    }
    const size = Math.max(h - bottom, 12)
    const centreModel = (bottom + h) / 2
    const centre = rig.current ? rig.current.localToWorld(new THREE.Vector3(0, centreModel - h * 0.5, 0)) : new THREE.Vector3(0, centreModel, 0)
    const dist = size * 2.1 + Math.min(size, alt / 600)
    const target = new THREE.Vector3(centre.x + Math.cos(camState.az) * dist, centre.y + size * 0.12, centre.z + Math.sin(camState.az) * dist)
    if (!camState.init) {
      camera.position.copy(target)
      camState.init = true
    } else camera.position.lerp(target, 0.06)
    camera.lookAt(centre)
  })

  return (
    <group>
      {/* pivot at mid-height so the pitch rotates the vehicle about its centre */}
      <group ref={rig} position={[0, h * 0.5, 0]}>
        <group position={[0, -h * 0.5, 0]}>
          <VehicleRig id={vehicleId} mode="ascent" />
        </group>
      </group>
      <group ref={ground}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <circleGeometry args={[300_000, 96]} />
          <meshStandardMaterial color="#2f3330" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[60, 64]} />
          <meshStandardMaterial color="#4a4d50" roughness={1} />
        </mesh>
        {/* launch mount legs */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} position={[Math.cos((i / 6) * Math.PI * 2) * (vehicle.stages[0].diameter / 2 + 3), -5, Math.sin((i / 6) * Math.PI * 2) * (vehicle.stages[0].diameter / 2 + 3)]}>
            <boxGeometry args={[1.6, 10, 1.6]} />
            <meshStandardMaterial color="#2b2e33" roughness={0.8} metalness={0.5} />
          </mesh>
        ))}
        {/* tower */}
        <mesh position={[-(vehicle.stages[0].diameter / 2 + 14), h * 0.58, 0]}>
          <boxGeometry args={[7, h * 1.16, 7]} />
          <meshStandardMaterial color="#3a3d42" roughness={0.8} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
