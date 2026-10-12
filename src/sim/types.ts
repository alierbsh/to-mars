/**
 * Shared simulation types: vehicles, mission configuration, results.
 * Masses in kg, thrust in N, Isp in s, lengths in m unless stated.
 */
import type { MarsWeather } from './weather'

export interface EngineGroup {
  label: string
  count: number
  thrustVac: number // N per engine
  ispVac: number // s
  /** Sea-level Isp (optional). Exit area is derived from the SL/vac pair when given. */
  ispSL?: number
  /** Nozzle exit area m² per engine (optional alternative to ispSL). */
  exitArea?: number
  minThrottle?: number
}

export type StageRole = 'booster' | 'core' | 'upper'

/** launch pad environments at Cape Canaveral / Kennedy Space Center */
export type PadId = 'lc39a-starship' | 'lc39b-ml' | 'lc39a-fss' | 'lc36' | 'slc37' | 'lc39a-lut'

export interface Stage {
  id: string
  name: string
  role: StageRole
  /** number of identical parallel units (boosters) */
  count?: number
  dryMass: number
  propMass: number
  engines: EngineGroup[]
  /** fraction of propellant held back for booster return (not usable for ascent) */
  reserveFrac?: number
  diameter: number
  length: number
  /** throttle of this stage while parallel boosters are still attached (e.g. Falcon Heavy core 0.7) */
  throttleWhileBoosters?: number
  /** reusable: booster flies back / is caught (visual + reserve) */
  reusable?: boolean
}

export interface EntryModel {
  kind: 'capsule' | 'ship' | 'aeroshell'
  /** aerodynamic reference area m² (planform for belly-first ship, base area for capsule) */
  refArea: number
  cd: number
  /** lift-to-drag ratio at trim */
  ld: number
  /** effective stagnation nose radius m */
  noseRadius: number
  /** allowable peak stagnation heat flux W/cm² (after the model's margin factor) */
  tpsLimit: number
  tpsName: string
  /** total heat load limit J/cm² (0 = not modelled) */
  heatLoadLimit?: number
}

export interface LandingModel {
  /** total thrust N available for the landing burn (Mars), vacuum */
  thrust: number
  isp: number
  minThrottle: number
  /** propellant reserved for landing, kg (Starship: from the main tanks) */
  reserve: number
  /** engines used for landing (visual) */
  label: string
}

export interface Spacecraft {
  id: string
  name: string
  /** structure + systems, excluding propellant and consumables */
  dryMass: number
  /** on-board propellant for its own propulsion (service module / tanks when not refuelled) */
  propMass: number
  isp: number
  thrust: number // N, main propulsion
  crewCapacity: number
  /** nominal free-flight life support, days (capsules). For habitats use consumables instead. */
  lifeSupportDays: number
  /** usable pressurised volume m³ */
  volume: number
  entry: EntryModel | null
  landing: LandingModel | null
  /** storm shelter / shielding g/cm² water-equivalent (0 = none) */
  shielding: number
  /** mass of the part that actually enters the Mars atmosphere (capsule without service module), kg; 0 = whole vehicle */
  entryMass?: number
}

export type VehicleStatus = 'flown' | 'development' | 'historical' | 'hypothetical'

export interface Vehicle {
  id: string
  name: string
  short: string
  manufacturer: string
  status: VehicleStatus
  badge: string
  tagline: string
  description: string
  height: number
  stages: Stage[]
  fairingMass: number
  /** altitude (m) where the fairing is dropped; null if no fairing */
  fairingJettisonAlt: number | null
  spacecraft: Spacecraft
  /** All launches are staged from the Cape (the owner's premise); `pad` picks the 3D pad environment. */
  launchSite: { name: string; lat: number; pad: PadId }
  /** acceleration cap during ascent, g */
  maxAccelG: number
  /** can be refuelled in LEO (Starship) */
  refuelable: boolean
  /** propellant capacity of the final stage when refuelled, kg */
  refuelCapacity?: number
  /** first flight / status line shown in UI */
  record: string
  sources: Array<{ label: string; url: string }>
  /** confidence tags for the key numbers */
  confidence: string
}

// ---------------- Mission configuration ----------------

