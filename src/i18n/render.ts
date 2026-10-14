/**
 * Rendering messages in a language: the template under the message's key, its parameters
 * rendered first (nested messages, vehicle texts), English where a language lacks a key.
 * Pure TypeScript: the simulation uses `en()` for its English text.
 */
import { DATA as EN_DATA } from './en/data'
import { SIM as EN_SIM } from './en/sim'
import { isMsg, type Msg, type Params, type RefMsg, type Text } from './msg'
import { numbers, type Num } from './numbers'

export type SimCatalog = typeof EN_SIM
export type SimKey = keyof SimCatalog
export type DataCatalog = typeof EN_DATA

/** what rendering a message needs: the language's simulation catalog, its data texts, its numbers */
export interface SimBundle {
  lang: string
  n: Num
  sim: SimCatalog
  data: DataCatalog
}

export const EN_SIM_BUNDLE: SimBundle = { lang: 'en', n: numbers('en'), sim: EN_SIM, data: EN_DATA }

/** a vehicle's texts, looked up by id */
interface VehicleTextsAny {
  [field: string]: unknown
  stages: Record<string, string>
}

function vehicleText(d: DataCatalog, r: RefMsg): string | undefined {
  const vt = (d.vehicles as unknown as Record<string, VehicleTextsAny | undefined>)[r.v]
  if (!vt) return undefined
  const s = r.f === 'stage' ? vt.stages[r.s ?? ''] : vt[r.f]
  return typeof s === 'string' ? s : undefined
}

type Template = string | ((p: Record<string, unknown>) => string)

/** a message (or plain text) in the bundle's language */
export function render(x: Text | null | undefined, L: SimBundle): string {
  if (x == null) return ''
  if (typeof x === 'string') return x
  if ('v' in x) return vehicleText(L.data, x) ?? vehicleText(EN_DATA, x) ?? x.v
  const t = ((L.sim as unknown as Record<string, Template | undefined>)[x.k] ?? (EN_SIM as unknown as Record<string, Template | undefined>)[x.k]) as Template | undefined
  if (t === undefined) return x.k
  if (typeof t === 'string') return t
  const p: Record<string, unknown> = {}
  if (x.p) for (const [k, v] of Object.entries(x.p)) p[k] = isMsg(v) ? render(v, L) : v
  return t(p)
}

/** a message in English: the simulation's own text */
export function en(x: Text | null | undefined): string {
  return render(x, EN_SIM_BUNDLE)
}

// ---------------------------------------------------------------- typed message builders for the simulation

/** the parameters a template takes, as the simulation passes them: text may be a message to render */
type In<T> = { [K in keyof T]: T[K] extends string ? string | Msg : T[K] extends string | undefined ? string | Msg | undefined : T[K] }
type ParamsOf<K extends SimKey> = SimCatalog[K] extends (p: infer P) => string ? In<P> : never

/** a message: `m('asc.mach1.d', { alt, t })` — keys and parameters checked against the English catalog */
export function m<K extends SimKey>(k: K, ...p: SimCatalog[K] extends string ? [] : [ParamsOf<K>]): Msg {
  return p.length ? { k, p: p[0] as Params } : { k }
}
