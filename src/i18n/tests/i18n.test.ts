/**
 * Every language says everything: the same keys as English (TypeScript checks the shapes; this
 * checks the contents), every message the simulation produces renders cleanly in every language
 * — from missions covering every outcome — and every interface template renders with any value.
 * Also: the English data catalog stays in step with the vehicle catalogue it mirrors.
 */
import { beforeAll, describe, expect, it } from 'vitest'
import { VEHICLES } from '../../data/vehicles'
import { runMission } from '../../sim/mission'
import { DEFAULT_CONFIG, PRESETS } from '../../sim/presets'
import { WINDOWS } from '../../sim/transfer'
import type { MissionConfig, MissionResult } from '../../sim/types'
import { DATA as EN_DATA } from '../en/data'
import { SIM as EN_SIM } from '../en/sim'
import { ALL_LANGS as LANGS, EN, loadBundle, type Bundle, type Lang } from '../index'
import { langFromPath, langPath } from '../langs'
import type { Text } from '../msg'

const BAD = /undefined|NaN|\[object Object\]|Infinity/

/** missions that between them reach every outcome and most events */
const MISSIONS: Array<Partial<MissionConfig>> = [
  {},
  { vehicleId: 'starship-v3', departure: WINDOWS[2].departure, transitDays: WINDOWS[2].transitDays }, // burns up
  { vehicleId: 'starship-v3', ...PRESETS[2].patch }, // stuck in orbit, window missed
  { vehicleId: 'starship-v3', tankers: 0 }, // not enough Δv
  { vehicleId: 'starship-v3', cargo: 600_000 }, // never makes orbit
  { vehicleId: 'starship-v3', dustStorm: 'global', departure: WINDOWS[0].departure, transitDays: WINDOWS[0].transitDays },
  { vehicleId: 'starship-v3', entryFpaDeg: -6 }, // skips out
  { vehicleId: 'starship-v3', crew: 0 },
  { vehicleId: 'starship-v3', tankers: 20, tankerCadenceDays: 12, propPerTanker: 60_000 }, // campaign longer than the window
  { vehicleId: 'sls-orion' },
  { vehicleId: 'sls-orion', parkingOrbitKm: 1200 }, // circularisation burn
  { vehicleId: 'sls-orion', parkingOrbitKm: 3000 }, // timed out
  { vehicleId: 'falcon-heavy-dragon' },
  { vehicleId: 'falcon-heavy-dragon', dustStorm: 'regional' },
  { vehicleId: 'new-glenn' }, // flyby
  { vehicleId: 'new-glenn', parkingOrbitKm: 4000 }, // propellant out before orbit
  { vehicleId: 'long-march-10' },
  { vehicleId: 'saturn-v-apollo' },
  { vehicleId: 'saturn-v-apollo', parkingOrbitKm: 2500 }, // escape: apoapsis ∞
]

/** every message in a result */
function texts(r: MissionResult): Text[] {
  const out: Text[] = []
  for (const e of r.events) out.push(e.msg?.label ?? e.label, e.msg?.detail ?? e.detail)
  for (const p of r.phases) out.push(p.msg ?? p.label)
  out.push(r.verdict.msg?.headline ?? r.verdict.headline, r.verdict.msg?.summary ?? r.verdict.summary)
  for (const s of r.verdict.stats) out.push(s.msg?.label ?? s.label, s.msg?.value ?? s.value, ...(s.msg?.note ? [s.msg.note] : []))
  return out
}

/** a value that passes for any parameter: a string (with every string method) that is also the number 7 */
function anyValue(): unknown {
  return Object.assign(new String('7'), { valueOf: () => 7, toFixed: (d: number) => (7).toFixed(d) })
}
const anyParams = new Proxy({}, { get: (_t, k) => (k === 'crew' ? 'none' : anyValue()) })

/** every leaf of a catalog: [path, value] */
function leaves(obj: unknown, path = ''): Array<[string, unknown]> {
  if (typeof obj === 'string' || typeof obj === 'function') return [[path, obj]]
  if (Array.isArray(obj)) return obj.flatMap((v, i) => leaves(v, `${path}[${i}]`))
  if (obj && typeof obj === 'object') return Object.entries(obj).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return [[path, obj]]
}

/** every key path of a catalog, arrays as one entry */
function shape(obj: unknown, path = ''): string[] {
  if (Array.isArray(obj) || typeof obj !== 'object' || obj === null) return [path]
  return Object.entries(obj).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k))
}

// each language loads in its own tests, so one broken catalog fails only its own language
const bundles = new Map<Lang, Promise<Bundle>>()
const bundle = (lang: Lang) => {
  if (!bundles.has(lang)) bundles.set(lang, loadBundle(lang))
  return bundles.get(lang)!
}
let results: MissionResult[] = []

beforeAll(async () => {
  results = MISSIONS.map((o) => {
    const cfg = { ...DEFAULT_CONFIG, ...o }
    return runMission(VEHICLES.find((v) => v.id === cfg.vehicleId)!, cfg)
  })
}, 120_000)

