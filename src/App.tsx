import { useEffect } from 'react'
import { useAppStore } from './state/store'
import DetailsSheet from './ui/DetailsSheet'
import Intro from './ui/Intro'
import MissionDrawer from './ui/MissionDrawer'
import Stage from './ui/Stage'
import TopBar from './ui/TopBar'
import VerdictCard from './ui/VerdictCard'
import Toast from './ui/Toast'
import Wiki from './ui/Wiki'

/** ?clean=1: the scene alone, no overlays (for the link preview image and other stills) */
const CLEAN = new URLSearchParams(location.search).get('clean') === '1'

export default function App() {
  const run = useAppStore((s) => s.run)
  const drawer = useAppStore((s) => s.drawer)
  const setDrawer = useAppStore((s) => s.setDrawer)
  useEffect(() => {
    run()
  }, [run])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawer) setDrawer(drawer)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawer, setDrawer])

  const intro = useAppStore((s) => s.intro)
  const wiki = useAppStore((s) => s.wiki)
  const quality = useAppStore((s) => s.quality)
  return (
    <div className={`app app--q-${quality} ${drawer ? `app--${drawer}` : ''} ${intro ? `app--intro app--intro-${intro}` : ''} ${wiki ? 'app--wiki' : ''} ${CLEAN ? 'app--clean' : ''}`}>
      <Stage />
      <TopBar />
      <VerdictCard />
      <MissionDrawer />
      <DetailsSheet />
      {drawer && <button className="scrim" aria-label="Close panel" onClick={() => setDrawer(drawer)} />}
      <Wiki />
      <Intro />
      <Toast />
    </div>
  )
}
