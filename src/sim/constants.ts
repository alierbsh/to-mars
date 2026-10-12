/**
 * Physical constants. Units: km, km/s, s unless noted.
 * Sources: JPL SSD astrodynamic parameters (DE440), NSSDC planetary fact sheets.
 * See docs/research/notes/simulation_physics.md.
 */

export const G0 = 9.80665 // m/s² — standard gravity (Isp definition)
export const AU_KM = 149_597_870.7

// Gravitational parameters, km³/s² (DE440)
export const MU_SUN = 1.32712440041279419e11
export const MU_EARTH = 398_600.435507
export const MU_MOON = 4_902.800118
export const MU_MARS = 42_828.375816 // Mars system

// Radii, km (NSSDC)
export const R_EARTH_EQ = 6_378.137
export const R_EARTH_MEAN = 6_371.0
export const R_MARS_EQ = 3_396.2
export const R_MARS_MEAN = 3_389.5

// Rotation (sidereal), s
export const EARTH_SIDEREAL_DAY = 23.9345 * 3600
export const MARS_SIDEREAL_DAY = 24.6229 * 3600
export const EARTH_OMEGA = (2 * Math.PI) / EARTH_SIDEREAL_DAY // rad/s
export const MARS_OMEGA = (2 * Math.PI) / MARS_SIDEREAL_DAY

// Surface gravity, m/s²
export const G_EARTH = 9.780
export const G_MARS = 3.721

// Spheres of influence, km (Conte 2014)
export const SOI_EARTH = 924_652
export const SOI_MARS = 577_133

// Synodic period Earth–Mars, days (NASA/TM-2010-216764)
export const SYNODIC_DAYS = 779.935

// Sutton–Graves stagnation-point heating constants, SI (q [W/m²] = k·sqrt(rho/Rn)·V³ with rho kg/m³, Rn m, V m/s)
export const SUTTON_GRAVES_EARTH = 1.74e-4
export const SUTTON_GRAVES_MARS = 1.89e-4 // 97% CO2 / 3% N2 (Mitcheltree et al.)

export const STEFAN_BOLTZMANN = 5.670374419e-8 // W/(m²·K⁴)

export const DAY_S = 86_400
export const J2000_JD = 2_451_545.0
