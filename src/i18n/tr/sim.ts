/** What the simulation says — tr (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('tr-TR')

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': 'Kalkış',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => `${p.vehicle}, ${p.site}; rampada ${f(p.mass)} t`,
  'asc.impact': 'Çarpma',
  'asc.impact.d': 'Araç yörüngeye ulaşamadan yere çarptı',
  'asc.mach1': 'Mach 1',
  'asc.mach1.d': (p: { alt: number; t: number }) => `${f(p.alt, 1)} km, T+${f(p.t)} s`,
  'asc.fairing': 'Faring ayrılması',
  'asc.fairing.d': (p: { alt: number }) => `${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => `${p.stage} ayrılması`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => `${p.stage} motor kesmesi ve ayrılması`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => `${p.stage} ateşlemesi`,
  'asc.ignition.d': (p: { t: number }) => `T+${f(p.t)} s`,
  'asc.propOut': 'Yörüngeye varmadan yakıt tükendi',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => `Yakıt tükendi: perije ${f(p.rp)} km, apoje ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': 'SECO — yörüngede',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s; ${f(p.prop, 1)} t yakıt kaldı`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': 'SECO-1',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => `${f(p.rp)} × ${f(p.ra)} km, ${f(p.v)} m/s, T+${f(p.t)} s`,
  'asc.circ': 'Daireselleştirme yanması',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => `apojede Δv ${f(p.dv)} m/s, ${f(p.alt)} km dairesel yörünge; ${f(p.prop, 1)} t yakıt kaldı`,
  'asc.circFail': 'Yörünge daireselleştirilemiyor',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => `Yörüngeyi daireselleştirmeye yetecek yakıt yok (gereken ${f(p.dv)} m/s, ${f(p.need, 1)} t; kalan ${f(p.left, 1)} t)`,
  'asc.reason.impact': 'Yere çarptı',
  'asc.reason.timeout': 'Süre doldu',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': 'Park yörüngesi',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => `yörüngedeki kütle ${f(p.mass, 1)} t; ${p.stage} içinde ${f(p.prop, 1)} t yakıt kaldı`,
  'leo.ship': 'Gemi park yörüngesinde',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => `yörüngeye ${f(p.res, 1)} t artık yakıtla ulaştı; görev, ayrılışta gemide ${f(p.target)} t yakıt gerektiriyor (${f(p.more)} t daha)`,
  'leo.tanker': (p: { n: number }) => `${p.n}. tanker kenetlendi`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => `+${f(p.add)} t → gemide ${f(p.aboard)} t (görevin ihtiyacına oranı %${f(p.pct)})`,
  'leo.done': 'Yakıt ikmali tamamlandı',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => `${p.n} tanker ve ${f(p.days)} günün sonunda gemide ${f(p.aboard)} t (gereken: ${f(p.target)} t, doluluk %${f(p.pct)}); buharlaşma kaybı ${f(p.lost, 1)} t`,
  'leo.short': 'Yakıt yetersiz',
  'leo.short.d': (p: { n: number; each: number; target: number }) => `her biri ${f(p.each)} t taşıyan ${p.n} tanker, görevin ihtiyaç duyduğu ${f(p.target)} t yakıta ulaşamadı`,
  'leo.missed': 'Fırlatma penceresi kaçırıldı',
  'leo.missed.d': (p: { days: number; limit: number }) => `${f(p.days)} günlük yakıt ikmali, fırlatma fırsatı çevresindeki ${p.limit} günlük sınırı aşıyor — bir sonraki pencere 26 ay sonra`,
  'leo.long': 'Yakıt ikmali pencereden uzun sürüyor',
  'leo.long.d': (p: { days: number; limit: number }) => `${f(p.days)} gün sürüyor, ayrılış dönemi ise ~${p.limit} gün; ayrılıştaki C3 en düşük değerden kötü olacak`,
  'leo.boiloff': 'Buharlaşma kaybı',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => `kayıp oranı %${f(p.pct)}: teslim edilen yakıt günde %${f(p.rate, 2)} hızla buharlaştı`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': "Mars'a geçiş yanması",
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => `Δv ${f(p.need, 2)} km/s (C3 ${f(p.c3, 1)} + ara rota düzeltmeleri), ${f(p.used)} t yakıt, ${f(p.burn)} s yanma; inişe ${f(p.left)} t kaldı`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => `${p.stage} tek başına Δv ${f(p.need, 2)} km/s sağlıyor (kapasitesi ${f(p.had, 2)})`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => `${p.stage} ${f(p.dv1, 2)} km/s veriyor, ${p.sc} kendi tanklarından ${f(p.rest, 2)} km/s ekliyor (${f(p.used, 1)} t); ${f(p.left, 1)} t kaldı`,
  'tmi.missed': 'Ayrılış penceresi kaçırıldı',
  'tmi.missed.d': 'Yakıt ikmali zamanında bitmedi; gemi Dünya yörüngesinde kalıyor.',
  'tmi.short': "Mars'a geçiş için Δv yetersiz",
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    `Mevcut ${f(p.avail, 2)} km/s, gereken ${f(p.need, 2)} km/s (${p.orbit} km yörüngeden C3 ${f(p.c3, 1)} km²/s²). ${p.refuel ? `Gemide ${f(p.prop ?? 0)} t yakıt, toplam ${f(p.mass ?? 0)} t.` : 'Üst kademe ile uzay aracının yakıtı birlikte hesaplandı.'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': "Mars'a geçiş tamamlandı",
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => `C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} günlük transfer, varışta v∞ ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': "Dünya'nın etki küresinden çıkış",
  'cr.earthSoi.d': '~0,92 milyon km uzakta',
  'cr.lifeOut': 'Yaşam desteği tükendi',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => `${p.sc} serbest uçuşta ${p.cap} gün yaşam desteği sağlıyor; transfer ${f(p.days)} gün sürüyor — mürettebat Mars'a ${f(p.short)} gün kala hayatını kaybediyor`,
  'cr.life': 'Yaşam desteği',
  'cr.life.d': (p: { cap: number; days: number }) => `${p.cap} günlük kapasite, ${f(p.days)} günlük transferi karşılıyor`,
  'cr.consOut': 'Sarf malzemeleri tükendi',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => `${f(p.t, 1)} t, kişi başı günde ${f(p.rate, 1)} kg ile ${p.crew} kişilik mürettebata ${f(p.days)} gün yetiyor`,
  'cr.half': 'Yolun yarısı',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => `sarf malzemesi payı ${f(p.margin)} gün (${f(p.t, 1)} t yüklendi; kişi başı günde ${f(p.rate, 1)} kg, su geri kazanımı %${f(p.water)}, O₂ geri kazanımı %${f(p.o2)})`,
  'cr.half.uncrewed': 'mürettebatsız — izlenecek sarf malzemesi yok',
  'cr.rad': 'Radyasyon',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => `gidiş yolunda şimdiye kadar ${f(p.dose)} mSv birikti (MSL RAD ölçümü günde 1,8 mSv${p.shield ? ', %15 zırh indirimi' : ', özel zırh yok'}); NASA'nın kariyer sınırı 600 mSv — dönüş yolu bunu ikiye katlıyor`,
  'cr.marsSoi': "Mars'ın etki küresine giriş",
  'cr.marsSoi.d': (p: { v: number }) => `Mars'a ~0,58 milyon km; yaklaşma hızı ${f(p.v, 2)} km/s`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': "Mars'ta hava durumu",
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => `Ls ${f(p.ls)}°, ${p.season}; ${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => `gezegeni saran bir toz fırtınası sürüyor (τ ≈ ${f(p.tau, 1)}): giriş irtifalarında yoğunluk ~%${f(p.density)} fazla, tozun altı hiç görünmüyor, yüzey rüzgârı ~${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => `bölgesel bir toz fırtınası (τ ≈ ${f(p.tau, 1)}): giriş irtifalarında yoğunluk ~%${f(p.density)} fazla, görüş kötü, rüzgâr ~${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => `açık gökyüzü (τ ≈ ${f(p.tau, 1)}), rüzgâr ~${f(p.wind)} m/s`,
  'season.nSpring': 'kuzey yarımkürede ilkbahar',
  'season.nSummer': 'kuzey yarımkürede yaz',
  'season.sSpring': 'güney yarımkürede ilkbahar — toz fırtınası mevsimi',
  'season.sSummer': 'güney yarımkürede yaz — toz fırtınası mevsimi',
  'season.nSpring.short': 'kuzeyde ilkbahar',
  'season.nSummer.short': 'kuzeyde yaz',
  'season.sSpring.short': 'güneyde ilkbahar',
  'season.sSummer.short': 'güneyde yaz',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': 'Atmosfere giriş',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => `${f(p.alt)} km, ${f(p.v)} m/s, γ ${f(p.fpa, 1)}°, ${f(p.mass, 1)} t, β ${f(p.beta)} kg/m²`,
  'en.touchdown': 'Yere değme',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => `${f(p.v, 1)} m/s, yere inen kütle ${f(p.mass, 1)} t, ${f(p.prop, 1)} t yakıt kaldı`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => `${f(p.h)} m yükseklikten dikey alçalma; yere inen kütle ${f(p.mass, 1)} t, ${f(p.prop, 1)} t yakıt kaldı`,
  'en.impact': 'Çarpma',
  'en.impact.d': (p: { v: number; landing: boolean }) => `${f(p.v)} m/s hızla yüzeye çarptı${p.landing ? ' (iniş yanması aracı durduramadı)' : ' — iniş için itki sistemi yok'}`,
  'en.skip': 'Atmosferden sekti',
  'en.skip.d': (p: { v: number }) => `Araç atmosferi ${f(p.v)} m/s hızla terk etti — giriş açısı fazla sığ`,
  'en.pullout': 'Toparlanma',
  'en.pullout.d': (p: { alt: number; v: number }) => `alçalma hızı ${f(p.alt)} km'de, ${f(p.v)} m/s hızdayken durduruldu — araç atmosferde kalmak için yatış yapıp kaldırma kuvvetini aşağı çeviriyor`,
  'en.tps': 'Isı kalkanı sınırı aşıldı',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => `${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm² (${p.tps}); ${f(p.alt)} km, ${f(p.v)} m/s`,
  'en.burn': 'İniş yanması başladı',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    `${f(p.alt, 1)} km, ${f(p.v)} m/s, Mach ${f(p.mach, 1)}, alçalma hızı ${f(p.sink)} m/s; gereken ${f(p.need, 1)} g${p.mars ? ' (Mars)' : ''}, mevcut ${f(p.avail, 1)}; ${p.landing}`,
  'en.tipped': 'Devrildi',
  'en.tipped.d': (p: { pct: number }) => `bir iniş ayağı, iniş sisteminin göremediği bir kayanın üstüne bastı — gemi yan yattı (tehlike olasılığı %${f(p.pct)})`,
  'en.propOut': 'Yakıt tükendi',
  'en.propOut.d': (p: { h: number; v: number }) => `yüzeyin ${f(p.h)} m üstünde — araç ${f(p.v)} m/s hızla düştü`,
  'en.propOutBurn': 'Yanma sırasında yakıt tükendi',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => `${f(p.alt, 2)} km, ${f(p.v)} m/s — araç artık serbest düşüşte`,
  'en.g': 'Mürettebat g sınırı aşıldı',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => `${f(p.alt)} km'de sürekli ${f(p.g, 1)} g > ${f(p.lim, 1)} g sınırı (aylarca ağırlıksız kalmış mürettebat için)`,
  'en.peakHeat': 'En yüksek ısınma',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => `${f(p.alt)} km'de ${f(p.q)} W/cm² (sınır ${f(p.lim)}, ${p.tps}); şimdiye kadarki ısı yükü ${f(p.load)} J/cm²`,
  'en.peakG': 'En yüksek yavaşlama',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => `${f(p.alt)} km'de ${f(p.g, 1)} g, ${f(p.v)} m/s`,
  'en.mach2': 'Mach 2',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => `${f(p.alt, 1)} km, ${f(p.v)} m/s — bunun altında paraşüt ~1 t için işe yarardı, ${f(p.mass)} t için değil`,
  'en.reason.tps': 'Isı kalkanı sınırını aştı',
  'en.reason.skip': 'Atmosferden sekip çıktı',
  'en.reason.tipped': 'İnişte devrildi',
  'en.reason.crashed': 'Çakıldı',
  'en.reason.slow': 'Yüzeye zamanında ulaşamadı',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': 'Kapak açılıyor',
  'surf.hatch.d': 'kabin basıncı dış ortamla (0,6 kPa) eşitlendi; mürettebat asansörü açılıyor',
  'surf.boots': "Mars'ta ilk ayak izleri",
  'surf.boots.d': (p: { n: number }) => `mürettebattan ${p.n} kişi asansörle indi; zemin sağlam`,
  'surf.flag': 'Bayrak',
  'surf.flag.d': 'gemiden 25 m uzağa, iniş ayaklarının rüzgâr almayan yanına dikildi',
  'surf.habitat': 'Yaşam modülü şişirildi',
  'surf.habitat.d': 'ilk şişirilebilir modül kuruldu, hava kilidi bağlandı',
  'surf.power': 'Güç devrede',
  'surf.power.d': 'yere serilen üç esnek güneş paneli; açık havada öğle saatinde ~40 kW',
  'flyby': 'Mars yakın geçişi',
  'flyby.d': (p: { sc: string; v: number }) => `${p.sc} atmosfere giriş sistemine sahip değil; Mars'ın yanından ${f(p.v, 2)} km/s hızla geçip Güneş yörüngesinde kalıyor`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': 'Fırlatma',
  'phase.refuel': 'Yörüngede yakıt ikmali',
  'phase.parking': 'Park yörüngesi',
  'phase.tmi': 'TMI yanması',
  'phase.cruise': "Mars'a yolculuk",
  'phase.edl': 'Giriş, alçalma ve iniş',
  'phase.surface': 'Yüzeyde',
  'phase.lost': 'Uzayda kayıp',
  'phase.breakup': 'Parçalanma',
  'phase.impact': 'Çarpma',
  'phase.firstSteps': 'İlk adımlar',
  'phase.flyby': 'Mars yakın geçişi',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': 'Fırlatma',
  'st.launch.v': (p: { rp: number; ra: number }) => `${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': 'başarısız',
  'st.launch.n': (p: { mass: number; t: number }) => `yörüngede ${f(p.mass)} t, T+${f(p.t)} s`,
  'st.prop': 'Ayrılışta yakıt',
  'st.prop.v': (p: { prop: number }) => `${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => `${p.n} tanker, ${f(p.days)} gün; ${f(p.boil, 1)} t buharlaştı`,
  'st.dv': 'Mars için Δv',
  'st.dv.v': (p: { avail: number; need: number }) => `${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => `mevcut / gereken (C3 ${f(p.c3, 1)} km²/s², ${f(p.days)} gün)`,
  'st.life': 'Yaşam desteği',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => `${f(p.day)} / ${f(p.days)} gün`,
  'st.life.lost.n': 'mürettebat yolda hayatını kaybetti',
  'st.life.ok': 'yeterli',
  'st.life.cap.n': (p: { days: number }) => `${p.days} günlük kapasite`,
  'st.life.cons.n': (p: { t: number; crew: number }) => `${p.crew} kişi için ${f(p.t, 1)} t sarf malzemesi`,
  'st.rad': 'Radyasyon (gidiş)',
  'st.rad.v': (p: { dose: number }) => `${f(p.dose)} mSv`,
  'st.rad.n': 'NASA kariyer sınırı 600 mSv; dönüş bunu ikiye katlar',
  'st.entry': 'Giriş',
  'st.entry.v': (p: { v: number }) => `${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => `β ${f(p.beta)} kg/m², γ ${f(p.fpa, Number.isInteger(p.fpa) ? 0 : 1)}°, ${f(p.mass)} t`,
  'st.wx': "Mars'ta hava durumu",
  'st.wx.global': 'Küresel toz fırtınası',
  'st.wx.regional': 'Bölgesel toz fırtınası',
  'st.wx.clear': 'Açık',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => `Ls ${f(p.ls)}°, ${p.season}; rüzgâr ${f(p.wind)} m/s`,
  'st.heat': 'En yüksek ısınma',
  'st.heat.v': (p: { q: number }) => `${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => `sınır ${f(p.lim)} (${p.tps}); ısı yükü ${f(p.load)} J/cm²`,
  'st.g': 'En yüksek yavaşlama',
  'st.g.v': (p: { g: number }) => `${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => `mürettebat sınırı ${f(p.lim, Number.isInteger(p.lim) ? 0 : 1)} g`,
  'st.landing': 'İniş yanması',
  'st.landing.v': (p: { dv: number }) => `${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => `${f(p.prop, 1)} t yakıt`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => `${p.ship} yörüngeye çıkamadı`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => `${p.reason}. ${p.crew === 'abort' ? 'Kapsülde fırlatma acil kaçış sistemi var — mürettebat kurtulur.' : p.crew === 'noAbort' ? "Starship'te fırlatma acil kaçış sistemi yok." : ''}`,
  'v.stuck': (p: { ship: string }) => `${p.ship} Dünya yörüngesinde mahsur kaldı`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => `${p.label}. ${p.detail}`,
  'v.stuck.none': 'Transfer hesaplanamadı.',
  'v.flyby': (p: { ship: string }) => `${p.ship} Mars'a ulaşıyor — ama yanından geçip gidiyor`,
  'v.flyby.s': (p: { crewed: boolean }) => `Araçta atmosfere giriş ya da yörüngeye yakalanma sistemi yok. ${p.crewed ? '' : 'Mürettebatsız.'}`,
  'v.burned': (p: { ship: string }) => `${p.ship} Mars atmosferinde yanıyor`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    `En yüksek ısınma ${f(p.q)} W/cm² — ${p.tps} için belirlenen ${f(p.lim)} W/cm² sınırının üstünde${p.alt != null && p.v != null ? ` (sınır ilk kez ${f(p.alt)} km yükseklikte, ${f(p.v)} m/s hızda aşıldı)` : ''}.`,
  'v.tipped': (p: { ship: string }) => `${p.ship} Mars'a iniyor — ve devriliyor`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => `${p.detail.charAt(0).toLocaleUpperCase('tr-TR')}${p.detail.slice(1)}. Mürettebat düşüşten büyük olasılıkla sağ kurtulur; gemi, yaşam alanı ve dönüş umudu kurtulmaz.`,
  'v.skipped': (p: { ship: string }) => `${p.ship} atmosferden sekip uzaklaşıyor`,
  'v.crashed': (p: { ship: string }) => `${p.ship} Mars'a çakılıyor`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => `İniş motorlarının yakıtı ${f(p.alt, 2)} km yükseklikte, ${f(p.v)} m/s hızdayken tükendi; ${p.what} yere ${f(p.impact)} m/s hızla çarptı.`,
  'v.what.capsule': 'kapsül',
  'v.what.ship': 'gemi',
  'v.landed': (p: { ship: string }) => `${p.ship} mürettebatı Mars'a sağ salim indiriyor`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => `${p.ship} Mars'a iniyor — ${p.crewed ? 'mürettebat yolculuktan sağ çıkamadı' : 'mürettebatsız'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => `${f(p.dv)} m/s'lik iniş yanmasında ${f(p.prop, 1)} t yakıt harcandı; yere iniş hızı ${f(p.v, 1)} m/s.`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => `${p.summary} İlk arıza: ${p.label} — ${p.detail}`,
}
