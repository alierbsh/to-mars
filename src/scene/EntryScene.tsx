/**
 * Mars entry, descent and landing: the spacecraft's centre at the origin (belly-first or
 * heat-shield-first), plasma scaled by heat flux, a smooth flip to vertical for the landing burn,
 * the NASA-DEM Mars surface (MarsSurface) sliding under the vehicle and rising to meet it, dust
 * kicked up by the landing burn. A crash is an impact: flash, debris on ballistic arcs, a dust
 * curtain, a scorch on the ground and a camera shake. A break-up throws fragments down-track.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { entryAt } from '../ui/hud'
import { dustTexture, fragmentAt, makeFragments, makePuffs } from './impact'
import { MarsSurface } from './MarsSurface'
import { SkyDome, setSky } from './SkyDome'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'

const SKY_HIGH = new THREE.Color('#02040a')
const SKY_LOW = new THREE.Color('#b8864f')
const R_MARS = 3_389_500
const DUST = '#b8865a'
const DUST_DARK = '#5a3a26'
const N_PUFFS = 24
const N_FRAGMENTS = 56

let plasmaCache: THREE.CanvasTexture | null = null
/** soft radial gradient, white-hot core to transparent */
function plasmaTexture(): THREE.CanvasTexture {
  if (plasmaCache) return plasmaCache
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.18, 'rgba(255,220,180,0.85)')
  g.addColorStop(0.5, 'rgba(255,150,80,0.35)')
  g.addColorStop(1, 'rgba(255,100,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  plasmaCache = new THREE.CanvasTexture(c)
  return plasmaCache
}

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}

