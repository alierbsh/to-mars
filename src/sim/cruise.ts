/**
 * Interplanetary cruise: life support consumables, radiation dose, milestone events.
 * Numbers: NASA daily crew balance (Ewert & Stromgren 2019): O2 0.89 kg, food 2.39 kg (as delivered),
 * drinking water 2.79 kg; MSL RAD cruise dose 1.8 mSv/day; NASA career limit 600 mSv.
 */
import { DAY_S } from './constants'
import type { Msg } from '../i18n/msg'
import { event, tx, vref } from './text'
import type { CruiseResult, MissionConfig, SimEvent, TransferResult, Vehicle } from './types'

export const O2_PER_DAY = 0.89
export const FOOD_PER_DAY = 2.39
export const WATER_PER_DAY = 3.5 // drinking + hygiene
export const CRUISE_DOSE_MSV_PER_DAY = 1.8
export const CAREER_LIMIT_MSV = 600

/** kg per crew-day with the configured ECLSS closure */
export function consumablesRate(cfg: MissionConfig): number {
  return O2_PER_DAY * (1 - cfg.oxygenRecovery) + WATER_PER_DAY * (1 - cfg.waterRecovery) + FOOD_PER_DAY
}

export function runCruise(vehicle: Vehicle, cfg: MissionConfig, transfer: TransferResult, t0: number, crew: number, consumablesCarried: number): CruiseResult {
  const events: SimEvent[] = []
  const days = transfer.transitDays
  const ev = (tDays: number, label: Msg, detail: Msg, severity: SimEvent['severity'] = 'info') => events.push(event(t0 + tDays * DAY_S, 'cruise', label, detail, severity))
  const sc = vref(vehicle.id, 'spacecraft', vehicle.spacecraft.name)

  const shieldFactor = vehicle.spacecraft.shielding >= 20 ? 0.85 : 1
  const dose = CRUISE_DOSE_MSV_PER_DAY * days * shieldFactor

  ev(0, tx('cr.tmi'), tx('cr.tmi.d', { c3: transfer.c3, days, vinf: transfer.vInfArr }), 'ok')
  ev(3, tx('cr.earthSoi'), tx('cr.earthSoi.d'), 'info')

  let lifeSupportOk = true
  let runOut: number | null = null
  let consumablesNeeded = 0
  if (crew > 0) {
    if (vehicle.spacecraft.lifeSupportDays > 0) {
      // capsule: fixed capability
      const cap = vehicle.spacecraft.lifeSupportDays
      consumablesNeeded = 0
      if (cap < days) {
        runOut = cap
        lifeSupportOk = false
        ev(cap, tx('cr.lifeOut'), tx('cr.lifeOut.d', { sc, cap, days, short: days - cap }), 'fail')
      } else {
        ev(days, tx('cr.life'), tx('cr.life.d', { cap, days }), 'ok')
      }
    } else {
      const rate = consumablesRate(cfg)
      consumablesNeeded = rate * crew * days
      const daysCovered = consumablesCarried / (rate * crew)
      if (daysCovered < days) {
        runOut = daysCovered
        lifeSupportOk = false
        ev(daysCovered, tx('cr.consOut'), tx('cr.consOut.d', { t: consumablesCarried / 1000, days: daysCovered, crew, rate }), 'fail')
      } else {
        ev(days / 2, tx('cr.half'), tx('cr.half.d', { margin: daysCovered - days, t: consumablesCarried / 1000, rate, water: cfg.waterRecovery * 100, o2: cfg.oxygenRecovery * 100 }), daysCovered - days < 30 ? 'warn' : 'info')
      }
    }
    const doseSev = dose > CAREER_LIMIT_MSV ? 'fail' : dose > CAREER_LIMIT_MSV / 2 ? 'warn' : 'info'
    ev(days * 0.75, tx('cr.rad'), tx('cr.rad.d', { dose, shield: shieldFactor < 1 }), doseSev)
  } else {
    ev(days / 2, tx('cr.half'), tx('cr.half.uncrewed'), 'info')
  }
  ev(days - 2, tx('cr.marsSoi'), tx('cr.marsSoi.d', { v: transfer.vInfArr }), 'info')
  return { events, days, consumablesNeeded, consumablesCarried, consumablesRunOutDay: runOut, doseMsv: dose, lifeSupportOk }
}