export interface MissionConfig {
  vehicleId: string
  /** departure date ISO (window) */
  departure: string
  /** transit days (Lambert time of flight) */
  transitDays: number
  crew: number
  /** cargo carried in addition to crew systems, kg */
  cargo: number
  /** crew systems mass (ECLSS, cabin, shelter) kg — habitats only */
  crewSystems: number
  /** consumables carried, kg (0 = sized automatically with margin) */
  consumablesMargin: number // fraction extra over the nominal need, e.g. 0.3
  /** ECLSS closure: fraction of water / oxygen recovered */
  waterRecovery: number
  oxygenRecovery: number
  // refuelling (Starship)
  tankers: number
  propPerTanker: number // kg
  tankerCadenceDays: number
  boiloffPerDay: number // fraction/day
  /** optional overrides of the final stage dry mass (kg) and booster dry mass */
  shipDryMass?: number
  boosterDryMass?: number
  // entry
  entryFpaDeg: number // negative, e.g. -12
  densityScale: number
  heatingMargin: number // multiplier on Sutton–Graves (≥1)
  gLimit: number
  bankDeg: number
  /** lift-up until pull-out, then lift-down to prevent skip-out (simple bank modulation) */
  autoBank: boolean
  /** expendable launch (no booster reserves) */
  expendable: boolean
  parkingOrbitKm: number
  // Mars weather at arrival
  /** 'random' draws from the storm climatology, seeded by the arrival date */
  dustStorm: 'random' | 'none' | 'regional' | 'global'
  /** mean surface wind at the site, m/s (raised by storms) */
  surfaceWind: number
}

// ---------------- Results ----------------

export type Severity = 'info' | 'ok' | 'warn' | 'fail'

export interface SimEvent {
  /** mission elapsed time, s */
  t: number
  phase: Phase
  label: string
  detail: string
  severity: Severity
}

export type Phase = 'ascent' | 'leo' | 'tmi' | 'cruise' | 'entry' | 'landing' | 'done'

export interface AscentSample {
  t: number
  alt: number // m
  vel: number // m/s inertial
  velRel: number // m/s air-relative
  mach: number
  q: number // Pa
  accel: number // g
  mass: number
  downrange: number // km
  thrust: number // N
  pitch: number // deg from vertical
  stage: string
}

export interface EntrySample {
  t: number
  alt: number
  vel: number
  mach: number
  gLoad: number
  heatFlux: number // W/cm²
  heatLoad: number // J/cm²
  mass: number
  downrange: number
  q: number
  burning: boolean
  fpa: number
}

export interface AscentResult {
  ok: boolean
  reason?: string
  events: SimEvent[]
  telemetry: AscentSample[]
  /** mass delivered to the parking orbit including the final stage and residuals */
  massInOrbit: number
  /** residual usable propellant in the final stage at SECO (kg) */
  residualProp: number
  finalStageDry: number
  orbit: { rp: number; ra: number; alt: number; vel: number } | null
  kickAngle: number
  losses: { gravity: number; drag: number; steering: number; dvExpended: number }
  duration: number
  /** peak values */
  maxQ: { q: number; t: number; alt: number }
  maxG: number
  /** per-stage separation times for the visualiser */
  stageTimes: Array<{ id: string; sep: number }>
}

export interface TransferResult {
  departureJD: number
  arrivalJD: number
  transitDays: number
  c3: number // km²/s²
  vInfDep: number // km/s
  vInfArr: number // km/s
  dvTmi: number // km/s from the parking orbit (impulsive + finite-burn allowance)
  entryVel: number // km/s at 125 km
  /** heliocentric samples for the cruise view: [jd, ship xyz, earth xyz, mars xyz] (km) */
  samples: Array<{ jd: number; ship: [number, number, number]; earth: [number, number, number]; mars: [number, number, number] }>
  converged: boolean
}

export interface LeoResult {
  events: SimEvent[]
  propAtDeparture: number
  campaignDays: number
  boiloffLost: number
  tankersLaunched: number
  /** usable propellant for TMI after landing reserve */
  usableProp: number
  dvAvailable: number // km/s
  massAtDeparture: number
}

export interface CruiseResult {
  events: SimEvent[]
  days: number
  consumablesNeeded: number
  consumablesCarried: number
  consumablesRunOutDay: number | null
  doseMsv: number
  lifeSupportOk: boolean
}

export interface EntryResult {
  ok: boolean
  reason?: string
  events: SimEvent[]
  telemetry: EntrySample[]
  peakG: number
  peakHeatFlux: number
  heatLoad: number
  landed: boolean
  crashed: boolean
  /** touched down on a rock or slope the legs could not take (blind landing in dust) */
  tipped?: boolean
  touchdownVel: number
  landingDv: number
  landingPropUsed: number
  duration: number
  entryMass: number
  beta: number
}

export interface Verdict {
  outcome: 'landed' | 'orbit-only' | 'flyby' | 'lost-in-transit' | 'failed-launch' | 'failed-tmi' | 'crashed' | 'burned-up'
  crewAlive: boolean
  headline: string
  summary: string
  firstFailure: SimEvent | null
  reached: { leo: boolean; tmi: boolean; mars: boolean; surface: boolean }
  stats: Array<{ label: string; value: string; note?: string; severity?: Severity }>
}

export interface MissionResult {
  config: MissionConfig
  vehicleId: string
  ascent: AscentResult
  leo: LeoResult | null
  transfer: TransferResult | null
  cruise: CruiseResult | null
  entry: EntryResult | null
  weather: MarsWeather | null
  verdict: Verdict
  events: SimEvent[]
  /** phase boundaries in mission time (s) */
  phases: Array<{ phase: Phase; start: number; end: number; label: string }>
  computeMs: number
}
