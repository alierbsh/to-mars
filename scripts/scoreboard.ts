/**
 * The scoreboard: every rocket × departure window × assumption set, run through the same
 * simulation as the site, written to src/data/scoreboard.json for the Scoreboard view.
 *
 *   npx tsx scripts/scoreboard.ts
 *
 * Re-run after any change to the sim or the vehicle data; src/sim/tests/scoreboard.test.ts
 * spot-checks the file against the live sim and fails when it is stale.
 */
import { writeFileSync } from 'node:fs'
import { VEHICLES } from '../src/data/vehicles'
import { runMission } from '../src/sim/mission'
import { DEFAULT_CONFIG, PRESETS } from '../src/sim/presets'
import { WINDOWS } from '../src/sim/transfer'
import { cellConfig, type ScoreCell, type ScoreboardData } from '../src/ui/scoreboardTypes'

/** at most `n` characters, cut at a word */
function clip(s: string, n = 150): string {
  const t = s.trim()
  if (t.length <= n) return t
  return `${t.slice(0, t.lastIndexOf(' ', n - 1)).replace(/[,;:—–-]\s*$/, '')}…`
}

function main() {
  const t0 = Date.now()
  const cells: ScoreCell[] = []
  for (const v of VEHICLES) {
    for (const p of PRESETS) {
      for (const w of WINDOWS) {
        const cfg = cellConfig(v.id, p.id, w.id)
        const r = runMission(v, cfg)
        const verdict = r.verdict
        const crewed = cfg.crew > 0 && v.spacecraft.crewCapacity > 0
        // "21 of 318 days": the day the consumables ran out, and the length of the trip
        const lifeSupport = verdict.stats.find((s) => s.label === 'Life support' && s.severity === 'fail')
        const lost = lifeSupport?.value.match(/^(\d+) of (\d+)/)
        cells.push({
          vehicleId: v.id,
          presetId: p.id,
          windowId: w.id,
          outcome: verdict.outcome,
          crewed,
          crewAlive: crewed && verdict.crewAlive,
          crewLostDay: lost ? Number(lost[1]) : null,
          tripDays: lost ? Number(lost[2]) : null,
          headline: verdict.headline,
          detail: clip(verdict.summary),
          stats: verdict.stats.filter((s) => s.severity === 'fail' || s.severity === 'warn').slice(0, 3).map((s) => ({ label: s.label, value: s.value, severity: s.severity as 'fail' | 'warn' })),
        })
      }
    }
    console.log(`${v.id}: done (${((Date.now() - t0) / 1000).toFixed(0)} s)`)
  }
  const data: ScoreboardData = { generated: new Date().toISOString().slice(0, 10), crew: DEFAULT_CONFIG.crew, cells }
  writeFileSync(new URL('../src/data/scoreboard.json', import.meta.url), JSON.stringify(data, null, 1) + '\n')
  console.log(`${cells.length} missions in ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

if (process.argv[1]?.endsWith('scoreboard.ts')) main()
