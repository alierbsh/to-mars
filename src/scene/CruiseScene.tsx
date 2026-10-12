/**
 * Heliocentric cruise: Sun, the orbits of Earth and Mars, both planets moving, and the ship
 * on its transfer arc. 1 scene unit = 1 million km. Planets are not to scale.
 */
import { Html, Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { julianDate, planetPosition } from '../sim/ephemeris'
import { useAppStore } from '../state/store'

const U = 1e-6 // km → scene units

export default function CruiseScene() {
  const result = useAppStore((s) => s.result)
  const tr = result?.transfer ?? null
  const earth = useRef<THREE.Group>(null)
  const mars = useRef<THREE.Group>(null)
  const ship = useRef<THREE.Group>(null)
  const { scene } = useThree()
  const init = useRef(false)

  const orbits = useMemo(() => {
    const jd0 = julianDate(new Date('2026-01-01T00:00:00Z'))
    const e: THREE.Vector3[] = []
    const m: THREE.Vector3[] = []
    for (let i = 0; i <= 120; i++) {
      const pe = planetPosition('earth', jd0 + (i / 120) * 365.25)
      e.push(new THREE.Vector3(pe[0] * U, pe[2] * U, -pe[1] * U))
      const pm = planetPosition('mars', jd0 + (i / 120) * 687)
      m.push(new THREE.Vector3(pm[0] * U, pm[2] * U, -pm[1] * U))
    }
    return { e, m }
  }, [])
  const path = useMemo(() => (tr ? tr.samples.map((s) => new THREE.Vector3(s.ship[0] * U, s.ship[2] * U, -s.ship[1] * U)) : []), [tr])

  useFrame(({ camera }) => {
    scene.background = new THREE.Color('#02040a')
    if (scene.fog) (scene.fog as THREE.Fog).color.set('#02040a')
    if (!tr) return
    const { t } = useAppStore.getState()
    const cruise = result!.phases.find((p) => p.phase === 'cruise')!
    const f = Math.max(0, Math.min(1, (t - cruise.start) / Math.max(cruise.end - cruise.start, 1)))
    const idx = Math.min(tr.samples.length - 1, Math.floor(f * (tr.samples.length - 1)))
    const s = tr.samples[idx]
    const toV = (p: [number, number, number]) => new THREE.Vector3(p[0] * U, p[2] * U, -p[1] * U)
    earth.current?.position.copy(toV(s.earth))
    mars.current?.position.copy(toV(s.mars))
    ship.current?.position.copy(toV(s.ship))
    // camera high above the ecliptic, framing the inner solar system
    const target = new THREE.Vector3(0, 760, 140)
    if (!init.current) {
      camera.position.copy(target)
      init.current = true
    } else camera.position.lerp(target, 0.05)
    camera.lookAt(0, 0, -20)
    camera.near = 0.5
    camera.far = 5000
    camera.updateProjectionMatrix()
  })

  if (!tr) return null
  return (
    <group>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#ffd978" />
      </mesh>
      <pointLight intensity={4} distance={2000} decay={0.5} color="#fff2d0" />
      <Line points={orbits.e} color="#4f7fb8" lineWidth={1} transparent opacity={0.7} />
      <Line points={orbits.m} color="#a8482a" lineWidth={1} transparent opacity={0.7} />
      {path.length > 1 && <Line points={path} color="#e6edf3" lineWidth={1.2} dashed dashSize={3} gapSize={2} />}
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[4.5, 24, 24]} />
          <meshStandardMaterial color="#3f7fd6" roughness={0.7} />
        </mesh>
        <Html center distanceFactor={600} className="label3d">Earth</Html>
      </group>
      <group ref={mars}>
        <mesh>
          <sphereGeometry args={[3.6, 24, 24]} />
          <meshStandardMaterial color="#c8552f" roughness={0.9} />
        </mesh>
        <Html center distanceFactor={600} className="label3d">Mars</Html>
      </group>
      <group ref={ship}>
        <mesh>
          <sphereGeometry args={[2.2, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Html center distanceFactor={600} className="label3d">Ship</Html>
      </group>
      <ambientLight intensity={0.25} />
    </group>
  )
}
