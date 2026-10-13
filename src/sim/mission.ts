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
  const fmt = (v: number, d = 0) => v.toFixed(d)

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
  phases.push({ phase: 'ascent', start: 0, end: ascent.duration, label: 'Launch' })
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
  phases.push({ phase: 'leo', start: tCursor, end: tCursor + leo.campaignDays * DAY_S, label: vehicle.refuelable ? 'Refuelling in orbit' : 'Parking orbit' })
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
      events.push({ t: tCursor, phase: 'tmi', label: 'Trans-Mars injection burn', detail: `Δv ${need.toFixed(2)} km/s (C3 ${transfer.c3.toFixed(1)} + mid-course), ${fmt(used / 1000)} t propellant, ${fmt(burnTime)} s burn; ${fmt(propAfterTmi / 1000)} t left for landing`, severity: 'ok' })
      phases.push({ phase: 'tmi', start: tCursor, end: tCursor + burnTime, label: 'TMI burn' })
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
      let detail = ''
      let scPropLeft = sc.propMass
      if (dv1 >= need) {
        detail = `${vehicle.stages[vehicle.stages.length - 1].name} burns Δv ${need.toFixed(2)} km/s (had ${dv1.toFixed(2)})`
      } else {
        const rest = need - dv1
        const usedSc = (scDryAll + sc.propMass) * (1 - Math.exp((-rest * 1000) / (sc.isp * G0)))
        scPropLeft = sc.propMass - usedSc
        detail = `${vehicle.stages[vehicle.stages.length - 1].name} gives ${dv1.toFixed(2)} km/s, ${sc.name} adds ${rest.toFixed(2)} km/s from its own tanks (${fmt(usedSc / 1000, 1)} t); ${fmt(scPropLeft / 1000, 1)} t left`
      }
      propAfterTmi = scPropLeft
      events.push({ t: tCursor, phase: 'tmi', label: 'Trans-Mars injection burn', detail, severity: 'ok' })
      phases.push({ phase: 'tmi', start: tCursor, end: tCursor + 600, label: 'TMI burn' })
      tCursor += 600
    }
  }

  const stats: Verdict['stats'] = []
  if (dvAvailable < need || missionMissed) {
    const label = missionMissed ? 'Departure window missed' : 'Not enough Δv for trans-Mars injection'
    const detail = missionMissed
      ? `The propellant campaign did not finish in time; the ship stays in Earth orbit.`
      : `${dvAvailable.toFixed(2)} km/s available vs ${need.toFixed(2)} km/s needed (C3 ${transfer.c3.toFixed(1)} km²/s² from ${cfg.parkingOrbitKm} km). ${vehicle.refuelable ? `${fmt(leo.propAtDeparture / 1000)} t propellant aboard, ${fmt(massAtDeparture / 1000)} t total.` : 'Upper stage and spacecraft propellant combined.'}`
    events.push({ t: tCursor, phase: 'tmi', label, detail, severity: 'fail' })
    verdict = makeVerdict(vehicle, cfg, crew, { ascent, leo, transfer, cruise, entry, weather, events, stats })
    return finish()
  }

  // --- 4. cruise ---
  cruise = runCruise(vehicle, cfg, transfer, tCursor, crew, consumablesCarried)
  events.push(...cruise.events)
  phases.push({ phase: 'cruise', start: tCursor, end: tCursor + transfer.transitDays * DAY_S, label: 'Cruise to Mars' })
  tCursor += transfer.transitDays * DAY_S

  // --- 5. entry, descent, landing ---
  weather = marsWeather(transfer.arrivalJD, cfg.dustStorm, cfg.surfaceWind)
  {
    const w = weather
    const stormText = w.storm === 'global' ? `a planet-encircling dust storm is under way (τ ≈ ${w.tau}): entry density up ~${fmt((w.densityFactor - 1) * 100)} % at altitude, nothing to see below the dust, surface winds ~${fmt(w.wind)} m/s` : w.storm === 'regional' ? `a regional dust storm (τ ≈ ${w.tau}): entry density up ~${fmt((w.densityFactor - 1) * 100)} % at altitude, poor visibility, winds ~${fmt(w.wind)} m/s` : `clear skies (τ ≈ ${w.tau}), winds ~${fmt(w.wind)} m/s`
    events.push({ t: tCursor, phase: 'entry', label: 'Weather at Mars', detail: `Ls ${fmt(w.ls)}°, ${w.season}; ${stormText}`, severity: w.storm === 'global' ? 'warn' : 'info' })
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
    })
    for (const e of entry.events) events.push({ ...e, t: tCursor + e.t })
    phases.push({ phase: 'entry', start: tCursor, end: tCursor + entry.duration, label: 'Entry, descent & landing' })
    tCursor += entry.duration
    // the aftermath: dust settling after a touchdown, debris after an impact (nothing is simulated here)
    const burned = entry.events.some((e) => e.label.startsWith('Heat shield'))
    const skipped = entry.events.some((e) => e.label === 'Skipped out')
    const aftermath = burned || skipped ? 12 : 24
    phases.push({ phase: 'landing', start: tCursor, end: tCursor + aftermath, label: entry.landed ? 'On the surface' : skipped ? 'Lost to space' : burned ? 'Break-up' : 'Impact' })
    tCursor += aftermath
    // a ship that lands with its crew alive: the first steps — hatch, elevator, boots on the
    // ground, the flag, the first habitat and power (a closing sequence; nothing is simulated)
    const crewAlive = crew > 0 && (cruise?.lifeSupportOk ?? true) && (cruise ? cruise.doseMsv <= 1000 : true)
    if (entry.landed && sc.entry?.kind === 'ship' && crewAlive) {
      const t1 = tCursor
      events.push({ t: t1 + 30, phase: 'done', label: 'Hatch opens', detail: 'cabin pressure equalised to 0.6 kPa outside; the crew elevator deploys', severity: 'info' })
      events.push({ t: t1 + 75, phase: 'done', label: 'First boots on Mars', detail: `${Math.min(crew, 6)} of the crew down the elevator; the surface holds`, severity: 'ok' })
      events.push({ t: t1 + 120, phase: 'done', label: 'The flag', detail: 'planted 25 m from the ship, in the lee of the landing legs', severity: 'info' })
      events.push({ t: t1 + 190, phase: 'done', label: 'Habitat inflated', detail: 'the first inflatable module up, airlock mated', severity: 'info' })
      events.push({ t: t1 + 245, phase: 'done', label: 'Power on', detail: 'three roll-out solar blankets, ~40 kW at noon in clear air', severity: 'ok' })
      phases.push({ phase: 'done', start: t1, end: t1 + 300, label: 'First steps' })
      tCursor += 300
    }
  } else {
    events.push({ t: tCursor, phase: 'entry', label: 'Mars flyby', detail: `${sc.name} has no entry system; it passes Mars at ${transfer.vInfArr.toFixed(2)} km/s and stays in solar orbit`, severity: 'warn' })
    phases.push({ phase: 'entry', start: tCursor, end: tCursor + 3600, label: 'Mars flyby' })
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
  const fmt = (v: number, d = 0) => v.toFixed(d)
  const stats: Verdict['stats'] = []
  const reached = { leo: ascent.ok, tmi: false, mars: false, surface: false }
  let crewAlive = crew > 0
  let outcome: Verdict['outcome']
  let headline: string
  let summary: string
  const hasAbort = vehicle.spacecraft.entry?.kind === 'capsule'

  stats.push({ label: 'Launch', value: ascent.ok ? `${fmt(ascent.orbit!.rp)} × ${fmt(ascent.orbit!.ra)} km` : 'failed', note: ascent.ok ? `${fmt(ascent.massInOrbit / 1000)} t in orbit at T+${fmt(ascent.duration)} s` : ascent.reason, severity: ascent.ok ? 'ok' : 'fail' })

  if (!ascent.ok) {
    outcome = 'failed-launch'
    crewAlive = crew > 0 && hasAbort
    headline = `${vehicle.short} never made orbit`
    summary = `${ascent.reason}. ${crew > 0 ? (hasAbort ? 'The capsule has a launch abort system — the crew gets out.' : 'Starship has no launch abort system.') : ''}`
    return { outcome, crewAlive, headline, summary, firstFailure, reached, stats }
  }

  if (leo && vehicle.refuelable) {
    stats.push({ label: 'Propellant at departure', value: `${fmt(leo.propAtDeparture / 1000)} t`, note: `${leo.tankersLaunched} tankers over ${fmt(leo.campaignDays)} days, ${fmt(leo.boiloffLost / 1000, 1)} t boiled off`, severity: leo.propAtDeparture < 0.5 * (vehicle.refuelCapacity ?? 1) ? 'warn' : 'info' })
  }
  if (transfer && leo) {
    const need = transfer.dvTmi + MCC_DV
    stats.push({ label: 'Δv for Mars', value: `${leo.dvAvailable.toFixed(2)} / ${need.toFixed(2)} km/s`, note: `available / needed (C3 ${transfer.c3.toFixed(1)} km²/s², ${fmt(transfer.transitDays)} days)`, severity: leo.dvAvailable >= need ? 'ok' : 'fail' })
  }

  const tmiFail = fails.find((e) => e.phase === 'tmi' || (e.phase === 'leo' && e.label.includes('window')))
  if (tmiFail || !cruise) {
    outcome = 'failed-tmi'
    headline = `${vehicle.short} is stuck in Earth orbit`
    summary = tmiFail ? `${tmiFail.label}. ${tmiFail.detail}` : 'The transfer could not be computed.'
    return { outcome, crewAlive, headline, summary, firstFailure, reached, stats }
  }
  reached.tmi = true

  if (cruise) {
    if (crew > 0) {
      if (!cruise.lifeSupportOk) {
        crewAlive = false
        stats.push({ label: 'Life support', value: `${fmt(cruise.consumablesRunOutDay ?? 0)} of ${fmt(cruise.days)} days`, note: 'crew lost in transit', severity: 'fail' })
      } else {
        stats.push({ label: 'Life support', value: 'sufficient', note: vehicle.spacecraft.lifeSupportDays > 0 ? `${vehicle.spacecraft.lifeSupportDays}-day capability` : `${fmt(cruise.consumablesCarried / 1000, 1)} t consumables for ${crew}`, severity: 'ok' })
      }
      stats.push({ label: 'Radiation (outbound)', value: `${fmt(cruise.doseMsv)} mSv`, note: 'NASA career limit 600 mSv; return doubles it', severity: cruise.doseMsv > 600 ? 'fail' : cruise.doseMsv > 300 ? 'warn' : 'info' })
    }
  }
  reached.mars = true

  if (!entry) {
    outcome = 'flyby'
    headline = `${vehicle.short} reaches Mars — and flies past it`
    summary = `No entry or capture system aboard. ${crew > 0 ? '' : 'Uncrewed.'}`
    return { outcome, crewAlive, headline, summary, firstFailure, reached, stats }
  }

  if (transfer) stats.push({ label: 'Entry', value: `${transfer.entryVel.toFixed(2)} km/s`, note: `β ${fmt(entry.beta)} kg/m², γ ${cfg.entryFpaDeg}°, ${fmt(entry.entryMass / 1000)} t`, severity: 'info' })
  if (weather) stats.push({ label: 'Weather at Mars', value: weather.storm === 'global' ? 'Global dust storm' : weather.storm === 'regional' ? 'Regional dust storm' : 'Clear', note: `Ls ${fmt(weather.ls)}°, ${weather.season.split(' — ')[0]}; winds ${fmt(weather.wind)} m/s`, severity: weather.storm === 'global' ? 'warn' : 'info' })
  stats.push({ label: 'Peak heating', value: `${fmt(entry.peakHeatFlux)} W/cm²`, note: `limit ${fmt(vehicle.spacecraft.entry!.tpsLimit)} (${vehicle.spacecraft.entry!.tpsName}); load ${fmt(entry.heatLoad)} J/cm²`, severity: entry.peakHeatFlux > vehicle.spacecraft.entry!.tpsLimit ? 'fail' : entry.peakHeatFlux > 0.8 * vehicle.spacecraft.entry!.tpsLimit ? 'warn' : 'ok' })
  stats.push({ label: 'Peak deceleration', value: `${entry.peakG.toFixed(1)} g`, note: `crew limit ${cfg.gLimit} g`, severity: crew > 0 && entry.peakG > cfg.gLimit ? 'fail' : crew > 0 && entry.peakG > 0.8 * cfg.gLimit ? 'warn' : 'ok' })

  const tpsFail = entry.events.find((e) => e.label.startsWith('Heat shield'))
  const gFail = entry.events.find((e) => e.label.startsWith('Crew g-limit'))
  if (gFail && crewAlive) crewAlive = false

  if (tpsFail) {
    outcome = 'burned-up'
    crewAlive = false
    headline = `${vehicle.short} burns up in the Martian atmosphere`
    summary = tpsFail.detail
  } else if (entry.tipped) {
    outcome = 'crashed'
    headline = `${vehicle.short} lands on Mars — and tips over`
    summary = `${entry.events.find((e) => e.label === 'Tipped over')?.detail ?? ''}. The crew likely survives the fall; the ship, the habitat and any return do not.`
  } else if (entry.crashed && !entry.landed) {
    outcome = entry.events.some((e) => e.label === 'Skipped out') ? 'flyby' : 'crashed'
    if (outcome === 'crashed') crewAlive = false
    headline = outcome === 'flyby' ? `${vehicle.short} skips off the atmosphere` : `${vehicle.short} crashes on Mars`
    summary = entry.events.find((e) => e.severity === 'fail')?.detail ?? entry.reason ?? ''
  } else {
    outcome = 'landed'
    reached.surface = true
    headline = crewAlive ? `${vehicle.short} lands on Mars with its crew alive` : `${vehicle.short} lands on Mars — ${crew > 0 ? 'the crew did not survive the trip' : 'uncrewed'}`
    summary = `Touchdown at ${entry.touchdownVel.toFixed(1)} m/s after a ${fmt(entry.landingDv)} m/s landing burn using ${fmt(entry.landingPropUsed / 1000, 1)} t.`
    stats.push({ label: 'Landing burn', value: `${fmt(entry.landingDv)} m/s`, note: `${fmt(entry.landingPropUsed / 1000, 1)} t propellant`, severity: 'ok' })
  }
  if (crew > 0 && !crewAlive && outcome === 'landed') {
    // keep headline
  }
  const firstFail = firstFailure
  if (crew > 0 && !crewAlive && firstFail && outcome === 'landed') summary = `${summary} First failure: ${firstFail.label} — ${firstFail.detail}`
  return { outcome, crewAlive, headline, summary, firstFailure, reached, stats }
}

export const PHASE_LABEL: Record<Phase, string> = {
  ascent: 'Launch',
  leo: 'Earth orbit',
  tmi: 'TMI',
  cruise: 'Cruise',
  entry: 'Entry & landing',
  landing: 'Landing',
  done: 'Done',
}
