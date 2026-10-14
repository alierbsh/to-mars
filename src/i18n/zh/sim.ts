/** What the simulation says — zh (translated from en/sim.ts; same keys, same parameters). */
import { numbers } from '../numbers'
import type { SimCatalog } from '../types'

const { f } = numbers('zh-CN')

/**
 * Chinese sets a space between a Han character and a Latin letter or digit (星舰 V3 在火星着陆).
 * Names arrive here already rendered and may begin or end in either script, so every template is
 * tagged `zh`: where an inserted value meets the text around it, a space goes in only between Han
 * and Latin/digits (猎鹰重型在火星着陆 · 发射 SLS + 猎户座). The words themselves are spaced by hand.
 */
const HAN = /[㐀-䶿一-鿿豈-﫿]/
const LATIN = /[A-Za-z0-9]/
const gap = (a: string, b: string): string =>
  (HAN.test(a.slice(-1)) && LATIN.test(b.charAt(0))) || (LATIN.test(a.slice(-1)) && HAN.test(b.charAt(0))) ? ' ' : ''
const zh = (s: TemplateStringsArray, ...v: unknown[]): string =>
  v.reduce<string>((out, x, i) => {
    const t = String(x)
    const o = out + gap(out, t) + t
    return o + gap(o, s[i + 1]) + s[i + 1]
  }, s[0])

