import { useEffect, useMemo, useRef } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useT } from '../i18n'
import { AU_KM } from '../sim/constants'
import type { MissionResult, SimEvent } from '../sim/types'
import { useAppStore, type Tab } from '../state/store'
import { LineChart } from './charts'
import { dateLabel, fmtT, tonnes } from './format'
import { vehicleTexts } from './texts'

const TABS: Tab[] = ['timeline', 'telemetry', 'trajectory', 'model']

/** Everything behind the verdict: the event timeline, telemetry charts, the transfer and the vehicle model. A drawer on the right. */
export default function DetailsSheet() {
  const L = useT()
  const D = L.ui.details
  const result = useAppStore((s) => s.result)
  const tab = useAppStore((s) => s.tab)
  const setTab = useAppStore((s) => s.setTab)
  const open = useAppStore((s) => s.drawer === 'details')
  const setDrawer = useAppStore((s) => s.setDrawer)
  // the tabs scroll sideways in long languages: keep the open one in view — by scrolling the row
  // itself (scrollIntoView would also scroll the page towards the closed, off-screen drawer)
  const activeTab = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = activeTab.current
    const row = el?.parentElement
    if (!open || !el || !row) return
    const overflow = row.scrollWidth > row.clientWidth + 1
    row.classList.toggle('tabs--overflow', overflow)
    if (!overflow) return
    const left = el.offsetLeft
    const right = left + el.offsetWidth
    if (right > row.scrollLeft + row.clientWidth - 18) row.scrollLeft = right - row.clientWidth + 18
    else if (left < row.scrollLeft) row.scrollLeft = left
  }, [tab, open, L])

  return (
    <aside className={`drawer drawer--right ${open ? 'drawer--open' : ''}`} inert={!open}>
      <div className="drawer__head">
        <nav className="tabs" aria-label={D.aria}>
          {TABS.map((id) => (
            <button key={id} ref={tab === id ? activeTab : undefined} className={`tab ${tab === id ? 'tab--on' : ''}`} onClick={() => setTab(id)}>
              {D.tabs[id]}
            </button>
          ))}
        </nav>
        <button className="drawer__close" onClick={() => setDrawer('details')} aria-label={D.close}>
          ×
        </button>
      </div>
      <div className="drawer__body">
        {result && tab === 'timeline' && <Timeline result={result} />}
        {result && tab === 'telemetry' && <Telemetry result={result} />}
        {result && tab === 'trajectory' && <Trajectory result={result} />}
        {result && tab === 'model' && <Model result={result} />}
        {!result && <p className="hint">{D.empty}</p>}
      </div>
    </aside>
  )
}

function Timeline({ result }: { result: MissionResult }) {
  const L = useT()
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
          <button className="event__btn" onClick={() => { setT(e.t); setPlaying(false) }} title={L.ui.details.jump}>
            <span className="event__time">{fmtT(e.t, L)}</span>
            <span className="event__body">
              <span className="event__label">{L.t(e.msg?.label ?? e.label)}</span>
              <span className="event__detail">{L.t(e.msg?.detail ?? e.detail)}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function Telemetry({ result }: { result: MissionResult }) {
  const L = useT()
  const D = L.ui.details
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
      <h3 className="h3">{D.launch}</h3>
      <LineChart series={[{ name: D.series.alt, color: 'var(--c-steel)', points: asc.alt }, { name: D.series.speed, color: 'var(--c-rust)', points: asc.vel, right: true }]} xLabel={D.xSeconds} marker={t - ascentStart} height={170} yMin={0} />
      <LineChart series={[{ name: D.series.g, color: 'var(--c-moss)', points: asc.g }, { name: D.series.q, color: 'var(--c-sand)', points: asc.q, right: true }]} xLabel={D.xSeconds} marker={t - ascentStart} height={140} yMin={0} />
      <p className="note">{D.losses({ grav: a.losses.gravity, drag: a.losses.drag, steer: a.losses.steering, q: a.maxQ.q / 1000, qt: a.maxQ.t, qalt: a.maxQ.alt / 1000, g: a.maxG, kick: a.kickAngle })}</p>
      {ent && (
        <>
          <h3 className="h3">{D.marsEntry}</h3>
          <LineChart series={[{ name: D.series.alt, color: 'var(--c-steel)', points: ent.alt }, { name: D.series.speed, color: 'var(--c-rust)', points: ent.vel, right: true }]} xLabel={D.xAfterInterface} marker={t - entryStart} height={170} yMin={0} />
          <LineChart series={[{ name: D.series.g, color: 'var(--c-moss)', points: ent.g }, { name: D.series.heat, color: 'var(--c-sand)', points: ent.heat, right: true }]} xLabel={D.xAfterInterface} marker={t - entryStart} height={140} yMin={0} />
        </>
      )}
    </div>
  )
}

