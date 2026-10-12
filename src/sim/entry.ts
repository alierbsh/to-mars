/**
 * Mars entry, descent and landing: planar Mars-centred integration from the 125 km interface.
 * Drag from the ballistic coefficient, in-plane lift with bank angle, Sutton–Graves stagnation
 * heating (with a margin factor for the turbulent/leeside underestimate on large blunt bodies),
 * g-load tracking, and a throttled retro-propulsive landing burn when the vehicle has one.
 */
import { earthAtmosphere, marsAtmosphere, type AtmoState } from './atmosphere'
import { G0, MU_EARTH, MU_MARS, R_EARTH_MEAN, R_MARS_EQ, SUTTON_GRAVES_EARTH, SUTTON_GRAVES_MARS } from './constants'
import { ENTRY_INTERFACE_KM } from './transfer'
import type { EntryModel, EntryResult, EntrySample, LandingModel, SimEvent } from './types'

export interface PlanetEntryModel {
  name: string
  mu: number // m³/s²
  radius: number // m
  g: number // surface gravity m/s²
  k: number // Sutton–Graves constant, SI
  atmosphere: (h: number, scale: number) => AtmoState
  interfaceAlt: number // m
}

export const MARS_PLANET: PlanetEntryModel = {
  name: 'Mars',
  mu: MU_MARS * 1e9,
  radius: R_MARS_EQ * 1000,
  g: 3.721,
  k: SUTTON_GRAVES_MARS,
  atmosphere: marsAtmosphere,
  interfaceAlt: ENTRY_INTERFACE_KM * 1000,
}

export const EARTH_PLANET: PlanetEntryModel = {
  name: 'Earth',
  mu: MU_EARTH * 1e9,
  radius: R_EARTH_MEAN * 1000,
  g: 9.80665,
  k: SUTTON_GRAVES_EARTH,
  atmosphere: (h) => earthAtmosphere(h),
  interfaceAlt: 120_000,
}

export interface EntryOptions {
  entryVel: number // m/s at the interface
  fpaDeg: number // negative
  mass: number // kg at entry (incl. landing propellant)
  entry: EntryModel
  landing: LandingModel | null
  landingProp: number // kg of propellant available for the landing burn
  densityScale: number
  heatingMargin: number
  gLimit: number
  bankDeg: number
  autoBank?: boolean
  crewed: boolean
  telemetryEvery?: number
  planet?: PlanetEntryModel
  /** dust-storm density lift at entry altitudes (1 = clear), tapering to the surface */
  stormDensity?: number
  /** blind-landing hazard: [chance, seeded roll]; a landing fails when roll < chance */
  hazard?: [number, number]
}

/**
 * Suicide-burn law: thrust acceleration needed to null speed V over the remaining path to the
 * ground (h / sin γ for retrograde thrust), with gravity's along-path component and drag's help.
 */
function thrustNeeded(V: number, vr: number, h: number, rho: number, cdA: number, m: number, g: number): number {
  const sinG = Math.max(-vr / Math.max(V, 1), 0.15)
  const path = Math.max(h, 1) / sinG
  const drag = (0.5 * rho * V * V * cdA) / m
  return (V * V) / (2 * path) + g * sinG - drag
}

