import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'

/** Wordmark, the rocket picker as a segmented row, and the two panel toggles. */
export default function TopBar() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const crew = useAppStore((s) => s.config.crew)
  const setConfig = useAppStore((s) => s.setConfig)
  const drawer = useAppStore((s) => s.drawer)
  const setDrawer = useAppStore((s) => s.setDrawer)
  const status = useAppStore((s) => s.status)

  return (
    <header className="top">
      <div className="wordmark">
        <span className="wordmark__dot" aria-hidden="true" />
        Occupy Mars
      </div>
      <nav className="picker" aria-label="Rocket">
        {VEHICLES.map((v) => (
          <button
            key={v.id}
            className={`picker__item ${v.id === vehicleId ? 'picker__item--on' : ''}`}
            onClick={() => setConfig({ vehicleId: v.id, crew: Math.min(crew, Math.max(v.spacecraft.crewCapacity, 0)) || crew })}
            title={v.name}
          >
            {v.short}
          </button>
        ))}
      </nav>
      <div className="top__right">
        <span className={`status status--${status}`} aria-label={status}>
          {status === 'running' ? 'computing' : status === 'error' ? 'error' : 'live'}
        </span>
        <button className={`pill ${drawer === 'mission' ? 'pill--on' : ''}`} onClick={() => setDrawer('mission')}>
          Mission
        </button>
        <button className={`pill ${drawer === 'details' ? 'pill--on' : ''}`} onClick={() => setDrawer('details')}>
          Data
        </button>
      </div>
    </header>
  )
}
