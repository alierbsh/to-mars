import Scene from '../scene/Scene'
import { useAppStore } from '../state/store'
import LowerThird from './LowerThird'

/** The stage is the whole screen: the 3D scene (which also runs the mission clock, scene/Scene.tsx: Playback) and the webcast-style lower third (gauges, clock, timeline, engines, controls). */
export default function Stage() {
  const result = useAppStore((s) => s.result)
  const intro = useAppStore((s) => s.intro)
  const openSeq = useAppStore((s) => s.openSeq)

  return (
    <main className="stage">
      <Scene />
      {result && !intro && <LowerThird key={openSeq} />}
    </main>
  )
}
