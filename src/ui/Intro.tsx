import { useEffect, useState } from 'react'
import { music } from '../audio/music'
import { MUSIC_VEHICLE } from '../audio/MusicDriver'
import { VEHICLES } from '../data/vehicles'
import { useT } from '../i18n'
import { useAppStore } from '../state/store'
import { describeMission } from './share'
import GraphicsPicker from './GraphicsPicker'
import { LangList } from './LangPicker'
import { COUNTDOWN, SPEED } from './launch'
import { nameLang, vehicleTexts } from './texts'

const BASE_URL = import.meta.env.BASE_URL

/** The opening: one button over the stack on its pad (the why is in the wiki), then the ship, then five… four… ignition. */
export default function Intro() {
  const intro = useAppStore((s) => s.intro)
  if (!intro) return null
  return (
    <div className={`intro intro--${intro}`}>
      {intro === 'start' && <Start />}
      {intro === 'pick' && <Pick />}
      {intro === 'countdown' && <Countdown />}
    </div>
  )
}

/** nothing to read: the button and the languages under the stack on its pad (the heading is for screen readers) */
function Start() {
  const L = useT()
  const setIntro = useAppStore((s) => s.setIntro)
  return (
    <section className="intro__panel intro__panel--start">
      <h1 className="sr-only">{L.ui.meta.siteName}</h1>
      <button
        className="intro__cta"
        onClick={() => {
          setIntro('pick')
        }}
      >
        {L.ui.intro.cta}
      </button>
      <LangList className="langlist--intro" />
    </section>
  )
}

function Pick() {
  const L = useT()
  const I = L.ui.intro
  const current = useAppStore((s) => s.config.vehicleId)
  const config = useAppStore((s) => s.config)
  const pickFrom = useAppStore((s) => s.pickFrom)
  const launch = useAppStore((s) => s.launch)
  const [vehicleId, setVehicleId] = useState(current)
  const v = VEHICLES.find((x) => x.id === vehicleId)!
  return (
    <section className="intro__panel intro__panel--pick">
      {pickFrom ? (
        <>
          <p className="label label--rust">{pickFrom === 'shared' ? I.shared : I.fromBoard}</p>
          <h1 className="intro__title">{describeMission(config, L)}</h1>
          <p className="intro__shared">{I.sharedHint}</p>
        </>
      ) : (
        <>
          <p className="label">{I.step}</p>
          <h1 className="intro__title">{I.choose}</h1>
        </>
      )}
      <ul className="ships">
        {VEHICLES.map((s) => {
          const st = vehicleTexts(s.id, L)
          return (
            <li key={s.id}>
              <button className={`ship ${s.id === vehicleId ? 'ship--on' : ''}`} onClick={() => setVehicleId(s.id)}>
                <img className="ship__img" src={`${BASE_URL}assets/ships/${s.id}.jpg`} alt="" />
                <span className="ship__name">{st.short}</span>
                <span className="ship__meta">{st.badge}</span>
                <span className="ship__line">{st.tagline}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="intro__row">
        <div className="intro__opt">
          <p className="label">{L.ui.settings.graphics}</p>
          <GraphicsPicker className="speedpick" itemClass="speedpick__item" onClass="speedpick__item--on" />
        </div>
        <button
          className="intro__cta"
          onClick={() => {
            // the click lets the music start later, once the physics says how the flight ends
            if (vehicleId === MUSIC_VEHICLE) music.prime()
            launch(vehicleId, SPEED)
          }}
        >
          <LaunchLabel id={v.id} />
        </button>
      </div>
    </section>
  )
}

/** "Launch Starship V3", the ship's name marked as English where the language keeps it (for the capitals) */
function LaunchLabel({ id }: { id: string }) {
  const L = useT()
  const ship = vehicleTexts(id, L).short
  const lang = nameLang(id, L)
  if (!lang) return <>{L.ui.intro.launch({ ship })}</>
  const [before, after] = L.ui.intro.launch({ ship: '\u0001' }).split('\u0001')
  return (
    <>
      {before}
      <span lang={lang}>{ship}</span>
      {after}
    </>
  )
}

function Countdown() {
  const L = useT()
  const ignite = useAppStore((s) => s.ignite)
  const status = useAppStore((s) => s.status)
  const at = useAppStore((s) => s.countdownAt)
  const [n, setN] = useState(COUNTDOWN.from)
  // the first number shows once the physics is done (the music starts with it); should it run
  // again, the count waits for it and starts over
  useEffect(() => {
    if (status === 'done' && at === null) useAppStore.setState({ countdownAt: performance.now() })
    else if (status !== 'done' && at !== null) useAppStore.setState({ countdownAt: null })
  }, [status, at])
  // from then on the numbers and the ignition keep to the clock, however late the page's timers
  // run (a phone's are): the music counts from the same instant
  useEffect(() => {
    if (at === null) return
    const total = COUNTDOWN.from * COUNTDOWN.tickMs + COUNTDOWN.igniteMs
    let id = 0
    const step = () => {
      const ms = performance.now() - at
      if (ms >= total) {
        // late, with the music already there, the mission starts where the music has got to
        ignite(music.keepsTime() ? Math.min(3, (ms - total) / 1000) : 0)
        return
      }
      const left = Math.max(0, COUNTDOWN.from - Math.floor(ms / COUNTDOWN.tickMs))
      setN(left)
      if (useAppStore.getState().countdown !== left) useAppStore.setState({ countdown: left })
      const next = left > 0 ? (COUNTDOWN.from - left + 1) * COUNTDOWN.tickMs : total
      id = window.setTimeout(step, Math.max(0, next - ms))
    }
    step()
    return () => window.clearTimeout(id)
  }, [at, ignite])
  return (
    <div className="countdown" aria-live="assertive">
      {status !== 'done' ? (
        <p className="label">{L.ui.intro.running}</p>
      ) : n > 0 ? (
        <span className="countdown__n" key={n}>
          {n}
        </span>
      ) : (
        <span className="countdown__go">{L.ui.intro.ignition}</span>
      )}
    </div>
  )
}
