/**
 * Mission orchestrator: ascent → LEO (refuelling) → TMI → cruise → Mars entry/landing → verdict.
 */
import { ascentSearch } from './ascent'
import { DAY_S, G0 } from './constants'
import { consumablesRate, runCruise } from './cruise'
import { runEntry } from './entry'
import { runLeo } from './leo'
import { computeTransfer } from './transfer'
import { marsWeather, type MarsWeather } from './weather'
import type { KeyMsg, Msg, Text } from '../i18n/msg'
import { en, event, sref, stat, tx, vref } from './text'
import type { CruiseResult, EntryResult, LeoResult, MissionConfig, MissionResult, Phase, SimEvent, TransferResult, Vehicle, Verdict } from './types'

const CREW_MASS_EACH = 100 // kg: person + suit + personal effects
const MCC_DV = 0.05 // km/s mid-course allowance

function stageIsp(vehicle: Vehicle): number {
  const st = vehicle.stages[vehicle.stages.length - 1]
  const F = st.engines.reduce((a, e) => a + e.thrustVac * e.count, 0)
  const mdot = st.engines.reduce((a, e) => a + (e.thrustVac * e.count) / (e.ispVac * G0), 0)
  return F / (mdot * G0)
}

export function runMission(vehicle: Vehicle, cfg: MissionConfig): MissionResult {
  const t0 = performance.now()
  const sc = vehicle.spacecraft
  const crew = Math.min(cfg.crew, sc.crewCapacity)
  const crewMass = crew * CREW_MASS_EACH
  const events: SimEvent[] = []
  const phases: MissionResult['phases'] = []
  const phase = (p: Phase, start: number, end: number, label: Msg) => phases.push({ phase: p, start, end, label: en(label), msg: label })
  const upper = sref(vehicle.id, vehicle.stages[vehicle.stages.length - 1].id)
  const scName = vref(vehicle.id, 'spacecraft', sc.name)

  // --- payload sizing ---
  let consumablesCarried = 0
  let payloadMass: number
  if (vehicle.refuelable) {
    const rate = consumablesRate(cfg)
    consumablesCarried = crew > 0 ? rate * crew * cfg.transitDays * (1 + cfg.consumablesMargin) : 0
    payloadMass = cfg.crewSystems + cfg.cargo + consumablesCarried + crewMass
  } else {
    payloadMass = sc.dryMass + sc.propMass + crewMass
  }

  // --- 1. ascent ---
  const ascent = ascentSearch(vehicle, {
    payloadMass,
    targetAlt: cfg.parkingOrbitKm * 1000,
    expendable: cfg.expendable,
    maxAccelG: vehicle.maxAccelG,
    shipDryMass: vehicle.refuelable ? cfg.shipDryMass : undefined,
    boosterDryMass: vehicle.refuelable ? cfg.boosterDryMass : undefined,
  })
  events.push(...ascent.events)
  phase('ascent', 0, ascent.duration, tx('phase.launch'))
  let tCursor = ascent.duration

  let leo: LeoResult | null = null
  let transfer: TransferResult | null = null
  let cruise: CruiseResult | null = null
  let entry: EntryResult | null = null
  let weather: MarsWeather | null = null
  let verdict: Verdict

  if (!ascent.ok) {
    verdict = makeVerdict(vehicle, cfg, crew, { ascent, leo, transfer, cruise, entry, events, stats: [] })
    return finish()
  }

  // --- 2. transfer geometry + Δv need ---
  transfer = computeTransfer(new Date(cfg.departure + 'T00:00:00Z'), cfg.transitDays, cfg.parkingOrbitKm)
  const need = transfer.dvTmi + MCC_DV // km/s
  const shipDry = vehicle.refuelable ? (cfg.shipDryMass ?? vehicle.stages[vehicle.stages.length - 1].dryMass) : ascent.finalStageDry

  // propellant the ship must have at departure: TMI burn + landing reserve + 5 % margin
  let propTarget = 0
  if (vehicle.refuelable) {
    const ve = stageIsp(vehicle) * G0
    const f = 1 - Math.exp((-need * 1000) / ve)
    const D = shipDry + payloadMass
    const R = sc.landing?.reserve ?? 0
    propTarget = ((D * f + R) / (1 - f)) * 1.05
  }

  // --- 3. LEO: refuelling campaign / parking orbit ---
  leo = runLeo(vehicle, cfg, ascent, tCursor, propTarget)
  events.push(...leo.events)
  phase('leo', tCursor, tCursor + leo.campaignDays * DAY_S, tx(vehicle.refuelable ? 'phase.refuel' : 'phase.parking'))
  tCursor += leo.campaignDays * DAY_S
  let dvAvailable = 0
  let massAtDeparture = 0
  let propAfterTmi = 0 // propellant left in the vehicle that enters Mars
  let entryMass = 0
  let landingProp = 0
  const missionMissed = leo.events.some((e) => e.severity === 'fail')

  if (vehicle.refuelable) {
    const isp = stageIsp(vehicle)
    const m0 = shipDry + payloadMass + leo.propAtDeparture
    massAtDeparture = m0
    const usable = leo.usableProp
    dvAvailable = (isp * G0 * Math.log(m0 / Math.max(1, m0 - usable))) / 1000
    leo.dvAvailable = dvAvailable
    leo.massAtDeparture = m0
    if (dvAvailable >= need && !missionMissed) {
      const used = m0 * (1 - Math.exp((-need * 1000) / (isp * G0)))
      propAfterTmi = leo.propAtDeparture - used
      const burnTime = used / (vehicle.stages[vehicle.stages.length - 1].engines.reduce((a, e) => a + (e.thrustVac * e.count) / (e.ispVac * G0), 0))
      events.push(event(tCursor, 'tmi', tx('tmi.burn'), tx('tmi.burn.d', { need, c3: transfer.c3, used: used / 1000, burn: burnTime, left: propAfterTmi / 1000 }), 'ok'))
      phase('tmi', tCursor, tCursor + burnTime, tx('phase.tmi'))
      tCursor += burnTime
    }
  } else {
    const isp = stageIsp(vehicle)
    const scMass = sc.dryMass + sc.propMass + crewMass
    const residual = leo.propAtDeparture
    const dv1 = residual > 0 ? (isp * G0 * Math.log((shipDry + residual + scMass) / (shipDry + scMass))) / 1000 : 0
    const scDryAll = sc.dryMass + crewMass
    const dv2 = sc.isp > 0 && sc.propMass > 0 ? (sc.isp * G0 * Math.log((scDryAll + sc.propMass) / scDryAll)) / 1000 : 0
    dvAvailable = dv1 + dv2
    massAtDeparture = shipDry + residual + scMass
    leo.dvAvailable = dvAvailable
    leo.massAtDeparture = massAtDeparture
    if (dvAvailable >= need) {
      let detail: Msg
      let scPropLeft = sc.propMass
      if (dv1 >= need) {
        detail = tx('tmi.stage.d', { stage: upper, need, had: dv1 })
      } else {
        const rest = need - dv1
        const usedSc = (scDryAll + sc.propMass) * (1 - Math.exp((-rest * 1000) / (sc.isp * G0)))
        scPropLeft = sc.propMass - usedSc
        detail = tx('tmi.both.d', { stage: upper, dv1, sc: scName, rest, used: usedSc / 1000, left: scPropLeft / 1000 })
      }
      propAfterTmi = scPropLeft
      events.push(event(tCursor, 'tmi', tx('tmi.burn'), detail, 'ok'))
      phase('tmi', tCursor, tCursor + 600, tx('phase.tmi'))
      tCursor += 600
    }
  }

  const stats: Verdict['stats'] = []
  if (dvAvailable < need || missionMissed) {
    const label = tx(missionMissed ? 'tmi.missed' : 'tmi.short')
    const detail = missionMissed
      ? tx('tmi.missed.d')
      : tx('tmi.short.d', { avail: dvAvailable, need, c3: transfer.c3, orbit: cfg.parkingOrbitKm, refuel: vehicle.refuelable, ...(vehicle.refuelable ? { prop: leo.propAtDeparture / 1000, mass: massAtDeparture / 1000 } : {}) })
    events.push(event(tCursor, 'tmi', label, detail, 'fail'))
    verdict = makeVerdict(vehicle, cfg, crew, { ascent, leo, transfer, cruise, entry, weather, events, stats })
    return finish()
  }

  // --- 4. cruise ---
  cruise = runCruise(vehicle, cfg, transfer, tCursor, crew, consumablesCarried)
  events.push(...cruise.events)
  phase('cruise', tCursor, tCursor + transfer.transitDays * DAY_S, tx('phase.cruise'))
  tCursor += transfer.transitDays * DAY_S

  // --- 5. entry, descent, landing ---
  weather = marsWeather(transfer.arrivalJD, cfg.dustStorm, cfg.surfaceWind)
  {
    const w = weather
    const density = (w.densityFactor - 1) * 100
    const storm = w.storm === 'global' ? tx('wx.global', { tau: w.tau, density, wind: w.wind }) : w.storm === 'regional' ? tx('wx.regional', { tau: w.tau, density, wind: w.wind }) : tx('wx.clear', { tau: w.tau, wind: w.wind })
    events.push(event(tCursor, 'entry', tx('wx.event'), tx('wx.event.d', { ls: w.ls, season: tx(`season.${w.seasonKey}`), storm }), w.storm === 'global' ? 'warn' : 'info'))
  }
  if (sc.entry) {
    if (vehicle.refuelable) {
      const consumablesUsed = crew > 0 ? consumablesRate(cfg) * crew * transfer.transitDays : 0
      entryMass = shipDry + payloadMass - consumablesUsed + propAfterTmi
      landingProp = propAfterTmi
    } else {
      entryMass = (sc.entryMass ?? sc.dryMass) + crewMass
      landingProp = sc.landing ? Math.min(propAfterTmi, sc.landing.reserve) : 0
      if (sc.landing) entryMass = (sc.entryMass ?? sc.dryMass) + crewMass + landingProp
    }
    entry = runEntry({
      entryVel: transfer.entryVel * 1000,
      fpaDeg: cfg.entryFpaDeg,
      mass: entryMass,
      entry: sc.entry,
      landing: sc.landing,
      landingProp,
      densityScale: cfg.densityScale,
      heatingMargin: cfg.heatingMargin,
      gLimit: cfg.gLimit,
      bankDeg: cfg.bankDeg,
      autoBank: cfg.autoBank,
      crewed: crew > 0 && (cruise?.lifeSupportOk ?? true),
      stormDensity: weather.densityFactor,
      hazard: [weather.hazardChance, weather.roll],
      vehicleId: vehicle.id,
    })
    for (const e of entry.events) events.push({ ...e, t: tCursor + e.t })
    phase('entry', tCursor, tCursor + entry.duration, tx('phase.edl'))
    tCursor += entry.duration
    // the aftermath: dust settling after a touchdown, debris after an impact (nothing is simulated here)
    const burned = entry.events.some((e) => e.label.startsWith('Heat shield'))
    const skipped = entry.events.some((e) => e.label === 'Skipped out')
    const aftermath = burned || skipped ? 12 : 24
    phase('landing', tCursor, tCursor + aftermath, tx(entry.landed ? 'phase.surface' : skipped ? 'phase.lost' : burned ? 'phase.breakup' : 'phase.impact'))
    tCursor += aftermath
    // a ship that lands with its crew alive: the first steps — hatch, elevator, boots on the
    // ground, the flag, the first habitat and power (a closing sequence; nothing is simulated)
    const crewAlive = crew > 0 && (cruise?.lifeSupportOk ?? true) && (cruise ? cruise.doseMsv <= 1000 : true)
    if (entry.landed && sc.entry?.kind === 'ship' && crewAlive) {
      const t1 = tCursor
      events.push(event(t1 + 30, 'done', tx('surf.hatch'), tx('surf.hatch.d'), 'info'))
      events.push(event(t1 + 75, 'done', tx('surf.boots'), tx('surf.boots.d', { n: Math.min(crew, 6) }), 'ok'))
      events.push(event(t1 + 120, 'done', tx('surf.flag'), tx('surf.flag.d'), 'info'))
      events.push(event(t1 + 190, 'done', tx('surf.habitat'), tx('surf.habitat.d'), 'info'))
      events.push(event(t1 + 245, 'done', tx('surf.power'), tx('surf.power.d'), 'ok'))
      phase('done', t1, t1 + 300, tx('phase.firstSteps'))
      tCursor += 300
    }
  } else {
    events.push(event(tCursor, 'entry', tx('flyby'), tx('flyby.d', { sc: scName, v: transfer.vInfArr }), 'warn'))
    phase('entry', tCursor, tCursor + 3600, tx('phase.flyby'))
    tCursor += 3600
  }

  verdict = makeVerdict(vehicle, cfg, crew, { ascent, leo, transfer, cruise, entry, weather, events, stats })
  return finish()

  function finish(): MissionResult {
    events.sort((a, b) => a.t - b.t)
    return { config: cfg, vehicleId: vehicle.id, ascent, leo, transfer, cruise, entry, weather, verdict, events, phases, computeMs: performance.now() - t0 }
  }
}