export const SIM: SimCatalog = {
  // ---------------------------------------------------------------- launch (sim/ascent.ts)
  'asc.liftoff': '起飞',
  'asc.liftoff.d': (p: { vehicle: string; site: string; mass: number }) => zh`${p.vehicle}从${p.site}升空，起飞质量 ${f(p.mass)} t`,
  'asc.impact': '撞击地面',
  'asc.impact.d': '火箭未能入轨便坠落地面',
  'asc.mach1': '1 马赫',
  'asc.mach1.d': (p: { alt: number; t: number }) => zh`高度 ${f(p.alt, 1)} km，T+${f(p.t)} s`,
  'asc.fairing': '整流罩分离',
  'asc.fairing.d': (p: { alt: number }) => zh`高度 ${f(p.alt)} km`,
  /** a strap-on booster (or pair) burns out and drops away */
  'asc.boosterSep': (p: { stage: string }) => zh`${p.stage}分离`,
  /** a core stage shuts down and separates */
  'asc.coreSep': (p: { stage: string }) => zh`${p.stage}关机并分离`,
  'asc.sep.d': (p: { alt: number; v: number; t: number }) => zh`高度 ${f(p.alt)} km，速度 ${f(p.v)} m/s，T+${f(p.t)} s`,
  'asc.ignition': (p: { stage: string }) => zh`${p.stage}点火`,
  'asc.ignition.d': (p: { t: number }) => zh`T+${f(p.t)} s`,
  'asc.propOut': '入轨前推进剂耗尽',
  /** ra null: the trajectory escapes (apoapsis at infinity) */
  'asc.propOut.d': (p: { rp: number; ra: number | null }) => zh`推进剂耗尽：近地点 ${f(p.rp)} km，远地点 ${p.ra === null ? '∞' : f(p.ra)} km`,
  /** second engine cutoff, in orbit */
  'asc.seco': '关机入轨（SECO）',
  'asc.seco.d': (p: { rp: number; ra: number; v: number; t: number; prop: number }) => zh`${f(p.rp)} × ${f(p.ra)} km，${f(p.v)} m/s，T+${f(p.t)} s；剩余推进剂 ${f(p.prop, 1)} t`,
  /** first cutoff of a low-thrust upper stage, before coasting to apoapsis */
  'asc.seco1': '上面级首次关机（SECO-1）',
  'asc.seco1.d': (p: { rp: number; ra: number; v: number; t: number }) => zh`${f(p.rp)} × ${f(p.ra)} km，${f(p.v)} m/s，T+${f(p.t)} s`,
  'asc.circ': '圆化点火',
  'asc.circ.d': (p: { dv: number; alt: number; prop: number }) => zh`在远地点施加 Δv ${f(p.dv)} m/s，进入 ${f(p.alt)} km 圆轨道；剩余推进剂 ${f(p.prop, 1)} t`,
  'asc.circFail': '无法圆化轨道',
  'asc.circFail.d': (p: { dv: number; need: number; left: number }) => zh`推进剂不足，无法圆化轨道（需要 ${f(p.dv)} m/s，即 ${f(p.need, 1)} t；仅剩 ${f(p.left, 1)} t）`,
  'asc.reason.impact': '撞击地面',
  'asc.reason.timeout': '超时未能入轨',

  // ---------------------------------------------------------------- Earth orbit (sim/leo.ts)
  'leo.parking': '停泊轨道',
  'leo.parking.d': (p: { mass: number; prop: number; stage: string }) => zh`入轨质量 ${f(p.mass, 1)} t；${p.stage}剩余推进剂 ${f(p.prop, 1)} t`,
  'leo.ship': '飞船进入停泊轨道',
  'leo.ship.d': (p: { res: number; target: number; more: number }) => zh`入轨时剩余推进剂 ${f(p.res, 1)} t；出发时船上需有 ${f(p.target)} t（还差 ${f(p.more)} t）`,
  'leo.tanker': (p: { n: number }) => zh`加注飞船 ${p.n} 对接`,
  'leo.tanker.d': (p: { add: number; aboard: number; pct: number }) => zh`+${f(p.add)} t → 船上 ${f(p.aboard)} t（达到任务所需的 ${f(p.pct)} %）`,
  'leo.done': '推进剂加注完成',
  'leo.done.d': (p: { aboard: number; pct: number; target: number; n: number; days: number; lost: number }) => zh`经 ${p.n} 艘加注飞船、历时 ${f(p.days)} 天，船上推进剂达 ${f(p.aboard)} t（为所需 ${f(p.target)} t 的 ${f(p.pct)} %）；蒸发损失 ${f(p.lost, 1)} t`,
  'leo.short': '推进剂不足',
  'leo.short.d': (p: { n: number; each: number; target: number }) => zh`${p.n} 艘加注飞船每艘输送 ${f(p.each)} t，仍达不到任务所需的 ${f(p.target)} t`,
  'leo.missed': '错过发射窗口',
  'leo.missed.d': (p: { days: number; limit: number }) => zh`加注作业历时 ${f(p.days)} 天，超过了发射机会前后 ${p.limit} 天的期限——下一个窗口要等 26 个月`,
  'leo.long': '加注作业超出窗口期',
  'leo.long.d': (p: { days: number; limit: number }) => zh`历时 ${f(p.days)} 天，而出发窗口期约为 ${p.limit} 天；出发 C3 将高于最小值`,
  'leo.boiloff': '蒸发损失',
  'leo.boiloff.d': (p: { pct: number; rate: number }) => zh`已输送推进剂的 ${f(p.pct)} % 蒸发掉了（每天 ${f(p.rate, 2)} %）`,

  // ---------------------------------------------------------------- departure (sim/mission.ts)
  'tmi.burn': '地火转移点火',
  'tmi.burn.d': (p: { need: number; c3: number; used: number; burn: number; left: number }) => zh`Δv ${f(p.need, 2)} km/s（C3 ${f(p.c3, 1)} + 中途修正），消耗推进剂 ${f(p.used)} t，点火持续 ${f(p.burn)} s；剩余 ${f(p.left)} t 用于着陆`,
  /** the upper stage alone has the Δv */
  'tmi.stage.d': (p: { stage: string; need: number; had: number }) => zh`${p.stage}点火提供 Δv ${f(p.need, 2)} km/s（可用 ${f(p.had, 2)}）`,
  /** the upper stage runs dry and the spacecraft finishes the burn */
  'tmi.both.d': (p: { stage: string; dv1: number; sc: string; rest: number; used: number; left: number }) => zh`${p.stage}提供 ${f(p.dv1, 2)} km/s，${p.sc}用自身贮箱补足 ${f(p.rest, 2)} km/s（${f(p.used, 1)} t）；剩余 ${f(p.left, 1)} t`,
  'tmi.missed': '错过出发窗口',
  'tmi.missed.d': '推进剂加注未能按时完成；飞船留在地球轨道上。',
  'tmi.short': 'Δv 不足以进行地火转移点火',
  /** refuel: a refuellable ship (prop and mass given) */
  'tmi.short.d': (p: { avail: number; need: number; c3: number; orbit: number; refuel: boolean; prop?: number; mass?: number }) =>
    zh`可用 ${f(p.avail, 2)} km/s，需要 ${f(p.need, 2)} km/s（从 ${p.orbit} km 轨道出发，C3 ${f(p.c3, 1)} km²/s²）。${p.refuel ? `船上推进剂 ${f(p.prop ?? 0)} t，总质量 ${f(p.mass ?? 0)} t。` : '已合计上面级与航天器的推进剂。'}`,

  // ---------------------------------------------------------------- the cruise (sim/cruise.ts)
  'cr.tmi': '地火转移点火完成',
  'cr.tmi.d': (p: { c3: number; days: number; vinf: number }) => zh`C3 ${f(p.c3, 1)} km²/s²，转移飞行 ${f(p.days)} 天，到达 v∞ ${f(p.vinf, 2)} km/s`,
  'cr.earthSoi': '飞出地球影响球',
  'cr.earthSoi.d': '距地球约 92 万 km',
  'cr.lifeOut': '生命保障耗尽',
  'cr.lifeOut.d': (p: { sc: string; cap: number; days: number; short: number }) => zh`${p.sc}只能支持 ${p.cap} 天自由飞行，而转移需要 ${f(p.days)} 天——乘组在距抵达火星还有 ${f(p.short)} 天时罹难`,
  'cr.life': '生命保障',
  'cr.life.d': (p: { cap: number; days: number }) => zh`${p.cap} 天的保障能力足以覆盖 ${f(p.days)} 天的转移飞行`,
  'cr.consOut': '消耗品耗尽',
  'cr.consOut.d': (p: { t: number; days: number; crew: number; rate: number }) => zh`${f(p.t, 1)} t 消耗品按每人每天 ${f(p.rate, 1)} kg 计，只够 ${p.crew} 名乘员用 ${f(p.days)} 天`,
  'cr.half': '半程',
  'cr.half.d': (p: { margin: number; t: number; rate: number; water: number; o2: number }) => zh`消耗品余量 ${f(p.margin)} 天（携带 ${f(p.t, 1)} t，每人每天 ${f(p.rate, 1)} kg，水回收率 ${f(p.water)} %，O₂ 回收率 ${f(p.o2)} %）`,
  'cr.half.uncrewed': '无人——无需跟踪消耗品',
  'cr.rad': '辐射',
  'cr.rad.d': (p: { dose: number; shield: boolean }) => zh`去程至今累计 ${f(p.dose)} mSv（按 MSL RAD 实测速率 1.8 mSv/天${p.shield ? '，计入 15 % 屏蔽折减' : '，无专门屏蔽'}）；NASA 职业生涯限值 600 mSv——返程还会让剂量翻倍`,
  'cr.marsSoi': '进入火星影响球',
  'cr.marsSoi.d': (p: { v: number }) => zh`距火星约 58 万 km，以 ${f(p.v, 2)} km/s 的速度接近`,

  // ---------------------------------------------------------------- weather at Mars (sim/weather.ts, sim/mission.ts)
  'wx.event': '火星天气',
  'wx.event.d': (p: { ls: number; season: string; storm: string }) => zh`Ls ${f(p.ls)}°，${p.season}；${p.storm}`,
  /** tau: optical depth; density: % added at entry altitudes; wind: m/s */
  'wx.global': (p: { tau: number; density: number; wind: number }) => zh`全球性沙尘暴正在肆虐（τ ≈ ${p.tau}）：进入高度的大气密度增加约 ${f(p.density)} %，沙尘之下什么也看不见，地表风速约 ${f(p.wind)} m/s`,
  'wx.regional': (p: { tau: number; density: number; wind: number }) => zh`区域性沙尘暴（τ ≈ ${p.tau}）：进入高度的大气密度增加约 ${f(p.density)} %，能见度差，风速约 ${f(p.wind)} m/s`,
  'wx.clear': (p: { tau: number; wind: number }) => zh`晴朗（τ ≈ ${p.tau}），风速约 ${f(p.wind)} m/s`,
  'season.nSpring': '北半球春季',
  'season.nSummer': '北半球夏季',
  'season.sSpring': '南半球春季——沙尘暴季节',
  'season.sSummer': '南半球夏季——沙尘暴季节',
  'season.nSpring.short': '北半球春季',
  'season.nSummer.short': '北半球夏季',
  'season.sSpring.short': '南半球春季',
  'season.sSummer.short': '南半球夏季',

  // ---------------------------------------------------------------- entry, descent and landing (sim/entry.ts)
  'en.interface': '进入界面',
  /** fpa: flight-path angle, degrees (negative); beta: ballistic coefficient */
  'en.interface.d': (p: { alt: number; v: number; fpa: number; mass: number; beta: number }) => zh`${f(p.alt)} km，${f(p.v)} m/s，γ ${f(p.fpa, 1)}°，${f(p.mass, 1)} t，β ${f(p.beta)} kg/m²`,
  'en.touchdown': '触地',
  'en.touchdown.d': (p: { v: number; mass: number; prop: number }) => zh`${f(p.v, 1)} m/s，着陆质量 ${f(p.mass, 1)} t，剩余推进剂 ${f(p.prop, 1)} t`,
  /** the final vertical descent, analytic */
  'en.touchdownVert.d': (p: { h: number; mass: number; prop: number }) => zh`从 ${f(p.h)} m 高度垂直下降；着陆质量 ${f(p.mass, 1)} t，剩余推进剂 ${f(p.prop, 1)} t`,
  'en.impact': '撞击地面',
  'en.impact.d': (p: { v: number; landing: boolean }) => zh`以 ${f(p.v)} m/s 撞击地面${p.landing ? '（着陆点火未能使其停住）' : '——没有着陆推进系统'}`,
  'en.skip': '弹出大气层',
  'en.skip.d': (p: { v: number }) => zh`飞行器以 ${f(p.v)} m/s 飞离大气层——进入角太浅`,
  'en.pullout': '拉起',
  'en.pullout.d': (p: { alt: number; v: number }) => zh`在 ${f(p.alt)} km 高度、${f(p.v)} m/s 时止住下沉——滚转至升力朝下，以留在大气层内`,
  'en.tps': '超出防热罩极限',
  'en.tps.d': (p: { q: number; lim: number; tps: string; alt: number; v: number }) => zh`${f(p.q, 1)} W/cm² > ${f(p.lim)} W/cm²，${p.tps}；发生在 ${f(p.alt)} km、${f(p.v)} m/s`,
  'en.burn': '着陆点火',
  /** need/avail: thrust acceleration in Mars g; mars: the planet is Mars; landing: the engines used */
  'en.burn.d': (p: { alt: number; v: number; mach: number; sink: number; need: number; mars: boolean; avail: number; landing: string }) =>
    zh`${f(p.alt, 1)} km，${f(p.v)} m/s，马赫数 ${f(p.mach, 1)}，下沉速度 ${f(p.sink)} m/s；需要 ${f(p.need, 1)} g${p.mars ? '（按火星重力）' : ''}，可用 ${f(p.avail, 1)}；${p.landing}`,
  'en.tipped': '倾覆',
  'en.tipped.d': (p: { pct: number }) => zh`一条着陆腿压上了着陆系统没能看见的岩石——飞船侧翻（障碍概率 ${f(p.pct)} %）`,
  'en.propOut': '推进剂耗尽',
  'en.propOut.d': (p: { h: number; v: number }) => zh`距地面 ${f(p.h)} m——以 ${f(p.v)} m/s 坠落`,
  'en.propOutBurn': '点火途中推进剂耗尽',
  'en.propOutBurn.d': (p: { alt: number; v: number }) => zh`${f(p.alt, 2)} km，${f(p.v)} m/s——开始坠落`,
  'en.g': '超出乘组过载极限',
  'en.g.d': (p: { g: number; lim: number; alt: number }) => zh`持续 ${f(p.g, 1)} g > 体能下降乘组的 ${f(p.lim, 1)} g 极限，高度 ${f(p.alt)} km`,
  'en.peakHeat': '峰值热流',
  'en.peakHeat.d': (p: { q: number; alt: number; lim: number; tps: string; load: number }) => zh`${f(p.q)} W/cm²，高度 ${f(p.alt)} km；极限 ${f(p.lim)}，${p.tps}；累计热载荷 ${f(p.load)} J/cm²`,
  'en.peakG': '峰值减速过载',
  'en.peakG.d': (p: { g: number; alt: number; v: number }) => zh`${f(p.g, 1)} g，高度 ${f(p.alt)} km，${f(p.v)} m/s`,
  'en.mach2': '2 马赫',
  'en.mach2.d': (p: { alt: number; v: number; mass: number }) => zh`${f(p.alt, 1)} km，${f(p.v)} m/s——低于此速度，降落伞只能用于约 1 t 的载荷，而不是 ${f(p.mass)} t`,
  'en.reason.tps': '防热罩超出极限',
  'en.reason.skip': '弹出大气层',
  'en.reason.tipped': '着陆时倾覆',
  'en.reason.crashed': '坠毁',
  'en.reason.slow': '未能及时到达地面',

  // ---------------------------------------------------------------- on the surface, a crewed Starship (sim/mission.ts)
  'surf.hatch': '舱门开启',
  'surf.hatch.d': '舱内气压已与舱外的 0.6 kPa 平衡；乘员电梯展开',
  'surf.boots': '首次踏上火星',
  'surf.boots.d': (p: { n: number }) => zh`${p.n} 名乘员乘电梯下到地面；地面足够坚实`,
  'surf.flag': '插旗',
  'surf.flag.d': '旗帜插在距飞船 25 m 处，位于着陆腿的背风侧',
  'surf.habitat': '居住舱充气展开',
  'surf.habitat.d': '第一个充气式舱段立起，气闸舱已对接',
  'surf.power': '电力接通',
  'surf.power.d': '三张卷展式太阳能毯，晴空正午约 40 kW',
  'flyby': '飞掠火星',
  'flyby.d': (p: { sc: string; v: number }) => zh`${p.sc}没有进入系统；它以 ${f(p.v, 2)} km/s 掠过火星，继续留在日心轨道上`,

  // ---------------------------------------------------------------- the phases of the timeline (sim/mission.ts)
  'phase.launch': '发射',
  'phase.refuel': '在轨加注',
  'phase.parking': '停泊轨道',
  'phase.tmi': '地火转移点火',
  'phase.cruise': '飞往火星',
  'phase.edl': '进入、下降与着陆',
  'phase.surface': '在火星表面',
  'phase.lost': '消失在太空中',
  'phase.breakup': '解体',
  'phase.impact': '撞击地面',
  'phase.firstSteps': '第一步',
  'phase.flyby': '飞掠火星',

  // ---------------------------------------------------------------- the verdict's numbers (sim/mission.ts)
  'st.launch': '发射',
  'st.launch.v': (p: { rp: number; ra: number }) => zh`${f(p.rp)} × ${f(p.ra)} km`,
  'st.launch.fail': '失败',
  'st.launch.n': (p: { mass: number; t: number }) => zh`入轨质量 ${f(p.mass)} t，T+${f(p.t)} s`,
  'st.prop': '出发时推进剂',
  'st.prop.v': (p: { prop: number }) => zh`${f(p.prop)} t`,
  'st.prop.n': (p: { n: number; days: number; boil: number }) => zh`${p.n} 艘加注飞船，历时 ${f(p.days)} 天，蒸发 ${f(p.boil, 1)} t`,
  'st.dv': '前往火星的 Δv',
  'st.dv.v': (p: { avail: number; need: number }) => zh`${f(p.avail, 2)} / ${f(p.need, 2)} km/s`,
  'st.dv.n': (p: { c3: number; days: number }) => zh`可用 / 所需（C3 ${f(p.c3, 1)} km²/s²，${f(p.days)} 天）`,
  'st.life': '生命保障',
  /** the day the consumables ran out, of the trip's days */
  'st.life.lost': (p: { day: number; days: number }) => zh`${f(p.day)} / ${f(p.days)} 天`,
  'st.life.lost.n': '乘组途中罹难',
  'st.life.ok': '充足',
  'st.life.cap.n': (p: { days: number }) => zh`保障能力 ${p.days} 天`,
  'st.life.cons.n': (p: { t: number; crew: number }) => zh`${p.crew} 人的消耗品 ${f(p.t, 1)} t`,
  'st.rad': '辐射（去程）',
  'st.rad.v': (p: { dose: number }) => zh`${f(p.dose)} mSv`,
  'st.rad.n': 'NASA 职业生涯限值 600 mSv；返程翻倍',
  'st.entry': '进入速度',
  'st.entry.v': (p: { v: number }) => zh`${f(p.v, 2)} km/s`,
  'st.entry.n': (p: { beta: number; fpa: number; mass: number }) => zh`β ${f(p.beta)} kg/m²，γ ${p.fpa}°，${f(p.mass)} t`,
  'st.wx': '火星天气',
  'st.wx.global': '全球性沙尘暴',
  'st.wx.regional': '区域性沙尘暴',
  'st.wx.clear': '晴朗',
  'st.wx.n': (p: { ls: number; season: string; wind: number }) => zh`Ls ${f(p.ls)}°，${p.season}；风速 ${f(p.wind)} m/s`,
  'st.heat': '峰值热流',
  'st.heat.v': (p: { q: number }) => zh`${f(p.q)} W/cm²`,
  'st.heat.n': (p: { lim: number; tps: string; load: number }) => zh`极限 ${f(p.lim)}，${p.tps}；热载荷 ${f(p.load)} J/cm²`,
  'st.g': '峰值减速过载',
  'st.g.v': (p: { g: number }) => zh`${f(p.g, 1)} g`,
  'st.g.n': (p: { lim: number }) => zh`乘组极限 ${p.lim} g`,
  'st.landing': '着陆点火',
  'st.landing.v': (p: { dv: number }) => zh`${f(p.dv)} m/s`,
  'st.landing.n': (p: { prop: number }) => zh`推进剂 ${f(p.prop, 1)} t`,

  // ---------------------------------------------------------------- the verdict (sim/mission.ts); ship: the rocket's short name
  'v.noOrbit': (p: { ship: string }) => zh`${p.ship}未能入轨`,
  /** crew: 'abort' (a capsule with an abort system), 'noAbort' (Starship), 'none' (uncrewed) */
  'v.noOrbit.s': (p: { reason: string; crew: 'abort' | 'noAbort' | 'none' }) => zh`${p.reason}。${p.crew === 'abort' ? '太空舱配有发射逃逸系统——乘组可以逃生。' : p.crew === 'noAbort' ? '星舰没有发射逃逸系统。' : ''}`,
  'v.stuck': (p: { ship: string }) => zh`${p.ship}被困在地球轨道上`,
  /** the failing event's name and detail */
  'v.stuck.s': (p: { label: string; detail: string }) => zh`${p.label}。${p.detail}`,
  'v.stuck.none': '无法计算转移轨道。',
  'v.flyby': (p: { ship: string }) => zh`${p.ship}抵达火星——却与它擦肩而过`,
  'v.flyby.s': (p: { crewed: boolean }) => zh`船上没有进入或捕获系统。${p.crewed ? '' : '无人任务。'}`,
  'v.burned': (p: { ship: string }) => zh`${p.ship}在火星大气中烧毁`,
  /** tps: the heat shield's short name; alt/v where the limit was first crossed (absent if unknown) */
  'v.burned.s': (p: { q: number; lim: number; tps: string; alt?: number; v?: number }) =>
    zh`峰值热流 ${f(p.q)} W/cm²——超过了${p.tps}的额定值 ${f(p.lim)} W/cm²${p.alt != null && p.v != null ? `（首次超限发生在 ${f(p.alt)} km、${f(p.v)} m/s）` : ''}。`,
  'v.tipped': (p: { ship: string }) => zh`${p.ship}在火星着陆——却倾覆了`,
  /** detail: how it tipped */
  'v.tipped.s': (p: { detail: string }) => zh`${p.detail}。乘组很可能在倾倒中幸存；但飞船、居住舱以及返程的一切希望都保不住了。`,
  'v.skipped': (p: { ship: string }) => zh`${p.ship}从大气层弹跳而出`,
  'v.crashed': (p: { ship: string }) => zh`${p.ship}坠毁在火星上`,
  /** what: 'v.what.capsule' or 'v.what.ship'; impact: speed at the ground, m/s */
  'v.crashed.dry': (p: { alt: number; v: number; what: string; impact: number }) => zh`着陆发动机在 ${f(p.alt, 2)} km 高度、${f(p.v)} m/s 时耗尽推进剂；${p.what}以 ${f(p.impact)} m/s 撞击地面。`,
  'v.what.capsule': '太空舱',
  'v.what.ship': '飞船',
  'v.landed': (p: { ship: string }) => zh`${p.ship}在火星着陆，乘组生还`,
  'v.landedLost': (p: { ship: string; crewed: boolean }) => zh`${p.ship}在火星着陆——${p.crewed ? '乘组没能熬过旅途' : '无人任务'}`,
  'v.landed.s': (p: { v: number; dv: number; prop: number }) => zh`经过 ${f(p.dv)} m/s 的着陆点火（消耗 ${f(p.prop, 1)} t），以 ${f(p.v, 1)} m/s 触地。`,
  /** a landing whose crew died on the way: the summary, then the first failure */
  'v.firstFail': (p: { summary: string; label: string; detail: string }) => zh`${p.summary}首个失效：${p.label}——${p.detail}`,
}
