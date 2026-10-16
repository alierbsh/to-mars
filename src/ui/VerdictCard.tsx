import { VEHICLES } from '../data/vehicles'
import { getL, useT } from '../i18n'
import type { MissionResult } from '../sim/types'
import { phaseAt, useAppStore } from '../state/store'
import CruiseInset from './CruiseInset'
import { shareMission } from './share'

const MILESTONES = [
  ['leo', 'orbit'],
  ['tmi', 'departure'],
  ['mars', 'mars'],
  ['surface', 'landing'],
] as const

/**
 * When the verdict shows: a few seconds into what follows the entry (on the surface, the impact,
 * the break-up, the miss), or at the end of a mission that never gets there. Before that the
 * card only says what has just happened — the outcome is the film's ending, not its poster.
 */
export function revealAt(r: MissionResult): number {
  const after = r.phases.find((p) => p.phase === 'landing')
  return after ? after.start + 3 : r.phases[r.phases.length - 1].end
}

/** the latest event at or before t (an index into result.events; -1 before the first) */
function eventAt(r: MissionResult, t: number): number {
  const ev = r.events
  let lo = 0
  let hi = ev.length - 1
  let at = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (ev[mid].t <= t + 1e-6) {
      at = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return at
}

/** The one thing the page is for: did they make it, and what decided it. Four numbers at most. */
export default function VerdictCard() {
  const L = useT()
  const V = L.ui.verdict
  const result = useAppStore((s) => s.result)
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const setDrawer = useAppStore((s) => s.setDrawer)
  // derived from the clock as small values, so the card renders only when they change
  const revealed = useAppStore((s) => !!s.result && s.t >= revealAt(s.result))
  const ei = useAppStore((s) => (s.result ? eventAt(s.result, s.t) : -1))
  const pi = useAppStore((s) => (s.result ? s.result.phases.indexOf(phaseAt(s.result, s.t)) : 0))

  if (status === 'error')
    return (
      <section className="verdict verdict--fail">
        <p className="label">{V.error}</p>
        <h1 className="verdict__headline">{error}</h1>
      </section>
    )
  if (!result)
    return (
      <section className="verdict verdict--stale">
        <p className="label">{V.mission}</p>
        <h1 className="verdict__headline">{V.running}</h1>
      </section>
    )
  if (!revealed) {
    // the mission as it plays: the stage it is in, and what has just happened there
    const e = ei >= 0 ? result.events[ei] : null
    const p = result.phases[Math.max(0, pi)]
    // the cruise: the scene stays with the ship, the transfer from above goes in here
    const cruising = p.phase === 'cruise' && !!result.transfer
    return (
      <section className={`verdict verdict--now ${cruising ? 'verdict--cruise' : ''} ${status === 'running' ? 'verdict--stale' : ''}`} role="status" aria-live="polite" aria-label={V.mission}>
        <p className={`label label--now label--${e?.severity === 'info' ? 'live' : (e?.severity ?? 'live')}`}>
          <span className="label__dot" aria-hidden="true" />
          {L.t(p.msg ?? p.label)}
        </p>
        {e && (
          <div key={ei} className="now">
            <h2 className="now__title">{L.t(e.msg?.label ?? e.label)}</h2>
            <p className="now__detail">{L.t(e.msg?.detail ?? e.detail)}</p>
          </div>
        )}
        {cruising && <CruiseInset result={result} />}
      </section>
    )
  }
  const v = result.verdict
  const vehicle = VEHICLES.find((x) => x.id === result.vehicleId)!
  const crewed = result.config.crew > 0 && vehicle.spacecraft.crewCapacity > 0
  const tone = v.outcome === 'landed' && (v.crewAlive || !crewed) ? 'ok' : v.outcome === 'landed' ? 'warn' : 'fail'
  const statusLabel = tone === 'ok' ? (crewed ? V.crewLanded : V.landed) : tone === 'warn' ? V.landedLost : v.outcome === 'flyby' ? V.flyby : V.lost
  // the stats that decided it: failures and warnings first, then the rest, four at most
  const ranked = [...v.stats].sort((a, b) => rank(b.severity) - rank(a.severity)).slice(0, 4)

  return (
    <section className={`verdict verdict--${tone} verdict--reveal ${status === 'running' ? 'verdict--stale' : ''}`}>
      <p className={`label label--${tone}`}>
        <span className="label__dot" aria-hidden="true" />
        {statusLabel}
      </p>
      <h1 className="verdict__headline">{L.t(v.msg?.headline ?? v.headline)}</h1>
      <p className="verdict__summary">{L.t(v.msg?.summary ?? v.summary)}</p>
      <ol className="milestones" aria-label={V.milestones}>
        {MILESTONES.map(([k, label]) => (
          <li key={k} className={`milestone ${v.reached[k] ? 'milestone--on' : ''}`}>
            {V[label]}
          </li>
        ))}
        {crewed && <li className={`milestone ${v.crewAlive ? 'milestone--on' : 'milestone--off'}`}>{v.crewAlive ? V.crewAlive : V.crewLost}</li>}
      </ol>
      <dl className="keystats">
        {ranked.map((s) => (
          <div key={s.label} className={`keystat keystat--${s.severity ?? 'info'}`}>
            <dt>{L.t(s.msg?.label ?? s.label)}</dt>
            <dd>{L.t(s.msg?.value ?? s.value)}</dd>
            {s.note && <span className="keystat__note">{L.t(s.msg?.note ?? s.note)}</span>}
          </div>
        ))}
      </dl>
      <div className="verdict__actions">
        <span className="verdict__links">
          <button className="verdict__more" onClick={() => setDrawer('details')}>
            {V.data}
          </button>
          <button className="verdict__more" onClick={() => useAppStore.getState().openBoard()}>
            {V.board}
          </button>
        </span>
        <button
          className="verdict__share"
          onClick={async () => {
            const { config, result: r, showToast } = useAppStore.getState()
            const LL = getL()
            const { outcome, url } = await shareMission(config, r, LL)
            if (outcome === 'copied') showToast(LL.ui.verdict.copied)
            else if (outcome === 'failed') window.prompt(LL.ui.verdict.copyPrompt, url)
          }}
          aria-label={V.shareAria}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M8 1.5v8.5M4.8 4.6 8 1.5l3.2 3.1M3 8.5v5h10v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {V.share}
        </button>
      </div>
    </section>
  )
}

function rank(sev?: string): number {
  return sev === 'fail' ? 3 : sev === 'warn' ? 2 : sev === 'ok' ? 1 : 0
}