interface VerdictInput {
  ascent: MissionResult['ascent']
  weather?: MarsWeather | null
  leo: LeoResult | null
  transfer: TransferResult | null
  cruise: CruiseResult | null
  entry: EntryResult | null
  events: SimEvent[]
  stats: Verdict['stats']
}

function makeVerdict(vehicle: Vehicle, cfg: MissionConfig, crew: number, r: VerdictInput): Verdict {
  const { ascent, leo, transfer, cruise, entry, weather } = r
  const fails = r.events.filter((e) => e.severity === 'fail').sort((a, b) => a.t - b.t)
  const firstFailure = fails[0] ?? null
  const stats: Verdict['stats'] = []
  const reached = { leo: ascent.ok, tmi: false, mars: false, surface: false }
  let crewAlive = crew > 0
  let outcome: Verdict['outcome']
  let headline: Text
  let summary: Text
  const hasAbort = vehicle.spacecraft.entry?.kind === 'capsule'
  const ship = vref(vehicle.id, 'short', vehicle.short)
  // an event's name and detail as messages; a numeric parameter of its detail
  const label = (e: SimEvent): Text => e.msg?.label ?? e.label
  const detail = (e: SimEvent): Text => e.msg?.detail ?? e.detail
  const param = (e: SimEvent | undefined, k: string): number | undefined => {
    const d = e?.msg?.detail as KeyMsg | undefined
    const v = d?.p?.[k]
    return typeof v === 'number' ? v : undefined
  }
  const done = (): Verdict => ({ outcome, crewAlive, headline: en(headline), summary: en(summary), firstFailure, reached, stats, msg: { headline, summary } })

  stats.push(
    ascent.ok
      ? stat(tx('st.launch'), tx('st.launch.v', { rp: ascent.orbit!.rp, ra: ascent.orbit!.ra }), tx('st.launch.n', { mass: ascent.massInOrbit / 1000, t: ascent.duration }), 'ok')
      : stat(tx('st.launch'), tx('st.launch.fail'), ascent.reasonMsg, 'fail'),
  )

  if (!ascent.ok) {
    outcome = 'failed-launch'
    crewAlive = crew > 0 && hasAbort
    headline = tx('v.noOrbit', { ship })
    summary = tx('v.noOrbit.s', { reason: ascent.reasonMsg ?? '', crew: crew > 0 ? (hasAbort ? 'abort' : 'noAbort') : 'none' })
    return done()
  }

  if (leo && vehicle.refuelable) {
    stats.push(stat(tx('st.prop'), tx('st.prop.v', { prop: leo.propAtDeparture / 1000 }), tx('st.prop.n', { n: leo.tankersLaunched, days: leo.campaignDays, boil: leo.boiloffLost / 1000 }), leo.propAtDeparture < 0.5 * (vehicle.refuelCapacity ?? 1) ? 'warn' : 'info'))
  }
  if (transfer && leo) {
    const need = transfer.dvTmi + MCC_DV
    stats.push(stat(tx('st.dv'), tx('st.dv.v', { avail: leo.dvAvailable, need }), tx('st.dv.n', { c3: transfer.c3, days: transfer.transitDays }), leo.dvAvailable >= need ? 'ok' : 'fail'))
  }

  const tmiFail = fails.find((e) => e.phase === 'tmi' || (e.phase === 'leo' && e.label.includes('window')))
  if (tmiFail || !cruise) {
    outcome = 'failed-tmi'
    headline = tx('v.stuck', { ship })
    summary = tmiFail ? tx('v.stuck.s', { label: label(tmiFail), detail: detail(tmiFail) }) : tx('v.stuck.none')
    return done()
  }
  reached.tmi = true

  if (cruise) {
    if (crew > 0) {
      if (!cruise.lifeSupportOk) {
        crewAlive = false
        stats.push(stat(tx('st.life'), tx('st.life.lost', { day: cruise.consumablesRunOutDay ?? 0, days: cruise.days }), tx('st.life.lost.n'), 'fail'))
      } else {
        stats.push(stat(tx('st.life'), tx('st.life.ok'), vehicle.spacecraft.lifeSupportDays > 0 ? tx('st.life.cap.n', { days: vehicle.spacecraft.lifeSupportDays }) : tx('st.life.cons.n', { t: cruise.consumablesCarried / 1000, crew }), 'ok'))
      }
      stats.push(stat(tx('st.rad'), tx('st.rad.v', { dose: cruise.doseMsv }), tx('st.rad.n'), cruise.doseMsv > 600 ? 'fail' : cruise.doseMsv > 300 ? 'warn' : 'info'))
    }
  }
  reached.mars = true

  if (!entry) {
    outcome = 'flyby'
    headline = tx('v.flyby', { ship })
    summary = tx('v.flyby.s', { crewed: crew > 0 })
    return done()
  }

  const tps = vehicle.spacecraft.entry!
  if (transfer) stats.push(stat(tx('st.entry'), tx('st.entry.v', { v: transfer.entryVel }), tx('st.entry.n', { beta: entry.beta, fpa: cfg.entryFpaDeg, mass: entry.entryMass / 1000 }), 'info'))
  if (weather) stats.push(stat(tx('st.wx'), tx(weather.storm === 'global' ? 'st.wx.global' : weather.storm === 'regional' ? 'st.wx.regional' : 'st.wx.clear'), tx('st.wx.n', { ls: weather.ls, season: tx(`season.${weather.seasonKey}.short`), wind: weather.wind }), weather.storm === 'global' ? 'warn' : 'info'))
  stats.push(stat(tx('st.heat'), tx('st.heat.v', { q: entry.peakHeatFlux }), tx('st.heat.n', { lim: tps.tpsLimit, tps: vref(vehicle.id, 'tps', tps.tpsName), load: entry.heatLoad }), entry.peakHeatFlux > tps.tpsLimit ? 'fail' : entry.peakHeatFlux > 0.8 * tps.tpsLimit ? 'warn' : 'ok'))
  stats.push(stat(tx('st.g'), tx('st.g.v', { g: entry.peakG }), tx('st.g.n', { lim: cfg.gLimit }), crew > 0 && entry.peakG > cfg.gLimit ? 'fail' : crew > 0 && entry.peakG > 0.8 * cfg.gLimit ? 'warn' : 'ok'))

  const tpsFail = entry.events.find((e) => e.label.startsWith('Heat shield'))
  const gFail = entry.events.find((e) => e.label.startsWith('Crew g-limit'))
  if (gFail && crewAlive) crewAlive = false

  if (tpsFail) {
    outcome = 'burned-up'
    crewAlive = false
    headline = tx('v.burned', { ship })
    // the peak, not the moment of crossing (which reads "50.4 > 50"): how far past the rating it went
    summary = tx('v.burned.s', { q: entry.peakHeatFlux, lim: tps.tpsLimit, tps: vref(vehicle.id, 'tpsShort', tps.tpsName.split(/[,(]/)[0].trim().toLowerCase()), alt: param(tpsFail, 'alt'), v: param(tpsFail, 'v') })
  } else if (entry.tipped) {
    outcome = 'crashed'
    headline = tx('v.tipped', { ship })
    const tip = entry.events.find((e) => e.label === 'Tipped over')
    summary = tx('v.tipped.s', { detail: tip ? detail(tip) : '' })
  } else if (entry.crashed && !entry.landed) {
    outcome = entry.events.some((e) => e.label === 'Skipped out') ? 'flyby' : 'crashed'
    if (outcome === 'crashed') crewAlive = false
    headline = tx(outcome === 'flyby' ? 'v.skipped' : 'v.crashed', { ship })
    const dry = entry.events.find((e) => e.label === 'Propellant exhausted mid-burn')
    const impact = entry.events.find((e) => e.label === 'Impact')
    const what = tx(vehicle.spacecraft.entry?.kind === 'capsule' ? 'v.what.capsule' : 'v.what.ship')
    const dryAlt = param(dry, 'alt')
    const dryV = param(dry, 'v')
    const impactV = param(impact, 'v')
    if (dryAlt !== undefined && dryV !== undefined && impactV !== undefined) summary = tx('v.crashed.dry', { alt: dryAlt, v: dryV, what, impact: impactV })
    else {
      const fail = entry.events.find((e) => e.severity === 'fail')
      summary = fail ? detail(fail) : (entry.reasonMsg ?? '')
    }
  } else {
    outcome = 'landed'
    reached.surface = true
    headline = crewAlive ? tx('v.landed', { ship }) : tx('v.landedLost', { ship, crewed: crew > 0 })
    summary = tx('v.landed.s', { v: entry.touchdownVel, dv: entry.landingDv, prop: entry.landingPropUsed / 1000 })
    stats.push(stat(tx('st.landing'), tx('st.landing.v', { dv: entry.landingDv }), tx('st.landing.n', { prop: entry.landingPropUsed / 1000 }), 'ok'))
  }
  if (crew > 0 && !crewAlive && firstFailure && outcome === 'landed') summary = tx('v.firstFail', { summary, label: label(firstFailure), detail: detail(firstFailure) })
  return done()
}
