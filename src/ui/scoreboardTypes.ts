import { DEFAULT_CONFIG, PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import type { Text } from '../i18n/msg'
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
  /** headline and summary as messages, for the reader's language */
  msg: { headline: Text; summary: Text }
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

export type CellKey = 'aliveLanded' | 'landed' | 'landedLost' | 'burned' | 'crashed' | 'stuck' | 'noOrbit' | 'orbitOnly' | 'lostTransit' | 'flyby'

/** the short name (a key of the scoreboard's cell names) and the tone of a cell's result */
export function cellLabel(c: Pick<ScoreCell, 'outcome' | 'crewed' | 'crewAlive'>): { key: CellKey; tone: Tone } {
  switch (c.outcome) {
    case 'landed':
      return !c.crewed ? { key: 'landed', tone: 'ok' } : c.crewAlive ? { key: 'aliveLanded', tone: 'ok' } : { key: 'landedLost', tone: 'warn' }
    case 'burned-up':
      return { key: 'burned', tone: 'fail' }
    case 'crashed':
      return { key: 'crashed', tone: 'fail' }
    case 'failed-tmi':
      return { key: 'stuck', tone: 'warn' }
    case 'failed-launch':
      return { key: 'noOrbit', tone: 'fail' }
    case 'orbit-only':
      return { key: 'orbitOnly', tone: 'warn' }
    case 'lost-in-transit':
      return { key: 'lostTransit', tone: 'fail' }
    case 'flyby':
      return { key: 'flyby', tone: 'none' }
  }
}
