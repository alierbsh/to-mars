/**
 * Tells the music when to play: through a Starship mission that ends well (the verdict card's
 * ok — the physics has run before the countdown, so the track can open with it), from the
 * countdown on and while the mission plays; a new countdown starts the track from the top.
 */
import { useEffect, useRef } from 'react'
import { VEHICLES } from '../data/vehicles'
import type { MissionResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { verdictTone } from '../ui/hud'
import { music } from './music'

/** the one rocket with a soundtrack */
export const MUSIC_VEHICLE = 'starship-v3'

/** the mission on screen has music: Starship, landed with its crew alive (a result still being
 * computed for another ship does not count) */
export function hasMusic(result: MissionResult | null, vehicleId: string): boolean {
  if (!result || result.vehicleId !== vehicleId || vehicleId !== MUSIC_VEHICLE) return false
  return verdictTone(result, VEHICLES.find((v) => v.id === vehicleId)!) === 'ok'
}

export function useHasMusic(): boolean {
  const result = useAppStore((s) => s.result)
  const vehicleId = useAppStore((s) => s.config.vehicleId)
  return hasMusic(result, vehicleId)
}

export function MusicDriver() {
  const has = useHasMusic()
  const intro = useAppStore((s) => s.intro)
  const playing = useAppStore((s) => s.playing)
  const launches = useRef(0)
  useEffect(() => {
    if (intro === 'countdown') launches.current++
  }, [intro])
  const wanted = has && (intro === 'countdown' || (!intro && playing))
  useEffect(() => music.set(wanted, String(launches.current)), [wanted, intro])
  return null
}
