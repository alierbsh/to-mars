/**
 * The vehicle model plus everything that animates it: engine plumes at the model's
 * `plume:<stageId>` anchors, staging offsets for separated stages, and visibility per phase.
 * Staging follows the vehicle (`STAGING`): Starship hot-stages — the ship lights while still
 * attached and its exhaust bursts out of the booster's vented ring — and the booster flips
 * tail-first and lights for its boostback while it falls away; condensation collars form at the
 * shoulders through Mach 1. All per-frame work mutates Object3Ds directly from the store (no
 * React re-renders).
 */
import { createPortal, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import type { MissionResult } from '../sim/types'
import { useAppStore } from '../state/store'
import { ascentAt, entryAt } from '../ui/hud'
import { ATMO } from './atmosphere'
import { PAD_DECK } from './capeSite'
import { ANIMATED_PARTS, MERGE, mergeStatic } from './mergeStatic'
import { MAT } from './parts'
import { Plume, plumeKindFor, type PlumeKind } from './Plume'
import { VaporCollar } from './Vapor'
import { ASCENT_ROLL, SPACECRAFT_GROUP, STAGING, VehicleModel } from './vehicles'

interface Anchor {
  stage: string
  kind: PlumeKind
  radius: number
  obj: THREE.Object3D
}

export type RigMode = 'pad' | 'ascent' | 'orbit' | 'entry'

/** the climb's attitude as AscentScene shows it (pitch, degrees from vertical) — a stage that has
 * separated keeps its own attitude against it */
export const rigAttitude = { pitch: 0 }

const smooth01 = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c * c * (3 - 2 * c)
}

/** seconds after separation that a booster lights for its boostback */
const BOOSTBACK_IGNITION = 6

/** how far (m, along the stack) a separated stage has fallen behind the one still climbing, dt s
 * after separation: ~0.8 g apart, and a booster burning back home pulls away twice as fast again */
export function stageDrop(dt: number, boostback: boolean): number {
  return boostback ? Math.min(20_000, 4 * dt * dt + 10 * Math.max(0, dt - BOOSTBACK_IGNITION) ** 2) : Math.min(6000, 3.5 * dt * dt)
}

