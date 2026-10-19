/**
 * Drives the music: through a Starship mission that ends well (the verdict card's ok — the physics
 * runs before the countdown), it tells the player a few times a second whether the mission is
 * running (the countdown, from its first number; or playing) and where the track should be —
 * the time since the countdown's 5, then musicClock(t) — and whether to hold it there: at the
 * start speed the track keeps to the mission, at another it runs on by itself, except when the
 * mission jumps (a seek, a restart).
 */
import { useEffect, useRef } from 'react'
import { VEHICLES } from '../data/vehicles'
import type { MissionResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { verdictTone } from '../ui/hud'
import { SPEED } from '../ui/launch'
import { music } from './music'
import { musicClock } from './musicClock'

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

/** a change in the track's place this much beyond the time that passed is a jump, s */
const JUMP_S = 2

export function MusicDriver() {
  const has = useHasMusic()
  const result = useAppStore((s) => s.result)
  // when the countdown's 5 appeared (the countdown waits for the physics to finish)
  const countdownAt = useRef<number | null>(null)
  useEffect(() => {
    if (!has || !result) {
      music.drive(false, 0, false)
      return
    }
    // the map from mission time to the track: built on the first look (during the countdown,
    // which has the time to spare, or at once for a mission opened by its link)
    let clock: ((t: number) => number) | null = null
    let last: { target: number; wall: number; running: boolean } | null = null
    const tick = () => {
      const s = useAppStore.getState()
      const now = performance.now() / 1000
      let running = false
      let target = 0
      if (s.intro === 'countdown') {
        clock ??= musicClock(result)
        if (countdownAt.current === null && s.status === 'done') countdownAt.current = now
        running = countdownAt.current !== null
        target = running ? now - countdownAt.current! : 0
      } else {
        countdownAt.current = null
        if (!s.intro) {
          clock ??= musicClock(result)
          running = s.playing
          target = clock(s.t)
        }
      }
      const jumped = !!last && Math.abs(target - last.target - (last.running && running ? now - last.wall : 0)) > JUMP_S
      last = { target, wall: now, running }
      music.drive(running, target, s.speed === SPEED || jumped)
    }
    tick()
    const id = window.setInterval(tick, 250)
    // at once on a start, a pause, the countdown, a change of speed
    const unsub = useAppStore.subscribe((s, p) => {
      if (s.intro !== p.intro || s.playing !== p.playing || s.status !== p.status || s.speed !== p.speed) tick()
    })
    return () => {
      window.clearInterval(id)
      unsub()
      music.drive(false, 0, false)
    }
  }, [has, result])
  return null
}
