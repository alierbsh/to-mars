import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { DEFAULT_CONFIG, PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import type { MissionConfig, MissionResult, Phase } from '../sim/types'
import type { PorkchopGrid, WorkerRequest, WorkerResponse } from '../sim/worker'
import { CHAPTERS } from '../wiki/chapters'
import { detectQuality, saveQuality, type Quality } from '../scene/quality'
import { missionFromLocation } from '../ui/share'

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
  /** seconds left in the opening countdown (5 → 0), for the pad effects */
  countdown: number
  /** bumps at ignition and on restart: the lower third replays its opening */
  openSeq: number
  /** the wiki chapter open, or null */
  wiki: string | null
  /** graphics tier (see scene/quality.ts); the canvas remounts when it changes */
  quality: Quality
  /** true once the viewer chose a tier themselves (no automatic stepping down then) */
  qualityPinned: boolean
  /** below the low tier: the canvas renders this fraction of a CSS pixel (1 = as the tier says) */
  dprScale: number
  /** where the pick step's preselected mission came from (it says so), or null */
  pickFrom: 'shared' | 'scoreboard' | null
  /** the scoreboard overlay is open */
  board: boolean
  /** a short message at the bottom of the screen ("Link copied") */
  toast: { text: string; id: number } | null
  /** the feedback panel is open */
  feedback: boolean

  setConfig: (patch: Partial<MissionConfig>) => void
  run: () => void
  requestPorkchop: () => void
  setT: (t: number) => void
  setPlaying: (p: boolean) => void
  setSpeed: (s: number) => void
  setTab: (tab: Tab) => void
  setDrawer: (d: Drawer) => void
  setIntro: (i: Intro) => void
  openWiki: (id?: string) => void
  closeWiki: () => void
  /** set the graphics tier; `pin` records it as the viewer's choice (null clears the choice) */
  setQuality: (q: Quality, pin?: boolean) => void
  setDprScale: (s: number) => void
  showToast: (text: string) => void
  setFeedback: (open: boolean) => void
  openBoard: () => void
  closeBoard: () => void
  /** start a new mission with this configuration: the pick step, the ship preselected */
  flyMission: (cfg: MissionConfig, from: 'shared' | 'scoreboard') => void
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

/** a mission shared by link (?mission=…): it opens on the ship choice, ready to launch */
const sharedMission = missionFromLocation()

/** ?vehicle=<id>&preset=<id>&window=<id> preselect a configuration (used by the screenshot scripts too) */
function initialConfig(): MissionConfig {
  const params = new URLSearchParams(location.search)
  let cfg = sharedMission ?? { ...DEFAULT_CONFIG }
  const vehicle = params.get('vehicle')
  if (vehicle) cfg.vehicleId = vehicle
  const preset = PRESETS.find((p) => p.id === params.get('preset'))
  if (preset) cfg = { ...cfg, ...preset.patch }
  const win = WINDOWS.find((w) => w.id === params.get('window'))
  if (win) cfg = { ...cfg, departure: win.departure, transitDays: win.transitDays }
  return cfg
}

/** deep links (?vehicle=, ?t=, …) skip the opening flow; settings like ?quality= do not */
const hasParams = ['vehicle', 'preset', 'window', 't', 'wiki'].some((k) => new URLSearchParams(location.search).has(k))
/** ?wiki=<chapter id> opens the wiki on that chapter */
const wikiParam = new URLSearchParams(location.search).get('wiki')
const initialWiki = wikiParam && CHAPTERS.some((c) => c.id === wikiParam) ? wikiParam : null

export const useAppStore = create<AppState>((set, get) => ({
  config: initialConfig(),
  intro: hasParams ? null : sharedMission ? 'pick' : 'start',
  countdown: 5,
  openSeq: 0,
  wiki: initialWiki,
  pickFrom: sharedMission ? 'shared' : null,
  board: new URLSearchParams(location.search).get('board') === '1',
  toast: null,
  feedback: false,
  quality: detectQuality(),
  qualityPinned: (typeof location !== 'undefined' && new URLSearchParams(location.search).has('quality')) || (typeof localStorage !== 'undefined' && !!localStorage.getItem('occupy-mars:quality')),
  dprScale: 1,
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
  openWiki: (id) => set({ wiki: id ?? 'why', drawer: null, board: false }),
  closeWiki: () => set({ wiki: null }),
  setQuality: (quality, pin = false) => {
    if (pin) saveQuality(quality)
    set({ quality, qualityPinned: pin, dprScale: 1 })
  },
  setDprScale: (dprScale) => set({ dprScale }),
  showToast: (text) => set((s) => ({ toast: { text, id: (s.toast?.id ?? 0) + 1 } })),
  setFeedback: (feedback) => set({ feedback }),
  openBoard: () => set({ board: true, wiki: null, drawer: null }),
  closeBoard: () => set({ board: false }),
  flyMission: (cfg, from) => {
    set({ playing: false, board: false, wiki: null, drawer: null, intro: 'pick', pickFrom: from })
    get().setConfig(cfg)
  },
  launch: (vehicleId, speed) => {
    if (get().pickFrom === 'shared' && typeof history !== 'undefined') {
      const p = new URLSearchParams(location.search)
      p.delete('mission')
      history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`)
    }
    const cur = get().config
    const vehicle = VEHICLES.find((v) => v.id === vehicleId)
    const crew = vehicle ? Math.min(cur.crew, Math.max(vehicle.spacecraft.crewCapacity, 0)) || cur.crew : cur.crew
    set({ speed, intro: 'countdown', countdown: 5, t: 0, playing: false, drawer: null, pickFrom: null })
    if (vehicleId !== cur.vehicleId) get().setConfig({ vehicleId, crew })
  },
  ignite: () => set((s) => ({ intro: null, t: 0, playing: true, openSeq: s.openSeq + 1 })),
  reset: () => set((s) => ({ t: 0, playing: true, openSeq: s.openSeq + 1 })),
}))

/**
 * The clock's multiplier for a moment of the mission, given the viewer's chosen speed. Liftoff
 * always plays in real time (the first 25 s: ignition, tower clear, the roll), ramping to the
 * chosen speed by T+85 s; the in-between phases run at the chosen speed; entry, descent and
 * landing follow their own profile down to real time for the landing burn; the aftermath at 1×.
 */
export function effectiveSpeed(phase: Phase, tInPhase: number, chosen: number, ctx?: { alt?: number }): number {
  if (phase === 'ascent') {
    // liftoff in real time (the natural rate is 4×, so 0.25 of it), ramping to the chosen speed by T+85
    const real = 1 / PHASE_RATE.ascent
    if (tInPhase < 25) return real
    const f = Math.min(1, (tInPhase - 25) / 60)
    const e = f * f * (3 - 2 * f)
    return real + (chosen - real) * e
  }
  if (phase === 'entry') {
    // entry, descent and landing as a film: the fall through the upper atmosphere at 8× real
    // time, the heating at 3×, the glide at 5×, and from 8 km down — the landing burn, the flip,
    // the touchdown — in real time. The chosen speed only slows it (0.5×).
    const alt = ctx?.alt ?? 1e6
    const real = alt > 70_000 ? 8 : alt > 55_000 ? 8 - 5 * ((70_000 - alt) / 15_000) : alt > 25_000 ? 3 : alt > 18_000 ? 3 + 2 * ((25_000 - alt) / 7_000) : alt > 9_000 ? 5 : alt > 8_000 ? 5 - 4 * ((9_000 - alt) / 1_000) : 1
    return (real / PHASE_RATE.entry) * Math.min(1, chosen)
  }
  if (phase === 'landing' || phase === 'done') return Math.min(chosen, 1)
  return chosen
}

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

/**
 * The clock for the DOM: the store's `t` moves every frame for the scenes, but a React tree
 * re-rendering 60 times a second for a changing number is wasted work on a slow CPU. This
 * delivers `t` at most `hz` times a second, plus a trailing update so a pause or a seek settles
 * on the exact value.
 */
export function useThrottledT(hz = 12): number {
  const [t, setT] = useState(() => useAppStore.getState().t)
  useEffect(() => {
    let last = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    const period = 1000 / hz
    const unsub = useAppStore.subscribe((s, prev) => {
      if (s.t === prev.t) return
      const now = performance.now()
      if (now - last >= period) {
        last = now
        setT(s.t)
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null
          last = performance.now()
          setT(useAppStore.getState().t)
        }, period - (now - last))
      }
    })
    return () => {
      unsub()
      if (timer) clearTimeout(timer)
    }
  }, [hz])
  return t
}
