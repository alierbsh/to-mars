import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
// (these import nothing themselves, so the config needs no TypeScript loader beyond its own)
import { ALL_LANGS, langPath, type Lang } from './src/i18n/langs.ts'
import { META as de } from './src/i18n/de/meta.ts'
import { META as en } from './src/i18n/en/meta.ts'
import { META as es } from './src/i18n/es/meta.ts'
import { META as fr } from './src/i18n/fr/meta.ts'
import { META as hi } from './src/i18n/hi/meta.ts'
import { META as tr } from './src/i18n/tr/meta.ts'
import { META as zh } from './src/i18n/zh/meta.ts'

// the site's address for the link-preview tags (they must be absolute): Vercel's production
// domain at build time, which follows a project rename; the current one otherwise
const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'reach-to-mars.vercel.app'}`

const META: Record<Lang, typeof en> = { en, tr, es, fr, de, hi, zh }
const MARK = '<!--lang-head-->'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * The part of <head> that depends on the language — title, description, the link preview, the
 * other languages' addresses — for a language's page (/tr/), or for / (English, the x-default:
 * the app moves on to the viewer's language from there).
 */
function langHead(lang: Lang | null): string {
  const id = lang ?? 'en'
  const M = META[id]
  const info = ALL_LANGS.find((l) => l.id === id)!
  const url = lang ? `${SITE_URL}${langPath(lang)}` : `${SITE_URL}/`
  const image = `${SITE_URL}/${id === 'en' ? 'og.jpg' : `og-${id}.jpg`}`
  return [
    `<title>${esc(M.title)}</title>`,
    `<meta name="description" content="${esc(M.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    ...ALL_LANGS.map((l) => `<link rel="alternate" hreflang="${l.html}" href="${SITE_URL}${langPath(l.id)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE_URL}/" />`,
    `<meta property="og:site_name" content="Occupy Mars Simulation" />`,
    `<meta property="og:title" content="${esc(M.title)}" />`,
    `<meta property="og:description" content="${esc(M.shareDescription)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${info.og}" />`,
    ...ALL_LANGS.filter((l) => l.id !== id).map((l) => `<meta property="og:locale:alternate" content="${l.og}" />`),
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(M.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(M.title)}" />`,
    `<meta name="twitter:description" content="${esc(M.shareDescription)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join('\n    ')
}

/** a page per language: dist/tr/index.html… — the same app, its <head> and <html lang> in that language */
function langPages(): Plugin {
  return {
    name: 'lang-pages',
    // after Vite's own HTML plugin has put index.html into the bundle
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      // the dev server: English; the build fills each page in generateBundle
      return ctx.server ? html.replace(MARK, langHead(null)) : html
    },
    generateBundle(_, bundle) {
      const index = bundle['index.html']
      if (!index || index.type !== 'asset') return
      const html = String(index.source)
      if (!html.includes(MARK)) this.error(`index.html has no ${MARK}`)
      index.source = html.replace(MARK, langHead(null))
      // a language's catalogs are a chunk of their own, loaded before the first render: fetch it
      // with the app rather than after it (one round trip less on a phone)
      const chunks = Object.values(bundle).filter((c) => c.type === 'chunk')
      const preload = (id: Lang) => {
        const own = chunks.find((c) => c.facadeModuleId?.replace(/\\/g, '/').endsWith(`/src/i18n/${id}/index.ts`))
        if (!own) return ''
        return [own.fileName, ...own.imports]
          .filter((f) => !html.includes(`/${f}"`))
          .map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`)
          .join('\n    ')
      }
      for (const l of ALL_LANGS) {
        let page = html.replace(MARK, langHead(l.id)).replace('<html lang="en">', `<html lang="${l.html}">`)
        const links = preload(l.id)
        if (links) page = page.replace('</head>', `  ${links}\n  </head>`)
        this.emitFile({ type: 'asset', fileName: `${l.id}/index.html`, source: page })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), langPages()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500, // three.js is big; we split it below
    rollupOptions: {
      output: {
        // Vite 8 / rolldown: group the 3D libs into their own long-cached chunks
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/]@react-three[\\/]/ },
          ],
        },
      },
    },
  },
})
