import type { AscentSample, EntrySample, MissionResult, Phase } from '../sim/types'
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
  return { ...a, t: lerp(a.t, b.t, f), alt: lerp(a.alt, b.alt, f), vel: lerp(a.vel, b.vel, f), mach: lerp(a.mach, b.mach, f), gLoad: lerp(a.gLoad, b.gLoad, f), heatFlux: lerp(a.heatFlux, b.heatFlux, f), heatLoad: lerp(a.heatLoad, b.heatLoad, f), mass: lerp(a.mass, b.mass, f), downrange: lerp(a.downrange, b.downrange, f), q: lerp(a.q, b.q, f), fpa: lerp(a.fpa, b.fpa, f), burning: f < 0.5 ? a.burning : b.burning }
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
      lines.push({ label: 'Altitude', value: `${fmt(a.alt / 1000, 1)} km` })
      lines.push({ label: 'Speed', value: `${fmt(a.vel)} m/s` })
      lines.push({ label: 'Mach', value: a.alt < 90_000 ? fmt(a.mach, 1) : '—' })
      lines.push({ label: 'Acceleration', value: `${fmt(a.accel, 2)} g` })
      lines.push({ label: 'Mass', value: `${fmt(a.mass / 1000)} t` })
      lines.push({ label: 'Dynamic pressure', value: `${fmt(a.q / 1000, 1)} kPa` })
    }
  } else if (p.phase === 'leo' && r.leo) {
    const days = (t - p.start) / DAY_S
    const docked = r.leo.events.filter((e) => e.label.startsWith('Tanker') && e.t <= t).length
    lines.push({ label: 'Day in orbit', value: fmt(days) })
    if (r.config.tankers > 0 && r.leo.tankersLaunched > 0) lines.push({ label: 'Tankers docked', value: `${docked} of ${r.leo.tankersLaunched}` })
    const propEv = [...r.leo.events].reverse().find((e) => e.t <= t && /→ (\d+) t aboard/.test(e.detail))
    const m = propEv?.detail.match(/→ (\d+) t aboard/)
    lines.push({ label: 'Propellant aboard', value: m ? `${m[1]} t` : `${fmt(r.ascent.residualProp / 1000)} t` })
    lines.push({ label: 'Orbit', value: r.ascent.orbit ? `${fmt(r.ascent.orbit.rp)} × ${fmt(r.ascent.orbit.ra)} km` : '—' })
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
  } else if (p.phase === 'entry') {
    const e = entryAt(r, t)
    if (e) {
      out.entry = e
      lines.push({ label: 'Altitude', value: `${fmt(e.alt / 1000, 1)} km` })
      lines.push({ label: 'Speed', value: `${fmt(e.vel)} m/s` })
      lines.push({ label: 'Mach', value: fmt(e.mach, 1) })
      lines.push({ label: 'Deceleration', value: `${fmt(e.gLoad, 1)} g`, tone: e.gLoad > r.config.gLimit ? 'fail' : e.gLoad > 0.8 * r.config.gLimit ? 'warn' : undefined })
      lines.push({ label: 'Heat flux', value: `${fmt(e.heatFlux)} W/cm²`, tone: e.heatFlux > 40 ? 'warn' : undefined })
      lines.push({ label: e.burning ? 'Landing burn' : 'Engines', value: e.burning ? 'firing' : 'off' })
    }
  }
  return out
}
