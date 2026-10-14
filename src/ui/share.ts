/**
 * Sharing a mission: the settings that differ from the defaults go into the link as
 * `?mission=<base64url JSON>`; opening such a link lands on the ship choice with that mission
 * ready to launch. The phone's share sheet when there is one, the clipboard otherwise.
 */
import { VEHICLES } from '../data/vehicles'
import { DEFAULT_CONFIG, PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import type { MissionConfig, MissionResult } from '../sim/types'

const KEY = 'mission'

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** the settings that differ from the defaults */
export function encodeMission(cfg: MissionConfig): string {
  const diff: Record<string, unknown> = {}
  const def = DEFAULT_CONFIG as unknown as Record<string, unknown>
  for (const [k, v] of Object.entries(cfg)) if (def[k] !== v) diff[k] = v
  return toBase64Url(JSON.stringify(diff))
}

/** a shared mission from the link, validated key by key against the defaults; null if absent or unreadable */
export function decodeMission(param: string | null): MissionConfig | null {
  if (!param) return null
  try {
    const raw = JSON.parse(fromBase64Url(param)) as Record<string, unknown>
    const out = { ...DEFAULT_CONFIG } as unknown as Record<string, unknown>
    const def = DEFAULT_CONFIG as unknown as Record<string, unknown>
    for (const [k, v] of Object.entries(raw)) {
      if (!(k in def) || typeof v !== typeof def[k]) continue
      if (typeof v === 'number' && !Number.isFinite(v)) continue
      out[k] = v
    }
    const cfg = out as unknown as MissionConfig
    if (!VEHICLES.some((v) => v.id === cfg.vehicleId)) cfg.vehicleId = DEFAULT_CONFIG.vehicleId
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cfg.departure)) cfg.departure = DEFAULT_CONFIG.departure
    return cfg
  } catch {
    return null
  }
}

/** the shared mission in this page's link, if any */
export function missionFromLocation(): MissionConfig | null {
  if (typeof location === 'undefined') return null
  return decodeMission(new URLSearchParams(location.search).get(KEY))
}

export function missionUrl(cfg: MissionConfig): string {
  return `${location.origin}${location.pathname}?${KEY}=${encodeMission(cfg)}`
}

/** a one-line description of a mission: window · assumptions · crew */
export function describeMission(cfg: MissionConfig): string {
  const vehicle = VEHICLES.find((v) => v.id === cfg.vehicleId)
  const win = WINDOWS.find((w) => w.departure === cfg.departure && w.transitDays === cfg.transitDays)
  const preset = PRESETS.find((p) => Object.entries(p.patch).every(([k, v]) => (cfg as unknown as Record<string, unknown>)[k] === v))
  const parts = [vehicle?.short ?? cfg.vehicleId, win ? `${win.label} window` : `departing ${cfg.departure}`]
  if (vehicle?.refuelable) parts.push(preset ? preset.name : 'custom assumptions')
  if (vehicle && vehicle.spacecraft.crewCapacity > 0) parts.push(`crew of ${Math.min(cfg.crew, vehicle.spacecraft.crewCapacity)}`)
  return parts.join(' · ')
}

export type ShareOutcome = 'shared' | 'copied' | 'failed' | 'cancelled'

/** the share sheet where there is one, else the clipboard */
export async function shareMission(cfg: MissionConfig, result: MissionResult | null): Promise<{ outcome: ShareOutcome; url: string }> {
  const url = missionUrl(cfg)
  const text = result ? `${result.verdict.headline}. ${describeMission(cfg)}. Can today's rockets carry a crew to Mars?` : `${describeMission(cfg)}. Can today's rockets carry a crew to Mars?`
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void>; canShare?: (d: ShareData) => boolean }
  // the share sheet on touch devices; on a desktop browser the clipboard is the expected thing
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
  if (touch && nav.share) {
    try {
      await nav.share({ title: 'Occupy Mars Simulation', text, url })
      return { outcome: 'shared', url }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return { outcome: 'cancelled', url }
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return { outcome: 'copied', url }
  } catch {
    return { outcome: 'failed', url }
  }
}
