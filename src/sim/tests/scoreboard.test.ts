/**
 * The scoreboard is precomputed (scripts/scoreboard.ts → src/data/scoreboard.json). These
 * spot-checks re-run a cell per rocket plus the two Starship cells that move most, and fail when
 * the file no longer matches the simulation — run `npx tsx scripts/scoreboard.ts` to refresh it.
 */
import { describe, expect, it } from 'vitest'
import { VEHICLES } from '../../data/vehicles'
import { runMission } from '../mission'
import data from '../../data/scoreboard.json'
import { cellConfig, type ScoreboardData } from '../../ui/scoreboardTypes'

const board = data as ScoreboardData
const picks: Array<[string, string, string]> = [
  ...VEHICLES.map((v) => [v.id, 'claims', 'w2028'] as [string, string, string]),
  ['starship-v3', 'claims', 'w2031'],
  ['starship-v3', 'demonstrated', 'w2035'],
]

describe('scoreboard.json is up to date with the simulation', () => {
  it('has every rocket × assumption set × window', () => {
    expect(board.cells.length).toBe(VEHICLES.length * 3 * 5)
  })
  for (const [v, p, w] of picks) {
    it(`${v} · ${p} · ${w}`, () => {
      const cell = board.cells.find((c) => c.vehicleId === v && c.presetId === p && c.windowId === w)!
      const r = runMission(VEHICLES.find((x) => x.id === v)!, cellConfig(v, p, w))
      expect(cell.outcome).toBe(r.verdict.outcome)
      expect(cell.crewAlive).toBe(cell.crewed && r.verdict.crewAlive)
      expect(cell.headline).toBe(r.verdict.headline)
    })
  }
})
