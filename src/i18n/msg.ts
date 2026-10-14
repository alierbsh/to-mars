/**
 * Messages: what the simulation says, as a key into a language's catalog plus the values to fill
 * in. The simulation builds them and renders each once in English (its own labels, the tests, the
 * scripts); the interface renders them again in the reader's language. A parameter can itself be
 * a message, or a reference to one of a vehicle's texts (a stage's name, the heat shield, the
 * landing engines) that comes from the language's data catalog.
 *
 * Pure TypeScript: used by the simulation worker and Node scripts.
 */
export type Param = string | number | boolean | null | undefined | Msg
export type Params = { [name: string]: Param }

/** a catalog message: key and parameters */
export interface KeyMsg {
  k: string
  p?: Params
}

/** the texts of a vehicle a message can refer to */
export type VehicleField = 'name' | 'short' | 'spacecraft' | 'tps' | 'tpsShort' | 'landing' | 'site'

/** a vehicle's text by reference: `f` of vehicle `v`, or the name of its stage `s` */
export interface RefMsg {
  v: string
  f: VehicleField | 'stage'
  s?: string
}

export type Msg = KeyMsg | RefMsg

/** a message, or text that needs no translation (a number, a name, English from an older result) */
export type Text = Msg | string

export function isMsg(x: unknown): x is Msg {
  return typeof x === 'object' && x !== null && ('k' in x || 'v' in x)
}

/** a reference to a vehicle's text; the English text itself when the vehicle is not known (a bare entry model in a test) */
export function vref(vehicleId: string | undefined, f: VehicleField, english: string): RefMsg | string {
  return vehicleId ? { v: vehicleId, f } : english
}

/** a reference to a stage's name */
export function sref(vehicleId: string, stageId: string): RefMsg {
  return { v: vehicleId, f: 'stage', s: stageId }
}
