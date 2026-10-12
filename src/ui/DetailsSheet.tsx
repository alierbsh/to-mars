import { useEffect, useMemo } from 'react'
import { VEHICLES } from '../data/vehicles'
import { AU_KM } from '../sim/constants'
import { MARS_CONSTANTS_NOTE } from './modelNotes'
import type { MissionResult, SimEvent } from '../sim/types'
import { useAppStore, type Tab } from '../state/store'
import { LineChart } from './charts'
import { dateLabel, fmtT, tonnes } from './format'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'trajectory', label: 'Trajectory' },
  { id: 'model', label: 'Vehicle' },
]

/** Everything behind the verdict: the event timeline, telemetry charts, the transfer and the vehicle model. A drawer on the right. */
export default function DetailsSheet() {
  const result = useAppStore((s) => s.result)
  const tab = useAppStore((s) => s.tab)
  const setTab = useAppStore((s) => s.setTab)
  const open = useAppStore((s) => s.drawer === 'details')
  const setDrawer = useAppStore((s) => s.setDrawer)

  return (
    <aside className={`drawer drawer--right ${open ? 'drawer--open' : ''}`} inert={!open}>
      <div className="drawer__head">
        <nav className="tabs" aria-label="Details">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'tab--on' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="drawer__close" onClick={() => setDrawer('details')} aria-label="Close">
          ×
        </button>
      </div>
      <div className="drawer__body">
        {result && tab === 'timeline' && <Timeline result={result} />}
        {result && tab === 'telemetry' && <Telemetry result={result} />}
        {result && tab === 'trajectory' && <Trajectory result={result} />}
        {result && tab === 'model' && <Model result={result} />}
        {!result && <p className="hint">Choose a rocket to run the mission.</p>}
      </div>
    </aside>
  )
}

