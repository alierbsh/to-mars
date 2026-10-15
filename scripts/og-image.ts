// The link preview images, 1200×630: public/og.jpg (English, also for the bare /) and
// public/og-<lang>.jpg for every other language's page — one still of the climb rendered by the site
// itself, with the title set over it in that language and the site's typeface.
// Usage: npm run build && npx tsx scripts/og-image.ts [missionSeconds] [lang …]
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { ALL_LANGS, langInfo, type Lang } from '../src/i18n/langs'
import { UI as en } from '../src/i18n/en/ui'
import { UI as tr } from '../src/i18n/tr/ui'
import { UI as es } from '../src/i18n/es/ui'
import { UI as fr } from '../src/i18n/fr/ui'
import { UI as de } from '../src/i18n/de/ui'
import { UI as hi } from '../src/i18n/hi/ui'
import { UI as zh } from '../src/i18n/zh/ui'
import { DATA as enData } from '../src/i18n/en/data'
import { DATA as trData } from '../src/i18n/tr/data'
import { DATA as esData } from '../src/i18n/es/data'
import { DATA as frData } from '../src/i18n/fr/data'
import { DATA as deData } from '../src/i18n/de/data'
import { DATA as hiData } from '../src/i18n/hi/data'
import { DATA as zhData } from '../src/i18n/zh/data'

const UI = { en, tr, es, fr, de, hi, zh }
const DATA = { en: enData, tr: trData, es: esData, fr: frData, de: deData, hi: hiData, zh: zhData }

const args = process.argv.slice(2)
const t = Number(args.find((a) => /^\d+$/.test(a)) ?? 110)
const only = args.filter((a) => ALL_LANGS.some((l) => l.id === a)) as Lang[]
const langs = only.length ? only : ALL_LANGS.map((l) => l.id)

const root = new URL('../dist', import.meta.url).pathname
const pub = new URL('../public', import.meta.url).pathname
const node = new URL('../node_modules/@fontsource', import.meta.url).pathname
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2' }

const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (p.endsWith('/')) p += 'index.html'
  let f = join(root, p)
  try {
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html')
  } catch {
    f = join(root, 'index.html')
  }
  try {
    res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream' })
    res.end(await readFile(f))
  } catch {
    res.writeHead(404)
    res.end()
  }
})
const port = 4290
await new Promise<void>((r) => server.listen(port, r))
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })

// 1. the still: wider than the card, so the ship (framed at the centre) lands right of the text
const W = 1640
const H = 630
const shot = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 })
await shot.goto(`http://localhost:${port}/en/?vehicle=starship-v3&t=${t}&still=1&clean=1&quality=high&prewarm=0`)
await shot.waitForTimeout(16000)
const still = (await shot.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: H }, timeout: 180_000 })).toString('base64')
await shot.close()

// 2. the cards. Instrument Sans for Latin, Noto Sans Devanagari for हिन्दी; Han from the system (Noto Sans CJK)
const font = async (pkg: string, file: string) => (await readFile(join(node, pkg, 'files', file))).toString('base64')
const faces = async (family: string, pkg: string, subset: string) =>
  (await Promise.all([400, 500, 600].map(async (w) => `@font-face { font-family: '${family}'; font-weight: ${w}; src: url(data:font/woff2;base64,${await font(pkg, `${pkg}-${subset}-${w}-normal.woff2`)}) format('woff2'); }`))).join('\n')
const latin = await faces('IS', 'instrument-sans', 'latin')
const deva = await faces('Deva', 'noto-sans-devanagari', 'devanagari')

/** the six ships by their short names, without the version or the capsule ("Starship", "SLS") */
const ships = (id: Lang) =>
  Object.values(DATA[id].vehicles)
    .map((v) => v.short.replace(/\s*V3$/, '').replace(/\s*\+.*$/, ''))
    .join(' · ')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function card(id: Lang): string {
  const U = UI[id]
  const info = langInfo(id)
  // no tracking where there are no capitals (it breaks Devanagari's headline and spreads Han apart)
  const caps = id !== 'hi' && id !== 'zh'
  return `<!doctype html><html lang="${info.html}"><head><meta charset="utf-8"><style>
${latin}
${deva}
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: 'IS', 'Deva', 'Noto Sans CJK SC', 'Noto Sans SC', sans-serif; color: #fff; background: #000; }
.bg { position: absolute; inset: 0; background: url(data:image/png;base64,${still}) center / cover; }
.shade { position: absolute; inset: 0; background:
  linear-gradient(90deg, rgba(2,5,11,0.92) 0%, rgba(2,5,11,0.8) 34%, rgba(2,5,11,0.25) 56%, rgba(2,5,11,0) 66%),
  linear-gradient(0deg, rgba(2,5,11,0.6) 0%, rgba(2,5,11,0) 30%); }
.box { position: absolute; left: 64px; top: 64px; width: 580px; }
.mark { display: flex; align-items: center; gap: 14px; font-size: 19px; font-weight: 600; letter-spacing: ${caps ? '0.24em' : '0.02em'}; text-transform: uppercase; }
.dot { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #e8926f, #c8552f 55%, #6a2514); box-shadow: 0 0 18px rgba(200,85,47,0.6); }
h1 { margin-top: 58px; font-size: 62px; line-height: ${caps ? 1.04 : 1.25}; font-weight: 600; letter-spacing: ${caps ? '-0.025em' : '0'}; }
p { margin-top: 24px; font-size: 23px; line-height: 1.45; color: rgba(255,255,255,0.74); font-weight: 400; max-width: ${caps ? '30ch' : '24em'}; }
.ships { position: absolute; left: 64px; bottom: 54px; right: 64px; white-space: nowrap; font-size: 15px; font-weight: 500; letter-spacing: ${caps ? '0.16em' : '0.02em'}; text-transform: uppercase; color: rgba(255,255,255,0.6); line-height: 1.6; }
</style></head><body>
<div class="bg"></div><div class="shade"></div>
<div class="box">
  <div class="mark"><span class="dot"></span>${esc(U.meta.siteName)}</div>
  <h1>${esc(U.share.question)}</h1>
  <p>${esc(U.meta.cardText)}</p>
</div>
<div class="ships"${id === 'tr' ? ' lang="en"' : ''}>${esc(ships(id))}</div>
</body></html>`
}

const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
for (const id of langs) {
  await page.setContent(card(id))
  await page.evaluate(() => document.fonts.ready)
  // the longer questions (French, Hindi…) step the title down until it and the line under it fit
  await page.evaluate(() => {
    const h1 = document.querySelector('h1') as HTMLElement
    const p = document.querySelector('p') as HTMLElement
    let size = 62
    while (size > 36 && p.getBoundingClientRect().bottom > 470) {
      size -= 2
      h1.style.fontSize = `${size}px`
    }
  })
  await page.waitForTimeout(300)
  const out = join(pub, id === 'en' ? 'og.jpg' : `og-${id}.jpg`)
  await writeFile(out, await page.screenshot({ type: 'jpeg', quality: 86 }))
  console.log('wrote', out)
}
await browser.close()
server.close()
