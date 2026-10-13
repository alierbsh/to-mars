import type { AscentSample, EntrySample, MissionResult, Phase, Vehicle } from '../sim/types'
import { PHASE_RATE, phaseAt } from '../state/store'
import { norm, sub } from '../sim/vec'
import { DAY_S } from '../sim/constants'

export interface HudLine {
  label: string
  value: string
  tone?: 'ok' | 'warn' | 'fail'
}

export interface HudState {
  phase: Phase
  phaseLabel: string
  lines: HudLine[]
  rate: number
  /** fraction through the current phase */
  frac: number
  /** vehicle state for the 3D scene */
  ascent?: AscentSample
  entry?: EntrySample
  cruiseIndex?: number
}

function interp<T extends { t: number }>(arr: T[], t: number): [T, T, number] | null {
  if (!arr.length) return null
  if (t <= arr[0].t) return [arr[0], arr[0], 0]
  if (t >= arr[arr.length - 1].t) return [arr[arr.length - 1], arr[arr.length - 1], 0]
  let lo = 0
  let hi = arr.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (arr[mid].t <= t) lo = mid
    else hi = mid
  }
  const f = (t - arr[lo].t) / Math.max(arr[hi].t - arr[lo].t, 1e-9)
  return [arr[lo], arr[hi], f]
}

const lerp = (a: number, b: number, f: number) => a + (b - a) * f

export function ascentAt(r: MissionResult, t: number): AscentSample | undefined {
  const p = r.phases.find((x) => x.phase === 'ascent')
  if (!p) return
  const s = interp(r.ascent.telemetry, t - p.start)
  if (!s) return
  const [a, b, f] = s
  return { ...a, t: lerp(a.t, b.t, f), alt: lerp(a.alt, b.alt, f), vel: lerp(a.vel, b.vel, f), velRel: lerp(a.velRel, b.velRel, f), mach: lerp(a.mach, b.mach, f), q: lerp(a.q, b.q, f), accel: lerp(a.accel, b.accel, f), mass: lerp(a.mass, b.mass, f), downrange: lerp(a.downrange, b.downrange, f), thrust: lerp(a.thrust, b.thrust, f), pitch: lerp(a.pitch, b.pitch, f) }
}

export function entryAt(r: MissionResult, t: number): EntrySample | undefined {
  const p = r.phases.find((x) => x.phase === 'entry')
  if (!p || !r.entry) return
  const s = interp(r.entry.telemetry, t - p.start)
  if (!s) return
  const [a, b, f] = s
  // after the phase (touchdown or impact) the engines are off and the vehicle is at rest
  const over = t >= p.end
  const onGround = over && (r.verdict.outcome === 'landed' || r.verdict.outcome === 'crashed')
  return { ...a, t: lerp(a.t, b.t, f), alt: onGround ? 0 : lerp(a.alt, b.alt, f), vel: over ? 0 : lerp(a.vel, b.vel, f), mach: over ? 0 : lerp(a.mach, b.mach, f), gLoad: over ? 0 : lerp(a.gLoad, b.gLoad, f), heatFlux: over ? 0 : lerp(a.heatFlux, b.heatFlux, f), heatLoad: lerp(a.heatLoad, b.heatLoad, f), mass: lerp(a.mass, b.mass, f), downrange: lerp(a.downrange, b.downrange, f), q: over ? 0 : lerp(a.q, b.q, f), fpa: lerp(a.fpa, b.fpa, f), burning: over ? false : f < 0.5 ? a.burning : b.burning }
}

