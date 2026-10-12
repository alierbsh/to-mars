import { EARTH_PLANET, runEntry } from '../src/sim/entry'
import { VEHICLES } from '../src/data/vehicles'
const ship = VEHICLES.find((v) => v.id === 'starship-v3')!.spacecraft
// Starship LEO re-entry as flown (Flights 4–13): ~7.3–7.5 km/s at the 120 km interface, shallow, ~170 t
for (const [v, fpa, mass] of [[7400, -1.5, 170_000], [7400, -2.5, 170_000], [7500, -1.2, 200_000], [7700, -2, 170_000]] as const) {
  const r = runEntry({ entryVel: v, fpaDeg: fpa, mass, entry: { ...ship.entry!, tpsLimit: 1e9 }, landing: null, landingProp: 0, densityScale: 1, heatingMargin: 1, gLimit: 99, bankDeg: 0, crewed: false, autoBank: true, planet: EARTH_PLANET })
  console.log(`Earth entry ${v} m/s γ ${fpa}° ${mass / 1000} t → peak S-G ${r.peakHeatFlux.toFixed(1)} W/cm², heat load ${r.heatLoad.toFixed(0)} J/cm², peak ${r.peakG.toFixed(1)} g, ${r.reason ?? 'ok'}, ${(r.duration / 60).toFixed(1)} min`)
}
// Orion Artemis I/II style: 11 km/s direct, -6°
const orion = VEHICLES.find((v) => v.id === 'sls-orion')!.spacecraft
for (const [v, fpa] of [[11000, -5.5], [11000, -6.5]] as const) {
  const r = runEntry({ entryVel: v, fpaDeg: fpa, mass: 9_300, entry: { ...orion.entry!, tpsLimit: 1e9 }, landing: null, landingProp: 0, densityScale: 1, heatingMargin: 1, gLimit: 99, bankDeg: 0, crewed: false, autoBank: true, planet: EARTH_PLANET })
  console.log(`Orion Earth entry ${v} m/s γ ${fpa}° → peak S-G ${r.peakHeatFlux.toFixed(1)} W/cm², load ${r.heatLoad.toFixed(0)} J/cm², ${r.peakG.toFixed(1)} g, ${r.reason ?? 'ok'}`)
}
// Mars Starship at various β and speeds, margin 1
const mars = VEHICLES.find((v) => v.id === 'starship-v3')!.spacecraft
for (const [v, fpa, mass] of [[5900, -12, 250_000], [5900, -15, 250_000], [6600, -12, 250_000], [7400, -12, 250_000], [7400, -15, 250_000]] as const) {
  const r = runEntry({ entryVel: v, fpaDeg: fpa, mass, entry: { ...mars.entry!, tpsLimit: 1e9 }, landing: null, landingProp: 0, densityScale: 1, heatingMargin: 1, gLimit: 99, bankDeg: 0, crewed: false, autoBank: true })
  console.log(`Mars Starship ${v} m/s γ ${fpa}° ${mass / 1000} t → peak S-G ${r.peakHeatFlux.toFixed(1)} W/cm², load ${r.heatLoad.toFixed(0)} J/cm², ${r.peakG.toFixed(1)} g, ${r.reason ?? 'ok'} (impact ${r.touchdownVel.toFixed(0)} m/s)`)
}
