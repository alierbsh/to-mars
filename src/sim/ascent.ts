/**
 * Launch-to-orbit integrator: planar ECI, rotating atmosphere (USSA76), thrust with
 * pressure-dependent Isp, Cd(Mach) drag on the stack base area, sequential + parallel staging,
 * gravity-turn guidance with a closed-loop insertion law for the exo-atmospheric part, RK4 at 0.1 s.
 */
import { earthAtmosphere, marsAtmosphere, rocketCd, type AtmoState } from './atmosphere'
import { EARTH_OMEGA, G0, MARS_OMEGA, MU_EARTH, MU_MARS, R_EARTH_MEAN, R_MARS_MEAN } from './constants'
import { elementsFromState } from './orbit'
import type { Msg } from '../i18n/msg'
import { en, event, sref, tx, vref } from './text'
import type { AscentResult, AscentSample, EngineGroup, SimEvent, Stage, Vehicle } from './types'

/** the body being climbed away from */
export interface AscentPlanet {
  name: string
  mu: number // km³/s²
  radius: number // km
  omega: number // rad/s
  atmosphere: (h: number) => AtmoState
  /** seconds of vertical flight before the pitch kick */
  tVertical: number
}
export const EARTH_ASCENT: AscentPlanet = { name: 'Earth', mu: MU_EARTH, radius: R_EARTH_MEAN, omega: EARTH_OMEGA, atmosphere: (h) => earthAtmosphere(h), tVertical: 40 }
export const MARS_ASCENT: AscentPlanet = { name: 'Mars', mu: MU_MARS, radius: R_MARS_MEAN, omega: MARS_OMEGA, atmosphere: (h) => marsAtmosphere(h), tVertical: 12 }
const P0 = 101_325

interface EngineDerived {
  thrustVac: number // N per engine
  mdot: number // kg/s per engine at full throttle
  exitArea: number // m²
  minThrottle: number
}

function deriveEngine(e: EngineGroup): EngineDerived {
  const mdot = e.thrustVac / (e.ispVac * G0)
  let exitArea = e.exitArea ?? 0
  if (!e.exitArea && e.ispSL) {
    const fSL = e.ispSL * mdot * G0
    exitArea = Math.max(0, (e.thrustVac - fSL) / P0)
  }
  return { thrustVac: e.thrustVac, mdot, exitArea, minThrottle: e.minThrottle ?? 0.4 }
}

interface LiveStage {
  def: Stage
  units: number
  dry: number // total dry mass for all units
  prop: number // total usable propellant remaining (all units)
  reserve: number // propellant kept (not usable), all units
  engines: Array<EngineDerived & { count: number }>
  burning: boolean
  separated: boolean
  ignitionT: number
  sepT: number
}

export interface AscentOptions {
  payloadMass: number
  targetAlt: number // m
  kickAngleDeg: number
  expendable: boolean
  shipDryMass?: number
  boosterDryMass?: number
  maxAccelG: number
  telemetryEvery?: number
  tVertical?: number
  kickDuration?: number
  planet?: AscentPlanet
  /** launch latitude override (the vehicle's site is used when absent) */
  latDeg?: number
}

function stageThrust(st: LiveStage, p: number, throttle: number): { F: number; mdot: number } {
  let F = 0
  let mdot = 0
  for (const e of st.engines) {
    const perEngine = Math.max(0.3 * e.thrustVac, e.thrustVac - p * e.exitArea)
    F += perEngine * e.count * st.units
    mdot += e.mdot * e.count * st.units
  }
  return { F: F * throttle, mdot: mdot * throttle }
}

