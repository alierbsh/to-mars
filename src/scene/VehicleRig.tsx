/**
 * The vehicle model plus everything that animates it: engine plumes at the model's
 * `plume:<stageId>` anchors, staging offsets for separated stages, and visibility per phase.
 * All per-frame work mutates Object3Ds directly from the store (no React re-renders).
 */
import { createPortal, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import type { MissionResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { ascentAt, entryAt } from '../ui/hud'
import { Plume, plumeKindFor, type PlumeKind } from './Plume'
import { SPACECRAFT_GROUP, VehicleModel } from './vehicles'

interface Anchor {
  stage: string
  kind: PlumeKind
  radius: number
  obj: THREE.Object3D
}

export type RigMode = 'pad' | 'ascent' | 'orbit' | 'entry'

export function VehicleRig({ id, mode, scale = 1 }: { id: string; mode: RigMode; scale?: number }) {
  const root = useRef<THREE.Group>(null)
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const throttles = useRef<Record<string, number>>({})
  const expansion = useRef(1)
  const vehicle = VEHICLES.find((v) => v.id === id)!

  useEffect(() => {
    if (!root.current) return
    const list: Anchor[] = []
    root.current.traverse((o) => {
      if (o.name.startsWith('plume:')) {
        list.push({ stage: o.name.slice(6), kind: plumeKindFor(String(o.userData.engines ?? '')), radius: Number(o.userData.radius ?? 2), obj: o })
      }
    })
    setAnchors(list)
  }, [id])

  useFrame(() => {
    const g = root.current
    if (!g) return
    const { result, t } = useAppStore.getState()
    const burning = new Set<string>()
    const hidden = new Set<string>()
    const offsets: Record<string, { dy: number; rz: number }> = {}
    const scGroup = SPACECRAFT_GROUP[id]
    const finalStage = vehicle.stages[vehicle.stages.length - 1].id

    if (result && mode === 'ascent') {
      const p = result.phases.find((x) => x.phase === 'ascent')!
      const ta = t - p.start
      const s = ascentAt(result, t)
      const preIgnition = useAppStore.getState().intro !== null // the opening: on the pad, engines cold
      if (s && s.thrust > 0 && t < p.end && !preIgnition) {
        burning.add(s.stage)
        for (const b of vehicle.stages) if (b.role === 'booster' && !result.ascent.stageTimes.some((st) => st.id === b.id && ta >= st.sep)) burning.add(b.id)
      }
      for (const st of result.ascent.stageTimes) {
        if (ta >= st.sep) {
          const dt = ta - st.sep
          if (dt > 30) {
            hidden.add(st.id)
            hidden.add(`${st.id}-lvsa`)
          } else {
            offsets[st.id] = { dy: -Math.min(6000, 3.5 * dt * dt), rz: Math.min(0.5, 0.02 * dt) }
            offsets[`${st.id}-lvsa`] = offsets[st.id]
          }
        }
      }
      const fj = result.events.find((e) => e.label === 'Fairing jettison')
      if (fj && t >= fj.t) {
        const dt = t - fj.t
        if (dt > 30) hidden.add('fairing')
        else offsets['fairing'] = { dy: Math.min(3000, 2 * dt * dt), rz: Math.min(0.6, 0.03 * dt) }
      }
      expansion.current = s ? 1 + Math.min(3, s.alt / 40_000) : 1
    } else if (result && mode === 'orbit') {
      for (const st of result.ascent.stageTimes) {
        hidden.add(st.id)
        hidden.add(`${st.id}-lvsa`)
      }
      if (scGroup !== 'fairing') hidden.add('fairing')
      const tmi = result.phases.find((x) => x.phase === 'tmi')
      if (tmi && t >= tmi.start && t < tmi.end) burning.add(vehicle.refuelable ? finalStage : finalStage)
      expansion.current = 3
    } else if (result && mode === 'entry') {
      for (const st of vehicle.stages) {
        if (st.id !== scGroup) {
          hidden.add(st.id)
          hidden.add(`${st.id}-lvsa`)
        }
      }
      if (scGroup !== 'fairing') hidden.add('fairing')
      if (!vehicle.refuelable) hidden.add(finalStage)
      hidden.add(`${scGroup}-sm`)
      const e = entryAt(result, t)
      if (e?.burning) burning.add(scGroup)
      expansion.current = 1.2
    }

    // apply
    g.traverse((o) => {
      if (!(o instanceof THREE.Group) || !o.name || o.name.startsWith('plume:')) return
      const key = o.name
      const base = (o.userData.baseY ??= o.position.y) as number
      const baseRz = (o.userData.baseRz ??= o.rotation.z) as number
      o.visible = !hidden.has(key)
      const off = offsets[key]
      o.position.y = base + (off ? off.dy : 0)
      o.rotation.z = baseRz + (off ? off.rz : 0)
    })
    for (const a of anchors) throttles.current[a.stage] = burning.has(a.stage) ? 1 : 0

  })

  return (
    <group ref={root} scale={scale}>
      <VehicleModel id={id} />
      {anchors.map((a, i) => (
        <PlumeAt key={i} anchor={a} throttles={throttles} expansion={expansion} />
      ))}
    </group>
  )
}

/** Renders a plume as a child of the anchor object, so it moves with its stage. */
function PlumeAt({ anchor, throttles, expansion }: { anchor: Anchor; throttles: React.MutableRefObject<Record<string, number>>; expansion: React.MutableRefObject<number> }) {
  const [thr, setThr] = useState(0)
  const [exp, setExp] = useState(1)
  useFrame(() => {
    const v = throttles.current[anchor.stage] ?? 0
    if (v !== thr) setThr(v)
    const e = expansion.current
    if (Math.abs(e - exp) > 0.05) setExp(e)
  })
  return createPortal(<Plume kind={anchor.kind} radius={anchor.radius} length={anchor.radius * 18} throttle={thr} expansion={exp} />, anchor.obj)
}

export function useResultAndT(): { result: MissionResult | null; t: number } {
  const result = useAppStore((s) => s.result)
  const t = useAppStore((s) => s.t)
  return { result, t }
}
