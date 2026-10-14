import { useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { sound } from '../audio/sound'

/** Wordmark, the ship this mission flies (changed only by starting a new mission), and the panel toggles. */
export default function TopBar() {
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  const drawer = useAppStore((s) => s.drawer)
  const setDrawer = useAppStore((s) => s.setDrawer)
  const setIntro = useAppStore((s) => s.setIntro)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const status = useAppStore((s) => s.status)
  const [muted, setMuted] = useState(sound.muted)
  const wiki = useAppStore((s) => s.wiki)
  const openWiki = useAppStore((s) => s.openWiki)
  const closeWiki = useAppStore((s) => s.closeWiki)
  const board = useAppStore((s) => s.board)
  const openBoard = useAppStore((s) => s.openBoard)
  const closeBoard = useAppStore((s) => s.closeBoard)
  const vehicle = VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[0]

  return (
    <header className="top">
      <div className="brand">
        <div className="wordmark">
          <span className="wordmark__dot" aria-hidden="true" />
          Occupy Mars Simulation
        </div>
        <a className="byline" href="https://alierbash.com" target="_blank" rel="noreferrer">
          Built by arbash
        </a>
      </div>
      <div className="craft" aria-label="This mission's ship">
        <span className="craft__name" title={vehicle.name}>
          {vehicle.short}
        </span>
        <button
          className="craft__new"
          onClick={() => {
            // a different ship is a different mission: back to the choice, then the countdown
            setPlaying(false)
            closeWiki()
            if (drawer) setDrawer(drawer)
            setIntro('pick')
          }}
          title="Choose a ship and fly a new mission"
        >
          New mission
        </button>
      </div>
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
          Mission settings
        </button>
        <button className={`pill ${drawer === 'details' ? 'pill--on' : ''}`} onClick={() => setDrawer('details')}>
          Data
        </button>
        <button className={`pill pill--board ${board ? 'pill--on' : ''}`} onClick={() => (board ? closeBoard() : openBoard())}>
          Scoreboard
        </button>
        <button className={`pill ${wiki ? 'pill--on' : ''}`} onClick={() => (wiki ? closeWiki() : openWiki())}>
          Wiki
        </button>
      </div>
    </header>
  )
}
