/**
 * Run the whole mission for every vehicle and print the verdict + timeline.
 * Usage: npx tsx scripts/mission-check.ts [vehicleId] [presetId] [windowId]
 */
import { VEHICLES } from '../src/data/vehicles'
import { runMission } from '../src/sim/mission'
import { DEFAULT_CONFIG, PRESETS } from '../src/sim/presets'
import { WINDOWS } from '../src/sim/transfer'

const only = process.argv[2]
const presetId = process.argv[3]
const windowId = process.argv[4]
const preset = PRESETS.find((p) => p.id === presetId)
const win = WINDOWS.find((w) => w.id === windowId)
const fmtT = (t: number) => (t < 3600 ? `T+${t.toFixed(0)}s` : t < 86400 * 2 ? `T+${(t / 3600).toFixed(1)}h` : `day ${(t / 86400).toFixed(0)}`)

for (const v of VEHICLES) {
  if (only && v.id !== only) continue
  const cfg = { ...DEFAULT_CONFIG, vehicleId: v.id, ...(preset?.patch ?? {}), ...(win ? { departure: win.departure, transitDays: win.transitDays } : {}) }
  const r = runMission(v, cfg)
  console.log(`\n=== ${v.name} (${r.computeMs.toFixed(0)} ms) ===`)
  console.log(`VERDICT: ${r.verdict.headline} [${r.verdict.outcome}, crew ${r.verdict.crewAlive ? 'alive' : 'lost'}]`)
  console.log(`  ${r.verdict.summary}`)
  for (const s of r.verdict.stats) console.log(`  · ${s.label}: ${s.value}${s.note ? ` (${s.note})` : ''} [${s.severity}]`)
  for (const e of r.events) console.log(`  ${fmtT(e.t).padStart(10)} ${e.phase.padEnd(6)} ${e.severity.padEnd(4)} ${e.label}: ${e.detail}`)
}
