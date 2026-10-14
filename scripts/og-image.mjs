// The link preview image (public/og.jpg, 1200×630): a still of the climb rendered by the site
// itself, with the title set over it in the site's typeface.
// Usage: npm run build && node scripts/og-image.mjs [missionSeconds]
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFile, stat, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const t = Number(process.argv[2] ?? 110)
const root = new URL('../dist', import.meta.url).pathname
const fonts = new URL('../node_modules/@fontsource/instrument-sans/files/', import.meta.url).pathname
const out = new URL('../public/og.jpg', import.meta.url).pathname
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2' }

const server = createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? '/').split('?')[0])
  if (p === '/') p = '/index.html'
  let f = join(root, p)
  try {
    await stat(f)
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
await new Promise((r) => server.listen(port, r))
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })

// 1. the still: wider than the card, so the ship (framed at the centre) lands right of the text
const W = 1640
const H = 630
const shot = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 })
await shot.goto(`http://localhost:${port}/?vehicle=starship-v3&t=${t}&still=1&clean=1&quality=high`)
await shot.waitForTimeout(16000)
const still = await shot.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: H } })
await shot.close()

// 2. the card
const font = async (w) => (await readFile(join(fonts, `instrument-sans-latin-${w}-normal.woff2`))).toString('base64')
const [f400, f500, f600] = await Promise.all([font(400), font(500), font(600)])
const html = `<!doctype html><html><head><style>
@font-face { font-family: 'IS'; font-weight: 400; src: url(data:font/woff2;base64,${f400}) format('woff2'); }
@font-face { font-family: 'IS'; font-weight: 500; src: url(data:font/woff2;base64,${f500}) format('woff2'); }
@font-face { font-family: 'IS'; font-weight: 600; src: url(data:font/woff2;base64,${f600}) format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: 'IS', sans-serif; color: #fff; background: #000; }
.bg { position: absolute; inset: 0; background: url(data:image/png;base64,${still.toString('base64')}) center / cover; }
.shade { position: absolute; inset: 0; background:
  linear-gradient(90deg, rgba(2,5,11,0.92) 0%, rgba(2,5,11,0.78) 30%, rgba(2,5,11,0.25) 52%, rgba(2,5,11,0) 64%),
  linear-gradient(0deg, rgba(2,5,11,0.6) 0%, rgba(2,5,11,0) 30%); }
.box { position: absolute; left: 64px; top: 64px; width: 560px; }
.mark { display: flex; align-items: center; gap: 14px; font-size: 19px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; }
.dot { width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #e8926f, #c8552f 55%, #6a2514); box-shadow: 0 0 18px rgba(200,85,47,0.6); }
h1 { margin-top: 62px; font-size: 62px; line-height: 1.04; font-weight: 600; letter-spacing: -0.025em; }
p { margin-top: 24px; font-size: 23px; line-height: 1.4; color: rgba(255,255,255,0.74); font-weight: 400; max-width: 30ch; }
.ships { position: absolute; left: 64px; bottom: 54px; font-size: 15px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
</style></head><body>
<div class="bg"></div><div class="shade"></div>
<div class="box">
  <div class="mark"><span class="dot"></span>Occupy Mars Simulation</div>
  <h1>Can today’s rockets carry a crew to Mars?</h1>
  <p>Real masses, real engines, real orbital mechanics. Watch the physics decide.</p>
</div>
<div class="ships">Starship · SLS · Falcon Heavy · New Glenn · Long March 10 · Saturn V</div>
</body></html>`
const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await card.setContent(html)
await card.waitForTimeout(800)
await writeFile(out, await card.screenshot({ type: 'jpeg', quality: 86 }))
console.log('wrote', out)
await browser.close()
server.close()
