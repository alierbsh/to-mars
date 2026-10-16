/**
 * The lower third, in the register of a launch webcast: two round gauges on the left (speed and
 * altitude in flight; the campaign in orbit; the distances in cruise), the T+ clock and the
 * mission timeline in the middle (one line, the phases along it, the major events as marks, the
 * present as a moving dot), the vehicle's engine status and the propellant bars on the right,
 * and the playback controls tucked under them. It opens the way a broadcast overlay does: the
 * rings draw themselves, the arcs sweep round to the live values, the timeline draws from the
 * left, the engines light one after another.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import type { MissionResult, Stage as StageDef, Vehicle } from '../sim/types'
import { useAppStore, useThrottledT } from '../state/store'
import { useT, type Bundle } from '../i18n'
import { fmtT } from './format'
import { burningAt, dialsAt, hudAt, markLabel, marksAt, momentAt, momentLabel, momentsAt, propFractionAt, type Dial as DialData } from './hud'
import { chapterForMark } from '../wiki/chapters'

const SPEEDS = [0.5, 1, 2, 4, 10]
const STILL = typeof location !== 'undefined' && new URLSearchParams(location.search).get('still') === '1'

const R = 36
const C = 2 * Math.PI * R

function Dial({ d, open }: { d: DialData; open: boolean }) {
  const frac = open ? d.frac : 0
  return (
    <div className="dial">
      <svg className="dial__svg" viewBox="0 0 84 84" aria-hidden="true">
        <circle className="dial__ring" cx="42" cy="42" r={R} style={{ strokeDasharray: C }} />
        <circle className="dial__arc" cx="42" cy="42" r={R} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - frac) }} />
      </svg>
      <div className="dial__inner">
        <span className="dial__value">{d.text}</span>
        <span className="dial__unit">{d.unit}</span>
      </div>
      <span className="dial__label">{d.label}</span>
    </div>
  )
}

/** ring layouts for n engines, as unit-circle positions */
function engineLayout(n: number): Array<[number, number]> {
  const ring = (count: number, r: number, phase = 0) => Array.from({ length: count }, (_, i) => [Math.cos(phase + (i / count) * Math.PI * 2) * r, Math.sin(phase + (i / count) * Math.PI * 2) * r] as [number, number])
  if (n === 1) return [[0, 0]]
  if (n === 2) return [[-0.45, 0], [0.45, 0]]
  if (n === 3) return ring(3, 0.5, -Math.PI / 2)
  if (n === 4) return ring(4, 0.55, Math.PI / 4)
  if (n === 5) return [[0, 0], ...ring(4, 0.65, Math.PI / 4)]
  if (n === 6) return [...ring(3, 0.32, -Math.PI / 2), ...ring(3, 0.78, Math.PI / 6)]
  if (n === 7) return [[0, 0], ...ring(6, 0.68)]
  if (n === 9) return [[0, 0], ...ring(8, 0.7, Math.PI / 8)]
  if (n === 33) return [...ring(3, 0.2, -Math.PI / 2), ...ring(10, 0.55), ...ring(20, 0.9, Math.PI / 20)]
  // anything else: concentric rings of ~6 per unit radius
  const out: Array<[number, number]> = [[0, 0]]
  let left = n - 1
  let r = 0.45
  while (left > 0) {
    const k = Math.min(left, Math.round(r * 14))
    out.push(...ring(k, r))
    left -= k
    r += 0.32
  }
  return out
}

interface EngineUnit {
  key: string
  stageId: string
  label: string
  n: number
  pts: Array<[number, number]>
}

