/**
 * Languages. The site speaks English, Türkçe, Español, Français, Deutsch, हिन्दी and 中文: English
 * is built in, the others load as their own chunk when chosen. The language comes from `?lang=`,
 * then the viewer's own choice (saved), then the browser's languages, then English.
 *
 * Components read the current language with `useT()` (re-rendering when it changes); code outside
 * React with `getL()`. A message from the simulation renders with `L.t(msg)`.
 */
import { create } from 'zustand'
import { DATA } from './en/data'
import { SIM } from './en/sim'
import { UI } from './en/ui'
import { WIKI } from './en/wiki'
import { numbers } from './numbers'
import { render } from './render'
import type { Bundle, Lang, LangModule } from './types'

export type { Bundle, DataCatalog, Lang, LangModule, MarkKey, SimCatalog, UiCatalog, WikiCatalog } from './types'

/** every language the site has catalogs for; `ready` ones are offered (a language is switched on once its translation is in) */
export const ALL_LANGS: Array<{ id: Lang; name: string; locale: string; code: string; ready: boolean }> = [
  { id: 'en', name: 'English', locale: 'en-US', code: 'EN', ready: true },
  { id: 'tr', name: 'Türkçe', locale: 'tr-TR', code: 'TR', ready: false },
  { id: 'es', name: 'Español', locale: 'es-ES', code: 'ES', ready: false },
  { id: 'fr', name: 'Français', locale: 'fr-FR', code: 'FR', ready: false },
  { id: 'de', name: 'Deutsch', locale: 'de-DE', code: 'DE', ready: false },
  { id: 'hi', name: 'हिन्दी', locale: 'hi-IN', code: 'HI', ready: false },
  { id: 'zh', name: '中文', locale: 'zh-CN', code: '中文', ready: false },
]

/** the languages offered */
export const LANGS = ALL_LANGS.filter((l) => l.ready)

const STORE_KEY = 'occupy-mars:lang'
const isLang = (x: unknown): x is Lang => LANGS.some((l) => l.id === x)

function makeBundle(lang: Lang, mod: LangModule): Bundle {
  const locale = ALL_LANGS.find((l) => l.id === lang)!.locale
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

/** the language to open in: ?lang=, the saved choice, the browser's languages, English */
export function detectLang(): Lang {
  if (typeof location !== 'undefined') {
    // ?lang= also opens a language that is not offered yet (to review a translation)
    const q = new URLSearchParams(location.search).get('lang')
    if (ALL_LANGS.some((l) => l.id === q)) return q as Lang
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
  // zh-CN picks the Simplified glyph forms; tr makes the stylesheet's capitals dot the i (İ)
  document.documentElement.lang = L.lang === 'zh' ? 'zh-CN' : L.lang
  document.title = L.ui.meta.title
  if (L.lang === 'hi') void import('./fonts/devanagari')
}

interface I18nState {
  lang: Lang
  L: Bundle
  /** switch language; `save` remembers it as the viewer's choice */
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
  if (lang === 'en') {
    applyToDocument(EN)
    return
  }
  await useI18n.getState().setLang(lang, false)
}
