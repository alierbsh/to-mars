/**
 * The languages and their addresses — no DOM, no React, so the build (vite.config.ts writes a page
 * per language) and the scripts can read it too. Every language has its own address, /tr/, /de/…;
 * the bare / picks one (the viewer's saved choice, else the browser's) and moves to its address.
 */
export type Lang = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'hi' | 'zh'

export interface LangInfo {
  id: Lang
  /** the language's own name, for the picker */
  name: string
  /** for numbers and dates (Intl) */
  locale: string
  /** on the globe pill */
  code: string
  /** <html lang>: zh-CN picks the Simplified glyph forms; tr makes the stylesheet's capitals dot the i (İ) */
  html: string
  /** og:locale */
  og: string
  /** offered in the picker (a language is switched on once its translation is in) */
  ready: boolean
}

/** every language the site has catalogs for */
export const ALL_LANGS: LangInfo[] = [
  { id: 'en', name: 'English', locale: 'en-US', code: 'EN', html: 'en', og: 'en_US', ready: true },
  { id: 'tr', name: 'Türkçe', locale: 'tr-TR', code: 'TR', html: 'tr', og: 'tr_TR', ready: true },
  { id: 'es', name: 'Español', locale: 'es-ES', code: 'ES', html: 'es', og: 'es_ES', ready: true },
  { id: 'fr', name: 'Français', locale: 'fr-FR', code: 'FR', html: 'fr', og: 'fr_FR', ready: true },
  { id: 'de', name: 'Deutsch', locale: 'de-DE', code: 'DE', html: 'de', og: 'de_DE', ready: true },
  { id: 'hi', name: 'हिन्दी', locale: 'hi-IN', code: 'HI', html: 'hi', og: 'hi_IN', ready: true },
  { id: 'zh', name: '中文', locale: 'zh-CN', code: '中文', html: 'zh-CN', og: 'zh_CN', ready: true },
]

/** the languages offered */
export const LANGS = ALL_LANGS.filter((l) => l.ready)

export const langInfo = (id: Lang): LangInfo => ALL_LANGS.find((l) => l.id === id)!

/** a language's address: /tr/ */
export const langPath = (id: Lang): string => `/${id}/`

/** the language a page's path names (/tr/, /tr/index.html), or null for / */
export function langFromPath(pathname: string): Lang | null {
  const first = pathname.split('/')[1]
  return ALL_LANGS.find((l) => l.id === first)?.id ?? null
}
