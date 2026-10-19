/**
 * Drives the music: through a Starship mission that ends well (the verdict card's ok — the physics
 * runs before the countdown), it tells the player a few times a second whether the mission is
 * running (the countdown, from its first number; or playing) and where the track should be —
 * the time since the countdown's 5, then musicClock(t) — and how closely to keep it there: at the
 * start speed the track is held to the mission (which keeps real time while it plays), at another
 * it runs on by itself, and when the mission jumps (a seek, a restart) it follows at once.
 */
import { useEffect } from 'react'
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
  useEffect(() => {
    // the map from mission time to the track, for the mission it was built for: built on the first
    // look (during the countdown, which has the time to spare, or at once for a mission opened by
    // its link)
    let clockFor: MissionResult | null = null
    let clock: ((t: number) => number) | null = null
    let last: { target: number; wall: number; running: boolean } | null = null
    const tick = () => {
      const s = useAppStore.getState()
      const now = performance.now() / 1000
      // a Starship countdown still waiting for the physics: a primed track waits with it, silent
      const armed = s.intro === 'countdown' && s.countdownAt === null && s.config.vehicleId === MUSIC_VEHICLE
      // (the store as it is now: a launch of another ship changes the ship a moment after the intro)
      if (!s.result || !hasMusic(s.result, s.config.vehicleId) || (s.intro !== null && s.intro !== 'countdown')) {
        last = null
        music.drive(false, 0, 'free', armed)
        return
      }
      if (clockFor !== s.result) {
        clockFor = s.result
        clock = null
      }
      clock ??= musicClock(s.result)
      let running: boolean
      let target: number
      if (s.intro === 'countdown') {
        // from the countdown's first number (it waits for the physics; Intro keeps to the same instant)
        running = s.countdownAt !== null
        target = running ? now - s.countdownAt! / 1000 : 0
      } else {
        running = s.playing
        target = clock(s.t)
      }
      const jumped = !!last && Math.abs(target - last.target - (last.running && running ? now - last.wall : 0)) > JUMP_S
      last = { target, wall: now, running }
      music.drive(running, target, jumped ? 'jump' : s.speed === SPEED ? 'hold' : 'free', armed)
    }
    tick()
    const id = window.setInterval(tick, 250)
    // at once on a start, a pause, the countdown, a new result, a change of speed (after the current
    // update has finished: a launch sets the countdown and the ship one after the other)
    const unsub = useAppStore.subscribe((s, p) => {
      if (
        s.intro !== p.intro ||
        s.countdownAt !== p.countdownAt ||
        s.playing !== p.playing ||
        s.status !== p.status ||
        s.result !== p.result ||
        s.speed !== p.speed ||
        s.config.vehicleId !== p.config.vehicleId
      )
        queueMicrotask(tick)
    })
    return () => {
      window.clearInterval(id)
      unsub()
      music.drive(false, 0, 'free')
    }
  }, [])
  return null
}
