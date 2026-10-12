/**
 * Interplanetary cruise: life support consumables, radiation dose, milestone events.
 * Numbers: NASA daily crew balance (Ewert & Stromgren 2019): O2 0.89 kg, food 2.39 kg (as delivered),
 * drinking water 2.79 kg; MSL RAD cruise dose 1.8 mSv/day; NASA career limit 600 mSv.
 */
import { DAY_S } from './constants'
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
  const fmt = (v: number, d = 0) => v.toFixed(d)
  const days = transfer.transitDays
  const ev = (tDays: number, label: string, detail: string, severity: SimEvent['severity'] = 'info') =>
    events.push({ t: t0 + tDays * DAY_S, phase: 'cruise', label, detail, severity })

  const shieldFactor = vehicle.spacecraft.shielding >= 20 ? 0.85 : 1
  const dose = CRUISE_DOSE_MSV_PER_DAY * days * shieldFactor

  ev(0, 'Trans-Mars injection complete', `C3 ${transfer.c3.toFixed(1)} km²/s², ${fmt(days)}-day transfer, arrival v∞ ${transfer.vInfArr.toFixed(2)} km/s`, 'ok')
  ev(3, 'Leaving Earth\'s sphere of influence', '~0.92 million km out', 'info')

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
        ev(cap, 'Life support exhausted', `${vehicle.spacecraft.name} supports ${cap} days of free flight; the transfer takes ${fmt(days)} — crew lost ${fmt(days - cap)} days short of Mars`, 'fail')
      } else {
        ev(days, 'Life support', `${cap}-day capability covers the ${fmt(days)}-day transfer`, 'ok')
      }
    } else {
      const rate = consumablesRate(cfg)
      consumablesNeeded = rate * crew * days
      const daysCovered = consumablesCarried / (rate * crew)
      if (daysCovered < days) {
        runOut = daysCovered
        lifeSupportOk = false
        ev(daysCovered, 'Consumables exhausted', `${fmt(consumablesCarried / 1000, 1)} t covers ${fmt(daysCovered)} days for ${crew} crew at ${rate.toFixed(1)} kg/person/day`, 'fail')
      } else {
        ev(days / 2, 'Halfway', `consumables margin ${fmt(daysCovered - days)} days (${fmt(consumablesCarried / 1000, 1)} t carried, ${rate.toFixed(1)} kg/person/day with ${fmt(cfg.waterRecovery * 100)} % water / ${fmt(cfg.oxygenRecovery * 100)} % O₂ recovery)`, daysCovered - days < 30 ? 'warn' : 'info')
      }
    }
    const doseSev = dose > CAREER_LIMIT_MSV ? 'fail' : dose > CAREER_LIMIT_MSV / 2 ? 'warn' : 'info'
    ev(days * 0.75, 'Radiation', `${fmt(dose)} mSv accumulated so far on the way out (MSL RAD rate 1.8 mSv/day${shieldFactor < 1 ? ', 15 % shielding credit' : ', no dedicated shielding'}); NASA career limit 600 mSv — the return leg doubles it`, doseSev)
  } else {
    ev(days / 2, 'Halfway', 'uncrewed — no consumables to track', 'info')
  }
  ev(days - 2, "Entering Mars' sphere of influence", `~0.58 million km from Mars, closing at ${transfer.vInfArr.toFixed(2)} km/s`, 'info')
  return { events, days, consumablesNeeded, consumablesCarried, consumablesRunOutDay: runOut, doseMsv: dose, lifeSupportOk }
}
