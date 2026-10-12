import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
const root = '/home/claude/to-mars/dist'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }
const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0]); if (p === '/') p = '/index.html'
  let file = join(root, p); try { await stat(file) } catch { file = join(root, 'index.html') }
  try { const data = await readFile(file); res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }); res.end(data) } catch { res.writeHead(404); res.end() }
})
await new Promise((r) => server.listen(4174, r))
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } })
page.on('console', (m) => { if (m.type() !== 'log') console.log(`[${m.type()}] ${m.text().slice(0, 300)}`) })
page.on('pageerror', (e) => console.log(`[pageerror] ${e.message}`))
await page.goto('http://localhost:4174/' + (process.argv[2] ?? ''))
await page.waitForTimeout(6000)
const info = await page.evaluate(() => {
  const c = document.querySelector('canvas')
  return { canvases: document.querySelectorAll('canvas').length, w: c?.width, h: c?.height, hud: document.querySelector('.hud__phase')?.textContent, stageHTML: document.querySelector('.stage')?.innerHTML.slice(0, 300) }
})
console.log(JSON.stringify(info))
await browser.close(); server.close()