describe('the English data catalog mirrors the vehicle catalogue', () => {
  it('vehicles, stages, engines, presets and windows', () => {
    const vs = EN_DATA.vehicles as unknown as Record<string, Record<string, unknown> & { stages: Record<string, string>; engines: Record<string, string[]> }>
    expect(Object.keys(vs)).toEqual(VEHICLES.map((v) => v.id))
    for (const v of VEHICLES) {
      const d = vs[v.id]
      expect(d.name).toBe(v.name)
      expect(d.short).toBe(v.short)
      expect(d.badge).toBe(v.badge)
      expect(d.tagline).toBe(v.tagline)
      expect(d.description).toBe(v.description)
      expect(d.record).toBe(v.record)
      expect(d.confidence).toBe(v.confidence)
      expect(d.site).toBe(v.launchSite.name)
      expect(d.spacecraft).toBe(v.spacecraft.name)
      expect(d.tps).toBe(v.spacecraft.entry?.tpsName ?? '')
      expect(d.tpsShort === '').toBe(!v.spacecraft.entry)
      expect(d.landing).toBe(v.spacecraft.landing?.label ?? '')
      expect(Object.keys(d.stages)).toEqual(v.stages.map((s) => s.id))
      for (const s of v.stages) {
        expect(d.stages[s.id]).toBe(s.name)
        expect(d.engines[s.id]).toEqual(s.engines.map((e) => e.label))
      }
    }
    const ps = EN_DATA.presets as unknown as Record<string, { name: string; blurb: string }>
    expect(Object.keys(ps)).toEqual(PRESETS.map((p) => p.id))
    for (const p of PRESETS) expect(ps[p.id]).toEqual({ name: p.name, blurb: p.blurb })
    const ws = EN_DATA.windows as unknown as Record<string, { label: string; note: string }>
    expect(Object.keys(ws)).toEqual(WINDOWS.map((w) => w.id))
    for (const w of WINDOWS) expect(ws[w.id]).toEqual({ label: w.label, note: w.note })
  })
})

describe('the simulation renders its own English', () => {
  it('every message equals the English text stored with it', () => {
    for (const r of results) {
      for (const e of r.events) {
        expect(EN.t(e.msg!.label)).toBe(e.label)
        expect(EN.t(e.msg!.detail)).toBe(e.detail)
      }
      expect(EN.t(r.verdict.msg!.headline)).toBe(r.verdict.headline)
      expect(EN.t(r.verdict.msg!.summary)).toBe(r.verdict.summary)
    }
  })
  it('the test missions reach every outcome', () => {
    const outcomes = new Set(results.map((r) => r.verdict.outcome))
    for (const o of ['landed', 'burned-up', 'crashed', 'failed-tmi', 'failed-launch', 'flyby']) expect(outcomes).toContain(o)
  })
})

describe('every language has its own address', () => {
  it('/tr/ is Turkish, / is none, and each address names its language', () => {
    expect(langFromPath('/')).toBeNull()
    expect(langFromPath('/index.html')).toBeNull()
    expect(langFromPath('/xx/')).toBeNull()
    expect(langFromPath('/tr')).toBe('tr')
    expect(langFromPath('/zh/index.html')).toBe('zh')
    for (const l of LANGS) expect(langFromPath(langPath(l.id))).toBe(l.id)
  })
})

describe.each(LANGS.map((l) => l.id))('%s', (lang) => {
  it('has the same catalogs as English', async () => {
    const L = await bundle(lang)
    expect(shape(L.ui)).toEqual(shape(EN.ui))
    expect(Object.keys(L.sim)).toEqual(Object.keys(EN_SIM))
    for (const k of Object.keys(EN_SIM) as Array<keyof typeof EN_SIM>) expect(typeof L.sim[k], k).toBe(typeof EN_SIM[k])
    expect(shape(L.data)).toEqual(shape(EN.data))
    const vs = L.data.vehicles as unknown as Record<string, { engines: Record<string, string[]> }>
    const ev = EN.data.vehicles as unknown as Record<string, { engines: Record<string, string[]> }>
    for (const id of Object.keys(ev)) for (const s of Object.keys(ev[id].engines)) expect(vs[id].engines[s].length, `${id}.${s}`).toBe(ev[id].engines[s].length)
    expect(Object.keys(L.wiki)).toEqual(Object.keys(EN.wiki))
    for (const [id, c] of Object.entries(L.wiki)) {
      expect(c.title.trim(), id).not.toBe('')
      expect(c.lead.trim(), id).not.toBe('')
      expect(c.body.length, id).toBeGreaterThan(0)
    }
  })

  it('renders every message of the test missions', async () => {
    const L = await bundle(lang)
    for (const r of results)
      for (const x of texts(r)) {
        const s = L.t(x)
        expect(s, JSON.stringify(x)).not.toMatch(BAD)
        if (typeof x === 'object' && 'k' in x) expect(s, x.k).not.toBe(x.k)
      }
  })

  it('renders every simulation template with any value', async () => {
    const L = await bundle(lang)
    for (const [k, tpl] of Object.entries(L.sim)) {
      const s = typeof tpl === 'function' ? (tpl as (p: unknown) => string)(anyParams) : tpl
      expect(typeof s, k).toBe('string')
      expect(s.trim(), k).not.toBe('')
      expect(s, k).not.toMatch(/undefined|\[object Object\]/)
    }
  })

  it('renders every interface template with any value', async () => {
    const L = await bundle(lang)
    for (const [path, v] of leaves(L.ui)) {
      const s = typeof v === 'function' ? (v as (p: unknown) => string)(anyParams) : v
      expect(typeof s, path).toBe('string')
      expect((s as string).trim(), path).not.toBe('')
      expect(s, path).not.toMatch(/undefined|\[object Object\]/)
    }
  })
})