export default function EntryScene({ vehicleId }: { vehicleId: string }) {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 20
  const isShip = vehicle.spacecraft.entry?.kind === 'ship'
  const rig = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const wake = useRef<THREE.Sprite>(null)
  const sky = useRef<THREE.Mesh>(null)
  const plasmaTex = useMemo(() => plasmaTexture(), [])
  const dustTex = useMemo(() => dustTexture(), [])
  const ground = useRef<THREE.Group>(null)
  const flash = useRef<THREE.Mesh>(null)
  const scorch = useRef<THREE.Group>(null)
  const shock = useRef<THREE.Mesh>(null)
  const dust = useRef<THREE.Group>(null)
  const debris = useRef<THREE.InstancedMesh>(null)
  const { scene } = useThree()
  const st = useMemo(() => ({ az: 0.4, flip: 0, init: false }), [])
  const bg = useMemo(() => new THREE.Color(), [])
  const bellyFirst = useMemo(() => {
    // model +Y (nose) → world +X (downrange), model +Z (tiles) → world -Y (into the flow)
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0))
    return new THREE.Quaternion().setFromRotationMatrix(m)
  }, [])
  const upright = useMemo(() => new THREE.Quaternion(), [])
  const capsuleTilt = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.35)), [])
  const puffs = useMemo(() => makePuffs(5, N_PUFFS), [])
  const fragments = useMemo(() => makeFragments(9, N_FRAGMENTS, isShip ? 45 : 75, isShip ? 6 : 1.7), [isShip])
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), origin: new THREE.Vector3() }), [])

  useFrame(({ camera }, rawDt) => {
    // a background tab hands back a huge delta on return: never let one frame jump far
    const dt = Math.min(rawDt, 0.1)
    const { result, t, playing } = useAppStore.getState()
    const e = result ? entryAt(result, t) : undefined
    const phase = result?.phases.find((p) => p.phase === 'entry')
    const alt = e?.alt ?? 125_000
    const ended = phase ? t >= phase.end : false
    const tau = phase ? t - phase.end : -1 // time since touchdown / impact
    const outcome = result?.verdict.outcome
    const landed = !!result?.entry?.landed
    const impact = outcome === 'crashed'
    const breakup = outcome === 'burned-up'
    const groundY = -Math.max(alt, 0) - L / 2 // the vehicle's centre is the origin; its base is L/2 below
    const burning = !!e?.burning

    // attitude: ships fly belly-first and flip over ~2.5 s of sim time from ignition; capsules trim
    if (rig.current) {
      if (isShip) {
        const tel = result?.entry?.telemetry
        const ign = tel?.find((x) => x.burning)
        const ignitionT = phase && ign ? phase.start + ign.t : Infinity
        st.flip = Number.isFinite(ignitionT) ? smooth((t - ignitionT) / 2.5) : 0
        rig.current.quaternion.copy(bellyFirst).slerp(upright, st.flip)
      } else {
        rig.current.quaternion.copy(capsuleTilt).slerp(upright, ended ? 1 : 0.2)
      }
      rig.current.visible = !(ended && (impact || breakup))
    }
    if (ground.current) {
      // The touchdown point lies ahead by the range still to fly. The surface group is centred on
      // it, so swing it about the planet's centre: far away it sits below the horizon, as it should.
      const tel = result?.entry?.telemetry
      const total = tel && tel.length ? tel[tel.length - 1].downrange : 0
      const range = e ? Math.max(0, total - e.downrange) * 1000 : 0
      const d = range / R_MARS
      ground.current.position.set(R_MARS * Math.sin(d), groundY - R_MARS * (1 - Math.cos(d)), 0)
      ground.current.rotation.z = -d
    }
    // plasma from heating: a sheath on the windward side and a wake behind
    if (glow.current && wake.current && result?.entry) {
      const q = e?.heatFlux ?? 0
      const limit = vehicle.spacecraft.entry?.tpsLimit ?? 50
      const k = Math.min(1.3, q / (0.5 * limit))
      const on = k > 0.04 && !ended
      glow.current.visible = on
      wake.current.visible = on
      ;(glow.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.85 * k)
      ;(wake.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.5 * k)
      const belly = isShip ? 1 - st.flip : 1
      glow.current.scale.set(L * (isShip ? 1.25 : 2.2), L * (isShip ? 0.55 : 1.6), 1)
      glow.current.position.set(0, -(isShip ? L * 0.12 * belly : L * 0.3), 0)
      wake.current.scale.set(L * (isShip ? 2.6 : 4), L * (isShip ? 0.5 : 1.2), 1)
      wake.current.position.set(-L * (isShip ? 1.2 : 2.2), -(isShip ? L * 0.05 : L * 0.1), 0)
    }
    // landing dust: the burn blasting the surface in the last 150 m, then settling after touchdown
    if (dust.current) {
      const near = Math.max(0, 1 - alt / 150)
      let k = 0
      let spread = 0
      if (impact && tau >= 0) {
        // impact curtain: fast, big, long-lived
        k = Math.max(0, 1 - tau / 22)
        spread = 1
      } else if (isShip && landed && ended) {
        k = Math.max(0, 1 - tau / 10) * 0.8
        spread = 1
      } else if (isShip && burning && near > 0) {
        k = near * 0.9
        spread = 0
      }
      dust.current.visible = k > 0.01
      dust.current.position.set(0, groundY + 0.5, 0)
      if (k > 0.01) {
        const base = impact ? Math.max(11, L * 1.2) : L * 0.35
        const tt = Math.max(0, tau)
        dust.current.children.forEach((c, i) => {
          const p = puffs[i]
          const s = c as THREE.Sprite
          const column = impact && i < 6 // a few puffs go straight up as the ejecta column
          const grow = impact ? Math.sqrt(Math.max(0, tt - p.delay)) : near + (spread ? Math.sqrt(tt) * 0.5 : 0)
          const r = column ? base * 0.25 * grow : base * 0.3 + base * 1.3 * p.rate * grow
          const h = column ? base * 0.4 + base * 2.2 * p.rise * grow : base * 0.15 + base * 0.7 * p.rise * grow
          s.position.set(Math.cos(p.dir) * r, h, Math.sin(p.dir) * r)
          const size = base * p.size * (0.7 + 1.0 * grow)
          s.scale.set(size, size * (column ? 1.3 : 0.85), 1)
          const fade = impact && tt < p.delay ? 0 : 1
          ;(s.material as THREE.SpriteMaterial).opacity = (impact ? 0.95 : 0.75) * k * fade * (impact ? Math.min(1, 2.2 / (0.8 + grow)) : 1)
          ;(s.material as THREE.SpriteMaterial).rotation = p.dir * 3 + grow * 0.3
        })
      }
    }
    // the end: flash, debris, scorch, shake
    if (flash.current) {
      const dur = impact ? 2.5 : breakup ? 3 : 0
      if (dur > 0 && tau >= 0 && tau < dur) {
        flash.current.visible = true
        const f = tau / dur
        flash.current.scale.setScalar(Math.max(impact ? 10 : 20, L) * (0.6 + 5 * f))
        flash.current.position.set(0, impact ? groundY + L * 0.3 : 0, 0)
        ;(flash.current.material as THREE.MeshBasicMaterial).opacity = (1 - f) * (1 - f)
      } else flash.current.visible = false
    }
    if (shock.current) {
      const on = impact && tau >= 0 && tau < 1.4
      shock.current.visible = on
      if (on) {
        shock.current.position.set(0, groundY + 0.3, 0)
        shock.current.scale.setScalar(Math.max(6, L) + 140 * tau)
        ;(shock.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - tau / 1.4)
      }
    }
    if (scorch.current) {
      scorch.current.visible = (impact && tau >= 0) || (isShip && landed && ended)
      scorch.current.position.set(0, groundY + 0.12, 0)
      const sc = impact ? Math.max(12, L * 1.1) : L * 0.28
      scorch.current.scale.setScalar(sc)
    }
    if (debris.current) {
      const show = (impact || breakup) && tau >= 0
      debris.current.visible = show
      if (show) {
        tmp.origin.set(0, impact ? groundY + 1 : 0, 0)
        const gY = impact ? groundY : groundY - 1e6 // break-up fragments fall away for the whole aftermath
        for (let i = 0; i < fragments.length; i++) {
          const f = fragments[i]
          fragmentAt(f, tau, tmp.origin, gY, tmp.o.position, breakup ? 160 : 0)
          const spinT = Math.min(tau, 30)
          tmp.o.rotation.set(f.spin.x * spinT, f.spin.y * spinT, f.spin.z * spinT)
          tmp.o.scale.setScalar(f.size)
          tmp.o.updateMatrix()
          debris.current.setMatrixAt(i, tmp.o.matrix)
        }
        debris.current.instanceMatrix.needsUpdate = true
      }
    }
    // sky: black above the atmosphere, butterscotch dust haze near the ground; the haze thins with altitude
    const f = Math.min(1, Math.max(0, 1 - alt / 70_000))
    bg.copy(SKY_HIGH).lerp(SKY_LOW, f * f)
    scene.background = bg
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog
      fog.color.copy(bg)
      fog.far = 60_000 + alt * 40
      fog.near = fog.far * 0.35
    }
    // gradient dome: butterscotch horizon, darker zenith; fades out with altitude
    setSky(sky.current, camera, f * f)
    // camera: slow orbit about the vehicle's centre; a shake at impact
    if (playing) st.az += dt * 0.08
    const after = impact && tau >= 0
    const dist = after ? Math.max(L * 4.5, 70) : Math.max(L * 3.2, 26)
    const target = new THREE.Vector3(Math.cos(st.az) * dist, after ? Math.max(14, L * 0.6) : L * 0.25, Math.sin(st.az) * dist)
    if (!st.init) {
      camera.position.copy(target)
      st.init = true
    } else camera.position.lerp(target, after ? 0.2 : 0.08)
    if (impact && tau >= 0 && tau < 1.6) {
      const a = Math.max(2, L * 0.08) * (1 - tau / 1.6) ** 2
      camera.position.x += (Math.random() - 0.5) * a
      camera.position.y += (Math.random() - 0.5) * a
      camera.position.z += (Math.random() - 0.5) * a
    }
    camera.lookAt(0, impact && ended ? groundY + L * 0.4 : 0, 0)
    camera.up.set(0, 1, 0)
    camera.near = 0.5
    camera.far = 6_000_000
    camera.updateProjectionMatrix()
  })

  const fragColours = useMemo(() => fragments.map((f) => new THREE.Color(f.light ? '#d9d8d2' : '#33363b')), [fragments])

  return (
    <group>
      <group ref={rig}>
        {/* the rig rotates about the spacecraft's centre */}
        <group position={[0, -(SPACECRAFT_BASE[vehicleId] ?? 0) - L / 2, 0]}>
          <VehicleRig id={vehicleId} mode="entry" />
        </group>
      </group>
      <SkyDome ref={sky} horizon="#dba366" zenith="#5c4029" />
      <sprite ref={glow} visible={false}>
        <spriteMaterial map={plasmaTex} color="#ffb278" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={wake} visible={false}>
        <spriteMaterial map={plasmaTex} color="#ff9a60" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <mesh ref={flash} visible={false}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={shock} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 1, 48]} />
        <meshBasicMaterial color="#e8c9a0" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <group ref={dust} visible={false}>
        {puffs.map((_, i) => (
          <sprite key={i}>
            <spriteMaterial map={dustTex} color={i % 2 ? DUST : DUST_DARK} transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
      </group>
      <group ref={scorch} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <circleGeometry args={[1, 40]} />
          <meshStandardMaterial color="#3a2418" roughness={1} transparent opacity={0.85} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
        <mesh>
          <ringGeometry args={[1, 1.9, 40]} />
          <meshStandardMaterial color="#d8b58a" roughness={1} transparent opacity={0.35} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      </group>
      <instancedMesh ref={debris} args={[undefined, undefined, N_FRAGMENTS]} visible={false} frustumCulled={false}>
        <boxGeometry args={[1, 0.6, 0.8]} />
        <meshStandardMaterial roughness={0.7} metalness={0.3} vertexColors={false} color="#9a9a96" />
        <DebrisColours colours={fragColours} meshRef={debris} />
      </instancedMesh>
      <group ref={ground}>
        <Suspense fallback={null}>
          <MarsSurface />
        </Suspense>
      </group>
      <directionalLight position={[300, 400, 200]} intensity={1.7} color="#ffe2c4" />
      <hemisphereLight args={['#c9a27a', '#3b2418', 0.45]} />
    </group>
  )
}

/** sets per-instance colours once the instanced mesh exists */
function DebrisColours({ colours, meshRef }: { colours: THREE.Color[]; meshRef: React.RefObject<THREE.InstancedMesh | null> }) {
  useFrame(() => {
    const m = meshRef.current
    if (!m || m.userData.coloured) return
    colours.forEach((c, i) => m.setColorAt(i, c))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
    m.userData.coloured = true
  })
  return null
}
