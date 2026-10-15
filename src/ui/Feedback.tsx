/**
 * "Give us feedback": a link at the foot of every wiki chapter and of the mission settings (out of
 * the way of the mission itself), and the small panel it opens
 * with the address, a button that starts an email (subject filled in; the mission's link and the
 * device under the signature line, for bug reports) and one that copies the address.
 */
import { useEffect, useRef } from 'react'
import { getL, useT } from '../i18n'
import { useAppStore } from '../state/store'
import { missionUrl } from './share'

/** the owner's address, put together here rather than written out whole in the bundle */
const ADDRESS = ['iammuhametali', 'gmail.com'].join('@')

function mailto(): string {
  const L = getL()
  const { config, intro, t, quality, qualityPinned } = useAppStore.getState()
  const lines = ['', '', '', '—']
  if (!intro) lines.push(`${missionUrl(config)}  (t = ${Math.round(t)} s)`)
  lines.push(`${innerWidth}×${innerHeight} @${Math.round(devicePixelRatio * 100) / 100}x · ${quality}${qualityPinned ? '' : ' (auto)'} · ${L.lang}`)
  lines.push(navigator.userAgent)
  return `mailto:${ADDRESS}?subject=${encodeURIComponent(L.ui.feedback.subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

function Icon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export function FeedbackLink({ className }: { className?: string }) {
  const L = useT()
  const setFeedback = useAppStore((s) => s.setFeedback)
  return (
    <button className={`fblink ${className ?? ''}`} onClick={() => setFeedback(true)}>
      <Icon />
      {L.ui.feedback.button}
    </button>
  )
}

export default function FeedbackPanel() {
  const L = useT()
  const F = L.ui.feedback
  const open = useAppStore((s) => s.feedback)
  const setFeedback = useAppStore((s) => s.setFeedback)
  const showToast = useAppStore((s) => s.showToast)
  const address = useRef<HTMLAnchorElement>(null)
  const close = () => setFeedback(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFeedback(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setFeedback])
  if (!open) return null
  const href = mailto()
  return (
    <div className="fb" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <button className="fb__scrim" aria-label={F.close} onClick={close} />
      <section className="fb__card">
        <button className="drawer__close fb__close" onClick={close} aria-label={F.close}>
          ×
        </button>
        <p className="label">{F.label}</p>
        <h2 id="fb-title" className="fb__title">
          {F.title}
        </h2>
        <p className="fb__text">{F.text}</p>
        <a className="fb__address" ref={address} href={href}>
          {ADDRESS}
        </a>
        <div className="fb__actions">
          <a className="fb__write" href={href}>
            {F.write} →
          </a>
          <button
            className="fb__copy"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(ADDRESS)
                showToast(F.copied)
              } catch {
                // no clipboard (an insecure context, an old browser): select it for a manual copy
                const el = address.current
                if (el) getSelection()?.selectAllChildren(el)
              }
            }}
          >
            {F.copy}
          </button>
        </div>
      </section>
    </div>
  )
}
