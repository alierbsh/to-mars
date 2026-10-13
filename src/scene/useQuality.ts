import { useAppStore } from '../state/store'
import { QUALITY, type QualitySettings } from './quality'

/** the current graphics tier's settings (re-renders the caller when the tier changes) */
export function useQuality(): QualitySettings {
  return QUALITY[useAppStore((s) => s.quality)]
}

/** the settings outside React (inside useFrame, material factories) */
export function qualityNow(): QualitySettings {
  return QUALITY[useAppStore.getState().quality]
}
