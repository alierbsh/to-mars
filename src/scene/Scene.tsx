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

/** set once the probe has decided (or was skipped): the frame cap waits for it */
let probeDone = false

/**
 * Renders at most `fps` frames a second — half the GPU work on a phone, and on the opening
 * screens, where the pad only has to look alive behind the text, less again. Taking a render
 * priority makes this the loop's renderer; the animations still run every tick.
 */
function FrameCap() {
  const last = useRef(0)
  useFrame(({ gl, scene, camera }) => {
    const { intro, quality } = useAppStore.getState()
    const q = QUALITY[quality]
    const cap = !probeDone ? 1000 : intro ? q.fpsIdle : q.fps
    const now = performance.now()
    // a little slack so a 60 Hz loop lands on every other frame for a 30 fps cap
    if (now - last.current >= 1000 / cap - 3) {
      last.current = now
      gl.render(scene, camera)
    }
  }, 1)
  return null
}

/**
 * Measures the frame time through the opening screens (the pad scene is already up behind
 * them) and again through the first seconds of the climb — the heaviest scene — and steps the
 * graphics tier down if the device cannot hold 30 fps. Once per tier, never when the viewer
 * pinned a tier, and only in the normal opening flow (not on deep links). High → medium keeps
 * the canvas (pixel ratio, shadows, samples and layers change in place); medium → low remounts
 * it for the smaller textures and the plain depth buffer.
 */
function AdaptiveQuality() {
  const samples = useRef<number[]>([])
  const last = useRef(0)
  const started = useRef(0)
  useFrame(() => {
    const { intro, quality, qualityPinned, setQuality, result, t } = useAppStore.getState()
    const now = performance.now()
    const ascent = result?.phases[0]
    const climbing = !intro && ascent && t >= ascent.start && t < ascent.start + 40
    if (probeDone || qualityPinned || quality === 'low' || intro === 'countdown' || (!intro && !climbing)) {
      if (qualityPinned || quality === 'low' || (!intro && !climbing)) probeDone = true
      last.current = 0
      return
    }
    if (!started.current) started.current = now
    if (last.current) {
      // skip the first seconds: shaders compile and textures upload while the screen settles
      if (now - started.current > 2500) samples.current.push(now - last.current)
    }
    last.current = now
    // decide on 90 frames, or sooner when frames are so slow that 90 would take ages
    const n = samples.current.length
    if (n >= 90 || (n >= 8 && samples.current.reduce((a, b) => a + b, 0) > 2500)) {
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
    <Canvas key={`${q.antialias}-${q.logDepth}-${q.textures}`} shadows={q.shadowMap > 0} camera={{ position: [200, 60, 200], fov: 35, near: 0.5, far: 600_000 }} dpr={[1, q.dpr]} gl={{ logarithmicDepthBuffer: q.logDepth, antialias: q.antialias, powerPreference: 'high-performance' }}>
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
      <FrameCap />
      {view !== 'ascent' && <Stars radius={200_000} depth={50_000} count={3000} factor={600} saturation={0} fade speed={0.1} />}
      {view === 'ascent' && <AscentScene vehicleId={vehicleId} />}
      {view === 'orbit' && <OrbitScene vehicleId={vehicleId} />}
      {view === 'cruise' && <CruiseScene />}
      {view === 'entry' && <EntryScene vehicleId={vehicleId} />}
    </Canvas>
  )
}