function unitsFor(vehicle: Vehicle, L: Bundle): EngineUnit[] {
  const out: EngineUnit[] = []
  const U = L.ui.lower
  const name = (s: StageDef, i: number, copies: number) => {
    if (vehicle.id === 'starship-v3') return s.id === 'ship' ? U.ship : U.booster
    if (s.role === 'booster') return copies > 1 ? U.boosterN({ n: i + 1 }) : U.booster
    // the stages in firing order: the first is the core, then stage 2, stage 3 (Saturn V's S-II, Long March 10's second stage)
    const k = vehicle.stages.filter((x) => x.role !== 'booster').indexOf(s)
    return k <= 0 ? U.core : k === 1 ? U.stage2 : U.stage3
  }
  for (const s of vehicle.stages) {
    const n = s.engines.reduce((a, e) => a + e.count, 0)
    const copies = s.count ?? 1
    for (let i = 0; i < copies; i++) out.push({ key: `${s.id}-${i}`, stageId: s.id, label: name(s, i, copies), n, pts: engineLayout(n) })
  }
  // boosters flank the core in the row
  const boosters = out.filter((u) => vehicle.stages.find((s) => s.id === u.stageId)?.role === 'booster')
  const rest = out.filter((u) => !boosters.includes(u))
  if (boosters.length === 2) return [boosters[0], ...rest, boosters[1]]
  return [...boosters, ...rest]
}

