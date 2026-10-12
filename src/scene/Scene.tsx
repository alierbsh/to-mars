import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import { phaseAt, useAppStore } from '../state/store'
import AscentScene from './AscentScene'
import CruiseScene from './CruiseScene'
import EntryScene from './EntryScene'
import OrbitScene from './OrbitScene'
import { prewarmMars } from './MarsSurface'
import { ViewControls } from './viewControl'

export default function Scene() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  // subscribe to the derived view only, so the canvas tree does not re-render every frame
  const view = useAppStore((s) => {
    const phase = s.result ? phaseAt(s.result, s.t).phase : 'ascent'
    return phase === 'ascent' ? 'ascent' : phase === 'leo' || phase === 'tmi' ? 'orbit' : phase === 'cruise' ? 'cruise' : 'entry'
  })

  useEffect(() => {
    const id = window.setTimeout(prewarmMars, 400)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <Canvas shadows camera={{ position: [200, 60, 200], fov: 35, near: 0.5, far: 600_000 }} dpr={[1, 1.5]} gl={{ logarithmicDepthBuffer: true, antialias: true }}>
      <color attach="background" args={['#070b12']} />
      <fog attach="fog" args={['#070b12', 2000, 60_000]} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
          <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
          <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
        </Environment>
      </Suspense>
      <ViewControls />
      <Stars radius={200_000} depth={50_000} count={3000} factor={600} saturation={0} fade speed={0.1} />
      {view === 'ascent' && <AscentScene vehicleId={vehicleId} />}
      {view === 'orbit' && <OrbitScene vehicleId={vehicleId} />}
      {view === 'cruise' && <CruiseScene />}
      {view === 'entry' && <EntryScene vehicleId={vehicleId} />}
    </Canvas>
  )
}
