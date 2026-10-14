/**
 * Low-Earth-orbit operations: the tanker campaign and cryogenic boil-off for a refuellable
 * ship, or simply the residual upper-stage propellant for everything else.
 */
import { DAY_S } from './constants'
import type { Msg } from '../i18n/msg'
import { event, sref, tx } from './text'
import type { AscentResult, LeoResult, MissionConfig, SimEvent, Vehicle } from './types'

export const WINDOW_LENGTH_DAYS = 150 // practical departure period around the minimum-C3 date (warn)
export const WINDOW_MISS_DAYS = 300 // campaign longer than this cannot make the opportunity (fail)

/**
 * @param propTarget propellant the mission needs aboard at departure (TMI + landing reserve + margin);
 *                   tankers stop once it is reached. Capped at the tank capacity.
 */
export function runLeo(vehicle: Vehicle, cfg: MissionConfig, ascent: AscentResult, t0: number, propTarget: number): LeoResult {
  const events: SimEvent[] = []
  const ev = (tDays: number, label: Msg, detail: Msg, severity: SimEvent['severity'] = 'info') => events.push(event(t0 + tDays * DAY_S, 'leo', label, detail, severity))

  if (!vehicle.refuelable) {
    ev(0, tx('leo.parking'), tx('leo.parking.d', { mass: ascent.massInOrbit / 1000, prop: ascent.residualProp / 1000, stage: sref(vehicle.id, vehicle.stages[vehicle.stages.length - 1].id) }), 'info')
    return {
      events,
      propAtDeparture: ascent.residualProp,
      campaignDays: 0.5,
      boiloffLost: 0,
      tankersLaunched: 0,
      usableProp: ascent.residualProp,
      dvAvailable: 0,
      massAtDeparture: ascent.massInOrbit,
    }
  }

  const capacity = vehicle.refuelCapacity ?? vehicle.stages[vehicle.stages.length - 1].propMass
  const target = Math.min(capacity, propTarget)
  const r = cfg.boiloffPerDay
  let prop = ascent.residualProp
  let delivered = 0
  let day = 0
  const checkout = 3
  ev(0, tx('leo.ship'), tx('leo.ship.d', { res: prop / 1000, target: target / 1000, more: Math.max(0, target - prop) / 1000 }), 'info')
  let launched = 0
  for (let i = 1; i <= cfg.tankers; i++) {
    // enough already (allowing for boil-off during checkout)?
    if (prop * Math.pow(1 - r, checkout) >= target) break
    const nextDay = i * cfg.tankerCadenceDays
    prop *= Math.pow(1 - r, nextDay - day)
    day = nextDay
    const room = capacity - prop
    const add = Math.min(cfg.propPerTanker, room)
    prop += add
    delivered += add
    launched = i
    ev(day, tx('leo.tanker', { n: i }), tx('leo.tanker.d', { add: add / 1000, aboard: prop / 1000, pct: (100 * prop) / target }), 'info')
  }
  // checkout before departure
  prop *= Math.pow(1 - r, checkout)
  day += checkout
  const lost = ascent.residualProp + delivered - prop
  const fill = prop / target
  ev(day, tx('leo.done'), tx('leo.done.d', { aboard: prop / 1000, pct: fill * 100, target: target / 1000, n: launched, days: day, lost: lost / 1000 }), fill < 0.98 ? 'warn' : 'info')
  if (fill < 0.98) {
    ev(day, tx('leo.short'), tx('leo.short.d', { n: launched, each: cfg.propPerTanker / 1000, target: target / 1000 }), 'warn')
  }
  if (day > WINDOW_MISS_DAYS) {
    ev(day, tx('leo.missed'), tx('leo.missed.d', { days: day, limit: WINDOW_MISS_DAYS }), 'fail')
  } else if (day > WINDOW_LENGTH_DAYS) {
    ev(day, tx('leo.long'), tx('leo.long.d', { days: day, limit: WINDOW_LENGTH_DAYS }), 'warn')
  }
  if (lost > 0.1 * delivered && delivered > 0) {
    ev(day, tx('leo.boiloff'), tx('leo.boiloff.d', { pct: (100 * lost) / Math.max(delivered, 1), rate: r * 100 }), 'warn')
  }
  const reserve = vehicle.spacecraft.landing?.reserve ?? 0
  return {
    events,
    propAtDeparture: prop,
    campaignDays: day,
    boiloffLost: lost,
    tankersLaunched: launched,
    usableProp: Math.max(0, prop - reserve),
    dvAvailable: 0,
    massAtDeparture: 0,
  }
}
