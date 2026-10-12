/**
 * Debug viewer for the ground: ?terrain=mars|cape&pad=<padId>&alt=<m>&az=<deg>&pitch=<deg>&x=<m>&z=<m>
 * Camera at (x, alt, z) over the touchdown / pad point, looking along the azimuth, pitched down.
 */
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'
import { CapeCanaveral } from './CapeCanaveral'
import { MarsSurface } from './MarsSurface'
import type { PadId } from '../sim/types'

export default function TerrainViewer({ kind, alt, az, pitch, x, z, pad }: { kind: string; alt: number; az: number; pitch: number; x: number; z: number; pad: string }) {
  const a = (az * Math.PI) / 180
  const p = (pitch * Math.PI) / 180
  const dir = new THREE.Vector3(Math.cos(a) * Math.cos(p), -Math.sin(p), Math.sin(a) * Math.cos(p))
  const pos = new THREE.Vector3(x, alt, z)
  const target = pos.clone().add(dir.multiplyScalar(1000))
  const mars = kind === 'mars'
  const sky = mars ? (alt > 40_000 ? '#05070c' : '#b8864f') : '#6f9bd1'
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <Canvas camera={{ position: pos.toArray(), fov: 45, near: 1, far: 6_000_000 }} dpr={1} onCreated={({ camera }) => camera.lookAt(target)}>
        <color attach="background" args={[sky]} />
        <fog attach="fog" args={[sky, (60_000 + alt * 40) * 0.35, 60_000 + alt * 40]} />
        {mars ? (
          <>
            <directionalLight position={[300, 400, 200]} intensity={1.7} color="#ffe2c4" />
            <hemisphereLight args={['#c9a27a', '#3b2418', 0.45]} />
          </>
        ) : (
          <>
            <directionalLight position={[180, 260, 120]} intensity={2.6} color="#fff1dc" />
            <hemisphereLight args={['#8fa4c2', '#3a332c', 0.8]} />
          </>
        )}
        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer intensity={2.5} rotation-x={Math.PI / 2} position={[0, 60, 0]} scale={[100, 100, 1]} color="#9fbbe0" />
            <Lightformer intensity={1.4} rotation-y={Math.PI / 2} position={[-50, 10, 0]} scale={[60, 40, 1]} color="#d9b48a" />
            <Lightformer intensity={1.0} rotation-y={-Math.PI / 2} position={[50, 10, 0]} scale={[60, 40, 1]} color="#8398ba" />
          </Environment>
          {mars ? <MarsSurface /> : <CapeCanaveral pad={pad as PadId} />}
        </Suspense>
      </Canvas>
    </div>
  )
}
