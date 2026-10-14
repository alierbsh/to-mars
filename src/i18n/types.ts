/** The shapes every language implements, taken from the English catalogs. */
import type { UI } from './en/ui'
import type { WIKI } from './en/wiki'
import type { DataCatalog, SimBundle, SimCatalog } from './render'
import type { Lang } from './langs'
import type { Text } from './msg'

export type { DataCatalog, Lang, SimCatalog }
export type UiCatalog = typeof UI
export type WikiCatalog = typeof WIKI
/** a timeline mark (liftoff, max-Q, a tanker docking…) */
export type MarkKey = keyof UiCatalog['marks']

/** what a language module exports */
export interface LangModule {
  ui: UiCatalog
  sim: SimCatalog
  data: DataCatalog
  wiki: WikiCatalog
}


/** a language ready to use: its catalogs, its number formats, and `t` to render a message */
export interface Bundle extends SimBundle, LangModule {
  lang: Lang
  t: (x: Text | null | undefined) => string
}
