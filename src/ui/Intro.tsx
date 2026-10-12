import { useEffect, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'

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
  const setIntro = useAppStore((s) => s.setIntro)
  return (
    <section className="intro__panel intro__panel--start">
      <p className="label">Occupy Mars</p>
      <h1 className="intro__title">Why a city on Mars?</h1>
      <div className="intro__text">
        <p>Every living thing that has ever existed has lived on one planet. One asteroid, one supervolcano, one bad century — and the whole story ends. A second world is the first real insurance policy life has ever been offered.</p>
        <p>Mars is the only candidate within reach: a day almost the length of ours, water locked up as ice, carbon dioxide to make fuel and oxygen from, enough sunlight for crops under glass. Not a home yet. A frontier that can become one.</p>
        <p>Nobody has flown there. This is a physics simulation of whether the rockets we have today — real masses, real engines, real orbital mechanics — could carry a crew to the surface alive, and what breaks first when they can't.</p>
      </div>
      <button className="intro__cta" onClick={() => setIntro('pick')}>
        Start the physics, motors and engines
      </button>
      <p className="intro__foot">Simulation runs in your browser. Drag to look around, scroll to zoom.</p>
    </section>
  )
}

function Pick() {
  const current = useAppStore((s) => s.config.vehicleId)
  const launch = useAppStore((s) => s.launch)
  const [vehicleId, setVehicleId] = useState(current)
  const [speed, setSpeed] = useState(RECOMMENDED)
  const v = VEHICLES.find((x) => x.id === vehicleId)!
  return (
    <section className="intro__panel intro__panel--pick">
      <p className="label">Step 1 of 2</p>
      <h1 className="intro__title">Choose your ship</h1>
      <ul className="ships">
        {VEHICLES.map((s) => (
          <li key={s.id}>
            <button className={`ship ${s.id === vehicleId ? 'ship--on' : ''}`} onClick={() => setVehicleId(s.id)}>
              <img className="ship__img" src={`${BASE_URL}assets/ships/${s.id}.jpg`} alt="" />
              <span className="ship__name">{s.short}</span>
              <span className="ship__meta">{s.badge}</span>
              <span className="ship__line">{s.tagline}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="intro__row">
        <div>
          <p className="label">Time speed</p>
          <div className="speedpick" role="group" aria-label="Time speed">
            {SPEEDS.map((sp) => (
              <button key={sp} className={`speedpick__item ${sp === speed ? 'speedpick__item--on' : ''}`} onClick={() => setSpeed(sp)}>
                {sp}×{sp === RECOMMENDED && <span className="speedpick__tag">Recommended</span>}
              </button>
            ))}
          </div>
          <p className="hint">For the orbit and the cruise. Liftoff always plays at 1× — it deserves it — and entry, descent and landing never faster than 2×.</p>
        </div>
        <button className="intro__cta" onClick={() => launch(vehicleId, speed)}>
          Launch {v.short}
        </button>
      </div>
    </section>
  )
}

function Countdown() {
  const ignite = useAppStore((s) => s.ignite)
  const status = useAppStore((s) => s.status)
  const [n, setN] = useState(5)
  useEffect(() => {
    if (status !== 'done') return // wait for the physics before the clock starts
    if (n <= 0) {
      const id = window.setTimeout(ignite, 900)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => setN(n - 1), 1000)
    return () => window.clearTimeout(id)
  }, [n, status, ignite])
  return (
    <div className="countdown" aria-live="assertive">
      {status !== 'done' ? (
        <p className="label">Running the physics…</p>
      ) : n > 0 ? (
        <span className="countdown__n" key={n}>
          {n}
        </span>
      ) : (
        <span className="countdown__go">Ignition</span>
      )}
    </div>
  )
}
