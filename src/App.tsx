import { useEffect } from 'react'
import { useAppStore } from './state/store'
import DetailsSheet from './ui/DetailsSheet'
import MissionDrawer from './ui/MissionDrawer'
import Stage from './ui/Stage'
import TopBar from './ui/TopBar'
import VerdictCard from './ui/VerdictCard'

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

  return (
    <div className={`app ${drawer ? `app--${drawer}` : ''}`}>
      <Stage />
      <TopBar />
      <VerdictCard />
      <MissionDrawer />
      <DetailsSheet />
      {drawer && <button className="scrim" aria-label="Close panel" onClick={() => setDrawer(drawer)} />}
    </div>
  )
}
