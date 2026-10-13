import { useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { sound } from '../audio/sound'

/** Wordmark, the rocket picker as a segmented row, and the two panel toggles. */
export default function TopBar() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const crew = useAppStore((s) => s.config.crew)
  const setConfig = useAppStore((s) => s.setConfig)
  const drawer = useAppStore((s) => s.drawer)
  const setDrawer = useAppStore((s) => s.setDrawer)
  const status = useAppStore((s) => s.status)
  const [muted, setMuted] = useState(sound.muted)
  const wiki = useAppStore((s) => s.wiki)
  const openWiki = useAppStore((s) => s.openWiki)
  const closeWiki = useAppStore((s) => s.closeWiki)

  return (
    <header className="top">
      <div className="brand">
        <div className="wordmark">
          <span className="wordmark__dot" aria-hidden="true" />
          Occupy Mars
        </div>
        <a className="byline" href="https://alierbash.com" target="_blank" rel="noreferrer">
          Built by arbash
        </a>
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
        <button
          className={`pill pill--icon ${muted ? 'pill--muted' : ''}`}
          onClick={() => {
            sound.enable()
            sound.setMuted(!muted)
            setMuted(!muted)
          }}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" /><path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" /><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
          )}
        </button>
        <button className={`pill ${drawer === 'mission' ? 'pill--on' : ''}`} onClick={() => setDrawer('mission')}>
          Mission
        </button>
        <button className={`pill ${drawer === 'details' ? 'pill--on' : ''}`} onClick={() => setDrawer('details')}>
          Data
        </button>
        <button className={`pill ${wiki ? 'pill--on' : ''}`} onClick={() => (wiki ? closeWiki() : openWiki())}>
          Wiki
        </button>
      </div>
    </header>
  )
}
