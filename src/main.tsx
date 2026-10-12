import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
      <ModelViewer id={model} view={params.get('view') ?? 'side'} az={num('az', 35)} />
    ) : terrain ? (
      <TerrainViewer kind={terrain} alt={num('alt', 300)} az={num('az', 0)} pitch={num('pitch', 10)} x={num('x', 0)} z={num('z', 0)} />
    ) : (
      <App />
    )}
  </StrictMode>,
)