export function runEntry(o: EntryOptions): EntryResult {
  const P = o.planet ?? MARS_PLANET
  const MU = P.mu
  const RM = P.radius
  const G_MARS = P.g
  const events: SimEvent[] = []
  const telemetry: EntrySample[] = []
  const telEvery = o.telemetryEvery ?? 1
  const fmt = (v: number, d = 0) => v.toFixed(d)
  let t = 0
  const ev = (label: string, detail: string, severity: SimEvent['severity'] = 'info') =>
    events.push({ t, phase: 'entry', label, detail, severity })

  const cdA = o.entry.cd * o.entry.refArea
  const beta0 = o.mass / cdA
  let m = o.mass
  let prop = o.landingProp
  const gamma = (o.fpaDeg * Math.PI) / 180
  const r0 = RM + P.interfaceAlt
  let x = r0
  let y = 0
  let vx = o.entryVel * Math.sin(gamma) // radial component (negative: down)
  let vy = o.entryVel * Math.cos(gamma) // tangential (prograde)
  let bank = Math.cos((o.bankDeg * Math.PI) / 180)
  let pulledOut = false

  let peakG = 0
  let peakQ = 0
  let heatLoad = 0
  let tpsFailed = false
  let gFailed = false
  let burning = false
  let landed = false
  let crashed = false
  let skipped = false
  let tipped = false
  let touchdownVel = 0
  let landingDv = 0
  let mach2Done = false
  let peakHeatAnnounced = false
  let peakGAnnounced = false
  let lastQ = 0
  let lastG = 0
  let lastTel = -1
  const aMax = o.landing ? o.landing.thrust / m : 0

  ev('Entry interface', `${fmt(P.interfaceAlt / 1000)} km, ${fmt(o.entryVel)} m/s, γ ${o.fpaDeg.toFixed(1)}°, ${fmt(m / 1000, 1)} t, β ${fmt(beta0)} kg/m²`, 'info')

  let dt = 0.1
  const tMax = 2400
  while (t < tMax) {
    const r = Math.hypot(x, y)
    const h = r - RM
    const V = Math.hypot(vx, vy)
    const storm = o.stormDensity && o.stormDensity > 1 ? 1 + (o.stormDensity - 1) * Math.min(1, Math.max(0, h / 30_000)) : 1
    const atmo = P.atmosphere(h, o.densityScale * storm)
    const mach = V / atmo.a
    const rhatx = x / r
    const rhaty = y / r
    const vr = vx * rhatx + vy * rhaty

    if (h <= 0) {
      if (burning && V < 12) {
        landed = true
        touchdownVel = V
        ev('Touchdown', `${fmt(V, 1)} m/s, ${fmt(m / 1000, 1)} t landed, ${fmt(prop / 1000, 1)} t propellant left`, 'ok')
      } else {
        crashed = true
        touchdownVel = V
        ev('Impact', `${fmt(V)} m/s at the surface${o.landing ? ' (landing burn could not stop it)' : ' — no landing propulsion'}`, 'fail')
      }
      break
    }
    if (h > P.interfaceAlt + 2000 && vr > 0) {
      skipped = true
      ev('Skipped out', `Vehicle left the atmosphere at ${fmt(V)} m/s — entry too shallow`, 'fail')
      break
    }

    // bank modulation: full lift up until the descent rate has been arrested, then lift down
    // (bank 180°) so the vehicle cannot skip back out; release once it is well inside the atmosphere
    if (o.autoBank && !burning) {
      if (!pulledOut && vr > -60 && h < P.interfaceAlt - 15_000) {
        pulledOut = true
        ev('Pull-out', `descent rate arrested at ${fmt(h / 1000)} km, ${fmt(V)} m/s — rolling lift down to stay in the atmosphere`, 'info')
      }
      // after pull-out: fly lift-neutral; lift-down only if actually climbing, lift-up if sinking fast
      bank = pulledOut ? (vr > 20 ? -1 : vr < -250 ? 1 : 0) : 1
    }
    // aero forces
    const q = 0.5 * atmo.rho * V * V
    const D = q * cdA
    const L = o.entry.ld * D * bank
    const vxh = V > 0 ? vx / V : 0
    const vyh = V > 0 ? vy / V : 0
    // in-plane up-normal: r̂ minus its component along v̂
    let nx = rhatx - (rhatx * vxh + rhaty * vyh) * vxh
    let ny = rhaty - (rhatx * vxh + rhaty * vyh) * vyh
    const nn = Math.hypot(nx, ny) || 1
    nx /= nn
    ny /= nn

    // heating
    const qdot = (P.k * Math.sqrt(atmo.rho / o.entry.noseRadius) * V * V * V * o.heatingMargin) / 1e4 // W/cm²
    heatLoad += qdot * dt
    if (qdot > peakQ) peakQ = qdot
    if (!tpsFailed && qdot > o.entry.tpsLimit) {
      tpsFailed = true
      ev('Heat shield limit exceeded', `${fmt(qdot)} W/cm² > ${fmt(o.entry.tpsLimit)} W/cm² (${o.entry.tpsName}) at ${fmt(h / 1000)} km, ${fmt(V)} m/s`, 'fail')
    }

    // landing burn logic
    let Fthr = 0
    let ux = 0
    let uy = 0
    let mdot = 0
    if (o.landing && !burning && prop > 0) {
      // Light as late as possible: the thrust acceleration needed to null the whole velocity before
      // the vertical velocity carries the vehicle into the ground (drag helps, gravity hurts).
      const aReq = thrustNeeded(V, vr, h, atmo.rho, cdA, m, G_MARS)
      const afterPullOut = pulledOut || !o.autoBank || h < 12_000
      const dragAccel = (0.5 * atmo.rho * V * V * cdA) / m
      const dragSpent = dragAccel < 0.6 * (o.landing.thrust / m) // let aerodynamics do the work while it can
      const descending = vr < -50 && h < 15_000 // supersonic retropropulsion starts in the last ~10 km
      if ((afterPullOut && dragSpent && descending && aReq >= 0.5 * aMax) || h < 1200) {
        burning = true
        dt = 0.05
        ev('Landing burn ignition', `${fmt(h / 1000, 1)} km, ${fmt(V)} m/s, Mach ${fmt(mach, 1)}, sink rate ${fmt(-vr)} m/s; needs ${fmt(aReq / G_MARS, 1)} g${P.name === 'Mars' ? ' (Mars)' : ''} of ${fmt(aMax / G_MARS, 1)} available; ${o.landing.label}`, aReq > aMax ? 'warn' : 'info')
      }
    }
    if (burning && prop > 0) {
      const aReq = thrustNeeded(V, vr, h, atmo.rho, cdA, m, G_MARS) * 1.3 // 30 % control margin (ends slightly high, final descent takes over)
      const Tmax = o.landing!.thrust
      let throttle = Math.min(1, Math.max(o.landing!.minThrottle, (aReq * m) / Tmax))
      if (V < 3) {
        // final vertical descent: analytic cost at a controlled sink rate, then touchdown
        const vd = Math.min(40, Math.max(2, h / 20))
        const dv = G_MARS * (h / vd) + vd
        const needed = m * (1 - Math.exp(-dv / (o.landing!.isp * G0)))
        if (needed <= prop) {
          prop -= needed
          m -= needed
          landingDv += dv
          landed = true
          touchdownVel = 2
          t += h / vd
          ev('Touchdown', `vertical descent from ${fmt(h)} m; ${fmt(m / 1000, 1)} t landed, ${fmt(prop / 1000, 1)} t propellant left`, 'ok')
          if (o.hazard && o.hazard[1] < o.hazard[0]) {
            tipped = true
            landed = false
            crashed = true
            ev('Tipped over', `a leg came down on a rock the landing could not see — the ship is on its side (hazard chance ${fmt(o.hazard[0] * 100)} %)`, 'fail')
          }
        } else {
          crashed = true
          touchdownVel = Math.sqrt(2 * G_MARS * h)
          ev('Propellant exhausted', `${fmt(h)} m above the surface — fell at ${fmt(touchdownVel)} m/s`, 'fail')
        }
        break
      }
      Fthr = Tmax * throttle
      ux = -vxh
      uy = -vyh
      mdot = Fthr / (o.landing!.isp * G0)
      if (mdot * dt > prop) {
        mdot = prop / dt
        Fthr = mdot * o.landing!.isp * G0
      }
    } else if (burning && prop <= 0) {
      // out of propellant mid-burn: ballistic to impact
      burning = false
      ev('Propellant exhausted mid-burn', `${fmt(h / 1000, 2)} km, ${fmt(V)} m/s — now falling`, 'fail')
    }

    // accelerations (semi-implicit Euler at small dt — forces vary smoothly)
    const g = MU / (r * r)
    const ax = -g * rhatx + (-D * vxh + L * nx + Fthr * ux) / m
    const ay = -g * rhaty + (-D * vyh + L * ny + Fthr * uy) / m
    const aero = Math.hypot(-D * vxh + L * nx, -D * vyh + L * ny) / m
    const gLoad = (aero + Fthr / m) / G0
    if (gLoad > peakG) peakG = gLoad
    if (o.crewed && !gFailed && gLoad > o.gLimit) {
      gFailed = true
      ev('Crew g-limit exceeded', `${fmt(gLoad, 1)} g sustained > ${fmt(o.gLimit, 1)} g limit for a deconditioned crew, at ${fmt(h / 1000)} km`, 'fail')
    }

    vx += ax * dt
    vy += ay * dt
    x += vx * dt
    y += vy * dt
    if (Fthr > 0) {
      m -= mdot * dt
      prop -= mdot * dt
      landingDv += (Fthr / m) * dt
    }
    t += dt

    // announce peaks when they pass
    if (!peakHeatAnnounced && lastQ > 0.2 && qdot < lastQ && qdot > 0.5 * peakQ && peakQ > 1 && h < 100_000) {
      peakHeatAnnounced = true
      ev('Peak heating', `${fmt(peakQ)} W/cm² at ${fmt(h / 1000)} km (limit ${fmt(o.entry.tpsLimit)}, ${o.entry.tpsName}); heat load so far ${fmt(heatLoad)} J/cm²`, peakQ > o.entry.tpsLimit ? 'fail' : peakQ > 0.8 * o.entry.tpsLimit ? 'warn' : 'info')
    }
    if (!peakGAnnounced && lastG > 0.5 && gLoad < lastG && gLoad > 0.5 * peakG && peakG > 1 && !burning) {
      peakGAnnounced = true
      ev('Peak deceleration', `${fmt(peakG, 1)} g at ${fmt(h / 1000)} km, ${fmt(V)} m/s`, peakG > o.gLimit && o.crewed ? 'fail' : peakG > 0.8 * o.gLimit && o.crewed ? 'warn' : 'info')
    }
    if (!mach2Done && mach < 2 && h < 60_000) {
      mach2Done = true
      ev('Mach 2', `${fmt(h / 1000, 1)} km, ${fmt(V)} m/s — below this a parachute would be usable for ~1 t, not ${fmt(m / 1000)} t`, 'info')
    }
    lastQ = qdot
    lastG = gLoad

    if (t - lastTel >= telEvery - 1e-9) {
      lastTel = t
      telemetry.push({
        t,
        alt: h,
        vel: V,
        mach,
        gLoad,
        heatFlux: qdot,
        heatLoad,
        mass: m,
        downrange: (Math.atan2(y, x) * RM) / 1000,
        q,
        burning,
        fpa: (Math.asin(Math.max(-1, Math.min(1, vr / Math.max(V, 1e-6)))) * 180) / Math.PI,
      })
    }
  }
  const ok = landed && !tpsFailed
  let reason: string | undefined
  if (tpsFailed) reason = 'Heat shield exceeded its limit'
  else if (skipped) reason = 'Skipped out of the atmosphere'
  else if (tipped) reason = 'Tipped over on landing'
  else if (crashed) reason = 'Crashed'
  else if (!landed) reason = 'Did not reach the surface in time'
  return {
    ok,
    reason,
    events,
    telemetry,
    peakG,
    peakHeatFlux: peakQ,
    heatLoad,
    landed,
    crashed: crashed || skipped,
    tipped,
    touchdownVel,
    landingDv,
    landingPropUsed: o.landingProp - prop,
    duration: t,
    entryMass: o.mass,
    beta: beta0,
  }
}
