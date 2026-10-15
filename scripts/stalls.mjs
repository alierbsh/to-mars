// Main-thread stalls around the scene cuts. Opens the built site at a mission time just before a
// cut (the query), records the long tasks (PerformanceObserver) and the moments each shot starts
// (?debug=1 makes the app log them, and the views built ahead: Prewarm.tsx), then prints the long
// tasks around each cut and the programs the renderer holds. Under SwiftShader shader compiles are
// CPU work, so they show up as long tasks.
//   node scripts/stalls.mjs "?vehicle=starship-v3&preset=claims&window=w2028&t=430" [seconds]
// (SHOT_PORT, SHOT_UA as in shot.mjs)
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const query = process.argv[2] ?? ''
const seconds = Number(process.argv[3] ?? 40)
const root = new URL('../dist', import.meta.url).pathname
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.webp': 'image/webp', '.ktx2': 'image/ktx2' }
const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (p.endsWith('/')) p += 'index.html'
  let file = join(root, p)
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
  } catch {
    file = join(root, 'index.html')
  }
  try {
    const data = await readFile(file)
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end()
  }
})
const port = Number(process.env.SHOT_PORT ?? 4190)
await new Promise((r) => server.listen(port, r))
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, userAgent: process.env.SHOT_UA || undefined })
await page.addInitScript(() => {
  window.__lt = []
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration])
  }).observe({ type: 'longtask', buffered: true })
})
const views = []
const perf = []
page.on('console', (m) => {
  const t = m.text()
  if (t.startsWith('[shot]')) views.push(t)
  else if (t.startsWith('[perf]')) perf.push(t)
  else if (t.startsWith('[warm]')) console.log(t)
})
const sep = query.includes('?') ? '&' : '?'
await page.goto(`http://localhost:${port}/${query}${sep}debug=1`)
// a deep link opens paused at its time: press play once the first frames are up
await page.waitForTimeout(Number(process.env.STALL_SETTLE ?? 15000))
await page.evaluate(() => document.querySelector('.ctl--main')?.click())
await page.waitForTimeout(seconds * 1000)
const lt = await page.evaluate(() => window.__lt)
console.log(views.join('\n'))
const cuts = views.map((v) => Number(v.split(' ')[2]))
for (let i = 0; i < cuts.length; i++) {
  const from = cuts[i]
  const to = i + 1 < cuts.length ? cuts[i + 1] : Infinity
  const mine = lt.filter(([s]) => s >= from - 200 && s < to)
  const total = mine.reduce((a, [, d]) => a + d, 0)
  const worst = mine.reduce((a, [, d]) => Math.max(a, d), 0)
  // the cut itself (its first 2 s), then the first ten seconds (where the next shot starts being
  // built ahead), then the whole shot
  const sum = (l) => `${l.length} (${l.reduce((a, [, d]) => a + d, 0).toFixed(0)} ms, worst ${l.reduce((a, [, d]) => Math.max(a, d), 0).toFixed(0)} ms)`
  const cut = mine.filter(([s]) => s < from + 2_000)
  const early = mine.filter(([s]) => s < from + 10_000)
  console.log(`${views[i]}: long tasks at the cut (2 s) ${sum(cut)}; in the first 10 s ${sum(early)}; whole shot ${sum(mine)}`)
}
const prog = perf.map((p) => (p.match(/programs=(\d+)/) ?? [])[1]).filter(Boolean)
console.log('programs over time:', prog.join(' '))
await browser.close()
server.close()
