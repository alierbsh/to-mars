/**
 * The next view, built ahead of its cut (precompile.ts says why a cut stalled). Each view after
 * the climb has a job: a copy of it mounted in a scene of its own that is never drawn — inert
 * (warm.ts: the camera, earthState and the page's labels belong to the view on screen) — with the
 * lights, fog and environment the real one will have, so its programs compile and its maps load
 * and upload while the current view plays on. The renderer caches programs by key, so at the cut
 * the real view finds them built. A job starts once the view before it has settled; jobs mount
 * one at a time; each stays a few seconds past its cut (its materials hold the programs until the
 * real view has taken them over), then goes. The view on screen is swept the same way after
 * each cut and every few seconds after, so what it keeps hidden until later — the tanker, the
 * flames, the dust — does not compile in the middle of the moment it appears.
 */
import { Stars } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useLayoutEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import type { MissionResult } from '../sim/types'
import { phaseAt, useAppStore } from '../state/store'
import CruiseScene from './CruiseScene'
import EntryScene from './EntryScene'
import OrbitScene from './OrbitScene'
import { Precompiler, lightSignature, primeLights, type Budget } from './precompile'
import { Warm, globalEnv } from './warm'

type Shot = 'ascent' | 'orbit' | 'cruise' | 'entry'
type Job = Exclude<Shot, 'ascent'>

/** the view on screen at t (Scene.tsx) */
export function shotAt(result: MissionResult, t: number): Shot {
  const p = phaseAt(result, t).phase
  if (p === 'ascent') return 'ascent'
  if (p === 'leo' || p === 'tmi') return 'orbit'
  if (p === 'cruise') return 'cruise'
  return 'entry'
}

/** what to build during each view: the next one */
const AFTER: Record<Shot, Job[]> = { ascent: ['orbit'], orbit: ['cruise'], cruise: ['entry'], entry: [] }

/** the shots this mission gets to */
function reached(result: MissionResult): Set<Shot> {
  const s = new Set<Shot>()
  const ph = result.phases.map((p) => p.phase)
  if (ph.includes('leo')) s.add('orbit')
  const ci = ph.indexOf('cruise')
  if (ci >= 0) {
    s.add('cruise')
    if (ci + 1 < ph.length) s.add('entry')
  }
  return s
}

/** ?debug=1: the shots, the jobs and their progress go to the console (scripts/stalls.mjs reads them) */
const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1'
/** ?prewarm=0 turns it off (for comparisons) */
const OFF = typeof location !== 'undefined' && new URLSearchParams(location.search).get('prewarm') === '0'

/** real ms a shot plays before the next one is built (its own cut has settled) */
const SETTLE_MS = 2500
/** real ms a job stays past its cut */
const LINGER_MS = 3500

/** the stars every view after the climb draws (Scene.tsx), and every copy of one */
export function SkyStars() {
  return <Stars radius={200_000} depth={50_000} count={3000} factor={600} saturation={0} fade speed={0.1} />
}

const targets = new Map<Job, { pc: Precompiler; camera: THREE.Camera; nextScan: number; built: boolean; drawAt: number }>()

/** a job has its programs once its scene has been scanned twice with nothing new and its queue is empty */
function built(j: Job): boolean {
  const t = targets.get(j)
  return !!t && t.built
}

