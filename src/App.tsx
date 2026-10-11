import Scene from './scene/Scene'
import { useAppStore } from './state/store'

/**
 * Three-column shell, same bones as the reference simulator:
 *   left   — mission + rocket catalogue (what you launch)
 *   centre — 3D stage with a live HUD and playback controls
 *   right  — verdict, timeline of events, telemetry, model notes
 *
 * Everything below is scaffolding: the catalogue, physics core and verdict
 * engine are filled in after the research phase.
 */
export default function App() {
  const rocketId = useAppStore((s) => s.rocketId)

  return (
    <div className="app">
      <header className="header">
        <div className="header__title">
          <span className="dot" />
          To Mars
        </div>
        <div className="header__tagline">
          Can today's most advanced rockets carry a crew to Mars? Real masses, real engines, real orbital mechanics.
        </div>
        <div className="header__meta">v0.0.1 · scaffold</div>
      </header>

      <aside className="sidebar">
        <div className="section-label">Mission</div>
        <div className="card">
          <div className="card__title">Crewed Mars transfer</div>
          <div className="card__desc">Launch window, crew size and mission profile land here.</div>
        </div>

        <div className="section-label">Rocket</div>
        <div className={`card ${rocketId === 'placeholder' ? 'card--selected' : ''}`}>
          <div className="card__title">
            Placeholder vehicle <span className="badge badge--hypo">scaffold</span>
          </div>
          <div className="card__desc">The real catalogue (Starship, SLS, New Glenn, …) replaces this after research.</div>
        </div>
        <div className="placeholder-note">Research phase in progress — numbers are not in yet.</div>
      </aside>

      <main className="stage">
        <Scene />
        <div className="hud">
          <div className="hud__label">STAGE</div>
          <div className="hud__value">placeholder · no physics yet</div>
        </div>
      </main>

      <aside className="panel">
        <div className="section-label">Verdict</div>
        <div className="card">
          <div className="card__title">No simulation run yet</div>
          <div className="card__desc">
            Once the physics core is in: did it reach Mars orbit, did it land, did the crew survive — and what failed first.
          </div>
        </div>
      </aside>
    </div>
  )
}
