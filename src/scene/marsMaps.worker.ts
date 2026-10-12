/**
 * Texture worker for the Mars surface: rasterises the tier colour maps and grains the globe crop
 * off the main thread. Each map is posted back as soon as it is done (transferred buffer).
 */
import { buildSite, grainGlobe, renderMap } from './marsSite'
import type { Heightmap } from './noise'

export interface MapsRequest {
  type: 'maps'
  gusev: Heightmap
  victoria: Heightmap
  maps: Array<{ kind: 'region' | 'mid' | 'near'; n: number; half: number }>
}
export interface GlobeRequest {
  type: 'globe'
  n: number
  data: Uint8ClampedArray
}
export type MapsWorkerRequest = MapsRequest | GlobeRequest
export interface MapsWorkerResponse {
  kind: 'region' | 'mid' | 'near' | 'globe'
  n: number
  data: Uint8ClampedArray
}

self.onmessage = (e: MessageEvent<MapsWorkerRequest>) => {
  const msg = e.data
  if (msg.type === 'globe') {
    grainGlobe(msg.data, msg.n)
    const res: MapsWorkerResponse = { kind: 'globe', n: msg.n, data: msg.data }
    self.postMessage(res, [msg.data.buffer])
    return
  }
  const site = buildSite(msg.gusev, msg.victoria)
  for (const m of msg.maps) {
    const px = m.kind === 'region' ? site.regionPixel : m.kind === 'mid' ? site.midPixel : site.nearPixel
    const data = renderMap(m.n, m.half, px, m.kind !== 'region')
    const res: MapsWorkerResponse = { kind: m.kind, n: m.n, data }
    self.postMessage(res, [data.buffer])
  }
}
