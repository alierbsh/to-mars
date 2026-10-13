/**
 * Launch & ascent from Cape Canaveral: the vehicle stays at the origin, pitched by the simulated
 * pitch; the Cape falls away and slides back downrange (swung about the Earth's centre, so the
 * horizon curves and the coast drops away at true scale). The sky is the atmosphere itself —
 * single scattering from the camera's point of view (atmosphere.ts) — so it goes from Florida
 * blue through the pale horizon band to the thin limb and black space, and the stars come out
 * as the air thins. A chase camera orbits slowly, climbs with the vehicle while the Cape is the
 * view, then drops to put the Earth's limb under the stack once it is coasting downrange.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { ascentAt } from '../ui/hud'
import { ATMO } from './atmosphere'
import { CapeCanaveral } from './CapeCanaveral'
import { R_EARTH } from './capeSite'
import { AscentSky } from './EarthBelow'
import { dustTexture } from './impact'
import { VehicleRig } from './VehicleRig'
import { autoOrbit, view } from './viewControl'

/** the sun: ~50° up in the south-east (a late Florida morning); shared by the lights and the sky */
const SUN = new THREE.Vector3(180, 260, 120).normalize()

/** roll about the vehicle's own axis for the climb: Starship rides with its tiled side toward +X,
 * i.e. earthward once it has pitched over, so the chase camera sees steel, not black tiles */
