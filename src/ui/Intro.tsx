import { useEffect, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useT } from '../i18n'
import { useAppStore } from '../state/store'
import { describeMission } from './share'
import { sound } from '../audio/sound'
import { LangList } from './LangPicker'
import { nameLang, vehicleTexts } from './texts'

const BASE_URL = import.meta.env.BASE_URL
const SPEEDS = [0.5, 1, 2, 4, 10]
const RECOMMENDED = 10

/** The opening: why a city on Mars, then the ship and the clock, then five… four… ignition. */
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

function Start() {
  const L = useT()
  const I = L.ui.intro
  const setIntro = useAppStore((s) => s.setIntro)
  return (
    <section className="intro__panel intro__panel--start">
      <p className="label" lang="en">
        {I.brand}
      </p>
      <h1 className="intro__title">{I.title}</h1>
      <div className="intro__text">
        {I.text.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <button
        className="intro__cta"
        onClick={() => {
          sound.enable()
          setIntro('pick')
        }}
      >
        {I.cta}
      </button>
      <button className="intro__alt" onClick={() => useAppStore.getState().openBoard()}>
        {I.toBoard}
      </button>
      <p className="intro__foot">{I.foot}</p>
      <LangList className="intro__langs" />
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
  const [speed, setSpeed] = useState(RECOMMENDED)
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
        <div>
          <p className="label">{I.timeSpeed}</p>
          <div className="speedpick" role="group" aria-label={I.timeSpeed}>
            {SPEEDS.map((sp) => (
              <button key={sp} className={`speedpick__item ${sp === speed ? 'speedpick__item--on' : ''}`} onClick={() => setSpeed(sp)}>
                {L.n.n(sp)}×{sp === RECOMMENDED && <span className="speedpick__tag">{I.recommended}</span>}
              </button>
            ))}
          </div>
          <p className="hint">{I.speedHint}</p>
        </div>
        <button
          className="intro__cta"
          onClick={() => {
            sound.enable()
            launch(vehicleId, speed)
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
