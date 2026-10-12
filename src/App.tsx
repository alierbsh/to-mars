import { useEffect } from 'react'
import { useAppStore } from './state/store'
import Panel from './ui/Panel'
import Sidebar from './ui/Sidebar'
import Stage from './ui/Stage'

export default function App() {
  const run = useAppStore((s) => s.run)
  const status = useAppStore((s) => s.status)
  useEffect(() => {
    run()
  }, [run])

  return (
    <div className="app">
      <header className="header">
        <div className="header__title">
          <span className="mars" aria-hidden="true" />
          Occupy Mars
        </div>
        <p className="header__tagline">Pick one of today's rockets, give it a crew, and let the physics decide whether it gets to Mars — and what breaks first.</p>
        <div className={`header__status header__status--${status}`}>{status === 'running' ? 'computing' : status === 'error' ? 'error' : 'live'}</div>
      </header>
      <Sidebar />
      <Stage />
      <Panel />
    </div>
  )
}
