/**
 * Mars weather at arrival: the season from the areocentric solar longitude (Allison & McEwen
 * 2000), and the dust-storm state — chosen at random, seeded by the arrival date so a given
 * mission always gets the same weather, with the climatology from the storm record:
 *  - regional storms are common in southern spring and summer (Ls 180–330°), rare otherwise;
 *  - planet-encircling (global) storms have come in roughly one Mars year in three, all in that
 *    season (1956, 1971, 1973, 1977 ×2, 1982, 1994, 2001, 2007, 2018).
 * Effects on entry: dust heating lifts and expands the atmosphere, so density at entry altitudes
 * rises (MRO/MGS aerobraking saw ×2 at 100 km in 2001; here +25 % regional, +60 % global above
 * 30 km, tapering to the surface where pressure is set by the atmosphere's mass). Visibility
 * collapses, so optical terrain-relative navigation and hazard avoidance are blind. Surface winds
 * rise to 20–30 m/s, which in 0.6 % of Earth's air pressure cannot push a 200 t ship over
 * (the drag moment on a standing Starship at 30 m/s is ~0.1 % of its restoring moment) — the
 * wind matters for what the landing can see, not for what it can stand.
 */
import { J2000_JD } from './constants'
import { hash2 } from '../scene/noise'

export type StormKind = 'none' | 'regional' | 'global'
export type DustStormSetting = 'random' | StormKind

export interface MarsWeather {
  /** areocentric solar longitude at arrival, degrees */
  ls: number
  season: string
  storm: StormKind
  /** visible optical depth */
  tau: number
  /** density multiplier at entry altitudes */
  densityFactor: number
  /** surface wind, m/s (mean), and gusts */
  wind: number
  gust: number
  /** chance that a landing without hazard avoidance hits a rock or slope the legs cannot take */
  hazardChance: number
  /** the seeded draw used for the hazard, 0..1 */
  roll: number
}

/** Ls in degrees (Allison & McEwen 2000, truncated series; accurate to ~0.1°) */
export function solarLongitude(jd: number): number {
  const dj = jd - J2000_JD
  const M = ((19.387 + 0.52402075 * dj) * Math.PI) / 180
  const aFMS = 270.3863 + 0.52403840 * dj
  const ls = aFMS + (10.691 + 3e-7 * dj) * Math.sin(M) + 0.623 * Math.sin(2 * M) + 0.05 * Math.sin(3 * M) + 0.005 * Math.sin(4 * M)
  return ((ls % 360) + 360) % 360
}

export function seasonName(ls: number): string {
  if (ls < 90) return 'northern spring'
  if (ls < 180) return 'northern summer'
  if (ls < 270) return 'southern spring — dust-storm season'
  return 'southern summer — dust-storm season'
}

export function marsWeather(arrivalJd: number, setting: DustStormSetting, surfaceWind: number): MarsWeather {
  const ls = solarLongitude(arrivalJd)
  const stormSeason = ls >= 180 && ls <= 330
  const seed = Math.floor(arrivalJd)
  const draw = hash2(seed, 17)
  const roll = hash2(seed, 29)
  let storm: StormKind
  if (setting !== 'random') storm = setting
  else if (stormSeason) storm = draw < 0.2 ? 'global' : draw < 0.6 ? 'regional' : 'none'
  else storm = draw < 0.08 ? 'regional' : 'none'
  const tau = storm === 'global' ? 4.5 : storm === 'regional' ? 1.8 : 0.5
  const densityFactor = storm === 'global' ? 1.6 : storm === 'regional' ? 1.25 : 1
  const wind = storm === 'global' ? Math.max(surfaceWind, 25) : storm === 'regional' ? Math.max(surfaceWind, 18) : surfaceWind
  const gust = wind * 1.4
  // hazard: with terrain-relative navigation and hazard avoidance (Perseverance-class) a few per
  // cent; blind in a regional storm a tenth; blind in a global storm, a quarter
  const hazardChance = storm === 'global' ? 0.25 : storm === 'regional' ? 0.1 : 0.02
  return { ls, season: seasonName(ls), storm, tau, densityFactor, wind, gust, hazardChance, roll }
}
