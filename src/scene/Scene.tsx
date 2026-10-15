import { Canvas, advance, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { MissionResult } from '../sim/types'
import { PHASE_RATE, effectiveSpeed, phaseAt, useAppStore } from '../state/store'
import { entryAt, momentsAt, playbackRate, type Moment } from '../ui/hud'
import { QUALITY, lowerQuality } from './quality'
import AscentScene from './AscentScene'
import CruiseScene from './CruiseScene'
import EntryScene from './EntryScene'
import OrbitScene from './OrbitScene'
import { prewarmMars } from './MarsSurface'
import { ViewControls, view as viewInput } from './viewControl'
import { AudioDriver } from '../audio/AudioDriver'
import { PerfProbe } from './PerfProbe'
import { Prewarm, SkyStars } from './Prewarm'
import { globalEnv } from './warm'

/**
 * The probe's state (see AdaptiveQuality): measuring right now (the frames go uncapped), done for
 * good, or settled for the stretch it last measured (the opening screens, the climb).
 */
const probe = { measuring: false, done: false, settled: null as null | 'opening' | 'climb' }

/** on the low tier, a device that still cannot keep up renders fewer pixels: these fractions of the CSS pixel */
const DPR_STEPS = [1, 0.8, 0.67]

/**
 * The frames a second this moment is worth. A phone pays for every frame in heat, so: uncapped only
 * while the probe measures; the tier's cap while the mission plays; less on the opening screens
 * (the pad only has to look alive behind the text) and when paused with nobody touching the view;
 * almost nothing under a full-screen panel (the wiki, the scoreboard, a side panel on a phone).
 */
function frameRate(now: number): number {
  const s = useAppStore.getState()
  const q = QUALITY[s.quality]
  if (probe.measuring) return 1000
  if (s.wiki || s.board || (s.drawer && innerWidth <= 820)) return 4
  if (s.intro === 'start' || s.intro === 'pick') return q.fpsIdle
  if (!s.playing && !s.intro && !viewInput.dragging && now - viewInput.lastInput > 1500) return Math.min(q.fps, 15)
  return q.fps
}

/**
 * The frame loop. The canvas runs with frameloop="never" and this decides when a frame happens:
 * the playback clock, the scenes' per-frame work and the render together, at most `frameRate`
 * times a second — a 120 Hz phone no longer runs the scenes' JavaScript 120 times a second to show
 * 30 frames. (Before, the clock and every useFrame ran on each display refresh and only the render
 * was capped.)
 */
function Pacer() {
  useEffect(() => {
    let raf = 0
    let last = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // a little slack so a 60 Hz display lands on every other refresh for a 30 fps cap
      if (last && now - last < 1000 / frameRate(now) - 3) return
      last = now
      advance(now / 1000)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return null
}

/**
 * The mission clock, first in every frame: each phase advances at its natural rate × the chosen
 * speed, dropped to real time around the moments that matter (ui/hud.ts: playbackRate).
 */
function Playback() {
  const memo = useRef<{ result: MissionResult | null; moments: Moment[] }>({ result: null, moments: [] })
  useFrame((_, rawDt) => {
    const { result, playing, speed, t: cur, setT, setPlaying } = useAppStore.getState()
    if (!result || !playing) return
    if (memo.current.result !== result) memo.current = { result, moments: momentsAt(result) }
    // at 4 frames a second under a panel the clock still keeps real pace; after a stall it does not leap
    const dt = Math.min(0.3, rawDt)
    const end = result.phases[result.phases.length - 1].end
    const phase = result.phases.find((p) => cur >= p.start && cur < p.end) ?? result.phases[result.phases.length - 1]
    const alt = phase.phase === 'entry' ? entryAt(result, cur)?.alt : undefined
    const base = PHASE_RATE[phase.phase] * effectiveSpeed(phase.phase, cur - phase.start, speed, { alt, left: phase.end - cur })
    let next = cur + dt * playbackRate(base, cur, memo.current.moments, speed, phase).rate
    // never skip the end of a phase in one frame
    if (next > phase.end && cur < phase.end) next = phase.end + 1e-3
    if (next >= end) {
      setT(end)
      setPlaying(false)
      return
    }
    setT(next)
  }, -1)
  return null
}

/**
 * Measures the frame time (uncapped) through the opening screens — the pad scene is already up
 * behind them — and again through the first seconds of the climb, the heaviest scene, and steps
 * the graphics tier down while the device cannot hold 30 fps; on the low tier, a device that still
 * cannot hold 25 renders fewer pixels (DPR_STEPS). One verdict per stretch, so the opening is not
 * run flat out while someone reads it; never when the viewer pinned a tier; only in the normal
 * opening flow (not on deep links). High → medium keeps the canvas (pixel ratio, shadows, samples
 * and layers change in place); medium → low remounts it for the smaller textures and the plain
 * depth buffer.
 */
function AdaptiveQuality() {
  const samples = useRef<number[]>([])
  const last = useRef(0)
  const started = useRef(0)
  useFrame(() => {
    const { intro, quality, qualityPinned, setQuality, dprScale, setDprScale, result, t } = useAppStore.getState()
    const now = performance.now()
    const ascent = result?.phases[0]
    const climbing = !intro && !!ascent && t >= ascent.start && t < ascent.start + 40
    const stretch = intro === 'start' || intro === 'pick' ? 'opening' : climbing ? 'climb' : null
    const floor = quality === 'low' && dprScale <= DPR_STEPS[DPR_STEPS.length - 1]
    if (qualityPinned || floor || (!intro && !climbing)) probe.done = true
    if (probe.done || !stretch || probe.settled === stretch) {
      probe.measuring = false
      last.current = 0
      started.current = 0
      samples.current = []
      return
    }
    probe.measuring = true
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
      const nextScale = DPR_STEPS.find((x) => x < dprScale - 1e-6)
      if (quality !== 'low' && median > 34) setQuality(lowerQuality(quality))
      else if (quality === 'low' && median > 40 && nextScale) setDprScale(nextScale)
      else probe.settled = stretch
    }
  })
  return null
}

/** keeps the canvas's environment map (set just before this, by <Environment>) for the views built ahead */
function CaptureEnv() {
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    globalEnv.texture = scene.environment
  }, [scene])
  return null
}