function Trajectory({ result }: { result: MissionResult }) {
  const L = useT()
  const D = L.ui.details
  const date = (jd: number) => L.n.date(dateLabel(jd))
  const tr = result.transfer
  const porkchop = useAppStore((s) => s.porkchop)
  const porkchopFor = useAppStore((s) => s.porkchopFor)
  const requestPorkchop = useAppStore((s) => s.requestPorkchop)
  const config = useAppStore((s) => s.config)
  useEffect(() => {
    if (porkchopFor !== config.departure) requestPorkchop()
  }, [config.departure, porkchopFor, requestPorkchop])
  if (!tr) return <p className="hint">{D.noTransfer}</p>
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
      <svg viewBox={`0 0 ${S} ${S}`} className="orbitplot" role="img" aria-label={D.orbitAria}>
        <circle cx={S / 2} cy={S / 2} r={1 * AU_KM * scale} className="orbit orbit--earth" />
        <circle cx={S / 2} cy={S / 2} r={1.5237 * AU_KM * scale} className="orbit orbit--mars" />
        <circle cx={S / 2} cy={S / 2} r={4} fill="#f5d27a" />
        <path d={earthPath} className="track track--earth" />
        <path d={marsPath} className="track track--mars" />
        <path d={shipPath} className="track track--ship" />
        <circle cx={px(first.earth)} cy={py(first.earth)} r={3.5} fill="var(--c-steel)" />
        <circle cx={px(last.mars)} cy={py(last.mars)} r={3.5} fill="var(--c-rust)" />
        <text x={px(first.earth) + 6} y={py(first.earth) + 4} className="chart__tick">{D.earthOn({ date: date(tr.departureJD) })}</text>
        <text x={px(last.mars) + 6} y={py(last.mars) + 4} className="chart__tick">{D.marsOn({ date: date(tr.arrivalJD) })}</text>
      </svg>
      <dl className="kv">
        <div><dt>{D.departure}</dt><dd>{D.departureValue({ date: date(tr.departureJD), c3: tr.c3, vinf: tr.vInfDep })}</dd></div>
        <div><dt>{D.dvFrom({ km: result.config.parkingOrbitKm })}</dt><dd>{D.dvValue({ dv: tr.dvTmi })}</dd></div>
        <div><dt>{D.arrival}</dt><dd>{D.arrivalValue({ date: date(tr.arrivalJD), days: tr.transitDays, vinf: tr.vInfArr, entry: tr.entryVel })}</dd></div>
      </dl>
      <h3 className="h3">{D.porkchopTitle}</h3>
      {porkchop && porkchopFor === config.departure ? <Porkchop /> : <p className="note">{D.computing}</p>}
    </div>
  )
}

