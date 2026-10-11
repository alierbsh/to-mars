import { create } from 'zustand'

/**
 * Global UI/simulation state.
 * Kept deliberately small for now — the simulation model, rocket catalogue and
 * verdict types will land here once the research phase fixes the numbers.
 */
export interface AppState {
  /** id of the selected rocket in the catalogue */
  rocketId: string
  setRocket: (id: string) => void

  /** simulation clock, seconds since launch */
  t: number
  playing: boolean
  setPlaying: (p: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  rocketId: 'placeholder',
  setRocket: (id) => set({ rocketId: id }),
  t: 0,
  playing: false,
  setPlaying: (playing) => set({ playing }),
}))
