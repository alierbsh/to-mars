import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'
import ModelViewer from './scene/ModelViewer'

const params = new URLSearchParams(location.search)
const model = params.get('model')

createRoot(document.getElementById('root')!).render(
  <StrictMode>{model ? <ModelViewer id={model} view={params.get('view') ?? 'side'} az={Number(params.get('az') ?? 35)} /> : <App />}</StrictMode>,
)
