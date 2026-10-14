/**
 * Languages. The site speaks English, Türkçe, Español, Français, Deutsch, हिन्दी and 中文: English
 * is built in, the others load as their own chunk when chosen. Each has its own address (/tr/, /de/…,
 * see langs.ts); the language comes from `?lang=`, then the address, then the viewer's own choice
 * (saved), then the browser's languages, then English — and the address bar follows it.
 *
 * Components read the current language with `useT()` (re-rendering when it changes); code outside
 * React with `getL()`. A message from the simulation renders with `L.t(msg)`.
 */
import { create } from 'zustand'
import { DATA } from './en/data'
import { SIM } from './en/sim'
import { UI } from './en/ui'
import { WIKI } from './en/wiki'
import { ALL_LANGS, LANGS, langFromPath, langInfo, langPath } from './langs'
import { numbers } from './numbers'
import { render } from './render'
import type { Bundle, Lang, LangModule } from './types'

export type { Bundle, DataCatalog, Lang, LangModule, MarkKey, SimCatalog, UiCatalog, WikiCatalog } from './types'
export { ALL_LANGS, LANGS, langPath } from './langs'

const STORE_KEY = 'occupy-mars:lang'
const isLang = (x: unknown): x is Lang => LANGS.some((l) => l.id === x)

function makeBundle(lang: Lang, mod: LangModule): Bundle {
  const locale = langInfo(lang).locale
  const L = { lang, n: numbers(lang === 'en' ? 'en' : locale), ...mod } as Bundle
  L.t = (x) => render(x, L)
  return L
}

/** English: built in, and the fallback for anything a language lacks */
export const EN: Bundle = makeBundle('en', { ui: UI, sim: SIM, data: DATA, wiki: WIKI })

const loaders: Record<Exclude<Lang, 'en'>, () => Promise<{ default: LangModule }>> = {
  tr: () => import('./tr'),
  es: () => import('./es'),
  fr: () => import('./fr'),
  de: () => import('./de'),
  hi: () => import('./hi'),
  zh: () => import('./zh'),
}

const loaded = new Map<Lang, Bundle>([['en', EN]])

/** a language's bundle, loading its chunk the first time */
export async function loadBundle(lang: Lang): Promise<Bundle> {
  const hit = loaded.get(lang)
  if (hit) return hit
  const mod = await loaders[lang as Exclude<Lang, 'en'>]()
  const L = makeBundle(lang, mod.default)
  loaded.set(lang, L)
  return L
}

/** ?lang= in the address (it also opens a language that is not offered yet, to review a translation) */
function langParam(): Lang | null {
  if (typeof location === 'undefined') return null
  const q = new URLSearchParams(location.search).get('lang')
  return ALL_LANGS.find((l) => l.id === q)?.id ?? null
}

/** the language to open in: ?lang=, the address (/tr/), the saved choice, the browser's languages, English */
export function detectLang(): Lang {
  const param = langParam()
  if (param) return param
  if (typeof location !== 'undefined') {
    const fromPath = langFromPath(location.pathname)
    if (fromPath) return fromPath
  }
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // storage unavailable: fall through
  }
  if (typeof navigator !== 'undefined') {
    for (const tag of navigator.languages ?? [navigator.language]) {
      const primary = tag?.toLowerCase().split('-')[0]
      if (isLang(primary)) return primary
    }
  }
  return 'en'
}

/** what the page itself says about its language: <html lang>, the tab's title, the Devanagari typeface */
function applyToDocument(L: Bundle) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = langInfo(L.lang).html
  document.title = L.ui.meta.title
  if (L.lang === 'hi') void import('./fonts/devanagari')
}

/**
 * The address bar follows the language: / becomes /tr/, and /tr/ becomes /de/ on a switch, keeping
 * the query (a shared mission, a deep link) and the hash; a ?lang= gives way to the address.
 */
function syncAddress(lang: Lang) {
  if (typeof location === 'undefined' || typeof history === 'undefined') return
  const path = location.pathname
  if (path !== '/' && path !== '/index.html' && !langFromPath(path)) return // not one of the site's pages
  const params = new URLSearchParams(location.search)
  params.delete('lang')
  const search = params.toString()
  const next = `${langPath(lang)}${search ? `?${search}` : ''}${location.hash}`
  if (next !== `${path}${location.search}${location.hash}`) history.replaceState(history.state, '', next)
}

interface I18nState {
  lang: Lang
  L: Bundle
  /** switch language; `save` remembers it as the viewer's choice (and moves to its address) */
  setLang: (lang: Lang, save?: boolean) => Promise<void>
}

export const useI18n = create<I18nState>((set) => ({
  lang: 'en',
  L: EN,
  setLang: async (lang, save = true) => {
    if (save) {
      try {
        localStorage.setItem(STORE_KEY, lang)
      } catch {
        // not remembered; still switch
      }
    }
    try {
      const L = await loadBundle(lang)
      applyToDocument(L)
      if (save) syncAddress(lang)
      set({ lang, L })
    } catch (e) {
      console.warn(`[i18n] could not load ${lang}`, e)
    }
  },
}))

/** the current language (re-renders the component when it changes) */
export const useT = (): Bundle => useI18n((s) => s.L)

/** the current language, outside React */
export const getL = (): Bundle => useI18n.getState().L

/** before the first render: open in the detected language without a flash of English */
export async function initLang(): Promise<void> {
  const lang = detectLang()
  // the bare / moves to the language's address (not when ?lang= asks for one: a review link)
  if (!langParam()) syncAddress(lang)
  if (lang === 'en') {
    applyToDocument(EN)
    return
  }
  await useI18n.getState().setLang(lang, false)
}
