/**
 * Choosing the site's language: a globe pill with a menu in the top bar, and a plain row of the
 * languages' own names on the opening screen and in Mission settings.
 */
import { useEffect, useRef, useState } from 'react'
import { LANGS, useI18n, useT } from '../i18n'

function Globe() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.8 8h12.4M8 1.7c-2.2 2.4-2.2 10.2 0 12.6M8 1.7c2.2 2.4 2.2 10.2 0 12.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

/** the top bar's language pill and its menu */
export function LangMenu() {
  const L = useT()
  const lang = useI18n((s) => s.lang)
  const setLang = useI18n((s) => s.setLang)
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]
  if (LANGS.length < 2) return null
  return (
    <div className="langmenu" ref={box}>
      <button className={`pill pill--lang ${open ? 'pill--on' : ''}`} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label={L.ui.lang.label} title={L.ui.lang.label}>
        <Globe />
        <span className="pill__code">{current.code}</span>
      </button>
      {open && (
        <ul className="langmenu__list" role="menu">
          {LANGS.map((l) => (
            <li key={l.id} role="none">
              <button
                role="menuitemradio"
                aria-checked={l.id === lang}
                lang={l.id}
                className={`langmenu__item ${l.id === lang ? 'langmenu__item--on' : ''}`}
                onClick={() => {
                  setOpen(false)
                  void setLang(l.id)
                }}
              >
                {l.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** the languages as a row of their own names */
export function LangList({ className = '' }: { className?: string }) {
  const L = useT()
  const lang = useI18n((s) => s.lang)
  const setLang = useI18n((s) => s.setLang)
  if (LANGS.length < 2) return null
  return (
    <div className={`langlist ${className}`} role="group" aria-label={L.ui.lang.label}>
      <Globe />
      {LANGS.map((l) => (
        <button key={l.id} lang={l.id} className={`langlist__item ${l.id === lang ? 'langlist__item--on' : ''}`} aria-pressed={l.id === lang} onClick={() => void setLang(l.id)}>
          {l.name}
        </button>
      ))}
    </div>
  )
}
