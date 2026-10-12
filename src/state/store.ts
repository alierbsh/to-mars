import { create } from 'zustand'
import { VEHICLES } from '../data/vehicles'
import { DEFAULT_CONFIG, PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import type { MissionConfig, MissionResult, Phase } from '../sim/types'
import type { PorkchopGrid, WorkerRequest, WorkerResponse } from '../sim/worker'

export type Tab = 'timeline' | 'telemetry' | 'trajectory' | 'model'
export type Drawer = 'mission' | 'details' | null
/** the opening flow: the case for Mars → choose the ship and the clock → countdown → the mission */
export type Intro = 'start' | 'pick' | 'countdown' | null

export interface AppState {
  config: MissionConfig
  result: MissionResult | null
  status: 'idle' | 'running' | 'done' | 'error'
  error: string | null
  porkchop: PorkchopGrid | null
  porkchopFor: string | null

  /** playback: mission time in seconds, and whether it is advancing */
  t: number
  playing: boolean
  speed: number // multiplier on the phase's natural rate (1 = the per-phase auto rate)
  tab: Tab
  followPhase: boolean
  /** which side panel is open (the stage is the whole screen) */
  drawer: Drawer
  intro: Intro

  setConfig: (patch: Partial<MissionConfig>) => void
  run: () => void
  requestPorkchop: () => void
  setT: (t: number) => void
  setPlaying: (p: boolean) => void
  setSpeed: (s: number) => void
  setTab: (tab: Tab) => void
  setDrawer: (d: Drawer) => void
  setIntro: (i: Intro) => void
  /** from the picker: set the ship and the clock, then count down */
  launch: (vehicleId: string, speed: number) => void
  /** the countdown reached zero: ignition */
  ignite: () => void
  reset: () => void
}

let worker: Worker | null = null
let reqId = 0
let pending = 0
let debounce: ReturnType<typeof setTimeout> | null = null

function getWorker(set: (p: Partial<AppState>) => void, get: () => AppState): Worker {
  if (worker) return worker
  worker = new Worker(new URL('../sim/worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data
    if (msg.type === 'result') {
      if (msg.id !== pending) return // stale
      const params = new URLSearchParams(location.search)
      const tParam = params.get('t')
      const t0 = tParam ? Number(tParam) : 0
      set({ result: msg.result, status: 'done', t: t0, playing: !tParam && !get().intro })
    } else if (msg.type === 'porkchop') {
      set({ porkchop: msg.grid, porkchopFor: get().config.departure })
    } else if (msg.type === 'error') {
      set({ status: 'error', error: msg.message })
    }
  }
  return worker
}

/** ?vehicle=<id>&preset=<id>&window=<id> preselect a configuration (used by the screenshot scripts too) */
function initialConfig(): MissionConfig {
  const params = new URLSearchParams(location.search)
  let cfg = { ...DEFAULT_CONFIG }
  const vehicle = params.get('vehicle')
  if (vehicle) cfg.vehicleId = vehicle
  const preset = PRESETS.find((p) => p.id === params.get('preset'))
  if (preset) cfg = { ...cfg, ...preset.patch }
  const win = WINDOWS.find((w) => w.id === params.get('window'))
  if (win) cfg = { ...cfg, departure: win.departure, transitDays: win.transitDays }
  return cfg
}

/** deep links (?vehicle=, ?t=, …) skip the opening flow */
const hasParams = new URLSearchParams(location.search).toString().length > 0

export const useAppStore = create<AppState>((set, get) => ({
  config: initialConfig(),
  intro: hasParams ? null : 'start',
  result: null,
  status: 'idle',
  error: null,
  porkchop: null,
  porkchopFor: null,
  t: 0,
  playing: false,
  speed: 1,
  tab: 'timeline',
  followPhase: true,
  drawer: null,

  setConfig: (patch) => {
    set((s) => ({ config: { ...s.config, ...patch } }))
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => get().run(), 180)
  },
  run: () => {
    const w = getWorker(set, get)
    const id = ++reqId
    pending = id
    set({ status: 'running', error: null })
    const req: WorkerRequest = { type: 'run', id, config: get().config }
    w.postMessage(req)
  },
  requestPorkchop: () => {
    const w = getWorker(set, get)
    const { config } = get()
    const req: WorkerRequest = { type: 'porkchop', id: ++reqId, departure: config.departure, spanDays: 60, tofMin: 120, tofMax: 400, parkingAltKm: config.parkingOrbitKm }
    w.postMessage(req)
  },
  setT: (t) => set({ t }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setTab: (tab) => set({ tab, drawer: 'details' }),
  setDrawer: (drawer) => set((s) => ({ drawer: s.drawer === drawer ? null : drawer })),
  setIntro: (intro) => set({ intro }),
  launch: (vehicleId, speed) => {
    const cur = get().config
    const vehicle = VEHICLES.find((v) => v.id === vehicleId)
    const crew = vehicle ? Math.min(cur.crew, Math.max(vehicle.spacecraft.crewCapacity, 0)) || cur.crew : cur.crew
    set({ speed, intro: 'countdown', t: 0, playing: false, drawer: null })
    if (vehicleId !== cur.vehicleId) get().setConfig({ vehicleId, crew })
  },
  ignite: () => set({ intro: null, t: 0, playing: true }),
  reset: () => set({ t: 0, playing: true }),
}))

/** Natural playback rate (simulated seconds per real second) for each phase. */
export const PHASE_RATE: Record<Phase, number> = {
  ascent: 4,
  leo: 86_400 * 2,
  tmi: 10,
  cruise: 86_400 * 4,
  entry: 4,
  landing: 2,
  done: 1,
}

export function phaseAt(result: MissionResult, t: number) {
  for (const p of result.phases) if (t >= p.start && t < p.end) return p
  return result.phases[result.phases.length - 1]
}
