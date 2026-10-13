import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Stars } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import { phaseAt, useAppStore } from '../state/store'
import { QUALITY, lowerQuality } from './quality'
import AscentScene from './AscentScene'
import CruiseScene from './CruiseScene'
import EntryScene from './EntryScene'
import OrbitScene from './OrbitScene'
import { prewarmMars } from './MarsSurface'
import { ViewControls } from './viewControl'
import { AudioDriver } from '../audio/AudioDriver'
import { PerfProbe } from './PerfProbe'

/**
 * Measures the frame time through the opening screens (the pad scene is already up behind them)
 * and steps the graphics tier down if the device cannot hold 30 fps — once per tier, never when
 * the viewer pinned a tier, and only in the normal opening flow (not on deep links).
 */
function AdaptiveQuality() {
  const samples = useRef<number[]>([])
  const last = useRef(0)
  const started = useRef(0)
  useFrame(() => {
    const { intro, quality, qualityPinned, setQuality } = useAppStore.getState()
    const now = performance.now()
    if (qualityPinned || quality === 'low' || !intro || intro === 'countdown') {
      last.current = 0
      return
    }
    if (!started.current) started.current = now
    if (last.current) {
      // skip the first seconds: shaders compile and textures upload while the screen settles
      if (now - started.current > 2500) samples.current.push(now - last.current)
    }
    last.current = now
    if (samples.current.length >= 90) {
      const sorted = [...samples.current].sort((a, b) => a - b)
      const median = sorted[sorted.length >> 1]
      samples.current = []
      started.current = now
      if (median > 34) setQuality(lowerQuality(quality))
    }
  })
  return null
}

export default function Scene() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const quality = useAppStore((s) => s.quality)
  const q = QUALITY[quality]
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
    <Canvas key={quality} shadows={q.shadowMap > 0} camera={{ position: [200, 60, 200], fov: 35, near: 0.5, far: 600_000 }} dpr={[1, q.dpr]} gl={{ logarithmicDepthBuffer: q.logDepth, antialias: q.antialias, powerPreference: 'high-performance' }}>
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
      <AudioDriver />
      <PerfProbe />
      <AdaptiveQuality />
      {view !== 'ascent' && <Stars radius={200_000} depth={50_000} count={3000} factor={600} saturation={0} fade speed={0.1} />}
      {view === 'ascent' && <AscentScene vehicleId={vehicleId} />}
      {view === 'orbit' && <OrbitScene vehicleId={vehicleId} />}
      {view === 'cruise' && <CruiseScene />}
      {view === 'entry' && <EntryScene vehicleId={vehicleId} />}
    </Canvas>
  )
}
