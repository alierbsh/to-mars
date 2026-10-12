/**
 * Debug/showcase viewer: ?model=<vehicleId>&view=side|front|engines|nose&az=<deg>
 * Renders just the vehicle on a pad with a fixed camera — used for screenshot checks.
 */
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense } from 'react'
import { VEHICLES } from '../data/vehicles'
import { VehicleModel } from './vehicles'

export default function ModelViewer({ id, view, az }: { id: string; view: string; az: number }) {
  const v = VEHICLES.find((x) => x.id === id) ?? VEHICLES[0]
  const h = v.height
  const a = (az * Math.PI) / 180
  let pos: [number, number, number] = [Math.cos(a) * h * 2.0, h * 0.55, Math.sin(a) * h * 2.0]
  let target: [number, number, number] = [0, h * 0.5, 0]
  let fov = 32
  if (view === 'engines') {
    pos = [Math.cos(a) * h * 0.4, 1.5, Math.sin(a) * h * 0.4]
    target = [0, 4, 0]
    fov = 40
  } else if (view === 'nose') {
    pos = [Math.cos(a) * h * 0.45, h * 0.95, Math.sin(a) * h * 0.45]
    target = [0, h * 0.86, 0]
    fov = 35
  } else if (view === 'mid') {
    pos = [Math.cos(a) * h * 0.6, h * 0.55, Math.sin(a) * h * 0.6]
    target = [0, h * 0.55, 0]
    fov = 35
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0e14' }}>
      <Canvas shadows camera={{ position: pos, fov, near: 0.5, far: 5000 }} dpr={1} onCreated={({ camera }) => camera.lookAt(...target)}>
        <color attach="background" args={['#0d1420']} />
        <hemisphereLight args={['#8fa4c2', '#3a332c', 1.1]} />
        <directionalLight position={[180, 260, 120]} intensity={3.2} color="#fff1dc" castShadow />
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
            <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
            <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
          </Environment>
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[400, 64]} />
          <meshStandardMaterial color="#3b3a36" roughness={1} />
        </mesh>
        <VehicleModel id={v.id} />
      </Canvas>
    </div>
  )
}
