/**
 * Approximate planetary positions from JPL SSD "Keplerian Elements for Approximate Positions
 * of the Major Planets" (E.M. Standish), Table 1, valid 1800–2050.
 * Frame: heliocentric, J2000 mean ecliptic. Units: km, km/s.
 * Stated accuracy for Mars: ~40 arcsec in longitude, ~25,000 km in distance.
 */
import { AU_KM, DAY_S, J2000_JD } from './constants'
import type { Vec3 } from './vec'
import { scale, sub } from './vec'

const DEG = Math.PI / 180

interface Elements {
  a: number // au
  e: number
  I: number // deg
  L: number // deg
  w: number // longitude of perihelion, deg
  O: number // longitude of ascending node, deg
}

interface ElementSet {
  base: Elements
  rate: Elements // per Julian century
}

export type Body = 'earth' | 'mars'

const TABLE: Record<Body, ElementSet> = {
  earth: {
    // Earth–Moon barycentre
    base: { a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, w: 102.93768193, O: 0.0 },
    rate: { a: 0.00000562, e: -0.00004392, I: -0.01294668, L: 35999.37244981, w: 0.32327364, O: 0.0 },
  },
  mars: {
    base: { a: 1.52371034, e: 0.0933941, I: 1.84969142, L: -4.55343205, w: -23.94362959, O: 49.55953891 },
    rate: { a: 0.00001847, e: 0.00007882, I: -0.00813131, L: 19140.30268499, w: 0.44441088, O: -0.29257343 },
  },
}

/** Julian Date from a UTC Date (TDB−UTC ≈ 69 s is ignored: ~1,700 km on Mars, inside the model accuracy). */
export function julianDate(d: Date): number {
  return d.getTime() / DAY_S / 1000 + 2_440_587.5
}

export function dateFromJD(jd: number): Date {
  return new Date((jd - 2_440_587.5) * DAY_S * 1000)
}

function solveKepler(M: number, e: number): number {
  // M in radians; Newton iteration to 1e-6 deg
  let E = M + e * Math.sin(M)
  for (let i = 0; i < 30; i++) {
    const dM = M - (E - e * Math.sin(E))
    const dE = dM / (1 - e * Math.cos(E))
    E += dE
    if (Math.abs(dE) < 1e-6 * DEG) break
  }
  return E
}

/** Heliocentric position (km) of a body at Julian date `jd`. */
export function planetPosition(body: Body, jd: number): Vec3 {
  const { base, rate } = TABLE[body]
  const T = (jd - J2000_JD) / 36525
  const a = base.a + rate.a * T
  const e = base.e + rate.e * T
  const I = (base.I + rate.I * T) * DEG
  const L = base.L + rate.L * T
  const wbar = base.w + rate.w * T
  const O = (base.O + rate.O * T) * DEG
  const w = (wbar - (base.O + rate.O * T)) * DEG
  let M = ((L - wbar) % 360) * DEG
  if (M > Math.PI) M -= 2 * Math.PI
  if (M < -Math.PI) M += 2 * Math.PI
  const E = solveKepler(M, e)
  const xp = a * (Math.cos(E) - e)
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E)
  const cw = Math.cos(w)
  const sw = Math.sin(w)
  const cO = Math.cos(O)
  const sO = Math.sin(O)
  const cI = Math.cos(I)
  const sI = Math.sin(I)
  const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp
  const y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp
  const z = sw * sI * xp + cw * sI * yp
  return [x * AU_KM, y * AU_KM, z * AU_KM]
}

/** Heliocentric state (km, km/s); velocity by central finite difference over ±0.5 day. */
export function planetState(body: Body, jd: number): { r: Vec3; v: Vec3 } {
  const r = planetPosition(body, jd)
  const h = 0.5 // days
  const rp = planetPosition(body, jd + h)
  const rm = planetPosition(body, jd - h)
  const v = scale(sub(rp, rm), 1 / (2 * h * DAY_S))
  return { r, v }
}
