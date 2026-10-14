/** What the simulation says — fr (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('fr-FR')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'Décollage',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle} depuis ${p.site}, ${f(p.mass)} t au décollage`,
  'asc.impact': 'Impact',
  'asc.impact.d': "Le véhicule a percuté le sol avant d'atteindre l'orbite",
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'Largage de la coiffe',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage} : séparation`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage} : extinction et séparation`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage} : allumage`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': "Ergols épuisés avant l'orbite",
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `Ergols épuisés : périgée ${f(p.rp)} km, apogée ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO — orbite',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s ; il reste ${f(p.prop, 1)} t d'ergols`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'Allumage de circularisation',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `Δv ${f(p.dv)} m/s à l'apogée, orbite circulaire à ${f(p.alt)} km ; il reste ${f(p.prop, 1)} t d'ergols`,
  'asc.circFail': "Impossible de circulariser l'orbite",
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `Pas assez d'ergols pour circulariser (${f(p.dv)} m/s nécessaires, soit ${f(p.need, 1)} t ; il reste ${f(p.left, 1)} t)`,
  'asc.reason.impact': 'Impact avec le sol',
  'asc.reason.timeout': 'Temps imparti écoulé',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': "Orbite d'attente",
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `${f(p.mass, 1)} t en orbite ; il reste ${f(p.prop, 1)} t d'ergols (${p.stage})`,
  'leo.ship': "Vaisseau en orbite d'attente",
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `arrivé avec ${f(p.res, 1)} t d'ergols résiduels ; la mission exige ${f(p.target)} t à bord au départ (${f(p.more)} t de plus)`,
  'leo.tanker': (p: { n: number }) => `Amarrage du ravitailleur ${p.n}`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → ${f(p.aboard)} t à bord (${f(p.pct)} % des besoins de la mission)`,
  'leo.done': 'Campagne de ravitaillement terminée',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${f(p.aboard)} t à bord (${f(p.pct)} % des ${f(p.target)} t nécessaires) après ${p.n} ravitailleur${p.n > 1 ? 's' : ''} en ${f(p.days)} jours ; l'évaporation a coûté ${f(p.lost, 1)} t`,
  'leo.short': 'Ergols insuffisants',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `Avec ${p.n} ravitailleur${p.n > 1 ? 's' : ''} livrant ${f(p.each)} t chacun, impossible d'atteindre les ${f(p.target)} t nécessaires à la mission`,
  'leo.missed': 'Fenêtre de tir manquée',
  'leo.missed.d': (p: { days: number; limit: number }) => `Campagne de ${f(p.days)} jours, plus longue que la limite de ${p.limit} jours autour de l'opportunité — la prochaine fenêtre est dans 26 mois`,
  'leo.long': 'Campagne plus longue que la fenêtre',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} jours contre une période de départ de ~${p.limit} jours ; le C3 au départ sera moins bon que le minimum`,
  'leo.boiloff': 'Évaporation',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `${f(p.pct)} % des ergols livrés se sont évaporés au rythme de ${f(p.rate, 2)} %/jour`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': "Allumage d'injection vers Mars",
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + corrections à mi-parcours), ${f(p.used)} t d'ergols, ${f(p.burn)} s de poussée ; il reste ${f(p.left)} t pour l'atterrissage`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage} : Δv de ${f(p.need, 2)} km/s (sur ${f(p.had, 2)} km/s disponibles)`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage} : ${f(p.dv1, 2)} km/s ; ${p.sc} : +${f(p.rest, 2)} km/s grâce à ses propres ergols (${f(p.used, 1)} t) ; il reste ${f(p.left, 1)} t`,
  'tmi.missed': 'Fenêtre de départ manquée',
  'tmi.missed.d': "La campagne de ravitaillement n'a pas abouti à temps ; le vaisseau reste en orbite terrestre.",
  'tmi.short': "Δv insuffisant pour l'injection vers Mars",
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `${f(p.avail, 2)} km/s disponibles contre ${f(p.need, 2)} km/s nécessaires (C3 ${f(p.c3, 1)} km²/s² depuis ${p.orbit} km). ${p.refuel ? `${f(p.prop ?? 0)} t d'ergols à bord, ${f(p.mass ?? 0)} t au total.` : "Ergols de l'étage supérieur et du véhicule spatial réunis."}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': 'Injection vers Mars terminée',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², transfert de ${f(p.days)} jours, v∞ à l'arrivée ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': "Sortie de la sphère d'influence terrestre",
  'cr.earthSoi.d': 'à ~0,92 million de km',
  'cr.lifeOut': 'Support de vie épuisé',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} : support de vie pour ${p.cap} jours de vol libre ; le transfert en dure ${f(p.days)} — équipage perdu à ${f(p.short)} jour${Math.round(p.short) > 1 ? 's' : ''} de Mars`,
  'cr.life': 'Support de vie',
  'cr.life.d': (p: { cap: number; days: number }) => `une autonomie de ${p.cap} jours couvre le transfert de ${f(p.days)} jours`,
  'cr.consOut': 'Consommables épuisés',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t : de quoi tenir ${f(p.days)} jours pour un équipage de ${p.crew}, à ${f(p.rate, 1)} kg/personne/jour`,
  'cr.half': 'Mi-parcours',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `marge de consommables : ${f(p.margin)} jours (${f(p.t, 1)} t à bord, ${f(p.rate, 1)} kg/personne/jour avec ${f(p.water)} % de recyclage de l'eau et ${f(p.o2)} % de l'O₂)`,
  'cr.half.uncrewed': 'sans équipage — aucun consommable à suivre',
  'cr.rad': 'Radiations',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `${f(p.dose)} mSv cumulés jusqu'ici à l'aller (débit MSL RAD de 1,8 mSv/jour${p.shield ? ", 15 % d'atténuation par le blindage" : ', sans blindage dédié'}) ; limite de carrière NASA : 600 mSv — le trajet retour double la dose`,
  'cr.marsSoi': "Entrée dans la sphère d'influence de Mars",
  'cr.marsSoi.d': (p: { v: number }) => `à ~0,58 million de km de Mars, en approche à ${f(p.v, 2)} km/s`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': 'Météo sur Mars',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season} ; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `une tempête de poussière planétaire est en cours (τ ≈ ${f(p.tau, 1)}) : densité d'entrée en hausse de ~${f(p.density)} % en altitude, rien de visible sous la poussière, vents au sol ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `une tempête de poussière régionale (τ ≈ ${f(p.tau, 1)}) : densité d'entrée en hausse de ~${f(p.density)} % en altitude, visibilité médiocre, vents ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `ciel dégagé (τ ≈ ${f(p.tau, 1)}), vents ~${f(p.wind)} m/s`,
  'season.nSpring': 'printemps boréal',
  'season.nSummer': 'été boréal',
  'season.sSpring': 'printemps austral — saison des tempêtes de poussière',
  'season.sSummer': 'été austral — saison des tempêtes de poussière',
  'season.nSpring.short': 'printemps boréal',
  'season.nSummer.short': 'été boréal',
  'season.sSpring.short': 'printemps austral',
  'season.sSummer.short': 'été austral',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': "Interface d'entrée",
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'Contact avec le sol',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s, masse posée ${f(p.mass, 1)} t, il reste ${f(p.prop, 1)} t d'ergols`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `descente verticale depuis ${f(p.h)} m ; masse posée ${f(p.mass, 1)} t, il reste ${f(p.prop, 1)} t d'ergols`,
  'en.impact': 'Impact',
  'en.impact.d': (p: { v: number; landing: boolean }) => `${f(p.v)} m/s au sol${p.landing ? " (la poussée d'atterrissage n'a pas pu l'arrêter)" : " — pas de propulsion d'atterrissage"}`,
  'en.skip': "Rebond hors de l'atmosphère",
  'en.skip.d': (p: { v: number }) => `Le véhicule est ressorti de l'atmosphère à ${f(p.v)} m/s — entrée trop rasante`,
  'en.pullout': 'Redressement',
  'en.pullout.d': (p: { alt: number; v: number }) => `vitesse de descente stabilisée à ${f(p.alt)} km, ${f(p.v)} m/s — portance orientée vers le bas pour rester dans l'atmosphère`,
  'en.tps': 'Limite du bouclier thermique dépassée',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² à ${f(p.alt)} km, ${f(p.v)} m/s — ${p.tps}`,
  'en.burn': "Allumage d'atterrissage",
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, vitesse de chute ${f(p.sink)} m/s ; il faut ${f(p.need, 1)} g${p.mars ? ' (Mars)' : ''} sur ${f(p.avail, 1)} disponibles ; ${p.landing}`,
  'en.tipped': 'Renversement',
  'en.tipped.d': (p: { pct: number }) => `un pied d'atterrissage s'est posé sur un rocher que le système d'atterrissage n'a pas vu — le vaisseau est couché sur le flanc (risque d'obstacle ${f(p.pct)} %)`,
  'en.propOut': 'Ergols épuisés',
  'en.propOut.d': (p: { h: number; v: number }) => `à ${f(p.h)} m du sol — chute à ${f(p.v)} m/s`,
  'en.propOutBurn': 'Ergols épuisés en pleine poussée',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s — désormais en chute libre`,
  'en.g': "Limite de g de l'équipage dépassée",
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `${f(p.g, 1)} g soutenus > limite de ${f(p.lim, 1)} g pour un équipage déconditionné, à ${f(p.alt)} km`,
  'en.peakHeat': "Pic d'échauffement",
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.q)} W/cm² à ${f(p.alt)} km (limite ${f(p.lim)}) ; charge thermique cumulée ${f(p.load)} J/cm² ; ${p.tps}`,
  'en.peakG': 'Pic de décélération',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.g, 1)} g à ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s — en dessous, un parachute serait utilisable pour ~1 t, pas pour ${f(p.mass)} t`,
  'en.reason.tps': 'Bouclier thermique au-delà de sa limite',
  'en.reason.skip': "Rebond hors de l'atmosphère",
  'en.reason.tipped': "Renversé à l'atterrissage",
  'en.reason.crashed': 'Écrasé',
  'en.reason.slow': "N'a pas atteint la surface à temps",

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': "Ouverture de l'écoutille",
  'surf.hatch.d': "pression de la cabine égalisée avec les 0,6 kPa extérieurs ; l'ascenseur de l'équipage se déploie",
  'surf.boots': 'Premiers pas sur Mars',
  'surf.boots.d': (p: { n: number }) => `${p.n} membre${p.n > 1 ? 's' : ''} d'équipage descendu${p.n > 1 ? 's' : ''} par l'ascenseur ; le sol tient bon`,
  'surf.flag': 'Le drapeau',
  'surf.flag.d': "planté à 25 m du vaisseau, à l'abri des pieds d'atterrissage",
  'surf.habitat': 'Habitat gonflé',
  'surf.habitat.d': 'premier module gonflable déployé, sas raccordé',
  'surf.power': 'Mise sous tension',
  'surf.power.d': 'trois panneaux solaires souples déroulés, ~40 kW à midi par temps clair',
  'flyby': 'Survol de Mars',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} : aucun système d'entrée — passage à ${f(p.v, 2)} km/s au large de Mars, puis orbite autour du Soleil`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'Lancement',
  'phase.refuel': 'Ravitaillement en orbite',
  'phase.parking': "Orbite d'attente",
  'phase.tmi': 'Allumage TMI',
  'phase.cruise': 'Croisière vers Mars',
  'phase.edl': 'Entrée, descente et atterrissage',
  'phase.surface': 'En surface',
  'phase.lost': "Perdu dans l'espace",
  'phase.breakup': 'Désintégration',
  'phase.impact': 'Impact',
  'phase.firstSteps': 'Premiers pas',
  'phase.flyby': 'Survol de Mars',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'Lancement',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'échec',
  'st.launch.n': (p: { mass: number; t: number }) => `${f(p.mass)} t en orbite à T+${f(p.t)} s`,
  'st.prop': 'Ergols au départ',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${p.n} ravitailleur${p.n > 1 ? 's' : ''} en ${f(p.days)} jours, évaporation : ${f(p.boil, 1)} t`,
  'st.dv': 'Δv pour Mars',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `disponible / nécessaire (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} jours)`,
  'st.life': 'Support de vie',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `jour ${f(p.day)} sur ${f(p.days)}`,
  'st.life.lost.n': 'équipage perdu en route',
  'st.life.ok': 'suffisant',
  'st.life.cap.n': (p: { days: number }) => `autonomie de ${p.days} jours`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${f(p.t, 1)} t de consommables pour un équipage de ${p.crew}`,
  'st.rad': 'Radiations (aller)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'limite de carrière NASA : 600 mSv ; le retour double la dose',
  'st.entry': 'Entrée',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${Number.isInteger(p.fpa) ? f(p.fpa) : f(p.fpa, 1)}°, ${f(p.mass)} t`,
  'st.wx': 'Météo sur Mars',
  'st.wx.global': 'Tempête globale',
  'st.wx.regional': 'Tempête régionale',
  'st.wx.clear': 'Ciel dégagé',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season} ; vents ${f(p.wind)} m/s`,
  'st.heat': "Pic d'échauffement",
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `limite ${f(p.lim)} ; charge ${f(p.load)} J/cm² ; ${p.tps}`,
  'st.g': 'Pic de décélération',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `limite pour l'équipage : ${Number.isInteger(p.lim) ? f(p.lim) : f(p.lim, 1)} g`,
  'st.landing': "Poussée d'atterrissage",
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t d'ergols`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} n'atteint pas l'orbite`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}. ${p.crew === 'abort' ? "La capsule dispose d'un système de sauvetage — l'équipage s'en sort." : p.crew === 'noAbort' ? "Starship n'a pas de système de sauvetage au lancement." : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} ne quitte pas l'orbite terrestre`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}. ${p.detail}`,
  'v.stuck.none': "Le transfert n'a pas pu être calculé.",
  'v.flyby': (p: { ship: string }) => `${p.ship} atteint Mars — et passe à côté`,
  'v.flyby.s': (p: { crewed: boolean }) => `Aucun système d'entrée ni de capture à bord. ${p.crewed ? '' : 'Sans équipage.'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} se désintègre dans l'atmosphère martienne`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `Pic d'échauffement ${f(p.q)} W/cm² — au-delà des ${f(p.lim)} W/cm² admissibles pour le bouclier thermique (${p.tps}${p.alt != null && p.v != null ? ` ; limite franchie à ${f(p.alt)} km, ${f(p.v)} m/s` : ''}).`,
  'v.tipped': (p: { ship: string }) => `${p.ship} se pose sur Mars — et bascule`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail.charAt(0).toUpperCase()}${p.detail.slice(1)}. L'équipage survit probablement à la chute ; le vaisseau, l'habitat et tout espoir de retour, non.`,
  'v.skipped': (p: { ship: string }) => `${p.ship} rebondit sur l'atmosphère`,
  'v.crashed': (p: { ship: string }) => `${p.ship} s'écrase sur Mars`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `Les moteurs d'atterrissage sont tombés à sec à ${f(p.alt, 2)} km d'altitude, à ${f(p.v)} m/s ; ${p.what} a percuté le sol à ${f(p.impact)} m/s.`,
  'v.what.capsule': 'la capsule',
  'v.what.ship': 'le vaisseau',
  'v.landed': (p: { ship: string }) => `${p.ship} se pose sur Mars avec son équipage en vie`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} se pose sur Mars — ${p.crewed ? "l'équipage n'a pas survécu au voyage" : 'sans équipage'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `Contact avec le sol à ${f(p.v, 1)} m/s après une poussée d'atterrissage de ${f(p.dv)} m/s, qui a consommé ${f(p.prop, 1)} t.`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} Première défaillance : ${p.label} — ${p.detail}`,
}
