/**
 * Where the music stands at a mission time. The track was made on the default flight as it plays:
 * from the countdown's 5, at the start speed — its swells fall on Mach 1 and the stage separation,
 * and its 4:48 end within a second of the touchdown. So its position at mission time t is the real
 * time that playback (clockStep at SPEED) takes to bring the clock from liftoff to t, plus the
 * countdown — whatever speed the viewer has chosen since, and wherever they have jumped to.
 */
import type { MissionResult } from '../sim/types'
import { clockStep, momentsAt } from '../ui/hud'
import { COUNTDOWN_S, SPEED } from '../ui/launch'

/** the map's real-time step, s */
const STEP = 1 / 30

/** the music's position (s into the track) at each mission time t ≥ 0 of this mission */
export function musicClock(r: MissionResult): (t: number) => number {
  const moments = momentsAt(r)
  const end = r.phases[r.phases.length - 1].end
  // the mission time after each step of real time
  const ts = [0]
  for (let t = 0; t < end && ts.length < 200_000; ) {
    t = Math.min(end, clockStep(r, moments, t, STEP, SPEED))
    ts.push(t)
  }
  return (t: number) => {
    if (t <= 0) return COUNTDOWN_S
    if (t >= ts[ts.length - 1]) return COUNTDOWN_S + (ts.length - 1) * STEP
    let lo = 0
    let hi = ts.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (ts[mid] <= t) lo = mid
      else hi = mid
    }
    const span = ts[hi] - ts[lo]
    return COUNTDOWN_S + (lo + (span > 0 ? (t - ts[lo]) / span : 0)) * STEP
  }
}
