import { useMemo } from 'react'
import { useT } from '../i18n'
import { planetPosition } from '../sim/ephemeris'
import type { MissionResult, TransferResult } from '../sim/types'
import { useThrottledT } from '../state/store'

const AU = 149_597_870.7
const C_KM_S = 299_792.458
/** the map's half-width (AU): Mars's orbit reaches 1.67 */
const R = 1.78

type V3 = [number, number, number]
type P = [number, number]

/** heliocentric ecliptic km → the map (AU; north up, so y flips) */
const xy = (p: V3): P => [p[0] / AU, -p[1] / AU]
const pts = (a: P[]) => a.map((q) => `${q[0].toFixed(3)},${q[1].toFixed(3)}`).join(' ')

/**
 * The transfer from above, small, in the event card while the ship cruises — the scene stays with
 * the ship: the Sun, both orbits, the ship's arc (flown, and still to fly) and where Earth, Mars
 * and the ship are now; the day of the transit and the light time to Earth.
 */
export default function CruiseInset({ result }: { result: MissionResult }) {
  const L = useT()
  const I = L.ui.inset
  const t = useThrottledT(12)
  const tr = result.transfer as TransferResult
  const cruise = result.phases.find((p) => p.phase === 'cruise')
  const map = useMemo(() => {
    const orbit = (body: 'earth' | 'mars', days: number) => {
      const o: P[] = []
      for (let i = 0; i <= 120; i++) o.push(xy(planetPosition(body, tr.departureJD + (i / 120) * days) as V3))
      return pts(o)
    }
    return {
      earthOrbit: orbit('earth', 365.25),
      marsOrbit: orbit('mars', 687),
      arc: tr.samples.map((s) => xy(s.ship)),
    }
  }, [tr])
  if (!cruise) return null

  const f = Math.min(1, Math.max(0, (t - cruise.start) / Math.max(1, cruise.end - cruise.start)))
  const S = tr.samples
  const n = S.length - 1
  const x = f * n
  const i = Math.min(n - 1, Math.floor(x))
  const u = x - i
  const at = (k: 'ship' | 'earth' | 'mars'): V3 => {
    const a = S[i][k]
    const b = S[i + 1][k]
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]
  }
  const ship = at('ship')
  const earth = at('earth')
  const mars = at('mars')
  const [sx, sy] = xy(ship)
  const [ex, ey] = xy(earth)
  const [mx, my] = xy(mars)
  const flown = pts([...map.arc.slice(0, i + 1), [sx, sy]])
  // one-way light time from the ship to Earth
  const light = Math.hypot(ship[0] - earth[0], ship[1] - earth[1], ship[2] - earth[2]) / C_KM_S
  const days = Math.round(tr.transitDays)
  const day = Math.min(days, Math.floor((f * (cruise.end - cruise.start)) / 86_400) + 1)

  return (
    <figure className="inset">
      <svg className="inset__map" viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`} role="img" aria-label={I.aria}>
        <defs>
          <radialGradient id="inset-sun">
            <stop offset="0" stopColor="#ffe3a3" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffb760" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r={0.34} fill="url(#inset-sun)" />
        <circle r={0.075} fill="#ffd98a" />
        <polyline points={map.earthOrbit} className="inset__orbit inset__orbit--earth" />
        <polyline points={map.marsOrbit} className="inset__orbit inset__orbit--mars" />
        <polyline points={pts(map.arc)} className="inset__arc" />
        <polyline points={flown} className="inset__flown" />
        <circle cx={ex} cy={ey} r={0.085} className="inset__earth" />
        <circle cx={mx} cy={my} r={0.075} className="inset__mars" />
        <circle cx={sx} cy={sy} r={0.17} className="inset__halo" />
        <circle cx={sx} cy={sy} r={0.06} className="inset__ship" />
      </svg>
      <figcaption className="inset__facts">
        <span className="label">{I.transit}</span>
        <span className="inset__value">{I.day({ d: day, n: days })}</span>
        <span className="label">{I.signal}</span>
        <span className="inset__value">{I.delay({ m: Math.floor(light / 60), s: Math.floor(light % 60) })}</span>
        <span className="inset__legend">
          <span className="inset__key inset__key--earth">{L.ui.scene.earth}</span>
          <span className="inset__key inset__key--mars">{L.ui.scene.mars}</span>
          <span className="inset__key inset__key--ship">{L.ui.scene.ship}</span>
        </span>
      </figcaption>
    </figure>
  )
}
