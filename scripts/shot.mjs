// Screenshot the built app with headless Chromium (software WebGL).
// Usage: node scripts/shot.mjs [out.png] [width] [height] [waitMs] [query] [clickSelector|clickSelector2...]
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const out = process.argv[2] ?? 'shot.png'
const width = Number(process.argv[3] ?? 1440)
const height = Number(process.argv[4] ?? 900)
const waitMs = Number(process.argv[5] ?? 4000)
const query = process.argv[6] ?? ''
const click = process.argv[7]
const root = new URL('../dist', import.meta.url).pathname
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm' }

const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (p === '/') p = '/index.html'
  let file = join(root, p)
  try {
    await stat(file)
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
const port = Number(process.env.SHOT_PORT ?? 4173)
await new Promise((r) => server.listen(port, r))

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width, height } })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))
await page.goto(`http://localhost:${port}/${query}`)
// CSS transitions do not advance under headless SwiftShader: disable them when clicking around
if (click) await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' })
await page.waitForTimeout(waitMs)
if (click) {
  // several selectors separated by '|' are clicked in turn, 1.5 s apart (SHOT_CLICK_WAIT ms; 'js:sel' clicks via the DOM)
  for (const sel of click.split('|')) {
    // 'js:' prefix: click through the DOM (no actionability checks — the GPU-less page is slow)
    if (sel.startsWith('js:')) await page.evaluate((q) => document.querySelector(q)?.click(), sel.slice(3))
    else await page.click(sel)
    await page.waitForTimeout(Number(process.env.SHOT_CLICK_WAIT ?? 1500))
  }
}
await page.screenshot({ path: out, timeout: 180_000 })
console.log(logs.filter((l) => !l.includes('[log]') || process.env.SHOT_LOGS).slice(0, 30).join('\n'))
await browser.close()
server.close()
