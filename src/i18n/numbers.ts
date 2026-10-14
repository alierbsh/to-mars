/**
 * Numbers and dates as each language writes them. English reproduces the simulation's historical
 * output exactly (toFixed: a point, no grouping; integers grouped en-US); every other language
 * uses its own decimal and group separators through Intl. Pure TypeScript.
 */
export interface Num {
  /** the Intl locale */
  locale: string
  /** fixed decimals, no grouping: 1234.5 → "1234.5" / "1234,5" */
  f(x: number, d?: number): string
  /** a rounded integer with grouping: 12345.6 → "12,346" / "12.346" / "12 346" */
  i(x: number): string
  /** a number as it is, in the language's decimal format: -12.5 → "-12.5" / "-12,5" */
  n(x: number): string
  /** an ISO date (yyyy-mm-dd) as the language writes it; English keeps ISO */
  date(iso: string): string
}

const EN: Num = {
  locale: 'en-US',
  f: (x, d = 0) => x.toFixed(d),
  i: (x) => Math.round(x).toLocaleString('en-US'),
  n: (x) => String(x),
  date: (iso) => iso,
}

const cache = new Map<string, Num>()

export function numbers(locale: string): Num {
  if (locale === 'en' || locale === 'en-US') return EN
  const hit = cache.get(locale)
  if (hit) return hit
  const fixed = new Map<number, Intl.NumberFormat>()
  const fx = (d: number) => {
    let nf = fixed.get(d)
    if (!nf) {
      nf = new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false })
      fixed.set(d, nf)
    }
    return nf
  }
  const grouped = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  const plain = new Intl.NumberFormat(locale, { maximumFractionDigits: 6, useGrouping: false })
  const dates = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
  const num: Num = {
    locale,
    f: (x, d = 0) => fx(d).format(x),
    i: (x) => grouped.format(Math.round(x)),
    n: (x) => plain.format(x),
    date: (iso) => {
      const t = new Date(`${iso}T00:00:00Z`)
      return Number.isNaN(t.getTime()) ? iso : dates.format(t)
    },
  }
  cache.set(locale, num)
  return num
}
