/**
 * Quick ascent sanity run for every vehicle in the catalogue.
 * Usage: npx tsx scripts/ascent-check.ts [vehicleId] [payloadTonnes]
 */
import { VEHICLES } from '../src/data/vehicles'
import { ascentSearch } from '../src/sim/ascent'

const only = process.argv[2]
const payloadOverride = process.argv[3] ? Number(process.argv[3]) * 1000 : undefined

for (const v of VEHICLES) {
  if (only && v.id !== only) continue
  const payload =
    payloadOverride ?? (v.refuelable ? 40_000 : v.spacecraft.dryMass + v.spacecraft.propMass + v.spacecraft.crewCapacity * 100)
  const t0 = performance.now()
  const r = ascentSearch(v, { payloadMass: payload, targetAlt: 200_000, expendable: false, maxAccelG: v.maxAccelG })
  const ms = (performance.now() - t0).toFixed(0)
  console.log(`\n=== ${v.name}  payload ${(payload / 1000).toFixed(1)} t  (${ms} ms, kick ${r.kickAngle}°) ===`)
  console.log(r.ok ? `ORBIT ${r.orbit!.rp.toFixed(0)} × ${r.orbit!.ra.toFixed(0)} km at T+${r.duration.toFixed(0)} s, residual ${(r.residualProp / 1000).toFixed(1)} t, mass in orbit ${(r.massInOrbit / 1000).toFixed(1)} t` : `FAIL: ${r.reason}`)
  console.log(`losses: gravity ${r.losses.gravity.toFixed(0)} drag ${r.losses.drag.toFixed(0)} steering ${r.losses.steering.toFixed(0)} dvExpended ${r.losses.dvExpended.toFixed(0)} m/s; maxQ ${(r.maxQ.q / 1000).toFixed(1)} kPa at T+${r.maxQ.t.toFixed(0)} s ${(r.maxQ.alt / 1000).toFixed(1)} km; maxG ${r.maxG.toFixed(2)}`)
  for (const e of r.events) console.log(`  T+${e.t.toFixed(0).padStart(4)} ${e.severity.padEnd(4)} ${e.label}: ${e.detail}`)
}