export function hudAt(r: MissionResult, t: number): HudState {
  const p = phaseAt(r, t)
  const frac = Math.max(0, Math.min(1, (t - p.start) / Math.max(p.end - p.start, 1)))
  const lines: HudLine[] = []
  const out: HudState = { phase: p.phase, phaseLabel: p.label, lines, rate: PHASE_RATE[p.phase], frac }
  const fmt = (v: number, d = 0) => v.toFixed(d)
  if (p.phase === 'ascent') {
    const a = ascentAt(r, t)
    if (a) {
      out.ascent = a
      lines.push({ label: 'Speed', value: `${fmt(a.velRel)} m/s` })
      lines.push({ label: 'Altitude', value: `${fmt(a.alt / 1000, 1)} km` })
      lines.push({ label: 'Acceleration', value: `${fmt(t - p.start < 0.5 ? 1 : a.accel, 2)} g` })
      lines.push({ label: 'Mach', value: a.alt < 90_000 ? fmt(a.mach, 1) : '—' })
      lines.push({ label: 'Mass', value: `${fmt(a.mass / 1000)} t` })
      lines.push({ label: 'Dynamic pressure', value: `${fmt(a.q / 1000, 1)} kPa` })
    }
  } else if (p.phase === 'leo' && r.leo) {
    const days = (t - p.start) / DAY_S
    const docked = r.leo.events.filter((e) => e.label.startsWith('Tanker') && e.t <= t).length
    const propEv = [...r.leo.events].reverse().find((e) => e.t <= t && /→ (\d+) t aboard/.test(e.detail))
    const m = propEv?.detail.match(/→ (\d+) t aboard/)
    lines.push({ label: 'Propellant aboard', value: m ? `${m[1]} t` : `${fmt(r.ascent.residualProp / 1000)} t` })
    if (r.config.tankers > 0 && r.leo.tankersLaunched > 0) lines.push({ label: 'Tankers docked', value: `${docked} of ${r.leo.tankersLaunched}` })
    lines.push({ label: 'Orbit', value: r.ascent.orbit ? `${fmt(r.ascent.orbit.rp)} × ${fmt(r.ascent.orbit.ra)} km` : '—' })
    lines.push({ label: 'Day in orbit', value: fmt(days) })
  } else if (p.phase === 'tmi' && r.transfer) {
    lines.push({ label: 'Burn', value: 'trans-Mars injection' })
    lines.push({ label: 'Δv', value: `${r.transfer.dvTmi.toFixed(2)} km/s` })
    lines.push({ label: 'C3', value: `${r.transfer.c3.toFixed(1)} km²/s²` })
  } else if (p.phase === 'cruise' && r.transfer) {
    const days = (t - p.start) / DAY_S
    const n = r.transfer.samples.length
    const idx = Math.min(n - 1, Math.max(0, Math.floor((days / r.transfer.transitDays) * (n - 1))))
    out.cruiseIndex = idx
    const s = r.transfer.samples[idx]
    lines.push({ label: 'Day', value: `${fmt(days)} of ${r.transfer.transitDays}` })
    lines.push({ label: 'From Earth', value: `${fmt(norm(sub(s.ship, s.earth)) / 1e6, 1)} million km` })
    lines.push({ label: 'To Mars', value: `${fmt(norm(sub(s.ship, s.mars)) / 1e6, 1)} million km` })
    if (r.cruise && r.config.crew > 0) {
      lines.push({ label: 'Radiation so far', value: `${fmt((r.cruise.doseMsv * days) / r.cruise.days)} mSv`, tone: (r.cruise.doseMsv * days) / r.cruise.days > 300 ? 'warn' : undefined })
      if (r.cruise.consumablesRunOutDay !== null && days > r.cruise.consumablesRunOutDay) lines.push({ label: 'Life support', value: 'exhausted', tone: 'fail' })
    }
  } else if (p.phase === 'entry' || p.phase === 'landing') {
    const e = entryAt(r, t)
    if (e) {
      out.entry = e
      lines.push({ label: 'Speed', value: `${fmt(e.vel)} m/s` })
      lines.push({ label: 'Altitude', value: `${fmt(e.alt / 1000, 1)} km` })
      lines.push({ label: e.heatFlux > 2 ? 'Heat flux' : 'Deceleration', value: e.heatFlux > 2 ? `${fmt(e.heatFlux)} W/cm²` : `${fmt(e.gLoad, 1)} g`, tone: e.heatFlux > 2 ? (e.heatFlux > 40 ? 'warn' : undefined) : e.gLoad > r.config.gLimit ? 'fail' : e.gLoad > 0.8 * r.config.gLimit ? 'warn' : undefined })
      lines.push({ label: 'Mach', value: fmt(e.mach, 1) })
      lines.push({ label: 'Deceleration', value: `${fmt(e.gLoad, 1)} g` })
      lines.push({ label: e.burning ? 'Landing burn' : 'Engines', value: e.burning ? 'firing' : 'off' })
    }
  }
  return out
}

// ---------------------------------------------------------------- webcast overlay helpers

