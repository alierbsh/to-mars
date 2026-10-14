import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { shareMission } from './share'

const MILESTONES = [
  ['leo', 'Orbit'],
  ['tmi', 'Departure'],
  ['mars', 'Mars'],
  ['surface', 'Landing'],
] as const

/** The one thing the page is for: did they make it, and what decided it. Four numbers at most. */
export default function VerdictCard() {
  const result = useAppStore((s) => s.result)
  const status = useAppStore((s) => s.status)
  const error = useAppStore((s) => s.error)
  const setDrawer = useAppStore((s) => s.setDrawer)

  if (status === 'error')
    return (
      <section className="verdict verdict--fail">
        <p className="label">Simulation error</p>
        <h1 className="verdict__headline">{error}</h1>
      </section>
    )
  if (!result)
    return (
      <section className="verdict verdict--stale">
        <p className="label">Mission</p>
        <h1 className="verdict__headline">Running the physics…</h1>
      </section>
    )
  const v = result.verdict
  const vehicle = VEHICLES.find((x) => x.id === result.vehicleId)!
  const crewed = result.config.crew > 0 && vehicle.spacecraft.crewCapacity > 0
  const tone = v.outcome === 'landed' && (v.crewAlive || !crewed) ? 'ok' : v.outcome === 'landed' ? 'warn' : 'fail'
  const statusLabel = tone === 'ok' ? (crewed ? 'Crew landed' : 'Landed') : tone === 'warn' ? 'Landed · crew lost' : v.outcome === 'flyby' ? 'Flyby · no landing' : 'Mission lost'
  // the stats that decided it: failures and warnings first, then the rest, four at most
  const ranked = [...v.stats].sort((a, b) => rank(b.severity) - rank(a.severity)).slice(0, 4)

  return (
    <section className={`verdict verdict--${tone} ${status === 'running' ? 'verdict--stale' : ''}`}>
      <p className={`label label--${tone}`}>
        <span className="label__dot" aria-hidden="true" />
        {statusLabel}
      </p>
      <h1 className="verdict__headline">{v.headline}</h1>
      <p className="verdict__summary">{v.summary}</p>
      <ol className="milestones" aria-label="Milestones">
        {MILESTONES.map(([k, label]) => (
          <li key={k} className={`milestone ${v.reached[k] ? 'milestone--on' : ''}`}>
            {label}
          </li>
        ))}
        {crewed && <li className={`milestone ${v.crewAlive ? 'milestone--on' : 'milestone--off'}`}>{v.crewAlive ? 'Crew alive' : 'Crew lost'}</li>}
      </ol>
      <dl className="keystats">
        {ranked.map((s) => (
          <div key={s.label} className={`keystat keystat--${s.severity ?? 'info'}`}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
            {s.note && <span className="keystat__note">{s.note}</span>}
          </div>
        ))}
      </dl>
      <div className="verdict__actions">
        <span className="verdict__links">
          <button className="verdict__more" onClick={() => setDrawer('details')}>
            Mission data →
          </button>
          <button className="verdict__more" onClick={() => useAppStore.getState().openBoard()}>
            All rockets →
          </button>
        </span>
        <button
          className="verdict__share"
          onClick={async () => {
            const { config, result: r, showToast } = useAppStore.getState()
            const { outcome, url } = await shareMission(config, r)
            if (outcome === 'copied') showToast('Link copied — paste it anywhere')
            else if (outcome === 'failed') window.prompt('Copy this link', url)
          }}
          aria-label="Share this mission"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
            <path d="M8 1.5v8.5M4.8 4.6 8 1.5l3.2 3.1M3 8.5v5h10v-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share
        </button>
      </div>
    </section>
  )
}

function rank(sev?: string): number {
  return sev === 'fail' ? 3 : sev === 'warn' ? 2 : sev === 'ok' ? 1 : 0
}
