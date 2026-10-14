import { DEFAULT_CONFIG, PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import type { MissionConfig, Verdict } from '../sim/types'

/** the configuration of one scoreboard cell: the defaults, the assumption set, the window, the ship */
export function cellConfig(vehicleId: string, presetId: string, windowId: string): MissionConfig {
  const preset = PRESETS.find((p) => p.id === presetId)!
  const win = WINDOWS.find((w) => w.id === windowId)!
  return { ...DEFAULT_CONFIG, ...preset.patch, vehicleId, departure: win.departure, transitDays: win.transitDays }
}

/** one mission of the scoreboard: a rocket, an assumption set, a departure window */
export interface ScoreCell {
  vehicleId: string
  presetId: string
  windowId: string
  outcome: Verdict['outcome']
  crewed: boolean
  crewAlive: boolean
  /** the day the consumables ran out, when that is what killed the crew, and the trip's length */
  crewLostDay: number | null
  tripDays: number | null
  headline: string
  /** the verdict's summary (clipped): what decided it */
  detail: string
  /** the failing and marginal numbers, at most three */
  stats: Array<{ label: string; value: string; severity: 'fail' | 'warn' }>
}

export interface ScoreboardData {
  /** the day the table was computed (yyyy-mm-dd) */
  generated: string
  crew: number
  cells: ScoreCell[]
}

export type Tone = 'ok' | 'warn' | 'fail' | 'none'

/** the short name and the tone of a cell's result */
export function cellLabel(c: Pick<ScoreCell, 'outcome' | 'crewed' | 'crewAlive'>): { label: string; tone: Tone } {
  switch (c.outcome) {
    case 'landed':
      return !c.crewed ? { label: 'Landed', tone: 'ok' } : c.crewAlive ? { label: 'Crew landed alive', tone: 'ok' } : { label: 'Landed · crew lost', tone: 'warn' }
    case 'burned-up':
      return { label: 'Burned up', tone: 'fail' }
    case 'crashed':
      return { label: 'Crashed', tone: 'fail' }
    case 'failed-tmi':
      return { label: 'Stuck in Earth orbit', tone: 'warn' }
    case 'failed-launch':
      return { label: 'Failed to reach orbit', tone: 'fail' }
    case 'orbit-only':
      return { label: 'Orbit only', tone: 'warn' }
    case 'lost-in-transit':
      return { label: 'Crew lost in transit', tone: 'fail' }
    case 'flyby':
      return { label: 'Flew past Mars', tone: 'none' }
  }
}