/** the views after the climb are built ahead once the frame rate is no longer being measured */
const prewarmReady = () => !probe.measuring

/** the window's area in CSS pixels, following resizes and rotations */
function useViewportArea(): number {
  const [area, setArea] = useState(() => innerWidth * innerHeight)
  useEffect(() => {
    const on = () => setArea(innerWidth * innerHeight)
    addEventListener('resize', on)
    return () => removeEventListener('resize', on)
  }, [])
  return area
}

export default function Scene() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const quality = useAppStore((s) => s.quality)
  const dprScale = useAppStore((s) => s.dprScale)
  const q = QUALITY[quality]
  const area = useViewportArea()
  // the low tier's pixel budget (a tablet), then the probe's own step down for a device that still cannot keep up
  const scale = Math.min(dprScale, Math.sqrt(q.maxPixels / area))
  // subscribe to the derived view only, so the canvas tree does not re-render every frame
  const view = useAppStore((s) => {
    const phase = s.result ? phaseAt(s.result, s.t).phase : 'ascent'
    return phase === 'ascent' ? 'ascent' : phase === 'leo' || phase === 'tmi' ? 'orbit' : phase === 'cruise' ? 'cruise' : 'entry'
  })

  // Mars's maps (two DEMs decoded, the ground rasterised in a worker) are needed at entry: start
  // on them once the climb is over, not while a phone is still loading the opening
  useEffect(() => {
    if (view !== 'ascent') prewarmMars()
  }, [view])

  return (
    <>
    <Pacer />
    <Canvas key={`${q.antialias}-${q.logDepth}-${q.textures}`} frameloop="never" shadows={q.shadowMap > 0} camera={{ position: [200, 60, 200], fov: 35, near: 0.5, far: 600_000 }} dpr={scale < 1 ? q.dpr * scale : [1, q.dpr]} gl={{ logarithmicDepthBuffer: q.logDepth, antialias: q.antialias, powerPreference: quality === 'low' ? 'default' : 'high-performance' }}>
      <color attach="background" args={['#070b12']} />
      <fog attach="fog" args={['#070b12', 2000, 60_000]} />
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
          <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
          <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
        </Environment>
        <CaptureEnv />
      </Suspense>
      <Playback />
      <ViewControls />
      <AudioDriver />
      <PerfProbe />
      <AdaptiveQuality />
      {view !== 'ascent' && <SkyStars />}
      {view === 'ascent' && <AscentScene vehicleId={vehicleId} />}
      {view === 'orbit' && <OrbitScene vehicleId={vehicleId} />}
      {view === 'cruise' && <CruiseScene vehicleId={vehicleId} />}
      {view === 'entry' && <EntryScene vehicleId={vehicleId} />}
      <Prewarm vehicleId={vehicleId} ready={prewarmReady} />
    </Canvas>
    </>
  )
}
