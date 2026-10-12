import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { VehicleModel } from './vehicles'

function Pad() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[400, 64]} />
        <meshStandardMaterial color="#3b3a36" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#4a4d50" roughness={1} />
      </mesh>
    </group>
  )
}

export default function Scene() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const h = vehicle.height
  return (
    <Canvas shadows camera={{ position: [h * 1.6, h * 0.55, h * 1.3], fov: 35, near: 0.5, far: 5000 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#070b12']} />
      <fog attach="fog" args={['#070b12', 600, 1800]} />
      <hemisphereLight args={['#8fa4c2', '#3a332c', 1.1]} />
      <directionalLight position={[180, 260, 120]} intensity={3.2} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={160} shadow-camera-bottom={-40} shadow-camera-far={900} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
          <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
          <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
        </Environment>
      </Suspense>
      <Stars radius={900} depth={200} count={4000} factor={6} saturation={0} fade speed={0.2} />
      <Pad />
      <VehicleModel id={vehicleId} />
      <OrbitControls target={[0, h * 0.45, 0]} enablePan={false} autoRotate autoRotateSpeed={0.5} minDistance={h * 0.4} maxDistance={h * 4} maxPolarAngle={Math.PI / 2 - 0.02} />
    </Canvas>
  )
}
