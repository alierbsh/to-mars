/**
 * Debug/showcase viewer: ?model=<vehicleId>&view=side|front|engines|nose|plume&az=<deg>
 * Renders just the vehicle on a pad with a fixed camera — used for screenshot checks.
 * `&fire=1` lights every stage's plume (`&exp=` 1 sea level → 4 vacuum, `&floor=` metres from
 * the nozzles to a deck below, default none) for flame work.
 */
import { Canvas, createPortal } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { ANIMATED_PARTS, MERGE, mergeStatic } from './mergeStatic'
import { Plume, plumeKindFor } from './Plume'
import { VehicleModel } from './vehicles'

/** the plumes of a model standing still, at full throttle */
function StaticFire({ id, expansion, floor }: { id: string; expansion: number; floor: number }) {
  const root = useRef<THREE.Group>(null)
  const [anchors, setAnchors] = useState<THREE.Object3D[]>([])
  const fl = useRef(floor)
  useEffect(() => {
    if (!root.current) return
    const list: THREE.Object3D[] = []
    root.current.traverse((o) => {
      if (o.name.startsWith('plume:')) list.push(o)
    })
    setAnchors(list)
  }, [id])
  return (
    <group ref={root}>
      <VehicleModel id={id} />
      {anchors.map((o) => {
        const radius = Number(o.userData.radius ?? 2)
        return createPortal(<Plume key={o.name} kind={plumeKindFor(String(o.userData.engines ?? ''))} radius={radius} length={radius * 18} throttle={1} expansion={expansion} floor={fl} />, o)
      })}
    </group>
  )
}

/** the model as the site draws it: its static meshes merged (see mergeStatic) */
function Merged({ id, children }: { id: string; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null)
  useEffect(() => (MERGE && g.current ? mergeStatic(g.current, { keep: ANIMATED_PARTS }) : undefined), [id])
  return <group ref={g}>{children}</group>
}

export default function ModelViewer({ id, view, az, fire, expansion, floor }: { id: string; view: string; az: number; fire?: boolean; expansion?: number; floor?: number }) {
  const v = VEHICLES.find((x) => x.id === id) ?? VEHICLES[0]
  const h = v.height
  const a = (az * Math.PI) / 180
  let pos: [number, number, number] = [Math.cos(a) * h * 2.0, h * 0.55, Math.sin(a) * h * 2.0]
  let target: [number, number, number] = [0, h * 0.5, 0]
  let fov = 32
  // in fire mode the vehicle hangs `lift` metres over the ground so the flame has room
  const lift = fire ? (Number.isFinite(floor ?? Infinity) ? (floor as number) : h * 0.9) : 0
  if (view === 'plume') {
    // the booster's base and the flame below it, from a few lengths off
    pos = [Math.cos(a) * h * 1.4, lift * 0.6, Math.sin(a) * h * 1.4]
    target = [0, lift * 0.4, 0]
    fov = 40
  } else if (view === 'engines') {
    pos = [Math.cos(a) * h * 0.4, 1.5, Math.sin(a) * h * 0.4]
    target = [0, 4, 0]
    fov = 40
  } else if (view === 'nose') {
    pos = [Math.cos(a) * h * 0.45, h * 0.95, Math.sin(a) * h * 0.45]
    target = [0, h * 0.86, 0]
    fov = 35
  } else if (view === 'mid') {
    pos = [Math.cos(a) * h * 0.6, h * 0.55, Math.sin(a) * h * 0.6]
    target = [0, h * 0.55, 0]
    fov = 35
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0e14' }}>
      <Canvas shadows camera={{ position: pos, fov, near: 0.5, far: 5000 }} dpr={1} onCreated={({ camera }) => camera.lookAt(...target)}>
        <color attach="background" args={['#0d1420']} />
        <hemisphereLight args={['#8fa4c2', '#3a332c', 1.1]} />
        <directionalLight position={[180, 260, 120]} intensity={3.2} color="#fff1dc" castShadow />
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
            <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
            <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
          </Environment>
        </Suspense>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <circleGeometry args={[400, 64]} />
          <meshStandardMaterial color="#3b3a36" roughness={1} />
        </mesh>
        <group position={[0, lift, 0]}>
          <Merged id={v.id}>{fire ? <StaticFire id={v.id} expansion={expansion ?? 1} floor={floor ?? Infinity} /> : <VehicleModel id={v.id} />}</Merged>
        </group>
      </Canvas>
    </div>
  )
}
