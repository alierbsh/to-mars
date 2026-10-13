/**
 * Earth orbit: the ship (model, not to scale) in the foreground, the Earth below (see Earth.tsx);
 * tankers come and go on their docking events; the TMI burn lights the engines.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { EARTH_R, Earth, SUN_DIR } from './Earth'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { view } from './viewControl'

const ALT = 200
/** the parking orbit is inclined 28.5° (the Cape's latitude): the ship passes over varied latitudes */
const INCL = (28.5 * Math.PI) / 180

export default function OrbitScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 30
  const SCALE = 0.012 // model metres → km, exaggerated ×12 so the ship is visible against Earth
  const ship = useRef<THREE.Group>(null)
  const tanker = useRef<THREE.Group>(null)
  const { scene } = useThree()
  const state = useMemo(() => ({ ang: 0, init: false }), [])

  useFrame(({ camera }, rawDt) => {
    // a background tab hands back a huge delta on return: never let one frame jump far
    const dt = Math.min(rawDt, 0.1)
    const { result, t, playing } = useAppStore.getState()
    scene.background = new THREE.Color('#02040a')
    if (scene.fog) (scene.fog as THREE.Fog).color.set('#02040a')
    // start where the clock says (a 90-minute orbit), then drift slowly in real time
    if (!state.init) state.ang = ((t / 5400) % 1) * Math.PI * 2
    if (playing) state.ang += dt * 0.03
    const r = EARTH_R + ALT
    const tilt = new THREE.Matrix4().makeRotationX(INCL)
    const pos = new THREE.Vector3(Math.cos(state.ang) * r, 0, Math.sin(state.ang) * r).applyMatrix4(tilt)
    const velDir = new THREE.Vector3(-Math.sin(state.ang), 0, Math.cos(state.ang)).applyMatrix4(tilt)
    if (ship.current) {
      ship.current.position.copy(pos)
      // fly "horizontal": nose along the velocity direction, belly toward Earth
      const vel = velDir.clone()
      const up = pos.clone().normalize()
      const m = new THREE.Matrix4().makeBasis(up.clone().cross(vel).negate(), vel, up)
      ship.current.quaternion.setFromRotationMatrix(m)
    }
    // tanker rendezvous around each docking event
    if (tanker.current && result?.leo) {
      const docks = result.leo.events.filter((e) => e.label.startsWith('Tanker'))
      const next = docks.find((e) => Math.abs(e.t - t) < 2.5 * 86_400)
      if (next && vehicle.refuelable) {
        const f = (t - next.t) / (2.5 * 86_400) // -1 → 1
        const off = f < 0 ? -Math.pow(-f, 1.5) * 6 : Math.pow(f, 1.5) * 6
        tanker.current.visible = true
        const side = pos.clone().normalize().cross(velDir).normalize()
        tanker.current.position.copy(pos).add(side.multiplyScalar(0.18 + Math.abs(off)))
        tanker.current.quaternion.copy(ship.current!.quaternion)
      } else tanker.current.visible = false
    }
    // chase camera: behind, above and to the side, looking forward along the orbit so the horizon shows
    const dist = L * SCALE * 3.0 * view.zoom
    const vel = velDir.clone()
    const upv = pos.clone().normalize()
    const side = upv.clone().cross(vel).normalize()
    // the chase offset, swung about the local vertical by the viewer's drag
    const horiz = vel.clone().multiplyScalar(-0.9).add(side.clone().multiplyScalar(0.7)).normalize().applyAxisAngle(upv, -view.az)
    const camTarget = pos.clone().add(horiz.multiplyScalar(dist * 1.14 * Math.cos(view.el))).add(upv.clone().multiplyScalar(dist * (0.5 + 1.1 * Math.sin(view.el))))
    if (!state.init) {
      camera.position.copy(camTarget)
      state.init = true
    } else camera.position.lerp(camTarget, 1 - Math.exp(-Math.min(dt, 0.5) * (view.dragging ? 24 : 6)))
    camera.up.copy(upv)
    camera.lookAt(pos.clone().add(vel.clone().multiplyScalar(dist * 0.3)))
    camera.near = 0.01
    camera.far = 40_000
    camera.updateProjectionMatrix()
  })

  const sun = SUN_DIR.clone().multiplyScalar(30_000)
  return (
    <group>
      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      <group ref={ship}>
        <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
          <VehicleRig id={vehicleId} mode="orbit" />
        </group>
      </group>
      {vehicle.refuelable && (
        <group ref={tanker} visible={false}>
          <group scale={SCALE} position={[0, -((SPACECRAFT_BASE[vehicleId] ?? 0) + L / 2) * SCALE, 0]}>
            <VehicleRig id={vehicleId} mode="orbit" />
          </group>
        </group>
      )}
      <directionalLight position={sun.toArray()} intensity={3.2} color="#fff6e8" />
      {/* earthshine on the ship's underside, faint night side */}
      <directionalLight position={[-sun.x, -sun.y, -sun.z]} intensity={0.25} color="#7fa6d8" />
      <ambientLight intensity={0.08} color="#8fb0e0" />
    </group>
  )
}
