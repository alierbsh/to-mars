/**
 * The wiki's chapters in reading order, and the timeline marks that open each one. The texts are
 * per language (src/i18n/<lang>/wiki.ts, keyed by these ids): every stage of the mission
 * explained for someone who has never followed a launch, with the numbers the simulation uses.
 */
import type { MarkKey, WikiCatalog } from '../i18n'

export type ChapterId = keyof WikiCatalog

export interface Chapter {
  id: ChapterId
  /** timeline marks that open this chapter */
  marks?: MarkKey[]
}

export const CHAPTERS: Chapter[] = [
  { id: 'why' },
  { id: 'musk' },
  { id: 'rockets' },
  { id: 'liftoff', marks: ['liftoff', 'maxq', 'mach1'] },
  { id: 'staging', marks: ['stageSep', 'ignition', 'seco', 'fairing', 'circ'] },
  { id: 'refuelling', marks: ['orbit', 'tanker', 'fuelled', 'windowMissed'] },
  { id: 'window' },
  { id: 'tmi', marks: ['tmiBurn', 'tmi'] },
  { id: 'cruise', marks: ['earthSoi', 'halfway', 'radiation', 'marsSoi', 'flyby'] },
  { id: 'entry', marks: ['entry', 'peakHeat', 'peakG', 'pullout'] },
  { id: 'landing', marks: ['landingBurn'] },
  { id: 'verdict', marks: ['touchdown', 'impact', 'propOut', 'lifeSupport'] },
  { id: 'weather' },
  { id: 'unknowns' },
  { id: 'models' },
]

/** the chapter a timeline mark opens, if any */
export function chapterForMark(key: MarkKey): Chapter | undefined {
  return CHAPTERS.find((c) => c.marks?.includes(key))
}
