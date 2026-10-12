import type { MissionConfig } from './types'
import { WINDOWS } from './transfer'

export const DEFAULT_CONFIG: MissionConfig = {
  vehicleId: 'starship-v3',
  departure: WINDOWS[1].departure,
  transitDays: WINDOWS[1].transitDays,
  crew: 4,
  cargo: 10_000,
  crewSystems: 20_000,
  consumablesMargin: 0.3,
  waterRecovery: 0.98,
  oxygenRecovery: 0.5,
  tankers: 12,
  propPerTanker: 100_000,
  tankerCadenceDays: 10,
  boiloffPerDay: 0.001,
  shipDryMass: 140_000,
  boosterDryMass: 250_000,
  entryFpaDeg: -12,
  densityScale: 1,
  heatingMargin: 1,
  gLimit: 5,
  bankDeg: 0,
  autoBank: true,
  expendable: false,
  parkingOrbitKm: 200,
}

export interface Preset {
  id: string
  name: string
  blurb: string
  patch: Partial<MissionConfig>
}

/** Assumption presets for Starship — the four numbers the verdict actually hinges on. */
export const PRESETS: Preset[] = [
  {
    id: 'claims',
    name: 'SpaceX claims',
    blurb: '150 t per tanker, 0.05 %/day boil-off, a tanker every 7 days, light ship.',
    patch: { propPerTanker: 150_000, boiloffPerDay: 0.0005, tankerCadenceDays: 7, tankers: 10, shipDryMass: 120_000, boosterDryMass: 230_000 },
  },
  {
    id: 'independent',
    name: 'Independent estimates',
    blurb: '100 t per tanker, 0.1 %/day boil-off, 10-day cadence, 12 tankers (Rapp, Notardonato).',
    patch: { propPerTanker: 100_000, boiloffPerDay: 0.001, tankerCadenceDays: 10, tankers: 12, shipDryMass: 140_000, boosterDryMass: 250_000 },
  },
  {
    id: 'demonstrated',
    name: 'Demonstrated so far',
    blurb: 'Three flights in 2026 at ~60-day gaps, no transfer ever done, uninsulated tanks (0.5 %/day).',
    patch: { propPerTanker: 100_000, boiloffPerDay: 0.005, tankerCadenceDays: 60, tankers: 12, shipDryMass: 160_000, boosterDryMass: 275_000 },
  },
]