export function VehicleRig({ id, mode, scale = 1 }: { id: string; mode: RigMode; scale?: number }) {
  const root = useRef<THREE.Group>(null)
  const [anchors, setAnchors] = useState<Anchor[]>([])
  const throttles = useRef<Record<string, number>>({})
  const expansion = useRef(1)
  /** distance from the vehicle base to the pad deck (ascent only; Infinity elsewhere) */
  const floor = useRef(Infinity)
  /** per stage, a surface right under its nozzles (hot staging: the top of the stage below) */
  const floors = useRef<Record<string, number | undefined>>({})
  /** the condensation collars' strength (0–1) */
  const vapor = useRef(0)
  const staging = STAGING[id]
  // the axis across the flight plane in the model's frame (the climb rolls the model about its own axis)
  const flipAxis = useMemo(() => new THREE.Vector3(-Math.sin(ASCENT_ROLL[id] ?? 0), 0, Math.cos(ASCENT_ROLL[id] ?? 0)), [id])
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), p: new THREE.Vector3(), r: new THREE.Vector3() }), [])
  const bells = useRef<Array<{ mesh: THREE.Mesh; stage: string; cold: THREE.Material }> | null>(null)
  const parts = useRef<{ list: THREE.Group[]; frostGroup: THREE.Group | null; frostMats: THREE.MeshStandardMaterial[] } | null>(null)
  const vehicle = VEHICLES.find((v) => v.id === id)!

  useEffect(() => {
    if (!root.current) return
    parts.current = null
    bells.current = null
    const list: Anchor[] = []
    root.current.traverse((o) => {
      if (o.name.startsWith('plume:')) {
        list.push({ stage: o.name.slice(6), kind: plumeKindFor(String(o.userData.engines ?? '')), radius: Number(o.userData.radius ?? 2), obj: o })
      }
    })
    setAnchors(list)
    // one mesh per material per stage instead of hundreds (the legs and the frost stay separate:
    // they are animated by name)
    if (MERGE) return mergeStatic(root.current, { keep: ANIMATED_PARTS })
  }, [id])

  useFrame(() => {
    const g = root.current
    if (!g) return
    const { result, t } = useAppStore.getState()
    const burning = new Set<string>()
    const hidden = new Set<string>()
    /** dy: drop along the stack; rz: tumble; turn (rad, about the axis across the flight plane, through `pivot` m up the stage) */
    const offsets: Record<string, { dy: number; rz: number; turn?: number; pivot?: number }> = {}
    /** throttle of a burning stage, if not full (the boostback lights 13 of 33) */
    const level: Record<string, number> = {}
    floors.current = {}
    vapor.current = 0
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
        const dt = ta - st.sep
        // hot staging: the upper stage lights 0.6 s before the stages part; its exhaust, with
        // nowhere to go, bursts out sideways through the vents (the plume's splash on a surface
        // right under the nozzles), until the gap opens too wide for it
        if (staging?.hot?.lower === st.id && dt >= -0.6 && dt < 2.5 && !preIgnition) {
          burning.add(staging.hot.upper)
          floors.current[staging.hot.upper] = 0.6 + stageDrop(Math.max(0, dt), staging.boostback?.stage === st.id) + 400 * Math.max(0, dt - 1.5) ** 2
        }
        if (ta >= st.sep) {
          if (dt > 30) {
            hidden.add(st.id)
            hidden.add(`${st.id}-lvsa`)
          } else if (staging?.boostback?.stage === st.id) {
            // the boostback: the booster keeps its own attitude while the ship pitches up, flips
            // tail-first over ~6 s (its top swinging back toward the coast) and, nearly round,
            // lights its inner engines for the burn home — falling away faster once it does
            const pitchAtSep = ascentAt(result, p.start + st.sep - 0.5)?.pitch ?? rigAttitude.pitch
            const flip = Math.PI * smooth01((dt - 1) / 6)
            offsets[st.id] = { dy: -stageDrop(dt, true), rz: 0, turn: ((rigAttitude.pitch - pitchAtSep) * Math.PI) / 180 + flip, pivot: staging.boostback.pivot }
            if (dt > BOOSTBACK_IGNITION) {
              burning.add(st.id)
              level[st.id] = 0.4
            }
          } else {
            offsets[st.id] = { dy: -stageDrop(dt, false), rz: Math.min(0.5, 0.02 * dt) }
            offsets[`${st.id}-lvsa`] = offsets[st.id]
          }
        }
      }
      // condensation through the transonic: humid air below ~13 km, Mach ~0.88–1.35
      if (s && !preIgnition) vapor.current = smooth01((s.mach - 0.86) / 0.1) * (1 - smooth01((s.mach - 1.15) / 0.22)) * (1 - smooth01((s.alt - 9_000) / 5_000))
      const fj = result.events.find((e) => e.label === 'Fairing jettison')
      if (fj && t >= fj.t) {
        const dt = t - fj.t
        if (dt > 30) hidden.add('fairing')
        else offsets['fairing'] = { dy: Math.min(3000, 2 * dt * dt), rz: Math.min(0.6, 0.03 * dt) }
      }
      expansion.current = s ? 1 + Math.min(3, s.alt / 40_000) : 1
      floor.current = (s?.alt ?? 0) + PAD_DECK[vehicle.launchSite.pad]
    } else if (result && mode === 'orbit') {
      floor.current = Infinity
      for (const st of result.ascent.stageTimes) {
        hidden.add(st.id)
        hidden.add(`${st.id}-lvsa`)
      }
      if (scGroup !== 'fairing') hidden.add('fairing')
      const tmi = result.phases.find((x) => x.phase === 'tmi')
      if (tmi && t >= tmi.start && t < tmi.end) burning.add(vehicle.refuelable ? finalStage : finalStage)
      expansion.current = 4 // vacuum
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
      floor.current = e ? e.alt : Infinity
    }

    // frost: full on the pad, shed over the first 20 s of flight (the ascent phase starts at ignition)
    let frost = 0
    if (mode === 'pad') frost = 1
    else if (mode === 'ascent' && result) {
      const ta = t - result.phases[0].start
      frost = useAppStore.getState().intro ? 1 : Math.max(0, 1 - ta / 20)
    }

    // apply — to the named groups, collected once (a traverse of the whole model every frame
    // is a few hundred objects on a 33-engine booster)
    if (!parts.current) {
      const list: THREE.Group[] = []
      const frostMats: THREE.MeshStandardMaterial[] = []
      let frostGroup: THREE.Group | null = null
      g.traverse((o) => {
        if (!(o instanceof THREE.Group) || !o.name || o.name.startsWith('plume:')) return
        if (o.name === 'frost') {
          frostGroup = o
          o.traverse((c) => {
            const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
            if (m && m.transparent) frostMats.push(m)
          })
          return
        }
        if (o.name === 'leg' || o.name === 'legExt') return
        o.userData.basePos ??= o.position.clone()
        o.userData.baseRot ??= o.rotation.clone()
        list.push(o)
      })
      parts.current = { list, frostGroup, frostMats }
    }
    const { list, frostGroup, frostMats } = parts.current
    if (frostGroup) {
      frostGroup.visible = frost > 0.01
      for (const m of frostMats) m.opacity = 0.75 * frost
    }
    for (const o of list) {
      const key = o.name
      o.visible = !hidden.has(key)
      const off = offsets[key]
      const basePos = o.userData.basePos as THREE.Vector3
      const baseRot = o.userData.baseRot as THREE.Euler
      if (off?.turn !== undefined) {
        // turned about the axis across the flight plane, through a point `pivot` m up the stage:
        // shift it so that point stays put (stage groups are unrotated in the model)
        tmp.q.setFromAxisAngle(flipAxis, off.turn)
        tmp.p.set(0, off.pivot ?? 0, 0)
        tmp.r.copy(tmp.p).applyQuaternion(tmp.q)
        o.quaternion.copy(tmp.q)
        o.position.copy(basePos).add(tmp.p).sub(tmp.r)
        o.position.y += off.dy
      } else {
        o.position.copy(basePos)
        o.position.y += off ? off.dy : 0
        o.rotation.set(baseRot.x, baseRot.y, baseRot.z + (off ? off.rz : 0))
      }
    }
    for (const a of anchors) throttles.current[a.stage] = burning.has(a.stage) ? (level[a.stage] ?? 1) : 0
    // engine bells glow while their stage fires
    if (!bells.current) {
      const list: Array<{ mesh: THREE.Mesh; stage: string; cold: THREE.Material }> = []
      g.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh || (m.material !== MAT.bell && m.material !== MAT.bellHot)) return
        let p: THREE.Object3D | null = o
        while (p && !(p instanceof THREE.Group && p.name && !p.name.startsWith('plume:'))) p = p.parent
        if (p) list.push({ mesh: m, stage: p.name, cold: m.material as THREE.Material })
      })
      bells.current = list
    }
    for (const b of bells.current) b.mesh.material = burning.has(b.stage) ? MAT.bellGlow : b.cold
  })

  const collars = useMemo(() => (mode === 'ascent' ? vaporCollars(id) : []), [id, mode])
  return (
    <group ref={root} scale={scale}>
      <VehicleModel id={id} />
      {anchors.map((a, i) => (
        <PlumeAt key={i} anchor={a} throttles={throttles} expansion={expansion} floor={floor} floors={floors} lights={mode !== 'orbit'} />
      ))}
      {collars.map((c, i) => (
        <VaporCollar key={i} y={c.y} r={c.r} length={c.r * (i === 0 ? 5 : 7)} strength={vapor} sun={ATMO.sunDir.value} />
      ))}
    </group>
  )
}

