/**
 * Launch & ascent from Cape Canaveral: the vehicle stays at the origin, pitched by the simulated
 * pitch; the Cape falls away and slides back downrange (swung about the Earth's centre, so the
 * horizon curves and the coast drops away at true scale) and the sky goes from Florida blue to
 * black. A chase camera orbits slowly and reframes whatever is still attached after staging.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { ascentAt } from '../ui/hud'
import { CapeCanaveral } from './CapeCanaveral'
import { R_EARTH } from './capeSite'
import { SkyDome, setSky } from './SkyDome'
import { VehicleRig } from './VehicleRig'

const SKY_LOW = new THREE.Color('#79a9e0')
const SKY_MID = new THREE.Color('#1b3a66')
const SKY_HIGH = new THREE.Color('#02040a')
const HORIZON_LOW = new THREE.Color('#c9dcef')
const ZENITH_LOW = new THREE.Color('#3f7fcb')

export default function AscentScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const h = vehicle.height
  const rig = useRef<THREE.Group>(null)
  const ground = useRef<THREE.Group>(null)
  const sky = useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  const camState = useMemo(() => ({ az: 1.0, init: false }), [])
  const bg = useMemo(() => new THREE.Color(), [])
  const horizon = useMemo(() => new THREE.Color(), [])
  const zenith = useMemo(() => new THREE.Color(), [])
  const cores = useMemo(() => vehicle.stages.filter((st) => st.role !== 'booster'), [vehicle])

  useFrame(({ camera }, dt) => {
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
    }
    // sky: Florida blue at the pad → deep blue by 20 km → black above ~70 km
    const f = Math.min(1, alt / 70_000)
    bg.copy(f < 0.3 ? SKY_LOW.clone().lerp(SKY_MID, f / 0.3) : SKY_MID.clone().lerp(SKY_HIGH, (f - 0.3) / 0.7))
    scene.background = bg
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog
      fog.color.copy(bg)
      fog.far = 90_000 + alt * 30
      fog.near = fog.far * 0.5
    }
    const haze = Math.max(0, 1 - alt / 45_000)
    horizon.copy(HORIZON_LOW).lerp(SKY_MID, Math.min(1, alt / 30_000))
    zenith.copy(ZENITH_LOW).lerp(SKY_HIGH, Math.min(1, alt / 25_000))
    setSky(sky.current, camera, haze * haze, horizon, zenith)
    // camera: slow orbit; frame whatever is still attached (zoom in after staging)
    if (playing) camState.az += dt * 0.06
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
    const dist = size * (2.1 - 0.9 * pull) + Math.min(size, alt / 600)
    // climb above the vehicle as it rises, so the Cape falls away in the frame behind it
    const lift = Math.min(alt * 0.25, size * 1.4)
    const target = new THREE.Vector3(centre.x + Math.cos(camState.az) * dist, centre.y + size * (0.12 - 0.3 * pull) + lift, centre.z + Math.sin(camState.az) * dist)
    if (!camState.init) {
      camera.position.copy(target)
      camState.init = true
    } else camera.position.lerp(target, 0.06)
    camera.lookAt(centre.x, centre.y - size * 0.25 * pull, centre.z)
    camera.far = 4_000_000
    camera.updateProjectionMatrix()
  })

  return (
    <group>
      <hemisphereLight args={['#9fb9dc', '#4a4636', 0.6]} />
      <directionalLight position={[180, 260, 120]} intensity={2.4} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-160} shadow-camera-right={160} shadow-camera-top={200} shadow-camera-bottom={-60} shadow-camera-far={900} />
      <SkyDome ref={sky} horizon="#c9dcef" zenith="#3f7fcb" />
      {/* pivot at mid-height so the pitch rotates the vehicle about its centre */}
      <group ref={rig} position={[0, h * 0.5, 0]}>
        <group position={[0, -h * 0.5, 0]}>
          <VehicleRig id={vehicleId} mode="ascent" />
        </group>
      </group>
      <group ref={ground}>
        <CapeCanaveral pad={vehicle.launchSite.pad} />
      </group>
    </group>
  )
}
