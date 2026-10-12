import { useEffect, useMemo, useRef } from 'react'
import Scene from '../scene/Scene'
import { PHASE_RATE, useAppStore } from '../state/store'
import { fmtT } from './format'
import { hudAt } from './hud'

const SPEEDS = [0.25, 0.5, 1, 2, 4, 10]

export default function Stage() {
  const result = useAppStore((s) => s.result)
  const t = useAppStore((s) => s.t)
  const playing = useAppStore((s) => s.playing)
  const speed = useAppStore((s) => s.speed)
  const setT = useAppStore((s) => s.setT)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const setSpeed = useAppStore((s) => s.setSpeed)
  const reset = useAppStore((s) => s.reset)
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
  }, [result, playing, speed, setT, setPlaying])

  const hud = useMemo(() => (result ? hudAt(result, t) : null), [result, t])
  const end = result ? result.phases[result.phases.length - 1].end : 1

  return (
    <main className="stage">
      <Scene />
      {result && hud && (
        <div className="hud">
          <div className="hud__phase">{hud.phaseLabel}</div>
          <div className="hud__time">{fmtT(t)}</div>
          <dl className="hud__lines">
            {hud.lines.map((l) => (
              <div key={l.label} className={`hud__line ${l.tone ? `hud__line--${l.tone}` : ''}`}>
                <dt>{l.label}</dt>
                <dd>{l.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {result && (
        <div className="playbar">
          <button className="playbar__btn" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❚❚' : '▶'}
          </button>
          <button className="playbar__btn" onClick={reset} aria-label="Restart">
            ↺
          </button>
          <div className="phasestrip" role="group" aria-label="Mission phases">
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
                  <span className="phase__fill" style={{ width: `${frac * 100}%` }} />
                  <span className="phase__label">{p.label}</span>
                </button>
              )
            })}
          </div>
          <div className="speeds">
            {SPEEDS.map((s) => (
              <button key={s} className={`speed ${speed === s ? 'speed--on' : ''}`} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
          </div>
          <span className="playbar__end">{fmtT(end)}</span>
        </div>
      )}
    </main>
  )
}
