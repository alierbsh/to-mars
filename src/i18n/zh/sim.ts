/** What the simulation says — zh (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('zh-CN')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'Liftoff',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle} from ${p.site}, ${f(p.mass)} t on the pad`,
  'asc.impact': 'Impact',
  'asc.impact.d': 'Vehicle hit the ground before reaching orbit',
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'Fairing jettison',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage} separation`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage} cutoff & separation`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage} ignition`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': 'Propellant depleted before orbit',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `Propellant exhausted: periapsis ${f(p.rp)} km, apoapsis ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO — orbit',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s; ${f(p.prop, 1)} t propellant left`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'Circularisation burn',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `Δv ${f(p.dv)} m/s at apoapsis, ${f(p.alt)} km circular; ${f(p.prop, 1)} t propellant left`,
  'asc.circFail': 'Circularisation impossible',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `Not enough propellant to circularise (${f(p.dv)} m/s needed, ${f(p.need, 1)} t; ${f(p.left, 1)} t left)`,
  'asc.reason.impact': 'Impacted the surface',
  'asc.reason.timeout': 'Timed out',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': 'Parking orbit',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `${f(p.mass, 1)} t in orbit; ${f(p.prop, 1)} t propellant left in the ${p.stage}`,
  'leo.ship': 'Ship in parking orbit',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `arrived with ${f(p.res, 1)} t residual propellant; the mission needs ${f(p.target)} t aboard at departure (${f(p.more)} t more)`,
  'leo.tanker': (p: { n: number }) => `Tanker ${p.n} docks`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → ${f(p.aboard)} t aboard (${f(p.pct)} % of what the mission needs)`,
  'leo.done': 'Propellant campaign complete',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${f(p.aboard)} t aboard (${f(p.pct)} % of the ${f(p.target)} t needed) after ${p.n} tankers over ${f(p.days)} days; boil-off lost ${f(p.lost, 1)} t`,
  'leo.short': 'Short of propellant',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `${p.n} tankers delivering ${f(p.each)} t each could not reach the ${f(p.target)} t the mission needs`,
  'leo.missed': 'Launch window missed',
  'leo.missed.d': (p: { days: number; limit: number }) => `${f(p.days)}-day campaign is longer than the ${p.limit}-day limit around the opportunity — the next window is 26 months away`,
  'leo.long': 'Campaign longer than the window',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} days vs ~${p.limit}-day departure period; departure C3 will be worse than the minimum`,
  'leo.boiloff': 'Boil-off',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `${f(p.pct)} % of the delivered propellant boiled away at ${f(p.rate, 2)} %/day`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': 'Trans-Mars injection burn',
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + mid-course), ${f(p.used)} t propellant, ${f(p.burn)} s burn; ${f(p.left)} t left for landing`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage} burns Δv ${f(p.need, 2)} km/s (had ${f(p.had, 2)})`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage} gives ${f(p.dv1, 2)} km/s, ${p.sc} adds ${f(p.rest, 2)} km/s from its own tanks (${f(p.used, 1)} t); ${f(p.left, 1)} t left`,
  'tmi.missed': 'Departure window missed',
  'tmi.missed.d': 'The propellant campaign did not finish in time; the ship stays in Earth orbit.',
  'tmi.short': 'Not enough Δv for trans-Mars injection',
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `${f(p.avail, 2)} km/s available vs ${f(p.need, 2)} km/s needed (C3 ${f(p.c3, 1)} km²/s² from ${p.orbit} km). ${p.refuel ? `${f(p.prop ?? 0)} t propellant aboard, ${f(p.mass ?? 0)} t total.` : 'Upper stage and spacecraft propellant combined.'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': 'Trans-Mars injection complete',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², ${f(p.days)}-day transfer, arrival v∞ ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': "Leaving Earth's sphere of influence",
  'cr.earthSoi.d': '~0.92 million km out',
  'cr.lifeOut': 'Life support exhausted',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} supports ${p.cap} days of free flight; the transfer takes ${f(p.days)} — crew lost ${f(p.short)} days short of Mars`,
  'cr.life': 'Life support',
  'cr.life.d': (p: { cap: number; days: number }) => `${p.cap}-day capability covers the ${f(p.days)}-day transfer`,
  'cr.consOut': 'Consumables exhausted',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t covers ${f(p.days)} days for ${p.crew} crew at ${f(p.rate, 1)} kg/person/day`,
  'cr.half': 'Halfway',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `consumables margin ${f(p.margin)} days (${f(p.t, 1)} t carried, ${f(p.rate, 1)} kg/person/day with ${f(p.water)} % water / ${f(p.o2)} % O₂ recovery)`,
  'cr.half.uncrewed': 'uncrewed — no consumables to track',
  'cr.rad': 'Radiation',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `${f(p.dose)} mSv accumulated so far on the way out (MSL RAD rate 1.8 mSv/day${p.shield ? ', 15 % shielding credit' : ', no dedicated shielding'}); NASA career limit 600 mSv — the return leg doubles it`,
  'cr.marsSoi': "Entering Mars' sphere of influence",
  'cr.marsSoi.d': (p: { v: number }) => `~0.58 million km from Mars, closing at ${f(p.v, 2)} km/s`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': 'Weather at Mars',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season}; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `a planet-encircling dust storm is under way (τ ≈ ${p.tau}): entry density up ~${f(p.density)} % at altitude, nothing to see below the dust, surface winds ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `a regional dust storm (τ ≈ ${p.tau}): entry density up ~${f(p.density)} % at altitude, poor visibility, winds ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `clear skies (τ ≈ ${p.tau}), winds ~${f(p.wind)} m/s`,
  'season.nSpring': 'northern spring',
  'season.nSummer': 'northern summer',
  'season.sSpring': 'southern spring — dust-storm season',
  'season.sSummer': 'southern summer — dust-storm season',
  'season.nSpring.short': 'northern spring',
  'season.nSummer.short': 'northern summer',
  'season.sSpring.short': 'southern spring',
  'season.sSummer.short': 'southern summer',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': 'Entry interface',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'Touchdown',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s, ${f(p.mass, 1)} t landed, ${f(p.prop, 1)} t propellant left`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `vertical descent from ${f(p.h)} m; ${f(p.mass, 1)} t landed, ${f(p.prop, 1)} t propellant left`,
  'en.impact': 'Impact',
  'en.impact.d': (p: { v: number; landing: boolean }) => `${f(p.v)} m/s at the surface${p.landing ? ' (landing burn could not stop it)' : ' — no landing propulsion'}`,
  'en.skip': 'Skipped out',
  'en.skip.d': (p: { v: number }) => `Vehicle left the atmosphere at ${f(p.v)} m/s — entry too shallow`,
  'en.pullout': 'Pull-out',
  'en.pullout.d': (p: { alt: number; v: number }) => `descent rate arrested at ${f(p.alt)} km, ${f(p.v)} m/s — rolling lift down to stay in the atmosphere`,
  'en.tps': 'Heat shield limit exceeded',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² (${p.tps}) at ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.burn': 'Landing burn ignition',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, sink rate ${f(p.sink)} m/s; needs ${f(p.need, 1)} g${p.mars ? ' (Mars)' : ''} of ${f(p.avail, 1)} available; ${p.landing}`,
  'en.tipped': 'Tipped over',
  'en.tipped.d': (p: { pct: number }) => `a leg came down on a rock the landing could not see — the ship is on its side (hazard chance ${f(p.pct)} %)`,
  'en.propOut': 'Propellant exhausted',
  'en.propOut.d': (p: { h: number; v: number }) => `${f(p.h)} m above the surface — fell at ${f(p.v)} m/s`,
  'en.propOutBurn': 'Propellant exhausted mid-burn',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s — now falling`,
  'en.g': 'Crew g-limit exceeded',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `${f(p.g, 1)} g sustained > ${f(p.lim, 1)} g limit for a deconditioned crew, at ${f(p.alt)} km`,
  'en.peakHeat': 'Peak heating',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.q)} W/cm² at ${f(p.alt)} km (limit ${f(p.lim)}, ${p.tps}); heat load so far ${f(p.load)} J/cm²`,
  'en.peakG': 'Peak deceleration',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.g, 1)} g at ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s — below this a parachute would be usable for ~1 t, not ${f(p.mass)} t`,
  'en.reason.tps': 'Heat shield exceeded its limit',
  'en.reason.skip': 'Skipped out of the atmosphere',
  'en.reason.tipped': 'Tipped over on landing',
  'en.reason.crashed': 'Crashed',
  'en.reason.slow': 'Did not reach the surface in time',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': 'Hatch opens',
  'surf.hatch.d': 'cabin pressure equalised to 0.6 kPa outside; the crew elevator deploys',
  'surf.boots': 'First boots on Mars',
  'surf.boots.d': (p: { n: number }) => `${p.n} of the crew down the elevator; the surface holds`,
  'surf.flag': 'The flag',
  'surf.flag.d': 'planted 25 m from the ship, in the lee of the landing legs',
  'surf.habitat': 'Habitat inflated',
  'surf.habitat.d': 'the first inflatable module up, airlock mated',
  'surf.power': 'Power on',
  'surf.power.d': 'three roll-out solar blankets, ~40 kW at noon in clear air',
  'flyby': 'Mars flyby',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} has no entry system; it passes Mars at ${f(p.v, 2)} km/s and stays in solar orbit`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'Launch',
  'phase.refuel': 'Refuelling in orbit',
  'phase.parking': 'Parking orbit',
  'phase.tmi': 'TMI burn',
  'phase.cruise': 'Cruise to Mars',
  'phase.edl': 'Entry, descent & landing',
  'phase.surface': 'On the surface',
  'phase.lost': 'Lost to space',
  'phase.breakup': 'Break-up',
  'phase.impact': 'Impact',
  'phase.firstSteps': 'First steps',
  'phase.flyby': 'Mars flyby',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'Launch',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'failed',
  'st.launch.n': (p: { mass: number; t: number }) => `${f(p.mass)} t in orbit at T+${f(p.t)} s`,
  'st.prop': 'Propellant at departure',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${p.n} tankers over ${f(p.days)} days, ${f(p.boil, 1)} t boiled off`,
  'st.dv': 'Δv for Mars',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `available / needed (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} days)`,
  'st.life': 'Life support',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `${f(p.day)} of ${f(p.days)} days`,
  'st.life.lost.n': 'crew lost in transit',
  'st.life.ok': 'sufficient',
  'st.life.cap.n': (p: { days: number }) => `${p.days}-day capability`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${f(p.t, 1)} t consumables for ${p.crew}`,
  'st.rad': 'Radiation (outbound)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'NASA career limit 600 mSv; return doubles it',
  'st.entry': 'Entry',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${p.fpa}°, ${f(p.mass)} t`,
  'st.wx': 'Weather at Mars',
  'st.wx.global': 'Global dust storm',
  'st.wx.regional': 'Regional dust storm',
  'st.wx.clear': 'Clear',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season}; winds ${f(p.wind)} m/s`,
  'st.heat': 'Peak heating',
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `limit ${f(p.lim)} (${p.tps}); load ${f(p.load)} J/cm²`,
  'st.g': 'Peak deceleration',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `crew limit ${p.lim} g`,
  'st.landing': 'Landing burn',
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t propellant`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} never made orbit`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}. ${p.crew === 'abort' ? 'The capsule has a launch abort system — the crew gets out.' : p.crew === 'noAbort' ? 'Starship has no launch abort system.' : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} is stuck in Earth orbit`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}. ${p.detail}`,
  'v.stuck.none': 'The transfer could not be computed.',
  'v.flyby': (p: { ship: string }) => `${p.ship} reaches Mars — and flies past it`,
  'v.flyby.s': (p: { crewed: boolean }) => `No entry or capture system aboard. ${p.crewed ? '' : 'Uncrewed.'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} burns up in the Martian atmosphere`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `Peak heating ${f(p.q)} W/cm² — past the ${f(p.lim)} W/cm² the ${p.tps} are rated for${p.alt != null && p.v != null ? ` (first exceeded at ${f(p.alt)} km, ${f(p.v)} m/s)` : ''}.`,
  'v.tipped': (p: { ship: string }) => `${p.ship} lands on Mars — and tips over`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail.charAt(0).toUpperCase()}${p.detail.slice(1)}. The crew likely survives the fall; the ship, the habitat and any return do not.`,
  'v.skipped': (p: { ship: string }) => `${p.ship} skips off the atmosphere`,
  'v.crashed': (p: { ship: string }) => `${p.ship} crashes on Mars`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `The landing engines ran dry ${f(p.alt, 2)} km up at ${f(p.v)} m/s; ${p.what} hit the ground at ${f(p.impact)} m/s.`,
  'v.what.capsule': 'the capsule',
  'v.what.ship': 'the ship',
  'v.landed': (p: { ship: string }) => `${p.ship} lands on Mars with its crew alive`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} lands on Mars — ${p.crewed ? 'the crew did not survive the trip' : 'uncrewed'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `Touchdown at ${f(p.v, 1)} m/s after a ${f(p.dv)} m/s landing burn using ${f(p.prop, 1)} t.`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} First failure: ${p.label} — ${p.detail}`,
}