const ASCENT_ROLL: Record<string, number> = { 'starship-v3': Math.PI / 2 }

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export default function AscentScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const h = vehicle.height
  const rig = useRef<THREE.Group>(null)
  const ground = useRef<THREE.Group>(null)
  const sun = useRef<THREE.Sprite>(null)
  const sunTex = useMemo(() => dustTexture(), [])
  const { scene } = useThree()
  const camState = useMemo(() => ({ az: 1.0, init: false }), [])
  const cores = useMemo(() => vehicle.stages.filter((st) => st.role !== 'booster'), [vehicle])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  // the scene's distance fog is for the other phases: here the atmosphere does the haze
  useEffect(() => {
    const fog = scene.fog
    const bg = scene.background
    scene.fog = null
    scene.background = new THREE.Color('#000000')
    ATMO.sunDir.value.copy(SUN)
    return () => {
      scene.fog = fog
      scene.background = bg
    }
  }, [scene])

  useFrame(({ camera }, rawDt) => {
    // a background tab hands back a huge delta on return: never let one frame jump far
    const dt = Math.min(rawDt, 0.1)
    const { result, t, playing } = useAppStore.getState()
    const s = result ? ascentAt(result, t) : undefined
    const alt = s?.alt ?? 0
    const pitch = s ? (s.pitch * Math.PI) / 180 : 0
    if (rig.current) {
      // tilt toward +X (downrange); keep the pivot near the vehicle's centre of mass
      rig.current.rotation.z = -pitch
    }
    if (ground.current) {
      // the pad is behind by the downrange distance: swing it back about the Earth's centre
      const d = ((s?.downrange ?? 0) * 1000) / R_EARTH
      ground.current.position.set(-R_EARTH * Math.sin(d), -alt - R_EARTH * (1 - Math.cos(d)), 0)
      ground.current.rotation.z = d
      ground.current.updateMatrixWorld()
      // the atmosphere is centred on the planet, wherever the ground group has swung it
      ATMO.center.value.copy(ground.current.localToWorld(tmp.set(0, -R_EARTH, 0)))
    }
    // the sun's glare: on the sun's direction, far out, following the camera; strongest in haze
    if (sun.current) {
      sun.current.position.copy(camera.position).addScaledVector(SUN, 80_000)
      const haze = Math.max(0, 1 - alt / 45_000)
      ;(sun.current.material as THREE.SpriteMaterial).opacity = 0.18 + 0.3 * haze
    }
    // camera: slow orbit; frame whatever is still attached (zoom in after staging)
    if (playing && autoOrbit()) camState.az += dt * 0.06
    const az = camState.az + view.az
    let bottom = 0
    if (result) {
      const p = result.phases.find((x) => x.phase === 'ascent')!
      const ta = t - p.start
      let acc = 0
      for (const st of cores) {
        const sep = result.ascent.stageTimes.find((x) => x.id === st.id)
        if (sep && ta > sep.sep + 6) {
          acc += st.length
          bottom = acc
        } else break
      }
    }
    const size = Math.max(h - bottom, 12)
    const centreModel = (bottom + h) / 2
    const centre = rig.current ? rig.current.localToWorld(new THREE.Vector3(0, centreModel - h * 0.5, 0)) : new THREE.Vector3(0, centreModel, 0)
    // open close and low on the pad, pull out over the first 15 s, then keep framing the stack
    const ta = s?.t ?? 0
    const open = 1 - Math.min(1, ta / 15)
    const pull = open * open
    // room for the plume below the stack: frame the stack plus ~0.6 of its length of exhaust
    const dist = (size * (2.7 - 1.3 * pull) + Math.min(size, alt / 600)) * view.zoom
    // climb above the vehicle as it rises, so the Cape falls away in the frame behind it; from
    // ~10 km up, hold the camera a little above the stack and aim so that the horizon — which
    // dips below the horizontal as the Earth curves away — sits in the upper half of the frame
    const mid = smooth(6_000, 22_000, alt)
    const dip = Math.acos(R_EARTH / (R_EARTH + alt))
    const extra = (3.5 + 4.0 * smooth(20_000, 150_000, alt)) * (Math.PI / 180)
    const liftLow = Math.min(alt * 0.25, size * 1.4)
    const elev = Math.sin(view.el) * dist
    const flat = Math.cos(view.el)
    // the view axis points dip+extra below the horizontal (horizon in the upper third); lift the
    // camera so the vehicle sits a fixed angle above that axis — the dip grows with altitude and
    // would otherwise push the vehicle out of the top of the frame
    const shipAbove = Math.min(11 * (Math.PI / 180), 0.6 * (dip + extra))
    const liftHigh = Math.max(size * 0.3, dist * flat * Math.tan(dip + extra - shipAbove) - size * 0.05)
    const lift = liftLow * (1 - mid) + liftHigh * mid
    const camUp = size * (0.05 - 0.3 * pull) + lift + elev
    const target = new THREE.Vector3(centre.x + Math.cos(az) * dist * flat, centre.y + camUp, centre.z + Math.sin(az) * dist * flat)
    if (!camState.init) {
      camera.position.copy(target)
      camState.init = true
    } else camera.position.lerp(target, 1 - Math.exp(-Math.min(rawDt, 0.5) * (view.dragging ? 24 : 4))) // frame-rate independent
    const lookLow = -size * (0.22 + 0.2 * pull)
    const lookHigh = Math.max(-size * 0.3, dist * flat * Math.tan(dip + extra) - camUp)
    camera.lookAt(centre.x, centre.y + lookLow * (1 - mid) - lookHigh * mid, centre.z)
    camera.up.set(0, 1, 0)
    camera.near = 0.5
    camera.far = 8_000_000
    camera.updateProjectionMatrix()
  })

  return (
    <group>
      <hemisphereLight args={['#9fb9dc', '#4a4636', 0.6]} />
      <directionalLight position={[SUN.x * 400, SUN.y * 400, SUN.z * 400]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-160} shadow-camera-right={160} shadow-camera-top={200} shadow-camera-bottom={-60} shadow-camera-far={900} />
      <Suspense fallback={null}>
        <AscentSky />
      </Suspense>
      <sprite ref={sun} scale={[14_000, 14_000, 1]} renderOrder={-9}>
        <spriteMaterial map={sunTex} color="#fff2d0" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} fog={false} />
      </sprite>
      {/* pivot at mid-height so the pitch rotates the vehicle about its centre */}
      <group ref={rig} position={[0, h * 0.5, 0]}>
        <group position={[0, -h * 0.5, 0]} rotation={[0, ASCENT_ROLL[vehicleId] ?? 0, 0]}>
          <VehicleRig id={vehicleId} mode="ascent" />
        </group>
      </group>
      <group ref={ground}>
        <CapeCanaveral pad={vehicle.launchSite.pad} />
      </group>
    </group>
  )
}
