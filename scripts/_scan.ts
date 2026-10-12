import { computeTransfer } from '../src/sim/transfer'
const year = Number(process.argv[2] ?? 2035)
let best: any = null
for (let dd = 0; dd < 240; dd += 4) {
  const dep = new Date(Date.UTC(year, 0, 1) + dd * 86400e3)
  for (let tof = 120; tof <= 420; tof += 6) {
    const t = computeTransfer(dep, tof, 407, 0)
    if (!t.converged) continue
    if (!best || t.c3 < best.c3) best = { c3: t.c3, dep: dep.toISOString().slice(0, 10), tof, vInfArr: t.vInfArr }
  }
}
console.log(year, best)
