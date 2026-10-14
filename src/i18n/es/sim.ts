/** What the simulation says — es (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

// n: the few numbers English interpolates raw but that can carry decimals (τ, the entry angle, the g limit)
const { f, n } = numbers('es-ES')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'Despegue',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle} desde ${p.site}; ${f(p.mass)} t en el despegue`,
  'asc.impact': 'Impacto',
  'asc.impact.d': 'El vehículo chocó contra el suelo antes de alcanzar la órbita',
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'Separación de la cofia',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage}: separación`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage}: apagado y separación`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage}: ignición`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': 'Propelente agotado antes de la órbita',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `Propelente agotado: periapsis ${f(p.rp)} km, apoapsis ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO: en órbita',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s; quedan ${f(p.prop, 1)} t de propelente`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'Encendido de circularización',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `Δv de ${f(p.dv)} m/s en el apoapsis, órbita circular de ${f(p.alt)} km; quedan ${f(p.prop, 1)} t de propelente`,
  'asc.circFail': 'Circularización imposible',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `No hay propelente suficiente para circularizar (hacen falta ${f(p.dv)} m/s, ${f(p.need, 1)} t; quedan ${f(p.left, 1)} t)`,
  'asc.reason.impact': 'Impactó contra la superficie',
  'asc.reason.timeout': 'Se agotó el tiempo de simulación',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': 'Órbita de aparcamiento',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `${f(p.mass, 1)} t en órbita; ${p.stage}: quedan ${f(p.prop, 1)} t de propelente`,
  'leo.ship': 'Nave en órbita de aparcamiento',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `llega con ${f(p.res, 1)} t de propelente residual; la misión necesita ${f(p.target)} t a bordo para la salida (${f(p.more)} t más)`,
  'leo.tanker': (p: { n: number }) => `Cisterna ${p.n} acoplada`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → ${f(p.aboard)} t a bordo (${f(p.pct)} % de lo que necesita la misión)`,
  'leo.done': 'Campaña de recarga completada',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${f(p.aboard)} t a bordo (${f(p.pct)} % de las ${f(p.target)} t necesarias) tras ${p.n} ${p.n === 1 ? 'cisterna' : 'cisternas'} en ${f(p.days)} días; ${f(p.lost, 1)} t perdidas por evaporación`,
  'leo.short': 'Propelente insuficiente',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `Con ${p.n} ${p.n === 1 ? 'cisterna' : 'cisternas'} de ${f(p.each)} t no se alcanzan las ${f(p.target)} t que necesita la misión`,
  'leo.missed': 'Ventana de lanzamiento perdida',
  'leo.missed.d': (p: { days: number; limit: number }) => `La campaña de ${f(p.days)} días supera el límite de ${p.limit} días en torno a la oportunidad; la siguiente ventana llega dentro de 26 meses`,
  'leo.long': 'Campaña más larga que la ventana',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} días frente a un periodo de salida de ~${p.limit} días; el C3 de salida será peor que el mínimo`,
  'leo.boiloff': 'Pérdida por evaporación',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `El ${f(p.pct)} % del propelente entregado se evaporó a razón de ${f(p.rate, 2)} %/día`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': 'Encendido de inyección transmarciana',
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv de ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + correcciones de trayectoria), ${f(p.used)} t de propelente, encendido de ${f(p.burn)} s; quedan ${f(p.left)} t para el aterrizaje`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage}: Δv de ${f(p.need, 2)} km/s (disponía de ${f(p.had, 2)})`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage} aporta ${f(p.dv1, 2)} km/s y ${p.sc} añade ${f(p.rest, 2)} km/s con sus propios tanques (${f(p.used, 1)} t); quedan ${f(p.left, 1)} t`,
  'tmi.missed': 'Ventana de salida perdida',
  'tmi.missed.d': 'La campaña de recarga no terminó a tiempo; la nave se queda en órbita terrestre.',
  'tmi.short': 'Δv insuficiente para la inyección transmarciana',
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `${f(p.avail, 2)} km/s disponibles frente a ${f(p.need, 2)} km/s necesarios (C3 ${f(p.c3, 1)} km²/s² desde ${p.orbit} km). ${p.refuel ? `${f(p.prop ?? 0)} t de propelente a bordo, ${f(p.mass ?? 0)} t en total.` : 'Suma del propelente de la etapa superior y de la nave.'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': 'Inyección transmarciana completada',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², transferencia de ${f(p.days)} días, v∞ de llegada ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': 'Salida de la esfera de influencia terrestre',
  'cr.earthSoi.d': 'a ~0,92 millones de km',
  'cr.lifeOut': 'Soporte vital agotado',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} ofrece ${p.cap} días de vuelo libre; la transferencia dura ${f(p.days)} días: se pierde la tripulación a ${f(p.short)} días de Marte`,
  'cr.life': 'Soporte vital',
  'cr.life.d': (p: { cap: number; days: number }) => `una autonomía de ${p.cap} días cubre la transferencia de ${f(p.days)} días`,
  'cr.consOut': 'Consumibles agotados',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t alcanzan para ${f(p.days)} días con ${p.crew} ${p.crew === 1 ? 'tripulante' : 'tripulantes'} a ${f(p.rate, 1)} kg/persona/día`,
  'cr.half': 'A medio camino',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `margen de consumibles: ${f(p.margin)} días (${f(p.t, 1)} t a bordo, ${f(p.rate, 1)} kg/persona/día con un ${f(p.water)} % de recuperación de agua y un ${f(p.o2)} % de O₂)`,
  'cr.half.uncrewed': 'sin tripulación: no hay consumibles que controlar',
  'cr.rad': 'Radiación',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `${f(p.dose)} mSv acumulados hasta ahora en el viaje de ida (tasa de MSL RAD: 1,8 mSv/día${p.shield ? ', con un 15 % de reducción por blindaje' : ', sin blindaje específico'}); límite de carrera de la NASA: 600 mSv, y el viaje de vuelta duplica la dosis`,
  'cr.marsSoi': 'Entrada en la esfera de influencia de Marte',
  'cr.marsSoi.d': (p: { v: number }) => `a ~0,58 millones de km de Marte, acercándose a ${f(p.v, 2)} km/s`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': 'Meteorología en Marte',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season}; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `hay en curso una tormenta de polvo que envuelve todo el planeta (τ ≈ ${n(p.tau)}): densidad de entrada ~${f(p.density)} % mayor en altura, no se ve nada bajo el polvo, vientos en superficie de ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `tormenta de polvo regional (τ ≈ ${n(p.tau)}): densidad de entrada ~${f(p.density)} % mayor en altura, mala visibilidad, vientos de ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `cielo despejado (τ ≈ ${n(p.tau)}), vientos de ~${f(p.wind)} m/s`,
  'season.nSpring': 'primavera boreal',
  'season.nSummer': 'verano boreal',
  'season.sSpring': 'primavera austral (temporada de tormentas de polvo)',
  'season.sSummer': 'verano austral (temporada de tormentas de polvo)',
  'season.nSpring.short': 'primavera boreal',
  'season.nSummer.short': 'verano boreal',
  'season.sSpring.short': 'primavera austral',
  'season.sSummer.short': 'verano austral',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': 'Interfaz de entrada',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'Contacto con el suelo',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s; ${f(p.mass, 1)} t en la superficie, quedan ${f(p.prop, 1)} t de propelente`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `descenso vertical desde ${f(p.h)} m; ${f(p.mass, 1)} t en la superficie, quedan ${f(p.prop, 1)} t de propelente`,
  'en.impact': 'Impacto',
  'en.impact.d': (p: { v: number; landing: boolean }) => `${f(p.v)} m/s contra la superficie${p.landing ? ' (el encendido de aterrizaje no pudo frenarlo)' : ': sin propulsión de aterrizaje'}`,
  'en.skip': 'Rebote en la atmósfera',
  'en.skip.d': (p: { v: number }) => `El vehículo salió de la atmósfera a ${f(p.v)} m/s: entrada demasiado rasante`,
  'en.pullout': 'Recuperación',
  'en.pullout.d': (p: { alt: number; v: number }) => `descenso frenado a ${f(p.alt)} km, ${f(p.v)} m/s; se orienta la sustentación hacia abajo para no salir de la atmósfera`,
  'en.tps': 'Límite del escudo térmico superado',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² (${p.tps}) a ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.burn': 'Inicio del encendido de aterrizaje',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, velocidad de descenso ${f(p.sink)} m/s; necesita ${f(p.need, 1)} g${p.mars ? ' (de Marte)' : ''} de ${f(p.avail, 1)} disponibles; ${p.landing}`,
  'en.tipped': 'Vuelco',
  'en.tipped.d': (p: { pct: number }) => `una pata se apoyó en una roca que el sistema de aterrizaje no pudo ver: el vehículo ha quedado de lado (riesgo de obstáculo: ${f(p.pct)} %)`,
  'en.propOut': 'Propelente agotado',
  'en.propOut.d': (p: { h: number; v: number }) => `a ${f(p.h)} m sobre la superficie; cayó a ${f(p.v)} m/s`,
  'en.propOutBurn': 'Propelente agotado durante el encendido',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s; a partir de ahí, caída sin propulsión`,
  'en.g': 'Límite de g de la tripulación superado',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `${f(p.g, 1)} g de forma sostenida > límite de ${f(p.lim, 1)} g para una tripulación desacondicionada, a ${f(p.alt)} km`,
  'en.peakHeat': 'Calentamiento máximo',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.q)} W/cm² a ${f(p.alt)} km (límite ${f(p.lim)}, ${p.tps}); carga térmica acumulada: ${f(p.load)} J/cm²`,
  'en.peakG': 'Deceleración máxima',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.g, 1)} g a ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s; por debajo de este punto, un paracaídas serviría para ~1 t, no para ${f(p.mass)} t`,
  'en.reason.tps': 'El escudo térmico superó su límite',
  'en.reason.skip': 'Rebotó en la atmósfera',
  'en.reason.tipped': 'Volcó al aterrizar',
  'en.reason.crashed': 'Se estrelló',
  'en.reason.slow': 'No llegó a la superficie a tiempo',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': 'Se abre la escotilla',
  'surf.hatch.d': 'la presión de la cabina se iguala con los 0,6 kPa del exterior; se despliega el ascensor de la tripulación',
  'surf.boots': 'Primeras pisadas en Marte',
  'surf.boots.d': (p: { n: number }) => `${p.n === 1 ? '1 tripulante baja' : `${p.n} tripulantes bajan`} en el ascensor; el suelo aguanta`,
  'surf.flag': 'La bandera',
  'surf.flag.d': 'clavada a 25 m de la nave, al abrigo de las patas de aterrizaje',
  'surf.habitat': 'Hábitat inflado',
  'surf.habitat.d': 'primer módulo inflable desplegado, con la esclusa acoplada',
  'surf.power': 'Energía conectada',
  'surf.power.d': 'tres mantas solares desenrollables, ~40 kW a mediodía con el cielo despejado',
  'flyby': 'Sobrevuelo de Marte',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} no tiene sistema de entrada: pasa junto a Marte a ${f(p.v, 2)} km/s y se queda en órbita solar`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'Lanzamiento',
  'phase.refuel': 'Recarga en órbita',
  'phase.parking': 'Órbita de aparcamiento',
  'phase.tmi': 'Encendido TMI',
  'phase.cruise': 'Crucero hacia Marte',
  'phase.edl': 'Entrada, descenso y aterrizaje',
  'phase.surface': 'En la superficie',
  'phase.lost': 'Pérdida en el espacio',
  'phase.breakup': 'Desintegración',
  'phase.impact': 'Impacto',
  'phase.firstSteps': 'Primeros pasos',
  'phase.flyby': 'Sobrevuelo de Marte',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'Lanzamiento',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'fallido',
  'st.launch.n': (p: { mass: number; t: number }) => `${f(p.mass)} t en órbita en T+${f(p.t)} s`,
  'st.prop': 'Propelente a la salida',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${p.n} ${p.n === 1 ? 'cisterna' : 'cisternas'} en ${f(p.days)} días; ${f(p.boil, 1)} t evaporadas`,
  'st.dv': 'Δv hacia Marte',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `disponible / necesario (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} días)`,
  'st.life': 'Soporte vital',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `${f(p.day)} de ${f(p.days)} días`,
  'st.life.lost.n': 'tripulación perdida en el tránsito',
  'st.life.ok': 'suficiente',
  'st.life.cap.n': (p: { days: number }) => `autonomía de ${p.days} días`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${f(p.t, 1)} t de consumibles para ${p.crew} ${p.crew === 1 ? 'persona' : 'personas'}`,
  'st.rad': 'Radiación (ida)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'límite de carrera (NASA): 600 mSv; la vuelta la duplica',
  'st.entry': 'Entrada',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${n(p.fpa)}°, ${f(p.mass)} t`,
  'st.wx': 'Meteorología en Marte',
  'st.wx.global': 'Tormenta global',
  'st.wx.regional': 'Tormenta regional',
  'st.wx.clear': 'Despejado',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season}; vientos de ${f(p.wind)} m/s`,
  'st.heat': 'Calentamiento máximo',
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `límite ${f(p.lim)} (${p.tps}); carga ${f(p.load)} J/cm²`,
  'st.g': 'Deceleración máxima',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `límite para la tripulación: ${n(p.lim)} g`,
  'st.landing': 'Encendido de aterrizaje',
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t de propelente`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} no alcanza la órbita`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}. ${p.crew === 'abort' ? 'La cápsula tiene sistema de escape de lanzamiento: la tripulación se salva.' : p.crew === 'noAbort' ? 'Starship no tiene sistema de escape de lanzamiento.' : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} no logra salir de la órbita terrestre`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}. ${p.detail}`,
  'v.stuck.none': 'No se pudo calcular la transferencia.',
  'v.flyby': (p: { ship: string }) => `${p.ship} llega a Marte, pero pasa de largo`,
  'v.flyby.s': (p: { crewed: boolean }) => `No lleva sistema de entrada ni de captura. ${p.crewed ? '' : 'Sin tripulación.'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} se desintegra en la atmósfera marciana`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `Calentamiento máximo de ${f(p.q)} W/cm², por encima de los ${f(p.lim)} W/cm² que admite su escudo térmico (${p.tps})${p.alt != null && p.v != null ? `; el límite se superó por primera vez a ${f(p.alt)} km y ${f(p.v)} m/s` : ''}.`,
  'v.tipped': (p: { ship: string }) => `${p.ship} aterriza en Marte, pero vuelca`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail.charAt(0).toUpperCase()}${p.detail.slice(1)}. Es probable que la tripulación sobreviva a la caída; la nave, el hábitat y cualquier posibilidad de regreso, no.`,
  'v.skipped': (p: { ship: string }) => `${p.ship} rebota en la atmósfera`,
  'v.crashed': (p: { ship: string }) => `${p.ship} se estrella en Marte`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `Los motores de aterrizaje se quedaron sin propelente a ${f(p.alt, 2)} km de altura y ${f(p.v)} m/s; ${p.what} chocó contra el suelo a ${f(p.impact)} m/s.`,
  'v.what.capsule': 'la cápsula',
  'v.what.ship': 'la nave',
  'v.landed': (p: { ship: string }) => `${p.ship} aterriza en Marte con la tripulación viva`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} aterriza en Marte, ${p.crewed ? 'pero la tripulación no sobrevivió al viaje' : 'sin tripulación'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `Contacto con el suelo a ${f(p.v, 1)} m/s tras un encendido de aterrizaje de ${f(p.dv)} m/s que consumió ${f(p.prop, 1)} t.`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} Primer fallo: ${p.label} — ${p.detail}`,
}
