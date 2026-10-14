import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
const root = '/home/claude/to-mars/dist'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' }
const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0]); if (p === '/') p = '/index.html'
  let f = join(root, p); try { await stat(f) } catch { f = join(root, 'index.html') }
  try { res.writeHead(200, { 'content-type': types[extname(f)] ?? 'application/octet-stream' }); res.end(await readFile(f)) } catch { res.writeHead(404); res.end() }
})
await new Promise((r) => server.listen(4299, r))
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
for (const w of [1440, 1280, 1100, 1024, 900, 820, 600, 414, 375]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } })
  await page.goto('http://localhost:4299/?vehicle=starship-v3&t=95&still=1&quality=low')
  await page.waitForTimeout(2500)
  const boxes = await page.evaluate(() => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] }
    const pills = [...document.querySelectorAll('.top__right .pill')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), e.textContent.trim().slice(0, 18)] })
    return { wordmark: q('.wordmark'), byline: q('.byline'), brand: q('.brand'), craft: q('.craft'), right: q('.top__right'), pills, top: q('.top'), sw: document.documentElement.scrollWidth }
  })
  console.log(w, JSON.stringify(boxes))
  await page.close()
}
await browser.close(); server.close()
