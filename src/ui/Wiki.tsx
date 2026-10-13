/**
 * The wiki: a reading overlay — chapters down the left, the text on the right, one stage of the
 * mission per chapter in plain language. Opened from the Wiki pill or from a timeline mark.
 */
import { useEffect, useRef } from 'react'
import { useAppStore } from '../state/store'
import { CHAPTERS } from '../wiki/chapters'

export default function Wiki() {
  const wiki = useAppStore((s) => s.wiki)
  const openWiki = useAppStore((s) => s.openWiki)
  const closeWiki = useAppStore((s) => s.closeWiki)
  const body = useRef<HTMLDivElement>(null)
  const active = useRef<HTMLButtonElement>(null)
  const chapter = CHAPTERS.find((c) => c.id === wiki) ?? CHAPTERS[0]
  const idx = CHAPTERS.indexOf(chapter)
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
  return (
    <div className="wiki" role="dialog" aria-label="Wiki">
      <aside className="wiki__nav">
        <p className="label">Wiki · how a Mars mission works</p>
        <ol className="wiki__list">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                ref={c.id === chapter.id ? active : undefined}
                className={`wiki__item ${c.id === chapter.id ? 'wiki__item--on' : ''}`}
                onClick={() => openWiki(c.id)}
              >
                <span className="wiki__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="wiki__name">{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <div className="wiki__body" ref={body}>
        <button className="wiki__close drawer__close" onClick={closeWiki} aria-label="Close the wiki">
          ×
        </button>
        <p className="label">
          Chapter {idx + 1} of {CHAPTERS.length}
        </p>
        <h1 className="wiki__title">{chapter.title}</h1>
        <p className="wiki__lead">{chapter.lead}</p>
        <div className="wiki__text">
          {chapter.body.map((p, i) =>
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
              ← {CHAPTERS[idx - 1].title}
            </button>
          ) : (
            <span />
          )}
          {idx < CHAPTERS.length - 1 ? (
            <button className="wiki__step" onClick={() => openWiki(CHAPTERS[idx + 1].id)}>
              {CHAPTERS[idx + 1].title} →
            </button>
          ) : (
            <button className="wiki__step" onClick={closeWiki}>
              Back to the mission →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
