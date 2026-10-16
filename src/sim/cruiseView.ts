/**
 * The cruise next to the planets, as the cruise view (scene/CruiseScene.tsx) and the lower third
 * (ui/hud.ts) show it. The transfer (transfer.ts) is a heliocentric arc from Earth's centre to
 * Mars's; for its first and last days the ship's distance from the planet comes from the planet's
 * hyperbola instead — the escape from a 200 km periapsis at the middle of the departure burn, the
 * approach down to the entry interface (125 km up) over a 30 km periapsis — handed over to the
 * transfer's own over a few days, where the two agree. Pure TypeScript.
 */
import { DAY_S, MU_EARTH, MU_MARS, R_EARTH_MEAN, R_MARS_MEAN } from './constants'
import type { TransferResult } from './types'
import { norm, sub } from './vec'

/** km: the departure hyperbola's periapsis (the parking orbit, 200 km up) */
export const DEPART_RP = R_EARTH_MEAN + 200
/** s: periapsis — the burn's middle — before the cruise begins (the burn takes ~100 s) */
export const DEPART_T0 = 53
/** km: the arrival hyperbola's periapsis, 30 km up (it never gets there: the atmosphere takes over) */
export const ARRIVE_RP = R_MARS_MEAN + 30
/** km: the entry interface's altitude, where the cruise ends */
export const ENTRY_ALT = 125

/**
 * On a hyperbola (periapsis rp km, excess speed vinf km/s, planet mu km³/s²), |t| s from
 * periapsis: the distance from the planet's centre (km) and the flight-path angle (rad, between
 * the velocity and the local horizontal — 0 at periapsis, toward 90° far out).
 */
export function hyperbola(t: number, rp: number, vinf: number, mu: number): { r: number; gamma: number } {
  const a = mu / (vinf * vinf)
  const e = 1 + rp / a
  const M = Math.sqrt(mu / (a * a * a)) * Math.abs(t)
  let F = Math.asinh(M / e)
  for (let i = 0; i < 40; i++) {
    const step = (e * Math.sinh(F) - F - M) / (e * Math.cosh(F) - 1)
    F -= step
    if (Math.abs(step) < 1e-12) break
  }
  const den = e * Math.cosh(F) - 1
  const cosNu = (e - Math.cosh(F)) / den
  const sinNu = (Math.sqrt(e * e - 1) * Math.sinh(F)) / den
  return { r: a * den, gamma: Math.atan2(e * sinNu, 1 + e * cosNu) }
}

const eiCache = new Map<number, number>()

/** s before periapsis that the arrival hyperbola crosses the entry interface */
export function entryInterfaceTime(vinf: number): number {
  const hit = eiCache.get(vinf)
  if (hit !== undefined) return hit
  let lo = 0
  let hi = 7200
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (hyperbola(mid, ARRIVE_RP, vinf, MU_MARS).r < R_MARS_MEAN + ENTRY_ALT) lo = mid
    else hi = mid
  }
  eiCache.set(vinf, lo)
  return lo
}

/** 0 → 1 as x goes from a to b (either way round), eased */
export function smooth(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** how much of the transfer's own geometry to use τ s after the burn (0: the escape hyperbola) */
export const departBlend = (tau: number) => smooth(2.5 * DAY_S, 6 * DAY_S, tau)
/** …and `left` s before the entry interface (0: the approach hyperbola) */
export const arriveBlend = (left: number) => smooth(1.5 * DAY_S, 4 * DAY_S, left)

/** the escape hyperbola τ s after the burn ends */
export const departHyperbola = (tr: TransferResult, tau: number) => hyperbola(tau + DEPART_T0, DEPART_RP, tr.vInfDep, MU_EARTH)
/** the approach hyperbola `left` s before the entry interface (`tEI`: entryInterfaceTime) */
export const arriveHyperbola = (tr: TransferResult, left: number, tEI: number) => hyperbola(tEI + left, ARRIVE_RP, tr.vInfArr, MU_MARS)

/**
 * The ship's distances (km, centre to centre) from Earth and to Mars τ s into a cruise of `dur` s:
 * the transfer's samples (linear between them), the hyperbolas next to the planets.
 */
export function cruiseDistances(tr: TransferResult, tau: number, dur: number, tEI = entryInterfaceTime(tr.vInfArr)): { fromEarth: number; toMars: number } {
  const S = tr.samples
  const n = S.length - 1
  const x = Math.min(1, Math.max(0, tau / Math.max(dur, 1))) * n
  const i = Math.min(n - 1, Math.floor(x))
  const u = x - i
  const lerp = (a: number, b: number) => a + (b - a) * u
  const de = lerp(norm(sub(S[i].ship, S[i].earth)), norm(sub(S[i + 1].ship, S[i + 1].earth)))
  const dm = lerp(norm(sub(S[i].ship, S[i].mars)), norm(sub(S[i + 1].ship, S[i + 1].mars)))
  const left = Math.max(0, dur - tau)
  const he = departHyperbola(tr, tau).r
  const hm = arriveHyperbola(tr, left, tEI).r
  const we = departBlend(tau)
  const wm = arriveBlend(left)
  return { fromEarth: he + (de - he) * we, toMars: hm + (dm - hm) * wm }
}
