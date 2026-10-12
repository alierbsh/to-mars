import { VEHICLES } from '../src/data/vehicles'
import { ascentSearch } from '../src/sim/ascent'
const v = VEHICLES.find((x) => x.id === 'starship-v3')!
for (const [bd, sd] of [[275, 200], [275, 240], [275, 280], [300, 250]]) {
  for (const payload of [45, 100]) {
    const r = ascentSearch(v, { payloadMass: payload * 1000, targetAlt: 200_000, expendable: false, maxAccelG: 4, boosterDryMass: bd * 1000, shipDryMass: sd * 1000 })
    console.log(`booster ${bd} t ship ${sd} t payload ${payload} t → ${r.ok ? `orbit, residual ${(r.residualProp / 1000).toFixed(0)} t (kick ${r.kickAngle}°, T+${r.duration.toFixed(0)})` : 'FAIL ' + r.reason}`)
  }
}