function Timeline({ result }: { result: MissionResult }) {
  const pastCount = useAppStore((s) => {
    let n = 0
    for (const e of result.events) if (e.t <= s.t) n++
    return n
  })
  const setT = useAppStore((s) => s.setT)
  const setPlaying = useAppStore((s) => s.setPlaying)
  return (
    <ol className="timeline">
      {result.events.map((e: SimEvent, i: number) => (
        <li key={i} className={`event event--${e.severity} ${i < pastCount ? 'event--past' : ''}`}>
          <button className="event__btn" onClick={() => { setT(e.t); setPlaying(false) }} title="Jump here">
            <span className="event__time">{fmtT(e.t)}</span>
            <span className="event__body">
              <span className="event__label">{e.label}</span>
              <span className="event__detail">{e.detail}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function Telemetry({ result }: { result: MissionResult }) {
  const t = useAppStore((s) => Math.round(s.t))
  const a = result.ascent
  const e = result.entry
  const ascentStart = result.phases.find((p) => p.phase === 'ascent')?.start ?? 0
  const entryStart = result.phases.find((p) => p.phase === 'entry')?.start ?? 0
  const asc = useMemo(
    () => ({
      alt: a.telemetry.map((s) => [s.t, s.alt / 1000] as [number, number]),
      vel: a.telemetry.map((s) => [s.t, s.vel] as [number, number]),
      g: a.telemetry.map((s) => [s.t, s.accel] as [number, number]),
      q: a.telemetry.map((s) => [s.t, s.q / 1000] as [number, number]),
      mass: a.telemetry.map((s) => [s.t, s.mass / 1000] as [number, number]),
    }),
    [a],
  )
  const ent = useMemo(
    () =>
      e
        ? {
            alt: e.telemetry.map((s) => [s.t, s.alt / 1000] as [number, number]),
            vel: e.telemetry.map((s) => [s.t, s.vel] as [number, number]),
            g: e.telemetry.map((s) => [s.t, s.gLoad] as [number, number]),
            heat: e.telemetry.map((s) => [s.t, s.heatFlux] as [number, number]),
            mach: e.telemetry.map((s) => [s.t, s.mach] as [number, number]),
          }
        : null,
    [e],
  )
  return (
    <div className="telemetry">
      <h3 className="h3">Launch</h3>
      <LineChart series={[{ name: 'altitude km', color: 'var(--c-steel)', points: asc.alt }, { name: 'speed m/s', color: 'var(--c-rust)', points: asc.vel, right: true }]} xLabel="s" marker={t - ascentStart} height={170} yMin={0} />
      <LineChart series={[{ name: 'g', color: 'var(--c-moss)', points: asc.g }, { name: 'dyn. pressure kPa', color: 'var(--c-sand)', points: asc.q, right: true }]} xLabel="s" marker={t - ascentStart} height={140} yMin={0} />
      <p className="note">Losses: gravity {a.losses.gravity.toFixed(0)} m/s, drag {a.losses.drag.toFixed(0)} m/s, steering {a.losses.steering.toFixed(0)} m/s; max-Q {(a.maxQ.q / 1000).toFixed(1)} kPa at T+{a.maxQ.t.toFixed(0)} s, {(a.maxQ.alt / 1000).toFixed(1)} km; peak {a.maxG.toFixed(1)} g; pitch kick {a.kickAngle}°.</p>
      {ent && (
        <>
          <h3 className="h3">Mars entry</h3>
          <LineChart series={[{ name: 'altitude km', color: 'var(--c-steel)', points: ent.alt }, { name: 'speed m/s', color: 'var(--c-rust)', points: ent.vel, right: true }]} xLabel="s after interface" marker={t - entryStart} height={170} yMin={0} />
          <LineChart series={[{ name: 'g', color: 'var(--c-moss)', points: ent.g }, { name: 'heat flux W/cm²', color: 'var(--c-sand)', points: ent.heat, right: true }]} xLabel="s after interface" marker={t - entryStart} height={140} yMin={0} />
        </>
      )}
    </div>
  )
}

function Trajectory({ result }: { result: MissionResult }) {
  const tr = result.transfer
  const porkchop = useAppStore((s) => s.porkchop)
  const porkchopFor = useAppStore((s) => s.porkchopFor)
  const requestPorkchop = useAppStore((s) => s.requestPorkchop)
  const config = useAppStore((s) => s.config)
  useEffect(() => {
    if (porkchopFor !== config.departure) requestPorkchop()
  }, [config.departure, porkchopFor, requestPorkchop])
  if (!tr) return <p className="hint">No transfer computed — the launch failed.</p>
  const S = 300
  const scale = (S / 2 - 14) / (1.7 * AU_KM)
  const px = (v: [number, number, number]) => S / 2 + v[0] * scale
  const py = (v: [number, number, number]) => S / 2 - v[1] * scale
  const earthPath = tr.samples.map((s, i) => `${i ? 'L' : 'M'}${px(s.earth).toFixed(1)},${py(s.earth).toFixed(1)}`).join(' ')
  const marsPath = tr.samples.map((s, i) => `${i ? 'L' : 'M'}${px(s.mars).toFixed(1)},${py(s.mars).toFixed(1)}`).join(' ')
  const shipPath = tr.samples.map((s, i) => `${i ? 'L' : 'M'}${px(s.ship).toFixed(1)},${py(s.ship).toFixed(1)}`).join(' ')
  const first = tr.samples[0]
  const last = tr.samples[tr.samples.length - 1]
  return (
    <div className="trajectory">
      <svg viewBox={`0 0 ${S} ${S}`} className="orbitplot" role="img" aria-label="Heliocentric view of the transfer">
        <circle cx={S / 2} cy={S / 2} r={1 * AU_KM * scale} className="orbit orbit--earth" />
        <circle cx={S / 2} cy={S / 2} r={1.5237 * AU_KM * scale} className="orbit orbit--mars" />
        <circle cx={S / 2} cy={S / 2} r={4} fill="#f5d27a" />
        <path d={earthPath} className="track track--earth" />
        <path d={marsPath} className="track track--mars" />
        <path d={shipPath} className="track track--ship" />
        <circle cx={px(first.earth)} cy={py(first.earth)} r={3.5} fill="var(--c-steel)" />
        <circle cx={px(last.mars)} cy={py(last.mars)} r={3.5} fill="var(--c-rust)" />
        <text x={px(first.earth) + 6} y={py(first.earth) + 4} className="chart__tick">Earth, {dateLabel(tr.departureJD)}</text>
        <text x={px(last.mars) + 6} y={py(last.mars) + 4} className="chart__tick">Mars, {dateLabel(tr.arrivalJD)}</text>
      </svg>
      <dl className="kv">
        <div><dt>Departure</dt><dd>{dateLabel(tr.departureJD)} · C3 {tr.c3.toFixed(2)} km²/s² · v∞ {tr.vInfDep.toFixed(2)} km/s</dd></div>
        <div><dt>Δv from {result.config.parkingOrbitKm} km</dt><dd>{tr.dvTmi.toFixed(2)} km/s incl. 2 % finite-burn loss</dd></div>
        <div><dt>Arrival</dt><dd>{dateLabel(tr.arrivalJD)} after {tr.transitDays} days · v∞ {tr.vInfArr.toFixed(2)} km/s · entry {tr.entryVel.toFixed(2)} km/s at 125 km</dd></div>
      </dl>
      <h3 className="h3">Departure energy around this window</h3>
      {porkchop && porkchopFor === config.departure ? <Porkchop /> : <p className="note">Computing…</p>}
    </div>
  )
}

function Porkchop() {
  const grid = useAppStore((s) => s.porkchop)!
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)
  const W = 300
  const H = 220
  const padL = 36
  const padB = 24
  const cw = (W - padL - 8) / grid.depCount
  const ch = (H - padB - 8) / grid.tofCount
  const col = (c3: number) => {
    if (!Number.isFinite(c3)) return 'transparent'
    const t = Math.max(0, Math.min(1, (c3 - 7) / 33)) // 7 → 40 km²/s²
    const l = 62 - t * 50
    return `hsl(${215 - t * 200} ${35 + t * 30}% ${l}%)`
  }
  const base = new Date(grid.departure0 + 'T00:00:00Z').getTime()
  const selDep = (new Date(config.departure + 'T00:00:00Z').getTime() - base) / 86400e3 / grid.depStepDays
  const selTof = (config.transitDays - grid.tofMin) / grid.tofStep
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="porkchop" role="img" aria-label="Departure C3 vs departure date and transit time">
        {Array.from({ length: grid.depCount }, (_, i) =>
          Array.from({ length: grid.tofCount }, (_, j) => (
            <rect
              key={`${i}-${j}`}
              x={padL + i * cw}
              y={H - padB - (j + 1) * ch}
              width={cw + 0.4}
              height={ch + 0.4}
              fill={col(grid.c3[i * grid.tofCount + j])}
              onClick={() => {
                const d = new Date(base + i * grid.depStepDays * 86400e3)
                setConfig({ departure: d.toISOString().slice(0, 10), transitDays: Math.round(grid.tofMin + j * grid.tofStep) })
              }}
            >
              <title>
                {new Date(base + i * grid.depStepDays * 86400e3).toISOString().slice(0, 10)}, {Math.round(grid.tofMin + j * grid.tofStep)} d: C3 {grid.c3[i * grid.tofCount + j]?.toFixed(1)} km²/s², arrival v∞ {grid.vInf[i * grid.tofCount + j]?.toFixed(2)} km/s
              </title>
            </rect>
          )),
        )}
        {Number.isFinite(selDep) && (
          <rect x={padL + selDep * cw - 1} y={H - padB - (selTof + 1) * ch - 1} width={cw + 2} height={ch + 2} fill="none" stroke="#fff" strokeWidth={1.5} />
        )}
        <text x={padL} y={H - 6} className="chart__tick">{grid.departure0}</text>
        <text x={W - 8} y={H - 6} className="chart__tick" textAnchor="end">+{Math.round(2 * grid.depStepDays * (grid.depCount - 1) / 2) * 1} d</text>
        <text x={padL - 4} y={H - padB} className="chart__tick" textAnchor="end">{grid.tofMin} d</text>
        <text x={padL - 4} y={12} className="chart__tick" textAnchor="end">{Math.round(grid.tofMin + grid.tofStep * (grid.tofCount - 1))} d</text>
      </svg>
      <p className="note">Departure date across, transit time up; blue is cheap (C3 ≈ 7 km²/s²), red is expensive (≥ 40). Click a cell to fly it. Lambert solution on JPL planetary elements.</p>
    </div>
  )
}

function Model({ result }: { result: MissionResult }) {
  const v = VEHICLES.find((x) => x.id === result.vehicleId)!
  return (
    <div className="model">
      <h3 className="h3">{v.name}</h3>
      <p className="note">{v.description}</p>
      <p className="note">Record: {v.record}</p>
      <table className="table">
        <thead>
          <tr><th>Stage</th><th>Dry</th><th>Propellant</th><th>Engines</th><th>Isp vac</th></tr>
        </thead>
        <tbody>
          {v.stages.map((s) => (
            <tr key={s.id}>
              <td>{s.name}{s.count && s.count > 1 ? ` ×${s.count}` : ''}</td>
              <td>{tonnes(s.id === 'ship' && result.config.shipDryMass ? result.config.shipDryMass : s.id === 'superheavy' && result.config.boosterDryMass ? result.config.boosterDryMass : s.dryMass)}</td>
              <td>{tonnes(s.propMass)}</td>
              <td>{s.engines.map((e) => `${e.count} × ${e.label}`).join(', ')}</td>
              <td>{s.engines.map((e) => `${e.ispVac} s`).join(' / ')}</td>
            </tr>
          ))}
          <tr>
            <td>{v.spacecraft.name}</td>
            <td>{v.refuelable ? `${tonnes(result.config.crewSystems)} systems + ${tonnes(result.config.cargo)} cargo` : tonnes(v.spacecraft.dryMass)}</td>
            <td>{v.refuelable ? '—' : tonnes(v.spacecraft.propMass)}</td>
            <td>{v.spacecraft.landing ? v.spacecraft.landing.label : v.spacecraft.thrust ? `${(v.spacecraft.thrust / 1000).toFixed(0)} kN main engine` : '—'}</td>
            <td>{v.spacecraft.isp ? `${v.spacecraft.isp} s` : '—'}</td>
          </tr>
        </tbody>
      </table>
      <p className="note">Confidence: {v.confidence}.</p>
      {v.spacecraft.entry && (
        <p className="note">
          Entry model: {v.spacecraft.entry.kind}, reference area {v.spacecraft.entry.refArea} m², C<sub>D</sub> {v.spacecraft.entry.cd}, L/D {v.spacecraft.entry.ld}, nose radius {v.spacecraft.entry.noseRadius} m, {v.spacecraft.entry.tpsName}, limit {v.spacecraft.entry.tpsLimit} W/cm².
        </p>
      )}
      <h3 className="h3">How the simulation works</h3>
      <ul className="notes">
        <li>Launch: planar integration in the rotating-atmosphere frame with RK4 at 0.1 s; US Standard Atmosphere 1976; Isp falls with ambient pressure; drag on the stack base area with a Cd(Mach) curve (0.3 subsonic, 0.6 transonic, 0.25 hypersonic — unsourced engineering rule); gravity turn, then a closed-loop insertion law; the pitch kick is searched for the most propellant left in orbit; crewed vehicles are capped at 4 g.</li>
        <li>Orbit: the ship is filled to what the trip needs (TMI burn + landing reserve + 5 %), not to the brim. Boil-off compounds daily; the window is missed if the campaign exceeds 300 days.</li>
        <li>Transfer: Lambert's problem on JPL's approximate planetary elements (valid 1800–2050); Δv from the parking orbit uses the Oberth effect plus a 2 % finite-burn allowance and 50 m/s for mid-course corrections. Checked against the NASA Glenn 2026/2028/2031/2033 opportunities to within 1 %.</li>
        <li>Cruise: consumables at NASA's daily crew balance (0.89 kg O₂, 2.39 kg food, 3.5 kg water) reduced by ECLSS recovery; radiation at the MSL RAD cruise rate of 1.8 mSv/day.</li>
        <li>Entry: Mars Climate Database density profile; lift with a simple bank rule; Sutton–Graves stagnation heating {MARS_CONSTANTS_NOTE}; the landing burn is a suicide-burn law with drag credit; vehicles without landing engines hit at terminal velocity.</li>
        <li>Not modelled: launch abort outcomes, Mars rotation and winds, dust storms as random events, ECLSS hardware failures, landing-site hazards, the return trip.</li>
      </ul>
      <h3 className="h3">Sources</h3>
      <ul className="notes">
        {v.sources.map((s) => (
          <li key={s.url}>
            {s.url.startsWith('http') ? <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : s.label}
          </li>
        ))}
        <li>
          Places: <a href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noreferrer">NASA-3D-Resources</a> (public domain) — the Mobile Launcher model, the JPL DEMs of Gusev and Victoria craters, the global Mars mosaic. Cape Canaveral geography drawn from public maps; pad structures procedural.
        </li>
      </ul>
    </div>
  )
}