/** where the condensation collars go: the vehicle's own list, else the nose shoulder and the first interstage */
function vaporCollars(id: string): Array<{ y: number; r: number }> {
  const own = STAGING[id]?.vapor
  if (own) return own
  const v = VEHICLES.find((x) => x.id === id)
  if (!v) return []
  const core = v.stages.filter((s) => s.role !== 'booster')
  const r = Math.max(...core.map((s) => s.diameter ?? 4)) / 2
  return [{ y: v.height * 0.88, r }, ...(core.length > 1 ? [{ y: core[0].length ?? v.height * 0.5, r: (core[0].diameter ?? 2 * r) / 2 }] : [])]
}

/** Renders a plume as a child of the anchor object, so it moves with its stage. */
function PlumeAt({ anchor, throttles, expansion, floor, floors, lights }: { anchor: Anchor; throttles: React.MutableRefObject<Record<string, number>>; expansion: React.MutableRefObject<number>; floor: React.MutableRefObject<number>; floors: React.MutableRefObject<Record<string, number | undefined>>; lights: boolean }) {
  const [thr, setThr] = useState(0)
  const [exp, setExp] = useState(1)
  const fl = useRef(Infinity)
  useFrame(() => {
    const v = throttles.current[anchor.stage] ?? 0
    if (v !== thr) setThr(v)
    const e = expansion.current
    if (Math.abs(e - exp) > 0.05) setExp(e)
    // the deck below the nozzle (only the first stage ever gets near it), or a stage's own surface
    // right under it (hot staging)
    fl.current = floors.current[anchor.stage] ?? floor.current + anchor.obj.position.y
  })
  return createPortal(<Plume kind={anchor.kind} radius={anchor.radius} length={anchor.radius * 18} throttle={thr} expansion={exp} floor={fl} lights={lights} />, anchor.obj)
}

export function useResultAndT(): { result: MissionResult | null; t: number } {
  const result = useAppStore((s) => s.result)
  const t = useAppStore((s) => s.t)
  return { result, t }
}
