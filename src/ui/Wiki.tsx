/**
 * The wiki: a reading overlay — chapters down the left, the text on the right, one stage of the
 * mission per chapter in plain language. Opened from the Wiki pill or from a timeline mark.
 */
import { useEffect, useRef } from 'react'
import { useT } from '../i18n'
import { useAppStore } from '../state/store'
import { CHAPTERS } from '../wiki/chapters'

export default function Wiki() {
  const L = useT()
  const W = L.ui.wiki
  const wiki = useAppStore((s) => s.wiki)
  const openWiki = useAppStore((s) => s.openWiki)
  const closeWiki = useAppStore((s) => s.closeWiki)
  const body = useRef<HTMLDivElement>(null)
  const active = useRef<HTMLButtonElement>(null)
  const chapter = CHAPTERS.find((c) => c.id === wiki) ?? CHAPTERS[0]
  const idx = CHAPTERS.indexOf(chapter)
  const text = (id: (typeof CHAPTERS)[number]['id']) => L.wiki[id]
  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
    // the chapter list is a scrolling row on phones: keep the open chapter in view
    active.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [wiki])
  useEffect(() => {
    if (!wiki) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWiki()
      if (e.key === 'ArrowRight' && idx < CHAPTERS.length - 1) openWiki(CHAPTERS[idx + 1].id)
      if (e.key === 'ArrowLeft' && idx > 0) openWiki(CHAPTERS[idx - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [wiki, idx, openWiki, closeWiki])
  if (!wiki) return null
  const c = text(chapter.id)
  return (
    <div className="wiki" role="dialog" aria-label={W.aria}>
      <aside className="wiki__nav">
        <p className="label">{W.nav}</p>
        <ol className="wiki__list">
          {CHAPTERS.map((ch, i) => (
            <li key={ch.id}>
              <button
                ref={ch.id === chapter.id ? active : undefined}
                className={`wiki__item ${ch.id === chapter.id ? 'wiki__item--on' : ''}`}
                onClick={() => openWiki(ch.id)}
              >
                <span className="wiki__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="wiki__name">{text(ch.id).title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <div className="wiki__body" ref={body}>
        <button className="wiki__close drawer__close" onClick={closeWiki} aria-label={W.close}>
          ×
        </button>
        <p className="label">{W.chapter({ i: idx + 1, n: CHAPTERS.length })}</p>
        <h1 className="wiki__title">{c.title}</h1>
        <p className="wiki__lead">{c.lead}</p>
        <div className="wiki__text">
          {c.body.map((p, i) =>
            p.startsWith('## ') ? (
              <h3 key={i} className="wiki__h3">
                {p.slice(3)}
              </h3>
            ) : p.startsWith('- ') ? (
              <p key={i} className="wiki__bullet">
                {p.slice(2)}
              </p>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </div>
        <div className="wiki__foot">
          {idx > 0 ? (
            <button className="wiki__step" onClick={() => openWiki(CHAPTERS[idx - 1].id)}>
              ← {text(CHAPTERS[idx - 1].id).title}
            </button>
          ) : (
            <span />
          )}
          {idx < CHAPTERS.length - 1 ? (
            <button className="wiki__step" onClick={() => openWiki(CHAPTERS[idx + 1].id)}>
              {text(CHAPTERS[idx + 1].id).title} →
            </button>
          ) : (
            <button className="wiki__step" onClick={closeWiki}>
              {W.back}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
