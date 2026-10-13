import { useEffect, useRef } from 'react'
import Scene from '../scene/Scene'
import { PHASE_RATE, effectiveSpeed, useAppStore } from '../state/store'
import LowerThird from './LowerThird'

/** The stage is the whole screen: the 3D scene and the webcast-style lower third (gauges, clock, timeline, engines, controls). */
export default function Stage() {
  const result = useAppStore((s) => s.result)
  const playing = useAppStore((s) => s.playing)
  const speed = useAppStore((s) => s.speed)
  const setT = useAppStore((s) => s.setT)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const intro = useAppStore((s) => s.intro)
  const raf = useRef(0)
  const last = useRef(0)

  // playback loop: each phase advances at its own natural rate × speed
  useEffect(() => {
    if (!result || !playing) return
    const end = result.phases[result.phases.length - 1].end
    const step = (now: number) => {
      const dt = last.current ? Math.min(0.1, (now - last.current) / 1000) : 0
      last.current = now
      const cur = useAppStore.getState().t
      const phase = result.phases.find((p) => cur >= p.start && cur < p.end) ?? result.phases[result.phases.length - 1]
      let next = cur + dt * PHASE_RATE[phase.phase] * effectiveSpeed(phase.phase, cur - phase.start, speed)
      // never skip the end of a phase in one frame
      if (next > phase.end && cur < phase.end) next = phase.end + 1e-3
      if (next >= end) {
        setT(end)
        setPlaying(false)
        return
      }
      setT(next)
      raf.current = requestAnimationFrame(step)
    }
    last.current = 0
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [result, playing, speed, setT, setPlaying])

  const openSeq = useAppStore((s) => s.openSeq)

  return (
    <main className="stage">
      <Scene />
      {result && !intro && <LowerThird key={openSeq} />}
    </main>
  )
}