export function runAscent(vehicle: Vehicle, opts: AscentOptions): AscentResult {
  const dt = 0.1
  const telEvery = opts.telemetryEvery ?? 1
  const P = opts.planet ?? EARTH_ASCENT
  const MU = P.mu * 1e9 // m³/s²
  const RE = P.radius * 1000 // m
  const tVert = opts.tVertical ?? P.tVertical
  const kickDur = opts.kickDuration ?? 12
  const vKick = 100 // m/s air-relative speed at which the pitch kick starts
  const kick = (opts.kickAngleDeg * Math.PI) / 180
  const hTarget = opts.targetAlt

  // --- build live stages ---
  const live: LiveStage[] = vehicle.stages.map((def, idx) => {
    const units = def.count ?? 1
    let dry = def.dryMass
    if (idx === 0 && opts.boosterDryMass && def.role !== 'booster') dry = opts.boosterDryMass
    if (idx === vehicle.stages.length - 1 && opts.shipDryMass) dry = opts.shipDryMass
    const reserveFrac = opts.expendable ? 0 : (def.reserveFrac ?? 0)
    const reserve = def.propMass * reserveFrac * units
    return {
      def,
      units,
      dry: dry * units,
      prop: def.propMass * units - reserve,
      reserve,
      engines: def.engines.map((e) => ({ ...deriveEngine(e), count: e.count })),
      burning: false,
      separated: false,
      ignitionT: -1,
      sepT: -1,
    }
  })
  const coreOrder = live.filter((s) => s.def.role !== 'booster') // sequential chain bottom-up
  const boosters = live.filter((s) => s.def.role === 'booster')
  let coreIdx = 0
  coreOrder[0].burning = true
  coreOrder[0].ignitionT = 0
  for (const b of boosters) {
    b.burning = true
    b.ignitionT = 0
  }
  let fairing = vehicle.fairingJettisonAlt != null ? vehicle.fairingMass : 0

  const totalMass = () => {
    let m = opts.payloadMass + fairing
    for (const s of live) if (!s.separated) m += s.dry + s.prop + s.reserve
    return m
  }

  // --- reference area: widest element + attached boosters (base-area convention) ---
  const refArea = () => {
    let a = 0
    for (const s of live) {
      if (s.separated) continue
      const unit = Math.PI * (s.def.diameter / 2) ** 2
      if (s.def.role === 'booster') a += unit * s.units
      else a = Math.max(a, unit)
    }
    return a || 1
  }

  // --- state ---
  // Planar model: the launch plane carries the site's eastward rotation credit ω·R·cos(lat),
  // and the atmosphere co-rotates at the same effective rate so the air is at rest at liftoff.
  const lat = ((opts.latDeg ?? vehicle.launchSite.lat) * Math.PI) / 180
  const OMEGA = P.omega * Math.cos(lat)
  let x = RE
  let y = 0
  let vx = 0
  let vy = OMEGA * RE
  let t = 0
  let m = totalMass()

  const events: SimEvent[] = []
  const telemetry: AscentSample[] = []
  const stageTimes: Array<{ id: string; sep: number }> = []
  const ev = (label: Msg, detail: Msg, severity: SimEvent['severity'] = 'info') => events.push(event(t, 'ascent', label, detail, severity))

  let maxQ = { q: 0, t: 0, alt: 0 }
  let maxG = 0
  let mach1Done = false
  let gravLoss = 0
  let dragLoss = 0
  let dvExpended = 0
  let ok = false
  let reason: Msg | undefined
  let orbit: AscentResult['orbit'] = null
  let coastingToApo = false
  let coastDone = false
  let theta0 = 0 // launch-site angle for downrange

  ev(tx('asc.liftoff'), tx('asc.liftoff.d', { vehicle: vref(vehicle.id, 'name', vehicle.name), site: vref(vehicle.id, 'site', vehicle.launchSite.name), mass: m / 1000 }), 'info')

  type Mode = 'vertical' | 'kick' | 'gravityTurn' | 'closedLoop'
  let mode: Mode = 'vertical'
  let kickStart = 0
  let lastTel = -1
  const tMax = 3600

  const currentStage = () => coreOrder[coreIdx]

  while (t < tMax) {
    const r = Math.hypot(x, y)
    const h = r - RE
    if (h < -5) {
      reason = tx('asc.reason.impact')
      ev(tx('asc.impact'), tx('asc.impact.d'), 'fail')
      break
    }
    const rhatx = x / r
    const rhaty = y / r
    const ehatx = -rhaty
    const ehaty = rhatx
    // air-relative velocity (atmosphere co-rotates)
    const vrelx = vx + OMEGA * y
    const vrely = vy - OMEGA * x
    const vrel = Math.hypot(vrelx, vrely)
    const v = Math.hypot(vx, vy)
    const atmo = P.atmosphere(h)
    const mach = vrel / atmo.a
    const q = 0.5 * atmo.rho * vrel * vrel
    const vr = vx * rhatx + vy * rhaty
    const vt = vx * ehatx + vy * ehaty

    // --- thrust available ---
    const boostersAttached = boosters.some((b) => !b.separated)
    let F = 0
    let mdotTotal = 0
    const burning = live.filter((s) => s.burning && !s.separated)
    for (const s of burning) {
      const thr = s.def.role !== 'booster' && boostersAttached ? (s.def.throttleWhileBoosters ?? 1) : 1
      const st = stageThrust(s, atmo.p, thr)
      F += st.F
      mdotTotal += st.mdot
    }
    // acceleration cap (crew comfort / structural) via throttle
    let throttle = 1
    if (F / m > opts.maxAccelG * G0) throttle = Math.max(0.4, (opts.maxAccelG * G0 * m) / F)
    // max-Q throttle bucket (Falcon 9 / SLS / Starship practice): ease off through the transonic peak
    const canThrottle = burning.every((s) => s.engines.every((e) => e.minThrottle < 0.8))
    if (canThrottle && q > 18_000 && mach > 0.75 && mach < 1.6) throttle = Math.min(throttle, 0.75)

    // --- guidance ---
    if (mode === 'vertical' && (t >= tVert || vrel > vKick)) {
      mode = 'kick'
      kickStart = t
    }
    if (mode === 'kick' && t - kickStart >= kickDur) mode = 'gravityTurn'
    if (mode === 'gravityTurn' && (q < 1000 || vr < 0)) mode = 'closedLoop'

    let ux = rhatx
    let uy = rhaty
    if (mode === 'kick') {
      const phi = (kick * (t - kickStart)) / kickDur
      ux = Math.cos(phi) * rhatx + Math.sin(phi) * ehatx
      uy = Math.cos(phi) * rhaty + Math.sin(phi) * ehaty
    } else if (mode === 'gravityTurn') {
      if (vrel > 1) {
        ux = vrelx / vrel
        uy = vrely / vrel
      }
    } else if (mode === 'closedLoop') {
      const aT = (F * throttle) / m
      const gEff = MU / (r * r) - (vt * vt) / r
      // Insertion law: bleed the radial velocity to zero exactly at the target altitude with a
      // constant net radial deceleration (v_r² = 2·d·Δh), then hold v_r ≈ 0. Thrust supplies
      // gravity-minus-centrifugal plus that deceleration; the rest goes horizontal.
      const dh = hTarget - h
      let aRnet: number
      if (dh > 500) {
        aRnet = vr > 0 ? -(vr * vr) / (2 * dh) : Math.min(2, (-vr) / 30) // falling below target: climb gently
      } else {
        aRnet = -vr / 30
      }
      let aR = aRnet + gEff
      aR = Math.max(-0.5 * aT, Math.min(0.9 * aT, aR))
      const aTan = Math.sqrt(Math.max(aT * aT - aR * aR, 0))
      const n = Math.hypot(aR, aTan) || 1
      ux = (aR * rhatx + aTan * ehatx) / n
      uy = (aR * rhaty + aTan * ehaty) / n
      // low-T/W final stage: coast to apoapsis if already above target apoapsis
      const el = elementsFromState([x / 1000, y / 1000, 0], [vx / 1000, vy / 1000, 0], P.mu)
      const raAlt = (el.ra - P.radius) * 1000
      if (!coastDone && aT / G0 < 0.35 && raAlt > hTarget - 10_000 && vr > 5 && el.e < 1) coastingToApo = true
      if (coastingToApo) {
        if (vr > 0) {
          throttle = 0
        } else {
          coastingToApo = false
          coastDone = true
        }
        // burn prograde once at/after apoapsis
        ux = ehatx
        uy = ehaty
      }
    }

    // --- RK4 on [x,y,vx,vy] with linear mass decrease over the step ---
    const Fthr = F * throttle
    const mdot = mdotTotal * throttle
    const A = refArea()
    const accel = (px: number, py: number, pvx: number, pvy: number, mass: number) => {
      const rr = Math.hypot(px, py)
      const hh = rr - RE
      const at = P.atmosphere(hh)
      const rvx = pvx + OMEGA * py
      const rvy = pvy - OMEGA * px
      const rv = Math.hypot(rvx, rvy)
      const cd = rocketCd(rv / at.a)
      const D = 0.5 * at.rho * rv * rv * cd * A
      const g = MU / (rr * rr * rr)
      const ax = -g * px + (Fthr / mass) * ux - (rv > 0 ? (D / mass) * (rvx / rv) : 0)
      const ay = -g * py + (Fthr / mass) * uy - (rv > 0 ? (D / mass) * (rvy / rv) : 0)
      return [ax, ay, D]
    }
    // k = [dx, dy, dvx, dvy]
    const k1 = accel(x, y, vx, vy, m)
    const s2 = [x + 0.5 * dt * vx, y + 0.5 * dt * vy, vx + 0.5 * dt * k1[0], vy + 0.5 * dt * k1[1]]
    const k2 = accel(s2[0], s2[1], s2[2], s2[3], m - 0.5 * mdot * dt)
    const s3 = [x + 0.5 * dt * s2[2], y + 0.5 * dt * s2[3], vx + 0.5 * dt * k2[0], vy + 0.5 * dt * k2[1]]
    const k3 = accel(s3[0], s3[1], s3[2], s3[3], m - 0.5 * mdot * dt)
    const s4 = [x + dt * s3[2], y + dt * s3[3], vx + dt * k3[0], vy + dt * k3[1]]
    const k4 = accel(s4[0], s4[1], s4[2], s4[3], m - mdot * dt)
    const nx = x + (dt / 6) * (vx + 2 * s2[2] + 2 * s3[2] + s4[2])
    const ny = y + (dt / 6) * (vy + 2 * s2[3] + 2 * s3[3] + s4[3])
    const nvx = vx + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0])
    const nvy = vy + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])
    x = nx
    y = ny
    vx = nvx
    vy = nvy

    // loss bookkeeping
    const aThrust = Fthr / m
    dvExpended += aThrust * dt
    const gHere = MU / (r * r)
    if (v > 1) gravLoss += gHere * (vr / v) * dt
    dragLoss += (k1[2] / m) * dt
    const accelG = Math.hypot(k1[0] + (MU / (r * r * r)) * x, k1[1] + (MU / (r * r * r)) * y) / G0 // non-gravitational
    if (accelG > maxG) maxG = accelG

    // propellant consumption
    for (const s of burning) {
      const thr = s.def.role !== 'booster' && boostersAttached ? (s.def.throttleWhileBoosters ?? 1) : 1
      const st = stageThrust(s, atmo.p, thr * throttle)
      s.prop -= st.mdot * dt
    }
    t += dt
    m = totalMass()

    // --- events ---
    if (q > maxQ.q) maxQ = { q, t, alt: h }
    if (!mach1Done && mach >= 1) {
      mach1Done = true
      ev(tx('asc.mach1'), tx('asc.mach1.d', { alt: h / 1000, t }), 'info')
    }
    if (fairing > 0 && vehicle.fairingJettisonAlt != null && h > vehicle.fairingJettisonAlt) {
      fairing = 0
      m = totalMass()
      ev(tx('asc.fairing'), tx('asc.fairing.d', { alt: h / 1000 }), 'info')
    }
    // booster burnout
    for (const b of boosters) {
      if (!b.separated && b.prop <= 0) {
        b.prop = 0
        b.burning = false
        b.separated = true
        b.sepT = t
        stageTimes.push({ id: b.def.id, sep: t })
        ev(tx('asc.boosterSep', { stage: sref(vehicle.id, b.def.id) }), tx('asc.sep.d', { alt: h / 1000, v, t }), 'info')
        m = totalMass()
      }
    }
    // core burnout → next stage
    const cs = currentStage()
    if (cs.prop <= 0 && !cs.separated) {
      cs.prop = 0
      cs.burning = false
      if (coreIdx < coreOrder.length - 1) {
        cs.separated = true
        cs.sepT = t
        stageTimes.push({ id: cs.def.id, sep: t })
        ev(tx('asc.coreSep', { stage: sref(vehicle.id, cs.def.id) }), tx('asc.sep.d', { alt: h / 1000, v, t }), 'info')
        coreIdx++
        const nx = currentStage()
        nx.burning = true
        nx.ignitionT = t
        ev(tx('asc.ignition', { stage: sref(vehicle.id, nx.def.id) }), tx('asc.ignition.d', { t }), 'info')
        m = totalMass()
      } else {
        // final stage exhausted without orbit
        const el = elementsFromState([x / 1000, y / 1000, 0], [vx / 1000, vy / 1000, 0], P.mu)
        const rpAlt = el.rp - P.radius
        const raAlt = el.ra === Infinity ? Infinity : el.ra - P.radius
        reason = tx('asc.propOut.d', { rp: rpAlt, ra: raAlt === Infinity ? null : raAlt })
        ev(tx('asc.propOut'), reason, 'fail')
        break
      }
    }
    // orbit check on the final stage: direct insertion, or coast to apoapsis + circularisation burn
    if (coreIdx === coreOrder.length - 1 && mode === 'closedLoop' && throttle > 0) {
      const el = elementsFromState([x / 1000, y / 1000, 0], [vx / 1000, vy / 1000, 0], P.mu)
      const rpAlt = (el.rp - P.radius) * 1000
      const raAlt = el.e < 1 ? (el.ra - P.radius) * 1000 : Infinity
      if (el.e < 1 && rpAlt >= hTarget - 3000) {
        cs.burning = false
        ok = true
        orbit = { rp: el.rp - P.radius, ra: el.ra - P.radius, alt: h / 1000, vel: v }
        ev(tx('asc.seco'), tx('asc.seco.d', { rp: orbit.rp, ra: orbit.ra, v, t, prop: cs.prop / 1000 }), 'ok')
        break
      }
      const lowThrust = (F * throttle) / m / G0 < 0.35
      if (lowThrust && el.e < 1 && raAlt >= hTarget - 2000 && rpAlt >= 80_000) {
        // cut off now, coast to apoapsis, circularise impulsively with the final stage
        cs.burning = false
        const raM = el.ra * 1000
        const vApo = Math.sqrt(MU * (2 / raM - 1 / (el.a * 1000)))
        const vCirc = Math.sqrt(MU / raM)
        const dv = Math.max(0, vCirc - vApo)
        const isp =
          cs.engines.reduce((acc, e) => acc + e.thrustVac * e.count, 0) /
          (cs.engines.reduce((acc, e) => acc + e.mdot * e.count, 0) * G0)
        const propNeeded = m * (1 - Math.exp(-dv / (isp * G0)))
        const tCoast = el.period / 2 // ~half an orbit from a low point to apoapsis (approximation)
        ev(tx('asc.seco1'), tx('asc.seco1.d', { rp: rpAlt / 1000, ra: raAlt / 1000, v, t }), 'info')
        if (propNeeded <= cs.prop) {
          cs.prop -= propNeeded
          t += tCoast
          m = totalMass()
          ok = true
          orbit = { rp: el.ra - P.radius, ra: el.ra - P.radius, alt: el.ra - P.radius, vel: vCirc }
          ev(tx('asc.circ'), tx('asc.circ.d', { dv, alt: orbit.alt, prop: cs.prop / 1000 }), 'ok')
          // move the state to the circular orbit for consistency
          const ang = Math.atan2(y, x) + Math.PI
          x = raM * Math.cos(ang)
          y = raM * Math.sin(ang)
          vx = -vCirc * Math.sin(ang)
          vy = vCirc * Math.cos(ang)
        } else {
          reason = tx('asc.circFail.d', { dv, need: propNeeded / 1000, left: cs.prop / 1000 })
          ev(tx('asc.circFail'), reason, 'fail')
        }
        break
      }
    }

    // telemetry
    if (t - lastTel >= telEvery - 1e-9) {
      lastTel = t
      const ang = Math.atan2(y, x) - theta0 - OMEGA * t // ground-relative: the pad rotates with the Earth
      const pitchDeg = (Math.acos(Math.max(-1, Math.min(1, ux * rhatx + uy * rhaty))) * 180) / Math.PI
      telemetry.push({
        t,
        alt: h,
        vel: v,
        velRel: vrel,
        mach,
        q,
        accel: accelG,
        mass: m,
        downrange: (ang * RE) / 1000,
        thrust: Fthr,
        pitch: pitchDeg,
        stage: cs.def.id,
      })
    }
  }
  if (!ok && !reason) reason = tx('asc.reason.timeout')
  const last = currentStage()
  const finalStageDry = last.dry
  const massInOrbit = ok ? m : 0
  void theta0
  return {
    ok,
    reason: reason ? en(reason) : undefined,
    reasonMsg: reason,
    events,
    telemetry,
    massInOrbit,
    residualProp: ok ? Math.max(0, last.prop) : 0,
    finalStageDry,
    orbit,
    kickAngle: opts.kickAngleDeg,
    losses: { gravity: gravLoss, drag: dragLoss, steering: Math.max(0, dvExpended - gravLoss - dragLoss - Math.hypot(vx, vy)), dvExpended },
    duration: t,
    maxQ,
    maxG,
    stageTimes,
  }
}

/** Try a range of pitch-kick angles and keep the ascent with the most propellant left in orbit. */
export function ascentSearch(vehicle: Vehicle, opts: Omit<AscentOptions, 'kickAngleDeg'>, angles?: number[]): AscentResult {
  const list = angles ?? [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 9, 10.5, 12, 14, 17, 20]
  let best: AscentResult | null = null
  let bestFail: AscentResult | null = null
  for (const a of list) {
    const r = runAscent(vehicle, { ...opts, kickAngleDeg: a, telemetryEvery: 5 })
    if (r.ok) {
      if (!best || r.residualProp > best.residualProp) best = r
    } else if (!bestFail || scoreFail(r) > scoreFail(bestFail)) bestFail = r
  }
  const chosen = best ?? bestFail!
  // re-run the winner with fine telemetry
  return runAscent(vehicle, { ...opts, kickAngleDeg: chosen.kickAngle, telemetryEvery: 1 })
}

function scoreFail(r: AscentResult): number {
  // prefer attempts that got closest to orbit: highest altitude reached with the most speed
  let best = 0
  for (const s of r.telemetry) best = Math.max(best, s.alt / 1000 + s.vel / 20)
  return best
}
