/// <reference lib="webworker" />
/**
 * Simulation worker: runs the whole mission off the main thread.
 */
import { vehicleById } from '../data/vehicles'
import { runMission } from './mission'
import { computeTransfer } from './transfer'
import type { MissionConfig, MissionResult } from './types'

export type WorkerRequest =
  | { type: 'run'; id: number; config: MissionConfig }
  | { type: 'porkchop'; id: number; departure: string; spanDays: number; tofMin: number; tofMax: number; parkingAltKm: number }

export type WorkerResponse =
  | { type: 'result'; id: number; result: MissionResult }
  | { type: 'porkchop'; id: number; grid: PorkchopGrid }
  | { type: 'error'; id: number; message: string }

export interface PorkchopGrid {
  departure0: string
  depStepDays: number
  depCount: number
  tofMin: number
  tofStep: number
  tofCount: number
  /** row-major [dep][tof]: departure C3 km²/s² (NaN when unconverged) */
  c3: number[]
  /** arrival v∞ km/s */
  vInf: number[]
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data
  try {
    if (msg.type === 'run') {
      const result = runMission(vehicleById(msg.config.vehicleId), msg.config)
      const res: WorkerResponse = { type: 'result', id: msg.id, result }
      self.postMessage(res)
    } else if (msg.type === 'porkchop') {
      const depCount = 31
      const tofCount = 31
      const depStep = (2 * msg.spanDays) / (depCount - 1)
      const tofStep = (msg.tofMax - msg.tofMin) / (tofCount - 1)
      const base = new Date(msg.departure + 'T00:00:00Z').getTime() - msg.spanDays * 86400e3
      const c3: number[] = []
      const vInf: number[] = []
      for (let i = 0; i < depCount; i++) {
        const dep = new Date(base + i * depStep * 86400e3)
        for (let j = 0; j < tofCount; j++) {
          const tof = msg.tofMin + j * tofStep
          const t = computeTransfer(dep, tof, msg.parkingAltKm, 0)
          c3.push(t.converged ? t.c3 : NaN)
          vInf.push(t.converged ? t.vInfArr : NaN)
        }
      }
      const grid: PorkchopGrid = { departure0: new Date(base).toISOString().slice(0, 10), depStepDays: depStep, depCount, tofMin: msg.tofMin, tofStep, tofCount, c3, vInf }
      const res: WorkerResponse = { type: 'porkchop', id: msg.id, grid }
      self.postMessage(res)
    }
  } catch (err) {
    const res: WorkerResponse = { type: 'error', id: msg.id, message: err instanceof Error ? err.message : String(err) }
    self.postMessage(res)
  }
}
