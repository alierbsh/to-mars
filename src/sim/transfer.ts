/**
 * Earth → Mars transfer: Lambert solution between the two planets' JPL-element positions,
 * departure/arrival hyperbolic excess speeds, Δv from a circular parking orbit (Oberth),
 * entry speed at the Mars atmospheric interface, and heliocentric samples for the cruise view.
 */
import { DAY_S, MU_EARTH, MU_MARS, MU_SUN, R_EARTH_MEAN, R_MARS_EQ } from './constants'
import { julianDate, planetState } from './ephemeris'
import { lambert, propagate } from './orbit'
import type { TransferResult } from './types'
import { norm, sub } from './vec'

export const ENTRY_INTERFACE_KM = 125

/** Δv (km/s) to leave a circular parking orbit of radius r (km) onto a hyperbola with v∞² = c3. */
export function escapeDv(c3: number, r: number, mu = MU_EARTH): number {
  return Math.sqrt(c3 + (2 * mu) / r) - Math.sqrt(mu / r)
}

/** Speed (km/s) at radius r (km) arriving from infinity with vInf. */
export function entrySpeed(vInf: number, r: number, mu = MU_MARS): number {
  return Math.sqrt(vInf * vInf + (2 * mu) / r)
}

export function computeTransfer(departure: Date, transitDays: number, parkingAltKm: number, finiteBurnLoss = 0.02): TransferResult {
  const jd1 = julianDate(departure)
  const jd2 = jd1 + transitDays
  const e = planetState('earth', jd1)
  const m = planetState('mars', jd2)
  const sol = lambert(e.r, m.r, transitDays * DAY_S, MU_SUN, true)
  const vInfDepVec = sub(sol.v1, e.v)
  const vInfArrVec = sub(sol.v2, m.v)
  const vInfDep = norm(vInfDepVec)
  const vInfArr = norm(vInfArrVec)
  const c3 = vInfDep * vInfDep
  const rPark = R_EARTH_MEAN + parkingAltKm
  const dvTmi = escapeDv(c3, rPark) * (1 + finiteBurnLoss)
  const entryVel = entrySpeed(vInfArr, R_MARS_EQ + ENTRY_INTERFACE_KM)

  // cruise samples every ~2 days (max ~200 samples)
  const n = Math.min(200, Math.max(40, Math.round(transitDays / 2)))
  const samples: TransferResult['samples'] = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const dt = f * transitDays * DAY_S
    const ship = propagate(e.r, sol.v1, dt, MU_SUN)
    const jd = jd1 + f * transitDays
    const es = planetState('earth', jd)
    const ms = planetState('mars', jd)
    samples.push({ jd, ship: ship.r, earth: es.r, mars: ms.r })
  }
  return { departureJD: jd1, arrivalJD: jd2, transitDays, c3, vInfDep, vInfArr, dvTmi, entryVel, samples, converged: sol.converged }
}

export interface WindowOption {
  id: string
  label: string
  /** ISO date of the minimum-C3 departure (NASA/TM-2010-216764 table) */
  departure: string
  transitDays: number
  note: string
}

/** Departure opportunities from the NASA Glenn mission-design handbook table (min-C3, conjunction class). */
export const WINDOWS: WindowOption[] = [
  { id: 'w2026', label: '2026 (Oct–Nov)', departure: '2026-10-31', transitDays: 292, note: 'C3 9.1 km²/s², arrival v∞ 2.7 km/s — the window SpaceX let pass' },
  { id: 'w2028', label: '2028 / 29', departure: '2028-12-02', transitDays: 318, note: 'C3 8.9, arrival v∞ 3.3 km/s — SpaceX "NET 2028" cargo target' },
  { id: 'w2031', label: '2031', departure: '2031-02-23', transitDays: 320, note: 'C3 8.2 but arrival v∞ 5.5 km/s — a hot entry' },
  { id: 'w2033', label: '2033', departure: '2033-04-28', transitDays: 274, note: 'Cheapest departure of the decade (C3 7.8); arrival v∞ 4.4 km/s' },
  { id: 'w2035', label: '2035', departure: '2035-06-22', transitDays: 198, note: 'C3 10.2, arrival v∞ 2.7 km/s — fast and gentle' },
]
