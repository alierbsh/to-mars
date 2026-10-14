/**
 * The vehicles', assumption sets' and windows' words in the reader's language (src/i18n/<lang>/data.ts),
 * English where a language has no entry.
 */
import { EN, type Bundle } from '../i18n'

export interface VehicleTexts {
  name: string
  short: string
  badge: string
  tagline: string
  description: string
  record: string
  confidence: string
  site: string
  spacecraft: string
  tps: string
  tpsShort: string
  landing: string
  stages: Record<string, string>
  engines: Record<string, string[]>
}

export function vehicleTexts(id: string, L: Bundle): VehicleTexts {
  const all = (b: Bundle) => b.data.vehicles as unknown as Record<string, VehicleTexts | undefined>
  return all(L)[id] ?? all(EN)[id]!
}

export function presetTexts(id: string, L: Bundle): { name: string; blurb: string } {
  const all = (b: Bundle) => b.data.presets as unknown as Record<string, { name: string; blurb: string } | undefined>
  return all(L)[id] ?? all(EN)[id] ?? { name: id, blurb: '' }
}

export function windowTexts(id: string, L: Bundle): { label: string; note: string } {
  const all = (b: Bundle) => b.data.windows as unknown as Record<string, { label: string; note: string } | undefined>
  return all(L)[id] ?? all(EN)[id] ?? { label: id, note: '' }
}
