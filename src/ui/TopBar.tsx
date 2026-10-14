import { useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useT } from '../i18n'
import { useAppStore } from '../state/store'
import { sound } from '../audio/sound'
import { FeedbackLink } from './Feedback'
import { LangMenu } from './LangPicker'
import { nameLang, vehicleTexts } from './texts'

/** Wordmark, the ship this mission flies (changed only by starting a new mission), and the panel toggles. */
export default function TopBar() {
  const L = useT()
  const T = L.ui.top
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
  const vt = vehicleTexts(vehicle.id, L)

  return (
    <header className="top">
      <div className="brand">
        <div className="wordmark" lang="en">
          <span className="wordmark__dot" aria-hidden="true" />
          Occupy Mars Simulation
        </div>
        <div className="brand__links">
          <a className="byline" href="https://alierbash.com" target="_blank" rel="noreferrer">
            {T.byline}
          </a>
          <FeedbackLink className="byline byline--fb" />
        </div>
      </div>
      <div className="craft" aria-label={T.shipAria}>
        <span className="craft__name" title={vt.name} lang={nameLang(vehicle.id, L)}>
          {vt.short}
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
          title={T.newMissionTitle}
        >
          {T.newMission}
        </button>
      </div>
      <div className="top__right">
        <span className={`status status--${status}`}>{status === 'running' ? T.computing : status === 'error' ? T.error : T.live}</span>
        <button
          className={`pill pill--icon ${muted ? 'pill--muted' : ''}`}
          onClick={() => {
            sound.enable()
            sound.setMuted(!muted)
            setMuted(!muted)
          }}
          aria-label={muted ? T.unmute : T.mute}
          title={muted ? T.soundOff : T.soundOn}
        >
          {muted ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" /><path d="M11 6l3 4M14 6l-3 4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" /><path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
          )}
        </button>
        <LangMenu />
        <button className={`pill ${drawer === 'mission' ? 'pill--on' : ''}`} onClick={() => setDrawer('mission')}>
          {T.settingsShort === T.settings ? (
            T.settings
          ) : (
            <>
              <span className="pill__long">{T.settings}</span>
              <span className="pill__short">{T.settingsShort}</span>
            </>
          )}
        </button>
        <button className={`pill ${drawer === 'details' ? 'pill--on' : ''}`} onClick={() => setDrawer('details')}>
          {T.data}
        </button>
        <button className={`pill pill--board ${board ? 'pill--on' : ''}`} onClick={() => (board ? closeBoard() : openBoard())}>
          {T.board}
        </button>
        <button className={`pill ${wiki ? 'pill--on' : ''}`} onClick={() => (wiki ? closeWiki() : openWiki())}>
          {T.wiki}
        </button>
      </div>
    </header>
  )
}
