import { VEHICLES } from '../src/data/vehicles'
import { runAscent } from '../src/sim/ascent'

const id = process.argv[2] ?? 'new-glenn'
const kick = Number(process.argv[3] ?? 8)
const v = VEHICLES.find((x) => x.id === id)!
const payload = v.refuelable ? 40_000 : v.spacecraft.dryMass + v.spacecraft.propMass + v.spacecraft.crewCapacity * 100
const r = runAscent(v, { payloadMass: payload, targetAlt: 200_000, expendable: false, maxAccelG: v.maxAccelG, kickAngleDeg: kick, telemetryEvery: 10 })
console.log(r.ok ? `ORBIT ${r.orbit!.rp.toFixed(0)}x${r.orbit!.ra.toFixed(0)} residual ${(r.residualProp / 1000).toFixed(1)} t` : `FAIL ${r.reason}`)
console.log('   t   alt(km)  vel   vrel  mach   q(kPa)  g   mass(t) pitch stage')
for (const s of r.telemetry) {
  console.log(`${s.t.toFixed(0).padStart(4)} ${(s.alt / 1000).toFixed(1).padStart(7)} ${s.vel.toFixed(0).padStart(6)} ${s.velRel.toFixed(0).padStart(6)} ${s.mach.toFixed(2).padStart(5)} ${(s.q / 1000).toFixed(1).padStart(7)} ${s.accel.toFixed(2).padStart(5)} ${(s.mass / 1000).toFixed(0).padStart(7)} ${s.pitch.toFixed(1).padStart(5)} ${s.stage}`)
}
for (const e of r.events) console.log(`  T+${e.t.toFixed(0)} ${e.label}: ${e.detail}`)
