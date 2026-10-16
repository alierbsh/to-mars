/**
 * The cruise as shown (sim/cruiseView.ts): the distances start at the departure burn's periapsis
 * and end at the entry interface, and the hand-overs between the hyperbolas and the transfer's
 * samples leave no jump the lower third or the scene would show.
 */
import { describe, expect, it } from 'vitest'
import { VEHICLES } from '../../data/vehicles'
import { R_MARS_MEAN } from '../constants'
import { DEPART_RP, ENTRY_ALT, cruiseDistances } from '../cruiseView'
import { runMission } from '../mission'
import { DEFAULT_CONFIG } from '../presets'
import { WINDOWS } from '../transfer'

const DAY = 86_400

describe('the cruise next to the planets', () => {
  for (const w of [WINDOWS[0], WINDOWS[2], WINDOWS[4]]) {
    it(`${w.id}: from the burn to the entry interface, without jumps`, () => {
      const v = VEHICLES.find((x) => x.id === DEFAULT_CONFIG.vehicleId)!
      const r = runMission(v, { ...DEFAULT_CONFIG, departure: w.departure, transitDays: w.transitDays })
      const tr = r.transfer!
      const cruise = r.phases.find((p) => p.phase === 'cruise')!
      const dur = cruise.end - cruise.start
      const start = cruiseDistances(tr, 0, dur)
      const end = cruiseDistances(tr, dur, dur)
      // just past the burn's middle: a few dozen km above the parking orbit
      expect(start.fromEarth).toBeGreaterThan(DEPART_RP)
      expect(start.fromEarth).toBeLessThan(DEPART_RP + 200)
      expect(end.toMars).toBeCloseTo(R_MARS_MEAN + ENTRY_ALT, 0)
      // through the hand-overs (2.5–6 days out, 4–1.5 days left), an hour at a time: the
      // distances keep moving the same way, never by more than the ship covers in an hour
      for (const [a, b] of [
        [0, 8 * DAY],
        [dur - 8 * DAY, dur],
      ]) {
        let prev = cruiseDistances(tr, a, dur)
        for (let tau = a + 3600; tau <= b; tau += 3600) {
          const d = cruiseDistances(tr, tau, dur)
          const dE = d.fromEarth - prev.fromEarth
          const dM = d.toMars - prev.toMars
          if (a === 0) expect(dE).toBeGreaterThan(0)
          else expect(dM).toBeLessThan(0)
          // v∞ ≲ 6 km/s, plus the planet's pull near it: under 40,000 km an hour
          expect(Math.abs(a === 0 ? dE : dM)).toBeLessThan(40_000)
          prev = d
        }
      }
    })
  }
})
