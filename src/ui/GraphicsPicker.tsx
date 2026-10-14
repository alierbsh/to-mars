/**
 * The graphics tier as a row of buttons: Auto (chosen for this device, and stepped down by
 * AdaptiveQuality if it cannot keep up) or a tier the viewer pins (saved for the next visit).
 * The same choice on the opening's pick step and in Mission settings.
 */
import { useT } from '../i18n'
import { detectQuality, saveQuality } from '../scene/quality'
import { useAppStore } from '../state/store'

const CHOICES = ['auto', 'high', 'medium', 'low'] as const

export default function GraphicsPicker({ className, itemClass, onClass }: { className: string; itemClass: string; onClass: string }) {
  const L = useT()
  const S = L.ui.settings
  const quality = useAppStore((s) => s.quality)
  const pinned = useAppStore((s) => s.qualityPinned)
  const setQuality = useAppStore((s) => s.setQuality)
  return (
    <div className={className} role="group" aria-label={S.graphics}>
      {CHOICES.map((id) => {
        const on = id === 'auto' ? !pinned : pinned && quality === id
        return (
          <button
            key={id}
            className={`${itemClass} ${on ? onClass : ''}`}
            aria-pressed={on}
            onClick={() => {
              if (id === 'auto') {
                saveQuality(null)
                setQuality(detectQuality(), false)
              } else setQuality(id, true)
            }}
          >
            {S.quality[id]}
          </button>
        )
      })}
    </div>
  )
}
