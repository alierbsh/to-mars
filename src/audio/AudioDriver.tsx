/**
 * Drives the sound from the mission state every frame (inside the Canvas, so the camera's
 * distance from the vehicle is known): engine start through the countdown's last seconds, the
 * roar at liftoff thinning with the air and the distance, the rush of max-Q, silence in space,
 * plasma at entry, the muffled landing burn, the thud or boom at the end.
 */
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { VEHICLES } from '../data/vehicles'
import { plumeKindFor } from '../scene/Plume'
import { phaseAt, useAppStore } from '../state/store'
import { ascentAt, burningAt, entryAt } from '../ui/hud'
import { brightnessFor, sound } from './sound'

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

export function AudioDriver() {
  const lastPhase = useRef<string | null>(null)
  useFrame(({ camera }, dt) => {
    const { result, t, playing, intro, countdown } = useAppStore.getState()
    const vehicle = VEHICLES.find((v) => v.id === useAppStore.getState().config.vehicleId)!
    let roar = 0
    let crackle = 0
    let bright = 0.3
    let open = 1
    let hiss = 0
    let rush = 0
    if (intro === 'countdown') {
      // engine start: the roar builds through the last two seconds
      const k = countdown <= 2 ? 0.55 - 0.15 * countdown : 0
      roar = k
      crackle = k * 0.8
      bright = brightnessFor(plumeKindFor(vehicle.stages[0].engines[0].label))
    } else if (result && !intro && playing) {
      const phase = phaseAt(result, t)
      const dist = camera.position.length()
      const near = clamp01(260 / Math.max(dist, 1)) * 0.7 + 0.3
      if (phase.phase === 'ascent') {
        const s = ascentAt(result, t)
        if (s) {
          const firing = [...burningAt(result, vehicle, t)]
          const first = vehicle.stages.find((st) => firing.includes(st.id)) ?? vehicle.stages[0]
          const liftoffThrust = vehicle.stages.filter((st) => st.role !== 'upper').reduce((a, st) => a + (st.count ?? 1) * st.engines.reduce((b, e) => b + e.count * e.thrustVac * 0.9, 0), 0)
          const frac = clamp01(s.thrust / Math.max(liftoffThrust, 1))
          const air = Math.exp(-s.alt / 9000)
          roar = frac * air * near
          crackle = roar * (first.role === 'upper' ? 0.2 : 1) * clamp01(1 - s.alt / 12_000)
          bright = brightnessFor(plumeKindFor(first.engines[0].label))
          rush = clamp01(s.q / 30_000) * air * 0.8
        }
      } else if (phase.phase === 'entry' || phase.phase === 'landing' || phase.phase === 'done') {
        const e = entryAt(result, t)
        if (e) {
          hiss = clamp01(e.heatFlux / 35)
          rush = clamp01(e.q / 9000) * 0.6
          if (e.burning) {
            roar = 0.55 * near
            crackle = 0.25
            open = 0.3 // thin air: muffled
            bright = brightnessFor(plumeKindFor(vehicle.spacecraft.landing?.label ?? 'Raptor'))
          }
        }
        if (lastPhase.current === 'entry' && phase.phase !== 'entry') {
          const crashed = result.verdict.outcome === 'crashed'
          sound.thud(crashed ? 2 : 1, crashed)
        }
      }
      lastPhase.current = phase.phase
    }
    sound.update({ roar, crackle, bright, open, hiss, rush }, Math.min(dt, 0.1))
  })
  return null
}