export function Prewarm({ vehicleId, ready }: { vehicleId: string; ready: () => boolean }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const [jobs, setJobs] = useState<Job[]>([])
  const st = useMemo(
    () => ({
      jobs: [] as Job[],
      shot: null as Shot | null,
      since: 0,
      next: 0,
      linger: new Map<Job, number>(),
      main: new Precompiler(scene),
      mainScan: 0,
      scanned: false,
      swept: false,
      drawAt: 0,
      primed: { shot: null as Shot | null, until: 0, sig: '' },
      log: 0,
    }),
    [scene],
  )

  useFrame(({ camera }) => {
    const now = performance.now()
    const { result, t, intro, playing } = useAppStore.getState()
    if (OFF) {
      if (DEBUG && result && shotAt(result, t) !== st.shot) {
        st.shot = shotAt(result, t)
        console.log(`[shot] ${st.shot} ${now.toFixed(0)}`)
      }
      return
    }
    // for a few seconds after each cut, the canvas's lights are set up before every frame that
    // finds them changed: the new view's first shadow pass then compiles for its own lights
    // (precompile.ts: primeLights)
    const shotNow = result ? shotAt(result, t) : null
    if (shotNow !== st.primed.shot) {
      st.primed.shot = shotNow
      st.primed.until = now + 3000
    }
    if (now < st.primed.until && gl.getRenderTarget() === null) {
      const sig = lightSignature(scene)
      if (sig !== st.primed.sig) {
        st.primed.sig = sig
        primeLights(gl, camera, scene)
      }
    }
    if (now >= st.next) {
      st.next = now + 250
      const shot = result ? shotAt(result, t) : null
      if (shot !== st.shot) {
        if (DEBUG) console.log(`[shot] ${shot} ${now.toFixed(0)}`)
        st.shot = shot
        st.since = now
        // the view just cut to: swept once its first frames are out
        st.mainScan = now + 1000
        st.scanned = false
        st.swept = false
      }
      const want: Job[] = []
      // not on the opening screens, nor while the frame rate is being measured (AdaptiveQuality),
      // nor in the climb's first 40 s (measured, and the liftoff)
      if (result && shot && !intro && now - st.since > SETTLE_MS && ready() && !(shot === 'ascent' && t - result.phases[0].start < 40)) {
        const can = reached(result)
        for (const j of AFTER[shot]) if (can.has(j)) want.push(j)
      }
      // (the list as last set: the render that mounts it may come a few frames later)
      const jobs = st.jobs
      let next = jobs.filter((j) => {
        if (want.includes(j)) {
          st.linger.delete(j)
          return true
        }
        // past its cut: until the view on screen has been swept (its hidden parts hold the
        // programs now), and a little longer — at most half a minute more
        const until = st.linger.get(j) ?? now + LINGER_MS
        st.linger.set(j, until)
        if (now < until || (!st.swept && now < until + 30_000)) return true
        st.linger.delete(j)
        return false
      })
      // one at a time, once the view on screen is swept: the next once those wanted are built
      const add = want.find((j) => !next.includes(j))
      if (add && st.swept && !next.some((j) => want.includes(j) && !built(j))) next = [...next, add]
      if (next.length !== jobs.length || next.some((j, i) => j !== jobs[i])) {
        if (DEBUG) console.log(`[warm] ${next.join(',') || '-'} ${now.toFixed(0)}`)
        st.jobs = next
        setJobs(next)
      }
    }
    // nothing while the frame rate is being measured: the work would count against the device
    if (!ready()) return
    if (now >= st.mainScan) {
      st.main.scan()
      st.mainScan = now + 3000
      st.scanned = true
    }
    if (DEBUG && now > st.log) {
      st.log = now + 5000
      console.log(`[warm] main: ${st.main.stats()}`)
      for (const j of jobs) console.log(`[warm] ${j}: ${targets.get(j)?.pc.stats() ?? 'not yet'}`)
    }
    // this frame's share (more while paused: nothing moves). The view on screen first until it
    // has been swept after its cut, then the next view's copy, which has a cut to make
    const b: Budget = { until: now + (playing ? 4 : 8), programs: 2, finish: 2, bytes: 8 << 20 }
    // and at most one draw of a whole scene into a pixel (precompile.ts: prerender) a frame
    let drew = false
    if (!st.swept) st.main.step(gl, camera, b)
    for (const j of jobs) {
      const w = targets.get(j)
      if (!w) continue
      if (now >= w.nextScan) {
        w.pc.scan()
        w.nextScan = now + (w.pc.idle ? 2000 : 700)
      }
      w.pc.step(gl, camera, b)
      if (!w.built && w.pc.idle && w.pc.quiet >= 2 && w.pc.count > 0) {
        w.built = true
        if (DEBUG) console.log(`[warm] built ${j}: ${w.pc.count} objects, programs=${gl.info.programs?.length ?? 0} ${now.toFixed(0)}`)
      }
      if (w.built && !drew && w.pc.idle && w.pc.undrawn && now >= w.drawAt) {
        w.drawAt = now + 5000
        w.pc.prerender(gl, w.camera)
        drew = true
        if (DEBUG) console.log(`[warm] drew ${j}: ${gl.info.render.calls} calls, programs=${gl.info.programs?.length ?? 0} ${now.toFixed(0)}`)
      }
    }
    if (st.swept) st.main.step(gl, camera, b)
    if (!st.swept && st.scanned && st.main.idle) {
      st.swept = true
      if (DEBUG) console.log(`[warm] swept ${st.shot}: ${st.main.count} objects, programs=${gl.info.programs?.length ?? 0} ${now.toFixed(0)}`)
    }
    // the view on screen: once a shot, after its sweep (what it shows is drawn anyway; this is for
    // what it hides until later)
    if (st.swept && !drew && st.main.idle && st.main.undrawn && st.drawAt < st.since) {
      st.drawAt = now
      st.main.prerender(gl, camera)
      if (DEBUG) console.log(`[warm] drew ${st.shot}: ${gl.info.render.calls} calls, programs=${gl.info.programs?.length ?? 0} ${now.toFixed(0)}`)
    }
    if (DEBUG) Object.assign(window, { __warm: targets })
  })

  return (
    <>
      {jobs.map((j) => (
        <WarmJob key={j} job={j} vehicleId={vehicleId} />
      ))}
    </>
  )
}

/** a copy of the view `job`, in a scene of its own that is compiled but never drawn */
function WarmJob({ job, vehicleId }: { job: Job; vehicleId: string }) {
  const [scene] = useState(() => {
    const s = new THREE.Scene()
    s.name = `warm:${job}`
    // the orbit and the entry keep the canvas's fog (Scene.tsx); the cruise drops it
    if (job === 'orbit' || job === 'entry') s.fog = new THREE.Fog(0x000000, 1, 2)
    return s
  })
  const [camera] = useState(() => new THREE.PerspectiveCamera(35, 1, 0.5, 600_000))
  useLayoutEffect(() => {
    // the entry has no environment of its own: it reflects the canvas's
    if (job === 'entry') scene.environment = globalEnv.texture
    const w = { pc: new Precompiler(scene), camera, nextScan: 0, built: false, drawAt: 0 }
    targets.set(job, w)
    return () => {
      if (targets.get(job) === w) targets.delete(job)
    }
  }, [job, scene, camera])
  return createPortal(
    <Warm.Provider value>
      <Suspense fallback={null}>
        <SkyStars />
        {job === 'orbit' ? <OrbitScene vehicleId={vehicleId} /> : job === 'cruise' ? <CruiseScene vehicleId={vehicleId} /> : <EntryScene vehicleId={vehicleId} />}
      </Suspense>
    </Warm.Provider>,
    scene,
    { camera },
  )
}
