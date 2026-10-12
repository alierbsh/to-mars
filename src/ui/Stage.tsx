import { useEffect, useMemo, useRef } from 'react'
import Scene from '../scene/Scene'
import { PHASE_RATE, useAppStore } from '../state/store'
import { fmtT } from './format'
import { hudAt } from './hud'

const SPEEDS = [0.5, 1, 2, 4, 10]
const SHORT: Record<string, string> = { ascent: 'Launch', leo: 'Orbit', tmi: 'TMI', cruise: 'Cruise', entry: 'EDL', landing: 'Landing', done: 'Done' }

/** The stage is the whole screen: the 3D scene, the live numbers (webcast style) and the mission bar. */
export default function Stage() {
  const result = useAppStore((s) => s.result)
  const t = useAppStore((s) => s.t)
  const playing = useAppStore((s) => s.playing)
  const speed = useAppStore((s) => s.speed)
  const setT = useAppStore((s) => s.setT)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const setSpeed = useAppStore((s) => s.setSpeed)
  const reset = useAppStore((s) => s.reset)
  const intro = useAppStore((s) => s.intro)
  const raf = useRef(0)
  const last = useRef(0)
  const lastPhase = useRef<string | null>(null)

  // playback loop: each phase advances at its own natural rate × speed
  useEffect(() => {
    if (!result || !playing) return
    const end = result.phases[result.phases.length - 1].end
    const step = (now: number) => {
      const dt = last.current ? Math.min(0.1, (now - last.current) / 1000) : 0
      last.current = now
      const cur = useAppStore.getState().t
      const phase = result.phases.find((p) => cur >= p.start && cur < p.end) ?? result.phases[result.phases.length - 1]
      // entry, descent and landing is the part that matters: slow the clock to 2× when it begins
      if (phase.phase === 'entry' && lastPhase.current !== 'entry' && lastPhase.current !== null && useAppStore.getState().speed > 2) setSpeed(2)
      lastPhase.current = phase.phase
      let next = cur + dt * PHASE_RATE[phase.phase] * speed
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
  }, [result, playing, speed, setT, setPlaying, setSpeed])

  const hud = useMemo(() => (result ? hudAt(result, t) : null), [result, t])
  const end = result ? result.phases[result.phases.length - 1].end : 1
  const big = hud ? hud.lines.slice(0, 3) : []

  return (
    <main className="stage">
      <Scene />
      {result && hud && !intro && (
        <div className="live" aria-live="off">
          <p className="label">{hud.phaseLabel}</p>
          <div className="live__row">
            <div className="live__clock">{fmtT(t)}</div>
            {big.map((l) => (
              <div key={l.label} className={`live__num ${l.tone ? `live__num--${l.tone}` : ''}`}>
                <span className="live__value">{l.value}</span>
                <span className="live__label">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && !intro && (
        <div className="bar">
          <button className="bar__btn" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
            )}
          </button>
          <button className="bar__btn bar__btn--ghost" onClick={reset} aria-label="Restart">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 2v4h4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <div className="phases" role="group" aria-label="Mission phases">
            {result.phases.map((p) => {
              const active = t >= p.start && t < p.end
              const done = t >= p.end
              const frac = active ? (t - p.start) / Math.max(p.end - p.start, 1) : done ? 1 : 0
              return (
                <button
                  key={p.phase}
                  className={`phase ${active ? 'phase--active' : ''} ${done ? 'phase--done' : ''}`}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const f = (e.clientX - rect.left) / rect.width
                    setT(p.start + f * (p.end - p.start))
                  }}
                  title={`${p.label}: ${fmtT(p.start)} → ${fmtT(p.end)}`}
                >
                  <span className="phase__track">
                    <span className="phase__fill" style={{ width: `${frac * 100}%` }} />
                  </span>
                  <span className="phase__label">{SHORT[p.phase] ?? p.label}</span>
                </button>
              )
            })}
          </div>
          <div className="speeds" role="group" aria-label="Playback speed">
            {SPEEDS.map((s) => (
              <button key={s} className={`speed ${speed === s ? 'speed--on' : ''}`} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
          <span className="bar__end">{fmtT(end)}</span>
        </div>
      )}
    </main>
  )
}
