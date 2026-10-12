/**
 * Atmosphere models.
 *  - Earth: US Standard Atmosphere 1976 (7 layers to 86 km) + exponential extension to 150 km.
 *  - Mars: Mars Climate Database sample profile (Viking-1 season), log-linear interpolation,
 *    with a dust/density scale factor; NASA Glenn two-zone fit for temperature below 7 km.
 * All altitudes in metres, densities in kg/m³, pressures in Pa, temperatures in K.
 */

const USSA_G0 = 9.80665
const USSA_M = 28.9644 // kg/kmol
const USSA_RSTAR = 8.31432e3 // J/(kmol·K)
const R_AIR = USSA_RSTAR / USSA_M // 287.05 J/(kg·K)

// base geopotential altitude (m), base pressure (Pa), base temperature (K), lapse rate (K/m)
const USSA_LAYERS: Array<[number, number, number, number]> = [
  [0, 101_325, 288.15, -0.0065],
  [11_000, 22_632.1, 216.65, 0],
  [20_000, 5_474.89, 216.65, 0.001],
  [32_000, 868.019, 228.65, 0.0028],
  [47_000, 110.9063, 270.65, 0],
  [51_000, 66.9389, 270.65, -0.0028],
  [71_000, 3.95642, 214.65, -0.002],
]

export interface AtmoState {
  rho: number // kg/m³
  p: number // Pa
  T: number // K
  a: number // speed of sound m/s
}

const EARTH_RADIUS_M = 6_356_766 // USSA76 reference radius for geopotential conversion

/** Geometric altitude (m) → geopotential altitude (m). */
function geopotential(hGeom: number): number {
  return (EARTH_RADIUS_M * hGeom) / (EARTH_RADIUS_M + hGeom)
}

/** Earth atmosphere, valid 0–150 km; returns rho = 0 above ~150 km. */
export function earthAtmosphere(hGeom: number): AtmoState {
  if (hGeom < 0) hGeom = 0
  const h = geopotential(hGeom)
  if (h <= 86_000) {
    let i = USSA_LAYERS.length - 1
    while (i > 0 && h < USSA_LAYERS[i][0]) i--
    const [hb, pb, Tb, L] = USSA_LAYERS[i]
    let T: number
    let p: number
    if (L === 0) {
      T = Tb
      p = pb * Math.exp((-USSA_G0 * USSA_M * (h - hb)) / (USSA_RSTAR * Tb))
    } else {
      T = Tb + L * (h - hb)
      p = pb * Math.pow(Tb / T, (USSA_G0 * USSA_M) / (USSA_RSTAR * L))
    }
    const rho = p / (R_AIR * T)
    return { rho, p, T, a: Math.sqrt(1.4 * R_AIR * T) }
  }
  // Exponential extension above 86 km (piecewise scale heights fitted to USSA76 table values:
  // 86 km 6.96e-6, 100 km 5.6e-7, 120 km 2.2e-8, 150 km 2.1e-9 kg/m³). Thermosphere varies a few × with solar activity.
  const anchors: Array<[number, number, number]> = [
    // [h_m, rho, T]
    [86_000, 6.96e-6, 186.9],
    [100_000, 5.6e-7, 195.1],
    [120_000, 2.2e-8, 360],
    [150_000, 2.1e-9, 634],
    [200_000, 2.5e-10, 854],
  ]
  if (hGeom >= 200_000) return { rho: 0, p: 0, T: 854, a: 586 }
  let i = 0
  while (i < anchors.length - 2 && hGeom > anchors[i + 1][0]) i++
  const [h0, r0, T0] = anchors[i]
  const [h1, r1, T1] = anchors[i + 1]
  const f = (hGeom - h0) / (h1 - h0)
  const rho = Math.exp(Math.log(r0) + f * (Math.log(r1) - Math.log(r0)))
  const T = T0 + f * (T1 - T0)
  return { rho, p: rho * R_AIR * T, T, a: Math.sqrt(1.4 * R_AIR * T) }
}

// ---------------- Mars ----------------

const R_CO2 = 192.1 // J/(kg·K), mean molecular mass 43.3
const GAMMA_CO2 = 1.3

// Mars Climate Database sample profile (Viking 1 entry season, Ls = 98.9°): [alt km, T K, p Pa, rho kg/m³]
// 100 and 125 km rows are extrapolations (×3 uncertain) per the research notes.
const MCD_PROFILE: Array<[number, number, number, number]> = [
  [0, 233.2, 683.3, 1.533e-2],
  [10, 205.4, 280.5, 7.13e-3],
  [20, 187.8, 104.3, 2.888e-3],
  [40, 137.9, 8.738, 3.304e-4],
  [60, 159.4, 0.5805, 1.921e-5],
  [80, 157.6, 0.0394, 1.31e-6],
  [100, 150, 0.0038, 1.4e-7],
  [125, 145, 0.00022, 8.0e-9],
  [150, 160, 0.00001, 3.0e-10],
]

/**
 * Mars atmosphere from the MCD profile with log-linear density interpolation.
 * `densityScale` multiplies density (dust storms / seasonal variation; Mars-GRAM 3σ at 50–80 km ≈ ±50%).
 */
export function marsAtmosphere(hGeom: number, densityScale = 1): AtmoState {
  const hKm = Math.max(0, hGeom / 1000)
  if (hKm >= 150) return { rho: 0, p: 0, T: 160, a: Math.sqrt(GAMMA_CO2 * R_CO2 * 160) }
  let i = 0
  while (i < MCD_PROFILE.length - 2 && hKm > MCD_PROFILE[i + 1][0]) i++
  const [h0, T0, p0, r0] = MCD_PROFILE[i]
  const [h1, T1, p1, r1] = MCD_PROFILE[i + 1]
  const f = (hKm - h0) / (h1 - h0)
  const rho = Math.exp(Math.log(r0) + f * (Math.log(r1) - Math.log(r0))) * densityScale
  const p = Math.exp(Math.log(p0) + f * (Math.log(p1) - Math.log(p0))) * densityScale
  const T = T0 + f * (T1 - T0)
  return { rho, p, T, a: Math.sqrt(GAMMA_CO2 * R_CO2 * T) }
}

/**
 * Drag coefficient vs Mach for a slender launch vehicle.
 * UNSOURCED engineering rule (no published Cd(M) table was found in the research):
 * ~0.3 subsonic, transonic peak ~0.6 near M 1.1–1.3, 0.3 at M 3, 0.25 at M ≥ 5.
 */
export function rocketCd(mach: number): number {
  const pts: Array<[number, number]> = [
    [0, 0.28],
    [0.8, 0.3],
    [1.0, 0.5],
    [1.2, 0.6],
    [1.6, 0.5],
    [2.5, 0.35],
    [3.0, 0.3],
    [5.0, 0.25],
    [25, 0.22],
  ]
  if (mach <= 0) return pts[0][1]
  for (let i = 0; i < pts.length - 1; i++) {
    const [m0, c0] = pts[i]
    const [m1, c1] = pts[i + 1]
    if (mach <= m1) return c0 + ((mach - m0) / (m1 - m0)) * (c1 - c0)
  }
  return pts[pts.length - 1][1]
}