function Engines({ result, vehicle, t, open }: { result: MissionResult; vehicle: Vehicle; t: number; open: boolean }) {
  const L = useT()
  const units = useMemo(() => unitsFor(vehicle, L), [vehicle, L])
  const preIgnition = useAppStore((s) => s.intro) !== null
  const burning = useMemo(() => burningAt(result, vehicle, t, preIgnition), [result, vehicle, t, preIgnition])
  const ascent = result.phases[0]
  const inAscent = t < ascent.end
  let k = 0
  return (
    <div className="eng">
      {units.map((u) => {
        const on = burning.has(u.stageId)
        const prop = inAscent ? propFractionAt(result, vehicle, u.stageId, t) : 0
        const sep = result.ascent.stageTimes.find((x) => x.id === u.stageId)
        const gone = sep !== undefined && t - ascent.start > sep.sep
        const size = u.n > 20 ? 54 : u.n > 6 ? 46 : 38
        const dot = u.n > 20 ? 5 : u.n > 6 ? 7 : 9
        return (
          <div key={u.key} className={`eng__unit ${gone ? 'eng__unit--gone' : ''}`}>
            <div className="eng__grid" style={{ width: size, height: size }}>
              {u.pts.map(([x, y], i) => {
                const delay = open ? 0.6 + 0.02 * k++ : 0
                return <span key={i} className={`eng__dot ${on ? 'eng__dot--on' : ''}`} style={{ width: dot, height: dot, left: `calc(50% + ${(x * (size - dot)) / 2}px - ${dot / 2}px)`, top: `calc(50% + ${(y * (size - dot)) / 2}px - ${dot / 2}px)`, animationDelay: `${delay}s` }} />
              })}
            </div>
            <span className="eng__label">{u.label}</span>
            <span className="eng__prop" title={L.ui.lower.propellant}>
              <span className="eng__propfill" style={{ width: `${(gone ? 0 : prop) * 100}%` }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** a label's width in px, estimated: tracked capitals at `latin` px per character; Han and Devanagari (set larger, untracked) */
function textWidth(s: string, latin: number, han: number, deva: number): number {
  let w = 0
  for (const ch of s) w += /[\u3000-\u9fff\uff00-\uffef]/.test(ch) ? han : /[\u0900-\u097f]/.test(ch) ? deva : latin
  return w
}
/** a mark's name (8.5 px), a phase's label under the line (9.5 px) */
const nameWidth = (s: string) => textWidth(s, 6.6, 10.5, 5)
const phaseLabelWidth = (s: string) => textWidth(s, 7.6, 11, 5.5)

function Timeline({ result, t, onSeek }: { result: MissionResult; t: number; onSeek: (t: number) => void }) {
  const L = useT()
  const marks = useMemo(() => marksAt(result), [result])
  // the timeline's width, to keep the marks' names from running into each other
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const openWiki = useAppStore((s) => s.openWiki)
  const phases = result.phases
  const n = phases.length
  // the phase under way opens wide (like a webcast's flight timeline); the others share the rest
  const activeIdx = Math.max(0, phases.findIndex((p) => t >= p.start && t < p.end) === -1 ? n - 1 : phases.findIndex((p) => t >= p.start && t < p.end))
  const WIDE = 0.46
  const layout = useMemo(() => {
    const w = phases.map((_, i) => (i === activeIdx ? WIDE : (1 - WIDE) / (n - 1)))
    const left: number[] = []
    let x = 0
    for (const wi of w) {
      left.push(x)
      x += wi
    }
    return { w, left }
  }, [phases, n, activeIdx])
  const fracOf = (time: number) => {
    let i = phases.findIndex((p) => time >= p.start && time < p.end)
    if (i < 0) i = n - 1
    const p = phases[i]
    const f = Math.max(0, Math.min(1, (time - p.start) / Math.max(p.end - p.start, 1)))
    return layout.left[i] + f * layout.w[i]
  }
  const now = fracOf(t)
  // the phases' labels under the line: the one under way always, the others where they do not run
  // into a label already shown (narrow screens, long words)
  const showPhase = new Set<number>()
  {
    const spans: Array<[number, number]> = []
    const span = (i: number): [number, number] => {
      const x = layout.left[i] * width
      const half = phaseLabelWidth(L.ui.lower.phases[phases[i].phase]) / 2
      return [x - half, x + half]
    }
    for (const i of [activeIdx, ...phases.map((_, i) => i).filter((i) => i !== activeIdx)]) {
      const [a, b] = span(i)
      if (i !== activeIdx && spans.some(([c, d]) => a < d + 14 && b > c - 14)) continue
      spans.push([a, b])
      showPhase.add(i)
    }
  }
  // the names of the phase under way: above or below the line, alternating, each where it does not
  // overlap the one before it on that row — or not at all
  const place = new Map<number, { low: boolean; named: boolean }>()
  const right = [-Infinity, -Infinity]
  let k = 0
  marks.forEach((m, i) => {
    if (phases[activeIdx].phase !== m.phase) return
    const x = fracOf(m.t) * width
    const half = nameWidth(markLabel(m, L)) / 2
    const pref = k++ % 2
    for (const row of [pref, 1 - pref]) {
      if (x - half >= right[row] + 6) {
        right[row] = x + half
        place.set(i, { low: row === 1, named: true })
        return
      }
    }
    place.set(i, { low: pref === 1, named: false })
  })
  return (
    <div className="tl" ref={box}>
      <div className="tl__line" />
      <div className="tl__fill" style={{ width: `${now * 100}%` }} />
      <div className="tl__phases">
        {phases.map((p, i) => {
          const active = i === activeIdx
          const done = t >= p.end
          return (
            <button
              key={p.phase}
              className={`tl__phase ${active ? 'tl__phase--active' : ''} ${done ? 'tl__phase--done' : ''}`}
              style={{ left: `${layout.left[i] * 100}%`, width: `${layout.w[i] * 100}%` }}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                const f = (e.clientX - rect.left) / rect.width
                onSeek(p.start + f * (p.end - p.start))
              }}
              title={`${L.t(p.msg ?? p.label)}: ${fmtT(p.start, L)} → ${fmtT(p.end, L)}`}
            >
              <span className="tl__tick" />
              <span className="tl__phaselabel" style={showPhase.has(i) ? undefined : { visibility: 'hidden' }}>
                {L.ui.lower.phases[p.phase]}
              </span>
            </button>
          )
        })}
      </div>
      {marks.map((m, i) => {
        const f = fracOf(m.t)
        const past = t >= m.t
        const chapter = chapterForMark(m.key)
        const name = markLabel(m, L)
        // names sit above or below the line (the phase labels are a third row), only in the phase under way
        const { low, named } = place.get(i) ?? { low: false, named: false }
        return (
          <span key={`${m.key}-${m.n ?? ''}-${i}`} className={`tl__mark tl__mark--${m.tone} ${past ? 'tl__mark--past' : ''} ${low ? 'tl__mark--low' : ''} ${named ? 'tl__mark--named' : ''}`} style={{ left: `${f * 100}%`, animationDelay: `${0.9 + i * 0.05}s` }}>
            <span className="tl__dot" />
            {chapter ? (
              <button className="tl__name tl__name--link" onClick={() => openWiki(chapter.id)} title={L.ui.lower.wikiTitle({ title: L.wiki[chapter.id].title })}>
                {name}
              </button>
            ) : (
              <span className="tl__name">{name}</span>
            )}
          </span>
        )
      })}
      <span className="tl__now" style={{ left: `${now * 100}%` }} />
    </div>
  )
}

export default function LowerThird() {
  const L = useT()
  const result = useAppStore((s) => s.result)
  const t = useThrottledT(12)
  const playing = useAppStore((s) => s.playing)
  const speed = useAppStore((s) => s.speed)
  const setT = useAppStore((s) => s.setT)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const setSpeed = useAppStore((s) => s.setSpeed)
  const reset = useAppStore((s) => s.reset)
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  // the opening: one frame closed, then everything animates in
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 30)
    return () => window.clearTimeout(id)
  }, [])
  if (!result) return null
  const hud = hudAt(result, t, L)
  const moments = useMemo(() => momentsAt(result), [result])
  const moment = momentAt(moments, t)
  const [d1, d2] = dialsAt(result, t, L)
  const third = hud.lines[2]
  const end = result.phases[result.phases.length - 1].end
  // the clock: T+ through the launch, the mission day in between, E+ from the entry interface
  const phase = hud.phase
  const entry = result.phases.find((p) => p.phase === 'entry')
  const mmss = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s - m * 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }
  const afterEntry = !!entry && (phase === 'entry' || phase === 'landing' || phase === 'done')
  const main = afterEntry ? `E+${mmss(Math.max(0, t - entry.start))}` : fmtT(t, L)
  // after the entry interface the mission day stays as large as the clock beside it; before, the end
  const sub = afterEntry ? fmtT(t, L) : L.ui.lower.of({ end: fmtT(end, L) })

  return (
    <div className={`lower ${open ? 'lower--open' : ''} ${STILL ? 'lower--still' : ''}`}>
      <div className="lower__dials">
        <Dial d={d1} open={open} />
        <Dial d={d2} open={open} />
        {third && (
          <div className={`lower__third ${third.tone ? `lower__third--${third.tone}` : ''}`}>
            <span className="lower__thirdvalue">{third.value}</span>
            <span className="lower__thirdlabel">{third.label}</span>
          </div>
        )}
      </div>
      <div className="lower__centre">
        <div className={`lower__clock ${afterEntry ? 'lower__clock--day' : ''} ${moment ? 'lower__clock--moment' : ''}`}>
          {moment ? <span className="lower__phase lower__phase--moment">{momentLabel(moment, L)}</span> : <span className="lower__phase">{hud.phaseLabel}</span>}
          <span className="lower__t">{main}</span>
          <span className={afterEntry ? 'lower__t lower__t--day' : 'lower__end'}>{sub}</span>
        </div>
        <Timeline result={result} t={t} onSeek={setT} />
      </div>
      <div className="lower__right">
        <Engines result={result} vehicle={vehicle} t={t} open={open} />
        <div className="lower__controls">
          <button className="ctl ctl--main" onClick={() => setPlaying(!playing)} aria-label={playing ? L.ui.lower.pause : L.ui.lower.play}>
            {playing ? (
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor" /></svg>
            )}
          </button>
          <button className="ctl" onClick={reset} aria-label={L.ui.lower.restart}>
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.5 2.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 2v4h4" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
          </button>
          <div className="speeds" role="group" aria-label={L.ui.lower.speed}>
            {SPEEDS.map((s) => (
              <button key={s} className={`speed ${speed === s ? 'speed--on' : ''}`} onClick={() => setSpeed(s)}>
                {L.n.n(s)}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
