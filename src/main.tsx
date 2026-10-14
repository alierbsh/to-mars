import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// the typeface ships with the site (no request to Google's servers before the first paint);
// latin and latin-ext subsets, picked by unicode-range
import '@fontsource/instrument-sans/400.css'
import '@fontsource/instrument-sans/500.css'
import '@fontsource/instrument-sans/600.css'
import '@fontsource/instrument-sans/700.css'
import './styles/global.css'
import App from './App'
import ModelViewer from './scene/ModelViewer'
import TerrainViewer from './scene/TerrainViewer'

const params = new URLSearchParams(location.search)
const model = params.get('model')
const terrain = params.get('terrain')
const num = (k: string, d: number) => Number(params.get(k) ?? d)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {model ? (
      <ModelViewer id={model} view={params.get('view') ?? 'side'} az={num('az', 35)} fire={params.get('fire') === '1'} expansion={num('exp', 1)} floor={params.has('floor') ? num('floor', 0) : Infinity} />
    ) : terrain ? (
      <TerrainViewer kind={terrain} alt={num('alt', 300)} az={num('az', 0)} pitch={num('pitch', 10)} x={num('x', 0)} z={num('z', 0)} pad={params.get('pad') ?? 'lc39a-starship'} />
    ) : (
      <App />
    )}
  </StrictMode>,
)
