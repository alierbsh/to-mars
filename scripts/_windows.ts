import { computeTransfer, WINDOWS } from '../src/sim/transfer'
for (const w of WINDOWS) {
  const t = computeTransfer(new Date(w.departure + 'T00:00:00Z'), w.transitDays, 200, 0.02)
  console.log(`${w.label.padEnd(16)} dep ${w.departure} +${w.transitDays}d  C3 ${t.c3.toFixed(2)}  vInfDep ${t.vInfDep.toFixed(2)}  vInfArr ${t.vInfArr.toFixed(2)}  dvTMI ${t.dvTmi.toFixed(2)}  entry ${t.entryVel.toFixed(2)} km/s  conv ${t.converged}`)
}
// fast transfers from the 2028 window
for (const d of [320, 260, 220, 180, 150, 120, 100]) {
  const t = computeTransfer(new Date('2028-12-02T00:00:00Z'), d, 200, 0.02)
  console.log(`2028 +${d}d  C3 ${t.c3.toFixed(1)}  vInfArr ${t.vInfArr.toFixed(2)}  dvTMI ${t.dvTmi.toFixed(2)}  entry ${t.entryVel.toFixed(2)}`)
}