function Porkchop() {
  const L = useT()
  const D = L.ui.details
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
      <svg viewBox={`0 0 ${W} ${H}`} className="porkchop" role="img" aria-label={D.porkchopAria}>
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
                {D.porkchopCell({ date: L.n.date(new Date(base + i * grid.depStepDays * 86400e3).toISOString().slice(0, 10)), days: Math.round(grid.tofMin + j * grid.tofStep), c3: grid.c3[i * grid.tofCount + j], vinf: grid.vInf[i * grid.tofCount + j] })}
              </title>
            </rect>
          )),
        )}
        {Number.isFinite(selDep) && (
          <rect x={padL + selDep * cw - 1} y={H - padB - (selTof + 1) * ch - 1} width={cw + 2} height={ch + 2} fill="none" stroke="#fff" strokeWidth={1.5} />
        )}
        <text x={padL} y={H - 6} className="chart__tick">{L.n.date(grid.departure0)}</text>
        <text x={W - 8} y={H - 6} className="chart__tick" textAnchor="end">{D.days({ n: `+${Math.round(grid.depStepDays * (grid.depCount - 1))}` })}</text>
        <text x={padL - 4} y={H - padB} className="chart__tick" textAnchor="end">{D.days({ n: String(grid.tofMin) })}</text>
        <text x={padL - 4} y={12} className="chart__tick" textAnchor="end">{D.days({ n: String(Math.round(grid.tofMin + grid.tofStep * (grid.tofCount - 1))) })}</text>
      </svg>
      <p className="note">{D.porkchopNote}</p>
    </div>
  )
}

function Model({ result }: { result: MissionResult }) {
  const L = useT()
  const D = L.ui.details
  const v = VEHICLES.find((x) => x.id === result.vehicleId)!
  const vt = vehicleTexts(v.id, L)
  const sc = v.spacecraft
  return (
    <div className="model">
      <h3 className="model__name">{vt.name}</h3>
      <p className="note">{vt.description}</p>
      <p className="note">{D.record({ record: vt.record })}</p>
      <table className="table">
        <thead>
          <tr><th>{D.table.stage}</th><th>{D.table.dry}</th><th>{D.table.prop}</th><th>{D.table.engines}</th><th>{D.table.isp}</th></tr>
        </thead>
        <tbody>
          {v.stages.map((s) => (
            <tr key={s.id}>
              <td>{vt.stages[s.id] ?? s.name}{s.count && s.count > 1 ? ` ×${s.count}` : ''}</td>
              <td>{tonnes(s.id === 'ship' && result.config.shipDryMass ? result.config.shipDryMass : s.id === 'superheavy' && result.config.boosterDryMass ? result.config.boosterDryMass : s.dryMass, L)}</td>
              <td>{tonnes(s.propMass, L)}</td>
              <td>{s.engines.map((e, i) => `${e.count} × ${vt.engines[s.id]?.[i] ?? e.label}`).join(', ')}</td>
              <td>{s.engines.map((e) => `${L.n.n(e.ispVac)} s`).join(' / ')}</td>
            </tr>
          ))}
          <tr>
            <td>{vt.spacecraft}</td>
            <td>{v.refuelable ? D.systemsCargo({ sys: tonnes(result.config.crewSystems, L), cargo: tonnes(result.config.cargo, L) }) : tonnes(sc.dryMass, L)}</td>
            <td>{v.refuelable ? '—' : tonnes(sc.propMass, L)}</td>
            <td>{sc.landing ? vt.landing : sc.thrust ? D.mainEngine({ kn: sc.thrust / 1000 }) : '—'}</td>
            <td>{sc.isp ? `${L.n.n(sc.isp)} s` : '—'}</td>
          </tr>
        </tbody>
      </table>
      <p className="note">{D.confidence({ c: vt.confidence })}</p>
      {sc.entry && <p className="note">{D.entryModel({ kind: D.kinds[sc.entry.kind], area: sc.entry.refArea, cd: sc.entry.cd, ld: sc.entry.ld, nose: sc.entry.noseRadius, tps: vt.tps, lim: sc.entry.tpsLimit })}</p>}
      <h3 className="h3">{D.howTitle}</h3>
      <ul className="notes">
        {D.notes.map((note, i) => (
          <li key={i}>{note}</li>
        ))}
      </ul>
      <h3 className="h3">{D.sources}</h3>
      <ul className="notes">
        {v.sources.map((s) => (
          <li key={s.url}>
            {s.url.startsWith('http') ? <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a> : s.label}
          </li>
        ))}
        <li>
          {D.placesBefore}
          <a href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noreferrer">NASA-3D-Resources</a>
          {D.placesAfter}
        </li>
      </ul>
    </div>
  )
}
