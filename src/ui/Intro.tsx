import { useEffect, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useT } from '../i18n'
import { useAppStore } from '../state/store'
import { describeMission } from './share'
import GraphicsPicker from './GraphicsPicker'
import { LangList } from './LangPicker'
import { nameLang, vehicleTexts } from './texts'

const BASE_URL = import.meta.env.BASE_URL
/** the clock's speed a mission starts at (the orbit and the cruise; liftoff and the moments that
 * matter still play in real time) — the lower third's buttons change it in flight */
const SPEED = 10

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
  const [n, setN] = useState(5)
  useEffect(() => {
    if (status !== 'done') return // wait for the physics before the clock starts
    if (n <= 0) {
      const id = window.setTimeout(ignite, 900)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setN(n - 1)
      useAppStore.setState({ countdown: n - 1 })
    }, 1000)
    return () => window.clearTimeout(id)
  }, [n, status, ignite])
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
