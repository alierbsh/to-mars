/**
 * The simulation's words: events and stats are built from messages (src/i18n/en/sim.ts) and
 * carry both the English text and the message, so the interface can say them in any language.
 */
import type { Text } from '../i18n/msg'
import { en } from '../i18n/render'
import type { Phase, Severity, SimEvent, VerdictStat } from './types'

export { m as tx, en } from '../i18n/render'
export { sref, vref } from '../i18n/msg'

export function event(t: number, phase: Phase, label: Text, detail: Text, severity: Severity): SimEvent {
  return { t, phase, label: en(label), detail: en(detail), severity, msg: { label, detail } }
}

export function stat(label: Text, value: Text, note: Text | undefined, severity: Severity): VerdictStat {
  const out: VerdictStat = { label: en(label), value: en(value), severity, msg: note ? { label, value, note } : { label, value } }
  if (note) out.note = en(note)
  return out
}
