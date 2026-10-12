import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { phaseAt, useAppStore } from '../state/store'
import AscentScene from './AscentScene'
import CruiseScene from './CruiseScene'
import EntryScene from './EntryScene'
import OrbitScene from './OrbitScene'

export default function Scene() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const result = useAppStore((s) => s.result)
  const t = useAppStore((s) => s.t)
  const phase = result ? phaseAt(result, t).phase : 'ascent'
  const view = phase === 'ascent' ? 'ascent' : phase === 'leo' || phase === 'tmi' ? 'orbit' : phase === 'cruise' ? 'cruise' : 'entry'

  return (
    <Canvas shadows camera={{ position: [200, 60, 200], fov: 35, near: 0.5, far: 600_000 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#070b12']} />
      <fog attach="fog" args={['#070b12', 2000, 60_000]} />
      <hemisphereLight args={['#8fa4c2', '#3a332c', 1.0]} />
      <directionalLight position={[180, 260, 120]} intensity={3.0} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-120} shadow-camera-right={120} shadow-camera-top={160} shadow-camera-bottom={-40} shadow-camera-far={900} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
          <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
          <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
        </Environment>
      </Suspense>
      <Stars radius={200_000} depth={50_000} count={3000} factor={600} saturation={0} fade speed={0.1} />
      {view === 'ascent' && <AscentScene vehicleId={vehicleId} />}
      {view === 'orbit' && <OrbitScene vehicleId={vehicleId} />}
      {view === 'cruise' && <CruiseScene />}
      {view === 'entry' && <EntryScene vehicleId={vehicleId} />}
    </Canvas>
  )
}
