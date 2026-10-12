import { computeTransfer } from '../src/sim/transfer'
import { julianDate, planetState } from '../src/sim/ephemeris'
import { cross, dot, norm } from '../src/sim/vec'
for (const d of [170, 180, 190, 196, 200, 210, 230, 260, 300]) {
  const dep = new Date('2035-04-21T00:00:00Z')
  const t = computeTransfer(dep, d, 200, 0)
  const jd = julianDate(dep)
  const e = planetState('earth', jd).r
  const m = planetState('mars', jd + d).r
  const c = cross(e, m)
  const ang = Math.acos(dot(e, m) / (norm(e) * norm(m))) * 180 / Math.PI
  console.log(`+${d}d  angle ${(c[2] > 0 ? ang : 360 - ang).toFixed(1)}°  C3 ${t.c3.toFixed(2)}  vInfArr ${t.vInfArr.toFixed(2)}  z-cross ${c[2] > 0 ? '+' : '-'}`)
}
for (const dep of ['2035-04-10', '2035-04-21', '2035-05-01', '2035-05-15']) {
  for (const d of [196, 220, 250]) {
    const t = computeTransfer(new Date(dep + 'T00:00:00Z'), d, 200, 0)
    console.log(`${dep} +${d}d C3 ${t.c3.toFixed(2)} vInfArr ${t.vInfArr.toFixed(2)}`)
  }
}
