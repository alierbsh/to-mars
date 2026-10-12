// Screenshot the built app with headless Chromium (software WebGL).
// Usage: node scripts/shot.mjs [out.png] [width] [height] [waitMs] [query]
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const out = process.argv[2] ?? 'shot.png'
const width = Number(process.argv[3] ?? 1440)
const height = Number(process.argv[4] ?? 900)
const waitMs = Number(process.argv[5] ?? 4000)
const query = process.argv[6] ?? ''
const root = new URL('../dist', import.meta.url).pathname
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' }

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
await new Promise((r) => server.listen(4173, r))

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width, height } })
const logs = []
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`))
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
await page.goto(`http://localhost:4173/${query}`)
await page.waitForTimeout(waitMs)
await page.screenshot({ path: out })
console.log(logs.filter((l) => !l.includes('[log]') || process.env.SHOT_LOGS).slice(0, 30).join('\n'))
await browser.close()
server.close()