export interface Dial {
  label: string
  /** the number as shown */
  text: string
  unit: string
  /** 0–1 fill of the arc */
  frac: number
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const fmtInt = (v: number) => Math.round(v).toLocaleString('en-US')

/** the two round gauges of the lower third, per phase (speed/altitude in flight, the campaign in orbit, the distances in cruise) */
export function dialsAt(r: MissionResult, t: number): [Dial, Dial] {
  const p = phaseAt(r, t)
  if (p.phase === 'ascent') {
    const a = ascentAt(r, t)
    const v = a ? a.velRel * 3.6 : 0
    const alt = a ? a.alt / 1000 : 0
    return [
      { label: 'Speed', text: fmtInt(v), unit: 'km/h', frac: clamp01(v / 28_000) },
      { label: 'Altitude', text: alt < 10 ? alt.toFixed(1) : fmtInt(alt), unit: 'km', frac: clamp01(alt / 250) },
    ]
  }
  if (p.phase === 'leo') {
    const days = (t - p.start) / DAY_S
    const total = Math.max(1, (p.end - p.start) / DAY_S)
    const propEv = [...(r.leo?.events ?? [])].reverse().find((e) => e.t <= t && /→ (\d+) t aboard/.test(e.detail))
    const m = propEv?.detail.match(/→ (\d+) t aboard/)
    const aboard = m ? Number(m[1]) : r.ascent.residualProp / 1000
    const need = Math.max(aboard, r.leo ? r.leo.propAtDeparture / 1000 : aboard)
    return [
      { label: 'Propellant', text: fmtInt(aboard), unit: 't aboard', frac: clamp01(aboard / Math.max(need, 1)) },
      { label: 'In orbit', text: fmtInt(days), unit: 'days', frac: clamp01(days / total) },
    ]
  }
  if (p.phase === 'tmi' && r.transfer) {
    const f = clamp01((t - p.start) / Math.max(p.end - p.start, 1))
    return [
      { label: 'Burn', text: (r.transfer.dvTmi * f).toFixed(2), unit: 'km/s of ' + r.transfer.dvTmi.toFixed(2), frac: f },
      { label: 'C3', text: r.transfer.c3.toFixed(1), unit: 'km²/s²', frac: clamp01(r.transfer.c3 / 20) },
    ]
  }
  if (p.phase === 'cruise' && r.transfer) {
    const days = (t - p.start) / DAY_S
    const n = r.transfer.samples.length
    const idx = Math.min(n - 1, Math.max(0, Math.floor((days / r.transfer.transitDays) * (n - 1))))
    const s = r.transfer.samples[idx]
    const s0 = r.transfer.samples[0]
    const toMars = norm(sub(s.ship, s.mars)) / 1e6
    const toMars0 = norm(sub(s0.ship, s0.mars)) / 1e6
    const fromEarth = norm(sub(s.ship, s.earth)) / 1e6
    return [
      { label: 'To Mars', text: toMars < 10 ? toMars.toFixed(2) : toMars.toFixed(1), unit: 'million km', frac: clamp01(1 - toMars / Math.max(toMars0, 1)) },
      { label: 'From Earth', text: fromEarth < 10 ? fromEarth.toFixed(2) : fromEarth.toFixed(1), unit: 'million km', frac: clamp01(days / r.transfer.transitDays) },
    ]
  }
  if (p.phase === 'entry' || p.phase === 'landing' || p.phase === 'done') {
    const e = entryAt(r, t)
    const v = e ? e.vel * 3.6 : 0
    const v0 = r.entry ? r.entry.telemetry[0].vel * 3.6 : 25_000
    const alt = e ? e.alt / 1000 : 0
    return [
      { label: 'Speed', text: fmtInt(v), unit: 'km/h', frac: clamp01(v / Math.max(v0, 1)) },
      { label: 'Altitude', text: alt < 10 ? alt.toFixed(1) : fmtInt(alt), unit: 'km', frac: clamp01(alt / 125) },
    ]
  }
  return [
    { label: 'Speed', text: '0', unit: 'km/h', frac: 0 },
    { label: 'Altitude', text: '0', unit: 'km', frac: 0 },
  ]
}

/** which stages are firing at mission time t (the same rules the 3D rig uses) */
export function burningAt(r: MissionResult, vehicle: Vehicle, t: number, preIgnition = false): Set<string> {
  const burning = new Set<string>()
  const p = phaseAt(r, t)
  if (p.phase === 'ascent') {
    const ta = t - p.start
    const s = ascentAt(r, t)
    if (s && s.thrust > 0 && t < p.end && !preIgnition) {
      burning.add(s.stage)
      for (const b of vehicle.stages) if (b.role === 'booster' && !r.ascent.stageTimes.some((st) => st.id === b.id && ta >= st.sep)) burning.add(b.id)
    }
  } else if (p.phase === 'tmi') {
    burning.add(vehicle.stages[vehicle.stages.length - 1].id)
  } else if (p.phase === 'entry') {
    const e = entryAt(r, t)
    if (e?.burning) burning.add(vehicle.refuelable ? vehicle.stages[vehicle.stages.length - 1].id : SPACECRAFT_STAGE)
  }
  return burning
}

/** stage id used for the spacecraft's own engines in the burning set */
export const SPACECRAFT_STAGE = 'spacecraft'

/** propellant left in a stage as a fraction of its load, from the ascent mass history (ascent only; 1 before its burn, 0 after) */
export function propFractionAt(r: MissionResult, vehicle: Vehicle, stageId: string, t: number): number {
  const p = r.phases.find((x) => x.phase === 'ascent')
  if (!p) return 1
  const tel = r.ascent.telemetry
  if (!tel.length) return 1
  const ta = t - p.start
  const order = vehicle.stages.filter((s) => s.role !== 'booster').map((s) => s.id)
  const sep = (id: string) => r.ascent.stageTimes.find((x) => x.id === id)?.sep
  let t0 = 0
  let t1 = tel[tel.length - 1].t
  const st = vehicle.stages.find((s) => s.id === stageId)
  if (!st) return 1
  if (st.role === 'booster') {
    t1 = sep(stageId) ?? t1
  } else {
    const k = order.indexOf(stageId)
    if (k > 0) t0 = sep(order[k - 1]) ?? 0
    t1 = sep(stageId) ?? t1
  }
  if (ta <= t0) return 1
  if (ta >= t1) return 0
  const massAt = (x: number) => ascentAt(r, p.start + x)?.mass ?? 0
  const m0 = massAt(t0 + 0.05)
  const m1 = massAt(Math.max(t0 + 0.1, t1 - 0.05))
  const m = ascentAt(r, t)?.mass ?? m1
  if (m0 <= m1) return 1
  return clamp01((m - m1) / (m0 - m1))
}

export interface Mark {
  t: number
  phase: Phase
  label: string
  tone: 'info' | 'ok' | 'warn' | 'fail'
}

const SHORT: Array<[RegExp, string]> = [
  [/^Liftoff/i, 'LIFTOFF'],
  [/^Mach 1\b/i, 'MACH 1'],
  [/cutoff & separation/i, 'STAGE SEP'],
  [/ ignition$/i, 'IGNITION'],
  [/^Fairing/i, 'FAIRING'],
  [/^SECO\b/, 'SECO'],
  [/^Circularisation/i, 'CIRC BURN'],
  [/^Parking orbit|parking orbit/i, 'ORBIT'],
  [/^Tanker (\d+)/i, 'TANKER $1'],
  [/campaign complete/i, 'FUELLED'],
  [/window missed|Departure window/i, 'WINDOW MISSED'],
  [/injection burn/i, 'TMI BURN'],
  [/injection complete/i, 'TMI'],
  [/Leaving Earth/i, 'EARTH SOI'],
  [/^Halfway/i, 'HALFWAY'],
  [/^Radiation/i, 'RADIATION'],
  [/Entering Mars/i, 'MARS SOI'],
  [/flyby/i, 'FLYBY'],
  [/^Entry interface/i, 'ENTRY'],
  [/^Peak heating/i, 'PEAK HEAT'],
  [/^Peak deceleration/i, 'PEAK G'],
  [/^Pull-out/i, 'PULL-OUT'],
  [/^Landing burn/i, 'LANDING BURN'],
  [/^Touchdown/i, 'TOUCHDOWN'],
  [/^Impact/i, 'IMPACT'],
  [/exhausted/i, 'PROP OUT'],
  [/^Life support/i, 'LIFE SUPPORT'],
  [/^Hatch opens/i, 'HATCH'],
  [/^First boots/i, 'FIRST STEPS'],
  [/^The flag/i, 'FLAG'],
  [/^Habitat/i, 'HABITAT'],
  [/^Power on/i, 'POWER'],
]

function shortLabel(label: string): string | null {
  for (const [re, s] of SHORT) {
    const m = label.match(re)
    if (m) return s.replace('$1', m[1] ?? '')
  }
  return null
}

/** the timeline's event marks: the major moments of each phase, short webcast-style names, at most 4 per phase */
export function marksAt(r: MissionResult): Mark[] {
  const out: Mark[] = []
  // max-Q is not an event in the log; derive it from the telemetry
  const asc = r.phases.find((p) => p.phase === 'ascent')
  if (asc && r.ascent.telemetry.length) {
    let best = r.ascent.telemetry[0]
    for (const s of r.ascent.telemetry) if (s.q > best.q) best = s
    if (best.q > 1000) out.push({ t: asc.start + best.t, phase: 'ascent', label: 'MAX-Q', tone: 'info' })
  }
  for (const e of r.events) {
    const s = shortLabel(e.label)
    if (!s) continue
    out.push({ t: e.t, phase: e.phase as Phase, label: s, tone: e.severity as Mark['tone'] })
  }
  // keep ≤ 4 per phase: failures and warnings first, then the rest in time order
  const byPhase = new Map<Phase, Mark[]>()
  for (const m of out) byPhase.set(m.phase, [...(byPhase.get(m.phase) ?? []), m])
  const keep: Mark[] = []
  const rank = (m: Mark) => (m.tone === 'fail' ? 0 : m.tone === 'warn' ? 1 : m.label === 'LIFTOFF' ? 3 : 2)
  for (const [phase, list] of byPhase) {
    const p = r.phases.find((x) => x.phase === phase)
    const span = p ? Math.max(p.end - p.start, 1) : 1
    const chosen: Mark[] = []
    // by priority, skipping any mark that would sit on top of one already chosen (within 4 % of the phase)
    for (const m of [...list].sort((a, b) => rank(a) - rank(b) || a.t - b.t)) {
      if (chosen.length >= 4) break
      if (chosen.some((c) => Math.abs(c.t - m.t) < 0.04 * span)) continue
      chosen.push(m)
    }
    keep.push(...chosen)
  }
  return keep.sort((a, b) => a.t - b.t)
}

/**
 * A moment worth witnessing. Playback drops to `rate` mission seconds per real second over
 * [t − before, t + after] — real time for the staging events, orbit insertion, the departure
 * burn and peak heating; a slow crawl for the tanker dockings, whose approach spans days — and
 * ramps in and out of it over about a second of real time, whatever speed the viewer chose.
 */
export interface Moment {
  t: number
  label: string
  before: number
  after: number
  rate: number
}

export function momentsAt(r: MissionResult): Moment[] {
  const out: Moment[] = []
  for (const e of r.events) {
    const l = e.label
    if (/cutoff & separation$/i.test(l)) out.push({ t: e.t, label: 'Stage separation', before: 3, after: 7, rate: 1 })
    else if (/ separation$/i.test(l)) out.push({ t: e.t, label: 'Booster separation', before: 3, after: 6, rate: 1 })
    else if (/^Fairing jettison/i.test(l)) out.push({ t: e.t, label: 'Fairing jettison', before: 1.5, after: 3, rate: 1 })
    else if (/^SECO\b/.test(l)) out.push({ t: e.t, label: 'Engine cutoff — orbit', before: 3, after: 2.5, rate: 1 })
    else if (/^Circularisation burn/i.test(l)) out.push({ t: e.t, label: 'Circularisation burn', before: 2, after: 3, rate: 1 })
    else if (/^Tanker \d+ docks/i.test(l)) out.push({ t: e.t, label: l.replace(' docks', ' docking'), before: 1.5 * DAY_S, after: 0.8 * DAY_S, rate: 0.35 * DAY_S })
    else if (/^Trans-Mars injection burn/i.test(l)) out.push({ t: e.t, label: 'Trans-Mars injection', before: 2, after: 7, rate: 1 })
    else if (/^Peak heating/i.test(l)) out.push({ t: e.t, label: 'Peak heating', before: 3, after: 4, rate: 1 })
    else if (e.severity === 'fail' && e.phase === 'ascent') out.push({ t: e.t, label: l, before: 3, after: 4, rate: 1 })
  }
  return out.sort((a, b) => a.t - b.t)
}

/** real seconds taken to slow into a moment and to speed out of it */
const MOMENT_RAMP_S = 1.2

/**
 * Mission seconds per real second at t: the phase's base rate, pulled down to the rate of any
 * moment near t. Outside a moment's window the rate rises linearly with the distance to it,
 * which makes the deceleration exponential in real time and MOMENT_RAMP_S long.
 */
export function playbackRate(base: number, t: number, moments: Moment[], chosen: number, phase?: { start: number; end: number }): { rate: number; moment: Moment | null } {
  let rate = base
  let moment: Moment | null = null
  for (const m of moments) {
    // a moment reaches only into the phases its window touches: the ramp is sized to the phase's
    // pace, and a docking's ramp at the orbit's pace would be days long in the cruise
    if (phase && (m.t - m.before >= phase.end || m.t + m.after <= phase.start)) continue
    const hold = Math.min(base, m.rate * Math.min(1, chosen))
    if (hold >= base) continue
    const d = t < m.t - m.before ? m.t - m.before - t : t > m.t + m.after ? t - m.t - m.after : 0
    const r = Math.min(base, hold + (d * Math.log(base / hold)) / MOMENT_RAMP_S)
    if (r < rate) {
      rate = r
      moment = m
    }
  }
  return { rate, moment }
}

/** the moment whose window holds t, if any */
export function momentAt(moments: Moment[], t: number): Moment | null {
  return moments.find((m) => t >= m.t - m.before && t <= m.t + m.after) ?? null
}
