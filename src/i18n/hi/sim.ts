/** What the simulation says — hi (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('hi-IN')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'लिफ्टऑफ',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle}, ${p.site} से; पैड पर द्रव्यमान ${f(p.mass)} t`,
  'asc.impact': 'टक्कर',
  'asc.impact.d': 'कक्षा तक पहुंचने से पहले यान जमीन से टकरा गया',
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'फेयरिंग पृथक्करण',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage} का पृथक्करण`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage}: इंजन बंद, पृथक्करण`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage} का प्रज्वलन`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': 'कक्षा से पहले प्रणोदक खत्म',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `प्रणोदक खत्म: उपभू ${f(p.rp)} km, अपभू ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO — कक्षा में',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s; ${f(p.prop, 1)} t प्रणोदक शेष`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'वृत्तीकरण दहन',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `अपभू पर Δv ${f(p.dv)} m/s, ${f(p.alt)} km की वृत्ताकार कक्षा; ${f(p.prop, 1)} t प्रणोदक शेष`,
  'asc.circFail': 'वृत्तीकरण असंभव',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `कक्षा को वृत्ताकार बनाने के लिए पर्याप्त प्रणोदक नहीं (${f(p.dv)} m/s चाहिए, यानी ${f(p.need, 1)} t; शेष ${f(p.left, 1)} t)`,
  'asc.reason.impact': 'यान जमीन से टकरा गया',
  'asc.reason.timeout': 'समय सीमा समाप्त',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': 'पार्किंग कक्षा',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `कक्षा में ${f(p.mass, 1)} t; ${p.stage} में ${f(p.prop, 1)} t प्रणोदक शेष`,
  'leo.ship': 'यान पार्किंग कक्षा में',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `${f(p.res, 1)} t बचे प्रणोदक के साथ पहुंचा; प्रस्थान के समय मिशन को यान में ${f(p.target)} t चाहिए (${f(p.more)} t और)`,
  'leo.tanker': (p: { n: number }) => `टैंकर ${p.n} डॉक हुआ`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → यान में ${f(p.aboard)} t (मिशन की जरूरत का ${f(p.pct)} %)`,
  'leo.done': 'ईंधन भरने का अभियान पूरा',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${p.n} टैंकर, ${f(p.days)} दिन: यान में ${f(p.aboard)} t (जरूरी ${f(p.target)} t का ${f(p.pct)} %); वाष्पीकरण हानि ${f(p.lost, 1)} t`,
  'leo.short': 'प्रणोदक कम पड़ा',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `${p.n} टैंकर, हर एक में ${f(p.each)} t: मिशन के लिए जरूरी ${f(p.target)} t पूरे नहीं हो सके`,
  'leo.missed': 'प्रक्षेपण विंडो छूट गई',
  'leo.missed.d': (p: { days: number; limit: number }) => `${f(p.days)} दिन का अभियान अवसर के आसपास की ${p.limit} दिन की सीमा से लंबा है — अगली विंडो 26 महीने बाद है`,
  'leo.long': 'अभियान विंडो से लंबा',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} दिन, जबकि प्रस्थान अवधि ~${p.limit} दिन की है; प्रस्थान C3 न्यूनतम से खराब रहेगा`,
  'leo.boiloff': 'वाष्पीकरण हानि',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `पहुंचाए गए प्रणोदक का ${f(p.pct)} % वाष्पित होकर उड़ गया (${f(p.rate, 2)} %/दिन की दर से)`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': 'मंगल स्थानांतरण दहन (TMI)',
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + बीच रास्ते के सुधार), ${f(p.used)} t प्रणोदक, ${f(p.burn)} s का दहन; लैंडिंग के लिए ${f(p.left)} t शेष`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage}: Δv ${f(p.need, 2)} km/s का दहन (क्षमता ${f(p.had, 2)})`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage} से ${f(p.dv1, 2)} km/s; बाकी ${f(p.rest, 2)} km/s ${p.sc} के अपने टैंकों से (${f(p.used, 1)} t); ${f(p.left, 1)} t शेष`,
  'tmi.missed': 'प्रस्थान विंडो छूट गई',
  'tmi.missed.d': 'ईंधन भरने का अभियान समय पर पूरा नहीं हुआ; यान पृथ्वी की कक्षा में ही रह जाता है।',
  'tmi.short': 'मंगल स्थानांतरण दहन के लिए Δv पर्याप्त नहीं',
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `${f(p.avail, 2)} km/s उपलब्ध, जबकि ${f(p.need, 2)} km/s चाहिए (${p.orbit} km से C3 ${f(p.c3, 1)} km²/s²)। ${p.refuel ? `यान में ${f(p.prop ?? 0)} t प्रणोदक, कुल ${f(p.mass ?? 0)} t।` : 'ऊपरी चरण और अंतरिक्ष यान का प्रणोदक मिलाकर।'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': 'मंगल स्थानांतरण दहन पूरा',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} दिन का स्थानांतरण, आगमन v∞ ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': 'पृथ्वी के प्रभाव क्षेत्र से बाहर',
  'cr.earthSoi.d': '~0.92 मिलियन km दूर',
  'cr.lifeOut': 'जीवन रक्षा प्रणाली जवाब दे गई',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} में ${p.cap} दिन की स्वतंत्र उड़ान की जीवन रक्षा क्षमता है; स्थानांतरण में ${f(p.days)} दिन लगते हैं — मंगल से ${f(p.short)} दिन पहले चालक दल नहीं बचा`,
  'cr.life': 'जीवन रक्षा प्रणाली',
  'cr.life.d': (p: { cap: number; days: number }) => `${p.cap} दिन की क्षमता ${f(p.days)} दिन के स्थानांतरण के लिए काफी है`,
  'cr.consOut': 'रसद खत्म',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t रसद ${p.crew} सदस्यीय चालक दल के लिए ${f(p.days)} दिन चलती है (${f(p.rate, 1)} kg/व्यक्ति/दिन)`,
  'cr.half': 'आधा रास्ता',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `रसद में ${f(p.margin)} दिन का अतिरिक्त भंडार (साथ में ${f(p.t, 1)} t, ${f(p.rate, 1)} kg/व्यक्ति/दिन; ${f(p.water)} % पानी / ${f(p.o2)} % O₂ पुनर्चक्रण)`,
  'cr.half.uncrewed': 'मानवरहित — रसद का हिसाब रखने की जरूरत नहीं',
  'cr.rad': 'विकिरण',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `जाते हुए अब तक ${f(p.dose)} mSv जमा (MSL RAD दर 1.8 mSv/दिन${p.shield ? ', शील्डिंग से 15 % की छूट' : ', कोई अलग शील्डिंग नहीं'}); नासा की करियर सीमा 600 mSv — वापसी की यात्रा इसे दोगुना कर देती है`,
  'cr.marsSoi': 'मंगल के प्रभाव क्षेत्र में प्रवेश',
  'cr.marsSoi.d': (p: { v: number }) => `मंगल से ~0.58 मिलियन km, ${f(p.v, 2)} km/s से पास आ रहा है`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': 'मंगल पर मौसम',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season}; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `पूरे ग्रह को घेरने वाली धूल भरी आंधी चल रही है (τ ≈ ${p.tau}): ऊंचाई पर प्रवेश घनत्व ~${f(p.density)} % अधिक, धूल के नीचे कुछ दिखाई नहीं देता, सतह पर हवाएं ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `क्षेत्रीय धूल भरी आंधी (τ ≈ ${p.tau}): ऊंचाई पर प्रवेश घनत्व ~${f(p.density)} % अधिक, कम दृश्यता, हवाएं ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `साफ आसमान (τ ≈ ${p.tau}), हवाएं ~${f(p.wind)} m/s`,
  'season.nSpring': 'उत्तरी वसंत',
  'season.nSummer': 'उत्तरी ग्रीष्म',
  'season.sSpring': 'दक्षिणी वसंत — धूल भरी आंधियों की ऋतु',
  'season.sSummer': 'दक्षिणी ग्रीष्म — धूल भरी आंधियों की ऋतु',
  'season.nSpring.short': 'उत्तरी वसंत',
  'season.nSummer.short': 'उत्तरी ग्रीष्म',
  'season.sSpring.short': 'दक्षिणी वसंत',
  'season.sSummer.short': 'दक्षिणी ग्रीष्म',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': 'प्रवेश सीमा',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'सतह स्पर्श',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s, उतरा द्रव्यमान ${f(p.mass, 1)} t, ${f(p.prop, 1)} t प्रणोदक शेष`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `${f(p.h)} m से ऊर्ध्वाधर अवतरण; उतरा द्रव्यमान ${f(p.mass, 1)} t, ${f(p.prop, 1)} t प्रणोदक शेष`,
  'en.impact': 'टक्कर',
  'en.impact.d': (p: { v: number; landing: boolean }) => `${f(p.v)} m/s की गति से सतह से टक्कर${p.landing ? ' (लैंडिंग बर्न इसे रोक नहीं सका)' : ' — लैंडिंग के लिए कोई इंजन नहीं'}`,
  'en.skip': 'वायुमंडल से बाहर उछला',
  'en.skip.d': (p: { v: number }) => `यान ${f(p.v)} m/s पर वायुमंडल से बाहर निकल गया — प्रवेश कोण बहुत उथला`,
  'en.pullout': 'पुल-आउट',
  'en.pullout.d': (p: { alt: number; v: number }) => `${f(p.alt)} km, ${f(p.v)} m/s पर उतरने की दर थमी — वायुमंडल में बने रहने के लिए लिफ्ट की दिशा नीचे की ओर मोड़ी जा रही है`,
  'en.tps': 'हीट शील्ड की सीमा पार',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.alt)} km, ${f(p.v)} m/s पर ${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² (${p.tps})`,
  'en.burn': 'लैंडिंग बर्न का प्रज्वलन',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, उतरने की दर ${f(p.sink)} m/s; जरूरत ${f(p.need, 1)} g${p.mars ? ' (मंगल)' : ''}, उपलब्ध ${f(p.avail, 1)}; ${p.landing}`,
  'en.tipped': 'पलट गया',
  'en.tipped.d': (p: { pct: number }) => `एक लैंडिंग लेग ऐसी चट्टान पर पड़ा जिसे लैंडिंग प्रणाली देख नहीं सकी — यान करवट के बल पड़ा है (खतरे की संभावना ${f(p.pct)} %)`,
  'en.propOut': 'प्रणोदक खत्म',
  'en.propOut.d': (p: { h: number; v: number }) => `सतह से ${f(p.h)} m ऊपर — ${f(p.v)} m/s की गति से गिरा`,
  'en.propOutBurn': 'लैंडिंग बर्न के बीच प्रणोदक खत्म',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s — अब मुक्त पतन`,
  'en.g': 'चालक दल की g-सीमा पार',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `${f(p.alt)} km पर लगातार ${f(p.g, 1)} g > कमजोर हो चुके चालक दल की ${f(p.lim, 1)} g की सीमा`,
  'en.peakHeat': 'अधिकतम तापन',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.alt)} km पर ${f(p.q)} W/cm² (सीमा ${f(p.lim)}, ${p.tps}); अब तक का ऊष्मा भार ${f(p.load)} J/cm²`,
  'en.peakG': 'अधिकतम मंदन',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.alt)} km, ${f(p.v)} m/s पर ${f(p.g, 1)} g`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s — इससे नीचे पैराशूट ~1 t के लिए काम आ सकता है, ${f(p.mass)} t के लिए नहीं`,
  'en.reason.tps': 'हीट शील्ड की सीमा पार हो गई',
  'en.reason.skip': 'वायुमंडल से उछलकर बाहर निकल गया',
  'en.reason.tipped': 'लैंडिंग पर पलट गया',
  'en.reason.crashed': 'दुर्घटनाग्रस्त',
  'en.reason.slow': 'समय पर सतह तक नहीं पहुंचा',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': 'हैच खुलता है',
  'surf.hatch.d': 'केबिन का दाब बाहर के 0.6 kPa के बराबर किया गया; चालक दल की लिफ्ट नीचे उतरती है',
  'surf.boots': 'मंगल पर पहले कदम',
  'surf.boots.d': (p: { n: number }) => `चालक दल के ${p.n} सदस्य लिफ्ट से सतह पर; जमीन उनका भार संभाल लेती है`,
  'surf.flag': 'झंडा',
  'surf.flag.d': 'यान से 25 m दूर, लैंडिंग लेग की आड़ में गाड़ा गया',
  'surf.habitat': 'आवास फुलाया गया',
  'surf.habitat.d': 'पहला फुलाने योग्य मॉड्यूल खड़ा, एयरलॉक जोड़ा गया',
  'surf.power': 'बिजली चालू',
  'surf.power.d': 'तीन बिछाई जाने वाली सौर चादरें, साफ मौसम में दोपहर को ~40 kW',
  'flyby': 'मंगल फ्लाईबाई',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} में वायुमंडलीय प्रवेश की कोई प्रणाली नहीं; यह ${f(p.v, 2)} km/s से मंगल के पास से गुजरता है और सूर्य की कक्षा में ही रहता है`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'प्रक्षेपण',
  'phase.refuel': 'कक्षा में ईंधन भरना',
  'phase.parking': 'पार्किंग कक्षा',
  'phase.tmi': 'TMI दहन',
  'phase.cruise': 'मंगल की ओर यात्रा',
  'phase.edl': 'प्रवेश, अवतरण और लैंडिंग',
  'phase.surface': 'सतह पर',
  'phase.lost': 'अंतरिक्ष में खो गया',
  'phase.breakup': 'विखंडन',
  'phase.impact': 'टक्कर',
  'phase.firstSteps': 'पहले कदम',
  'phase.flyby': 'मंगल फ्लाईबाई',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'प्रक्षेपण',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'विफल',
  'st.launch.n': (p: { mass: number; t: number }) => `T+${f(p.t)} s पर कक्षा में ${f(p.mass)} t`,
  'st.prop': 'प्रस्थान के समय प्रणोदक',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${f(p.days)} दिन में ${p.n} टैंकर, ${f(p.boil, 1)} t वाष्पित`,
  'st.dv': 'मंगल के लिए Δv',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `उपलब्ध / जरूरी (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} दिन)`,
  'st.life': 'जीवन रक्षा प्रणाली',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `${f(p.days)} में से ${f(p.day)} दिन`,
  'st.life.lost.n': 'यात्रा में चालक दल नहीं बचा',
  'st.life.ok': 'पर्याप्त',
  'st.life.cap.n': (p: { days: number }) => `${p.days} दिन की क्षमता`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${p.crew} सदस्यीय चालक दल के लिए ${f(p.t, 1)} t रसद`,
  'st.rad': 'विकिरण (जाते समय)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'नासा की करियर सीमा 600 mSv; वापसी में यह दोगुना हो जाता है',
  'st.entry': 'प्रवेश',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${p.fpa}°, ${f(p.mass)} t`,
  'st.wx': 'मंगल पर मौसम',
  'st.wx.global': 'वैश्विक धूल भरी आंधी',
  'st.wx.regional': 'क्षेत्रीय धूल भरी आंधी',
  'st.wx.clear': 'साफ',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season}; हवाएं ${f(p.wind)} m/s`,
  'st.heat': 'अधिकतम तापन',
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `सीमा ${f(p.lim)} (${p.tps}); ऊष्मा भार ${f(p.load)} J/cm²`,
  'st.g': 'अधिकतम मंदन',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `चालक दल की सीमा ${p.lim} g`,
  'st.landing': 'लैंडिंग बर्न',
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t प्रणोदक`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} कक्षा तक नहीं पहुंच सका`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}। ${p.crew === 'abort' ? 'कैप्सूल में लॉन्च अबॉर्ट प्रणाली है — चालक दल सुरक्षित निकल आता है।' : p.crew === 'noAbort' ? 'स्टारशिप में कोई लॉन्च अबॉर्ट प्रणाली नहीं है।' : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} पृथ्वी की कक्षा में फंसा रह जाता है`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}। ${p.detail}`,
  'v.stuck.none': 'स्थानांतरण पथ की गणना नहीं हो सकी।',
  'v.flyby': (p: { ship: string }) => `${p.ship} मंगल तक पहुंचता है — और उसके पास से आगे निकल जाता है`,
  'v.flyby.s': (p: { crewed: boolean }) => `यान में न प्रवेश प्रणाली है, न कैप्चर प्रणाली। ${p.crewed ? '' : 'मानवरहित।'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} मंगल के वायुमंडल में जलकर नष्ट हो जाता है`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `अधिकतम तापन ${f(p.q)} W/cm² — ${p.tps} की ${f(p.lim)} W/cm² की रेटिंग से ज्यादा${p.alt != null && p.v != null ? ` (सीमा पहली बार ${f(p.alt)} km, ${f(p.v)} m/s पर पार हुई)` : ''}।`,
  'v.tipped': (p: { ship: string }) => `${p.ship} मंगल पर उतरता है — और पलट जाता है`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail}। चालक दल शायद इस गिरावट में बच जाता है; पर यान, आवास और वापसी की हर संभावना खत्म हो जाती है।`,
  'v.skipped': (p: { ship: string }) => `${p.ship} वायुमंडल से टकराकर वापस अंतरिक्ष में उछल जाता है`,
  'v.crashed': (p: { ship: string }) => `${p.ship} मंगल पर दुर्घटनाग्रस्त हो जाता है`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `${f(p.alt, 2)} km ऊपर, ${f(p.v)} m/s पर लैंडिंग इंजनों का प्रणोदक खत्म; ${p.what} ${f(p.impact)} m/s से जमीन से टकराया।`,
  'v.what.capsule': 'कैप्सूल',
  'v.what.ship': 'यान',
  'v.landed': (p: { ship: string }) => `${p.ship} जीवित चालक दल के साथ मंगल पर उतरता है`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} मंगल पर उतरता है — ${p.crewed ? 'पर चालक दल यात्रा में नहीं बचा' : 'मानवरहित'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `${f(p.dv)} m/s के लैंडिंग बर्न के बाद ${f(p.v, 1)} m/s पर सतह स्पर्श; खर्च हुआ ${f(p.prop, 1)} t प्रणोदक।`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} पहली विफलता: ${p.label} — ${p.detail}`,
}
