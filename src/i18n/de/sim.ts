/** What the simulation says — de (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('de-DE')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'Abheben',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle} startet von ${p.site}, ${f(p.mass)} t auf der Rampe`,
  'asc.impact': 'Aufschlag',
  'asc.impact.d': 'Fahrzeug vor Erreichen des Orbits am Boden aufgeschlagen',
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'Nutzlastverkleidung abgeworfen',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage}: Abtrennung`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage}: Brennschluss und Abtrennung`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage}: Zündung`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': 'Treibstoff vor Erreichen des Orbits aufgebraucht',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `Treibstoff erschöpft: Periapsis ${f(p.rp)} km, Apoapsis ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO — Orbit erreicht',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s; ${f(p.prop, 1)} t Treibstoff übrig`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'Zirkularisierung',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `Δv ${f(p.dv)} m/s in der Apoapsis, Kreisbahn in ${f(p.alt)} km Höhe; ${f(p.prop, 1)} t Treibstoff übrig`,
  'asc.circFail': 'Zirkularisierung unmöglich',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `Zu wenig Treibstoff für die Zirkularisierung (${f(p.dv)} m/s nötig, ${f(p.need, 1)} t; ${f(p.left, 1)} t übrig)`,
  'asc.reason.impact': 'Am Boden aufgeschlagen',
  'asc.reason.timeout': 'Zeitlimit überschritten',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': 'Parkorbit',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `${f(p.mass, 1)} t im Orbit; noch ${f(p.prop, 1)} t Treibstoff (${p.stage})`,
  'leo.ship': 'Raumschiff im Parkorbit',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `mit ${f(p.res, 1)} t Resttreibstoff angekommen; die Mission braucht beim Abflug ${f(p.target)} t an Bord (${f(p.more)} t mehr)`,
  'leo.tanker': (p: { n: number }) => `Tanker ${p.n} dockt an`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → ${f(p.aboard)} t an Bord (${f(p.pct)} % des Bedarfs der Mission)`,
  'leo.done': 'Betankung abgeschlossen',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${f(p.aboard)} t an Bord (${f(p.pct)} % der benötigten ${f(p.target)} t); ${p.n} Tanker in ${f(p.days)} Tagen, ${f(p.lost, 1)} t durch Boil-off verloren`,
  'leo.short': 'Zu wenig Treibstoff',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `Tanker: ${p.n} × ${f(p.each)} t — zu wenig für die ${f(p.target)} t, die die Mission braucht`,
  'leo.missed': 'Startfenster verpasst',
  'leo.missed.d': (p: { days: number; limit: number }) => `Die Kampagne dauert ${f(p.days)} Tage und damit länger als die Grenze von ${p.limit} Tagen rund um die Gelegenheit — das nächste Fenster kommt erst in 26 Monaten`,
  'leo.long': 'Kampagne länger als das Fenster',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} Tage gegenüber einer Abflugperiode von ~${p.limit} Tagen; das Abflug-C3 wird schlechter als das Minimum`,
  'leo.boiloff': 'Boil-off-Verluste',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `${f(p.pct)} % des gelieferten Treibstoffs bei ${f(p.rate, 2)} %/Tag verdampft`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': 'Mars-Transferzündung',
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + Kurskorrekturen), ${f(p.used)} t Treibstoff, ${f(p.burn)} s Brenndauer; ${f(p.left)} t übrig für die Landung`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage}: Δv ${f(p.need, 2)} km/s (verfügbar: ${f(p.had, 2)})`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage}: ${f(p.dv1, 2)} km/s, dann ${p.sc}: weitere ${f(p.rest, 2)} km/s aus eigenen Tanks (${f(p.used, 1)} t); ${f(p.left, 1)} t übrig`,
  'tmi.missed': 'Abflugfenster verpasst',
  'tmi.missed.d': 'Die Betankung wurde nicht rechtzeitig fertig; das Raumschiff bleibt im Erdorbit.',
  'tmi.short': 'Zu wenig Δv für die Mars-Transferzündung',
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `${f(p.avail, 2)} km/s verfügbar, ${f(p.need, 2)} km/s nötig (C3 ${f(p.c3, 1)} km²/s² aus ${p.orbit} km). ${p.refuel ? `${f(p.prop ?? 0)} t Treibstoff an Bord, ${f(p.mass ?? 0)} t gesamt.` : 'Treibstoff von Oberstufe und Raumschiff zusammengerechnet.'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': 'Mars-Transferzündung abgeschlossen',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², Transfer über ${f(p.days)} Tage, Ankunft v∞ ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': 'Verlassen der Einflusssphäre der Erde',
  'cr.earthSoi.d': '~0,92 Mio. km entfernt',
  'cr.lifeOut': 'Lebenserhaltung erschöpft',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} reicht für ${p.cap} Tage Freiflug; der Transfer dauert ${f(p.days)} Tage — Crew ${f(p.short)} Tage vor dem Mars verloren`,
  'cr.life': 'Lebenserhaltung',
  'cr.life.d': (p: { cap: number; days: number }) => `${p.cap} Tage Kapazität decken den Transfer von ${f(p.days)} Tagen`,
  'cr.consOut': 'Vorräte erschöpft',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t reichen ${f(p.days)} Tage für eine Crew von ${p.crew} bei ${f(p.rate, 1)} kg/Person/Tag`,
  'cr.half': 'Halbzeit',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `Vorratsreserve ${f(p.margin)} Tage (${f(p.t, 1)} t an Bord, ${f(p.rate, 1)} kg/Person/Tag bei ${f(p.water)} % Wasser- und ${f(p.o2)} % O₂-Rückgewinnung)`,
  'cr.half.uncrewed': 'unbemannt — keine Vorräte zu überwachen',
  'cr.rad': 'Strahlung',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `bisher ${f(p.dose)} mSv auf dem Hinflug angesammelt (Rate nach MSL RAD 1,8 mSv/Tag${p.shield ? ', 15 % Abzug für Abschirmung' : ', keine eigene Abschirmung'}); NASA-Karrieregrenzwert 600 mSv — der Rückflug verdoppelt die Dosis`,
  'cr.marsSoi': 'Ankunft in der Einflusssphäre des Mars',
  'cr.marsSoi.d': (p: { v: number }) => `~0,58 Mio. km vom Mars entfernt, Annäherung mit ${f(p.v, 2)} km/s`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': 'Wetter auf dem Mars',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season}; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `ein planetenweiter Staubsturm ist im Gange (τ ≈ ${f(p.tau, 1)}): Dichte beim Eintritt in der Höhe um ~${f(p.density)} % erhöht, unter dem Staub nichts zu sehen, Bodenwind ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `ein regionaler Staubsturm (τ ≈ ${f(p.tau, 1)}): Dichte beim Eintritt in der Höhe um ~${f(p.density)} % erhöht, schlechte Sicht, Wind ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `klarer Himmel (τ ≈ ${f(p.tau, 1)}), Wind ~${f(p.wind)} m/s`,
  'season.nSpring': 'Frühling auf der Nordhalbkugel',
  'season.nSummer': 'Sommer auf der Nordhalbkugel',
  'season.sSpring': 'Frühling auf der Südhalbkugel — Staubsturmsaison',
  'season.sSummer': 'Sommer auf der Südhalbkugel — Staubsturmsaison',
  'season.nSpring.short': 'Frühling im Norden',
  'season.nSummer.short': 'Sommer im Norden',
  'season.sSpring.short': 'Frühling im Süden',
  'season.sSummer.short': 'Sommer im Süden',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': 'Eintritt in die Atmosphäre',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'Aufsetzen',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s, ${f(p.mass, 1)} t gelandet, ${f(p.prop, 1)} t Treibstoff übrig`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `senkrechter Abstieg aus ${f(p.h)} m; ${f(p.mass, 1)} t gelandet, ${f(p.prop, 1)} t Treibstoff übrig`,
  'en.impact': 'Aufschlag',
  'en.impact.d': (p: { v: number; landing: boolean }) => `Aufprall mit ${f(p.v)} m/s${p.landing ? ' (die Landezündung konnte den Fall nicht stoppen)' : ' — kein Landetriebwerk'}`,
  'en.skip': 'Abgeprallt',
  'en.skip.d': (p: { v: number }) => `Das Fahrzeug verließ die Atmosphäre mit ${f(p.v)} m/s — Eintritt zu flach`,
  'en.pullout': 'Abfangen',
  'en.pullout.d': (p: { alt: number; v: number }) => `Sinkrate in ${f(p.alt)} km Höhe bei ${f(p.v)} m/s abgefangen — der Auftrieb wird durch Rollen nach unten gerichtet, um in der Atmosphäre zu bleiben`,
  'en.tps': 'Grenzwert des Hitzeschilds überschritten',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² (${p.tps}) in ${f(p.alt)} km Höhe, ${f(p.v)} m/s`,
  'en.burn': 'Landezündung',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, Sinkrate ${f(p.sink)} m/s; benötigt ${f(p.need, 1)} g${p.mars ? ' (Mars)' : ''} von ${f(p.avail, 1)} verfügbaren; ${p.landing}`,
  'en.tipped': 'Umgekippt',
  'en.tipped.d': (p: { pct: number }) => `ein Landebein setzte auf einem Felsen auf, den die Landung nicht sehen konnte — das Raumschiff liegt auf der Seite (Hindernisrisiko ${f(p.pct)} %)`,
  'en.propOut': 'Treibstoff erschöpft',
  'en.propOut.d': (p: { h: number; v: number }) => `${f(p.h)} m über der Oberfläche — Fall mit ${f(p.v)} m/s`,
  'en.propOutBurn': 'Treibstoff während der Zündung erschöpft',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s — jetzt im freien Fall`,
  'en.g': 'g-Grenze der Crew überschritten',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `dauerhaft ${f(p.g, 1)} g > Grenze von ${f(p.lim, 1)} g für eine geschwächte Crew, in ${f(p.alt)} km Höhe`,
  'en.peakHeat': 'Maximale Aufheizung',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.q)} W/cm² in ${f(p.alt)} km Höhe (Grenzwert ${f(p.lim)}, ${p.tps}); bisherige Wärmelast ${f(p.load)} J/cm²`,
  'en.peakG': 'Maximale Abbremsung',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.g, 1)} g in ${f(p.alt)} km Höhe, ${f(p.v)} m/s`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s — darunter wäre ein Fallschirm für ~1 t brauchbar, nicht für ${f(p.mass)} t`,
  'en.reason.tps': 'Hitzeschild über seinem Grenzwert',
  'en.reason.skip': 'Aus der Atmosphäre abgeprallt',
  'en.reason.tipped': 'Bei der Landung umgekippt',
  'en.reason.crashed': 'Abgestürzt',
  'en.reason.slow': 'Oberfläche nicht rechtzeitig erreicht',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': 'Luke öffnet sich',
  'surf.hatch.d': 'Kabinendruck an die 0,6 kPa draußen angeglichen; der Crew-Aufzug fährt aus',
  'surf.boots': 'Erster Fuß auf dem Mars',
  'surf.boots.d': (p: { n: number }) => `Abstieg über den Aufzug: ${p.n} aus der Crew; der Boden trägt`,
  'surf.flag': 'Die Flagge',
  'surf.flag.d': '25 m vom Raumschiff entfernt gesetzt, im Windschatten der Landebeine',
  'surf.habitat': 'Wohnmodul aufgeblasen',
  'surf.habitat.d': 'das erste aufblasbare Modul steht, die Luftschleuse ist angekoppelt',
  'surf.power': 'Strom an',
  'surf.power.d': 'drei ausrollbare Solarmatten, ~40 kW zur Mittagszeit bei klarer Luft',
  'flyby': 'Vorbeiflug am Mars',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} hat kein Eintrittssystem, fliegt mit ${f(p.v, 2)} km/s am Mars vorbei und bleibt in einer Umlaufbahn um die Sonne`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'Start',
  'phase.refuel': 'Betankung im Orbit',
  'phase.parking': 'Parkorbit',
  'phase.tmi': 'TMI-Zündung',
  'phase.cruise': 'Flug zum Mars',
  'phase.edl': 'Eintritt, Abstieg und Landung',
  'phase.surface': 'Auf der Oberfläche',
  'phase.lost': 'Im All verloren',
  'phase.breakup': 'Auseinanderbrechen',
  'phase.impact': 'Aufschlag',
  'phase.firstSteps': 'Erste Schritte',
  'phase.flyby': 'Vorbeiflug am Mars',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'Start',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'gescheitert',
  'st.launch.n': (p: { mass: number; t: number }) => `${f(p.mass)} t im Orbit bei T+${f(p.t)} s`,
  'st.prop': 'Treibstoff beim Abflug',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${p.n} Tanker in ${f(p.days)} Tagen, ${f(p.boil, 1)} t verdampft`,
  'st.dv': 'Δv zum Mars',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `verfügbar / benötigt (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} Tage)`,
  'st.life': 'Lebenserhaltung',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `${f(p.day)} von ${f(p.days)} Tagen`,
  'st.life.lost.n': 'Crew unterwegs verloren',
  'st.life.ok': 'ausreichend',
  'st.life.cap.n': (p: { days: number }) => `Kapazität ${p.days} Tage`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${f(p.t, 1)} t Vorräte für eine Crew von ${p.crew}`,
  'st.rad': 'Strahlung (Hinflug)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'NASA-Karrieregrenzwert 600 mSv; der Rückflug verdoppelt die Dosis',
  'st.entry': 'Eintritt',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${f(p.fpa, Number.isInteger(p.fpa) ? 0 : 1)}°, ${f(p.mass)} t`,
  'st.wx': 'Wetter auf dem Mars',
  'st.wx.global': 'Globaler Staubsturm',
  'st.wx.regional': 'Regionaler Staubsturm',
  'st.wx.clear': 'Klar',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season}; Wind ${f(p.wind)} m/s`,
  'st.heat': 'Maximale Aufheizung',
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `Grenzwert ${f(p.lim)} (${p.tps}); Wärmelast ${f(p.load)} J/cm²`,
  'st.g': 'Maximale Abbremsung',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `Grenze für die Crew: ${f(p.lim, Number.isInteger(p.lim) ? 0 : 1)} g`,
  'st.landing': 'Landezündung',
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t Treibstoff`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} schafft es nicht in den Orbit`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}. ${p.crew === 'abort' ? 'Die Kapsel hat ein Rettungssystem für den Start — die Crew kann sich retten.' : p.crew === 'noAbort' ? 'Starship hat kein Rettungssystem für den Start.' : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} sitzt im Erdorbit fest`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}. ${p.detail}`,
  'v.stuck.none': 'Der Transfer ließ sich nicht berechnen.',
  'v.flyby': (p: { ship: string }) => `${p.ship} erreicht den Mars — und fliegt vorbei`,
  'v.flyby.s': (p: { crewed: boolean }) => `Kein Eintritts- oder Einfangsystem an Bord. ${p.crewed ? '' : 'Unbemannt.'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} verglüht in der Marsatmosphäre`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `Maximale Aufheizung ${f(p.q)} W/cm² — über der Belastungsgrenze von ${f(p.lim)} W/cm² (${p.tps})${p.alt != null && p.v != null ? `, erstmals überschritten in ${f(p.alt)} km Höhe bei ${f(p.v)} m/s` : ''}.`,
  'v.tipped': (p: { ship: string }) => `${p.ship} landet auf dem Mars — und kippt um`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail.charAt(0).toUpperCase()}${p.detail.slice(1)}. Die Crew überlebt den Sturz wahrscheinlich; das Raumschiff, das Wohnmodul und jede Rückkehr nicht.`,
  'v.skipped': (p: { ship: string }) => `${p.ship} prallt an der Atmosphäre ab`,
  'v.crashed': (p: { ship: string }) => `${p.ship} zerschellt auf dem Mars`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `Die Landetriebwerke liefen in ${f(p.alt, 2)} km Höhe bei ${f(p.v)} m/s leer; ${p.what} schlug mit ${f(p.impact)} m/s auf.`,
  'v.what.capsule': 'die Kapsel',
  'v.what.ship': 'das Raumschiff',
  'v.landed': (p: { ship: string }) => `${p.ship} landet mit lebender Crew auf dem Mars`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} landet auf dem Mars — ${p.crewed ? 'die Crew hat den Flug nicht überlebt' : 'unbemannt'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `Aufsetzen mit ${f(p.v, 1)} m/s nach einer Landezündung von ${f(p.dv)} m/s, die ${f(p.prop, 1)} t verbrauchte.`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} Erster Ausfall: ${p.label} — ${p.detail}`,
}
