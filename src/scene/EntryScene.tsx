/**
 * Mars entry, descent and landing: the spacecraft at the origin (belly-first or heat-shield-first),
 * plasma glow scaled by heat flux, the flip to vertical for the landing burn, the ground rising,
 * a butterscotch sky near the surface. A crash ends in a flash.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { entryAt } from '../ui/hud'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'

const SKY_HIGH = new THREE.Color('#02040a')
const SKY_LOW = new THREE.Color('#b8864f')

export default function EntryScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 20
  const isShip = vehicle.spacecraft.entry?.kind === 'ship'
  const rig = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Mesh>(null)
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
    if (ground.current) ground.current.position.y = -Math.max(alt, 0) - (isShip && st.flip < 0.5 ? L / 2 : 0)
    // glow from heating
    if (glow.current && result?.entry) {
      const q = e?.heatFlux ?? 0
      const limit = vehicle.spacecraft.entry?.tpsLimit ?? 50
      const k = Math.min(1.2, q / (0.6 * limit))
      ;(glow.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * k
      glow.current.visible = k > 0.03 && !(ended && crashed)
      glow.current.scale.set(L * 0.9, L * 0.9, L * 0.9)
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
    // sky
    const f = Math.min(1, Math.max(0, 1 - alt / 70_000))
    bg.copy(SKY_HIGH).lerp(SKY_LOW, f * f)
    scene.background = bg
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(bg)
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
    camera.far = 500_000
    camera.updateProjectionMatrix()
  })

  return (
    <group>
      <group ref={rig}>
        <group position={[0, -(SPACECRAFT_BASE[vehicleId] ?? 0), 0]}>
          <VehicleRig id={vehicleId} mode="entry" />
        </group>
      </group>
      <mesh ref={glow}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#ffb070" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={flash} visible={false}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ffcc88" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={ground}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[400_000, 96]} />
          <meshStandardMaterial color="#9a5a36" roughness={1} />
        </mesh>
        {/* a few rocks for scale near the touchdown point */}
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i * 2.399) % (Math.PI * 2)
          const r = 30 + ((i * 37) % 200)
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.4, Math.sin(a) * r]}>
              <dodecahedronGeometry args={[0.6 + (i % 4) * 0.5, 0]} />
              <meshStandardMaterial color="#6e3d25" roughness={1} />
            </mesh>
          )
        })}
      </group>
      <directionalLight position={[300, 400, 200]} intensity={2.2} color="#ffe2c4" />
      <hemisphereLight args={['#d9b48a', '#4a2a1a', 0.7]} />
    </group>
  )
}

