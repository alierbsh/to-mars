/**
 * Mars entry, descent and landing: the spacecraft's centre at the origin (belly-first or
 * heat-shield-first), the heating as a glowing sheath, a plasma wake streaming behind, sparks of
 * ablating material, the windward tiles glowing cherry-orange, a camera that shakes with the
 * g-load; a smooth flip to vertical for the landing burn, shot low and wide like a film; the
 * NASA-DEM Mars surface (MarsSurface) sliding under the vehicle and rising to meet it, dust
 * kicked up by the landing burn. A crash is an impact: flash, debris on ballistic arcs, a dust
 * curtain, a scorch on the ground and a camera shake. A break-up throws fragments down-track.
 */
import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { VEHICLES } from '../data/vehicles'
import { useAppStore } from '../state/store'
import { entryAt } from '../ui/hud'
import { FirstSteps } from './FirstSteps'
import { cloudPuffTexture, dustTexture, fragmentAt, makeFragments, makePuffs } from './impact'
import { limbCamera, marsLimbMaterial } from './marsLimb'
import { MarsSurface } from './MarsSurface'
import { Plume } from './Plume'
import { SkyDome, setSky } from './SkyDome'
import { VehicleRig } from './VehicleRig'
import { SPACECRAFT_BASE, SPACECRAFT_LENGTH } from './vehicles'
import { autoOrbit, view } from './viewControl'
import { useQuality } from './useQuality'
import { useWarm } from './warm'

const SKY_HIGH = new THREE.Color('#02040a')
const SKY_LOW = new THREE.Color('#b8864f')
const SKY_STORM = new THREE.Color('#9c6236')
const SKY_ZENITH = new THREE.Color('#5c4029')
const SKY_STORM_ZENITH = new THREE.Color('#6a3f22')
const R_MARS = 3_389_500
const Z_AXIS = new THREE.Vector3(0, 0, 1)
const DUST = '#c69a6c'
const DUST_DARK = '#8a6244'
const N_PUFFS = 24
const N_FRAGMENTS = 56
const N_SPARKS = 320

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
  const q = useQuality()
  const vehicle = VEHICLES.find((v) => v.id === vehicleId)!
  const crew = useAppStore((s) => s.config.crew)
  const L = SPACECRAFT_LENGTH[vehicleId] ?? 20
  const isShip = vehicle.spacecraft.entry?.kind === 'ship'
  const rig = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const wake = useRef<THREE.Sprite>(null)
  const sky = useRef<THREE.Mesh>(null)
  const sun = useRef<THREE.Sprite>(null)
  const dirLight = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sunDir = useMemo(() => new THREE.Vector3(300, 400, 200).normalize(), [])
  const plasmaTex = useMemo(() => plasmaTexture(), [])
  const sunTex = useMemo(() => dustTexture(), [])
  const legs = useRef<THREE.Object3D[] | null>(null)
  const dustTex = useMemo(() => cloudPuffTexture(), [])
  const ground = useRef<THREE.Group>(null)
  const flash = useRef<THREE.Mesh>(null)
  const scorch = useRef<THREE.Group>(null)
  const shock = useRef<THREE.Mesh>(null)
  const dust = useRef<THREE.Group>(null)
  const debris = useRef<THREE.InstancedMesh>(null)
  const limb = useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  // `open`: the opening from the cruise's last framing (behind and above the ship, looking down past
  // it at the planet), fading into the fall's slow orbit
  const st = useMemo(() => ({ az: 0.4, flip: 0, init: false, heat: 0, dist: 0, el: 0, azHold: 0, shot: '', open: 0 }), [])
  const heatMats = useRef<THREE.MeshStandardMaterial[] | null>(null)
  const sparks = useRef<THREE.Points>(null)
  const sparkState = useMemo(() => ({ pos: new Float32Array(N_SPARKS * 3), vel: new Float32Array(N_SPARKS * 3), life: new Float32Array(N_SPARKS), col: new Float32Array(N_SPARKS * 3) }), [])
  const sparkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(sparkState.pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(sparkState.col, 3))
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6)
    return g
  }, [sparkState])
  const bg = useMemo(() => new THREE.Color(), [])
  const skyLow = useMemo(() => new THREE.Color(), [])
  const skyHorizon = useMemo(() => new THREE.Color(), [])
  const skyZenith = useMemo(() => new THREE.Color(), [])
  const bellyFirst = useMemo(() => {
    // model +Y (nose) → world +X (downrange), model +Z (tiles) → world -Y (into the flow)
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, -1, 0))
    return new THREE.Quaternion().setFromRotationMatrix(m)
  }, [])
  const upright = useMemo(() => new THREE.Quaternion(), [])
  // a ship flips nose-up about its lateral axis: the tiles end up facing downrange (+X)
  const uprightShip = useMemo(() => {
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0))
    return new THREE.Quaternion().setFromRotationMatrix(m)
  }, [])
  const capsuleTilt = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.35)), [])
  const nPuffs = Math.max(12, Math.round(N_PUFFS * q.sprites))
  const puffs = useMemo(() => makePuffs(5, nPuffs), [nPuffs])
  const fragments = useMemo(() => makeFragments(9, N_FRAGMENTS, isShip ? 45 : 75, isShip ? 6 : 1.7), [isShip])
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), origin: new THREE.Vector3() }), [])
  // the limb seen from above the air, as on the approach: the planet's centre is R below the
  // touchdown point in the ground group's frame
  const stormDust = useAppStore((s) => (s.result?.weather?.storm === 'global' ? 1 : s.result?.weather?.storm === 'regional' ? 0.4 : 0))
  // (its ground sphere a little under the surface map, which sits 2.5 km low far out: no dark seam between them)
  const limbMat = useMemo(() => marsLimbMaterial(R_MARS - 3000, 1000, new THREE.Vector3(), stormDust), [stormDust])
  useEffect(() => {
    if (limb.current) limbCamera(limb.current, limbMat)
  }, [limbMat])

  const warm = useWarm()
  useFrame(({ camera }, rawDt) => {
    // built ahead of the cut: stay put
    if (warm) return
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
    // the vehicle's centre is the origin; its base is L/2 below. A ship stands on its legs.
    const legH = isShip ? 2.7 : 0
    const groundY = -Math.max(alt, 0) - L / 2 - legH
    const burning = !!e?.burning

    // attitude: ships fly belly-first and flip over ~2.5 s of sim time from ignition; capsules trim
    if (rig.current) {
      if (isShip) {
        const tel = result?.entry?.telemetry
        const ign = tel?.find((x) => x.burning)
        const ignitionT = phase && ign ? phase.start + ign.t : Infinity
        st.flip = Number.isFinite(ignitionT) ? smooth((t - ignitionT) / 3.5) : 0
        rig.current.quaternion.copy(bellyFirst).slerp(uprightShip, st.flip)
      } else {
        rig.current.quaternion.copy(capsuleTilt).slerp(upright, ended ? 1 : 0.2)
      }
      rig.current.visible = !(ended && (impact || breakup))
      // landing legs deploy through the flip: swing out 24°, then the extensions slide down
      if (isShip) {
        if (!legs.current) {
          const list: THREE.Object3D[] = []
          rig.current.traverse((o) => {
            if (o.name === 'leg' || o.name === 'legExt') list.push(o)
          })
          legs.current = list
        }
        const deploy = smooth((st.flip - 0.3) / 0.65)
        for (const o of legs.current) {
          if (o.name === 'leg') o.rotation.x = -0.42 * deploy
          else o.position.y = -4.2 - 3.4 * deploy
        }
      }
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
      // the limb: the sun brought into the ground's turned frame; gone once inside the haze
      limbMat.uniforms.sunDir.value.copy(sunDir).applyAxisAngle(Z_AXIS, d)
      limbMat.uniforms.uGain.value = THREE.MathUtils.smoothstep(alt, 40_000, 75_000)
    }
    // heating: a sheath on the windward side, the tiles glowing, a plasma wake streaming behind,
    // sparks of ablating material — all scaled by the heat flux
    const limitQ = vehicle.spacecraft.entry?.tpsLimit ?? 50
    const heat = ended ? 0 : Math.min(1.3, (e?.heatFlux ?? 0) / (0.5 * limitQ))
    st.heat += (heat - st.heat) * (1 - Math.exp(-dt * 4))
    const k = st.heat
    if (glow.current && wake.current && result?.entry) {
      const on = k > 0.04 && !ended
      glow.current.visible = on
      wake.current.visible = on
      const pulse = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.1)
      ;(glow.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.9 * k * pulse)
      ;(wake.current.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.35 * k)
      const belly = isShip ? 1 - st.flip : 1
      glow.current.scale.set(L * (isShip ? 1.3 : 2.2) * (0.9 + 0.1 * pulse), L * (isShip ? 0.6 : 1.6), 1)
      glow.current.position.set(0, -(isShip ? L * 0.12 * belly : L * 0.3), 0)
      wake.current.scale.set(L * (isShip ? 2.6 : 4), L * (isShip ? 0.5 : 1.2), 1)
      wake.current.position.set(-L * (isShip ? 1.2 : 2.2), -(isShip ? L * 0.05 : L * 0.1), 0)
    }
    // the windward tiles glow with the heat (the ship's materials carry userData.heat)
    if (rig.current && isShip) {
      if (!heatMats.current) {
        const list: THREE.MeshStandardMaterial[] = []
        rig.current.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
          if (m && m.userData?.heat && !list.includes(m)) list.push(m)
        })
        heatMats.current = list
      }
      const g = Math.min(1, Math.max(0, k - 0.1) / 0.9)
      for (const m of heatMats.current) {
        m.emissive.setRGB(1.0, 0.32 + 0.3 * g, 0.06 + 0.2 * g)
        m.emissiveIntensity = 2.4 * g * g
      }
    }
    // sparks: bright specks shed from the belly, streaming back into the wake
    if (sparks.current) {
      const on = k > 0.08 && !ended
      sparks.current.visible = on
      if (on) {
        const sp = sparkState
        const R = L * 0.075
        for (let i = 0; i < N_SPARKS; i++) {
          sp.life[i] -= dt
          if (sp.life[i] <= 0) {
            if (Math.random() < k * 0.6) {
              sp.life[i] = 0.4 + Math.random() * 0.8
              sp.pos[i * 3] = (Math.random() - 0.5) * L * 0.9
              sp.pos[i * 3 + 1] = -R * (1.0 + Math.random() * 0.4) * (isShip ? 1 - st.flip : 1)
              sp.pos[i * 3 + 2] = (Math.random() - 0.5) * R * 2.2
              sp.vel[i * 3] = -L * (1.2 + Math.random() * 1.6)
              sp.vel[i * 3 + 1] = -L * (0.05 + Math.random() * 0.25)
              sp.vel[i * 3 + 2] = (Math.random() - 0.5) * L * 0.3
            } else {
              sp.life[i] = -1
              sp.pos[i * 3 + 1] = 1e5
            }
          } else {
            sp.pos[i * 3] += sp.vel[i * 3] * dt
            sp.pos[i * 3 + 1] += sp.vel[i * 3 + 1] * dt
            sp.pos[i * 3 + 2] += sp.vel[i * 3 + 2] * dt
          }
          const f = Math.max(0, Math.min(1, sp.life[i]))
          sp.col[i * 3] = 1.0 * f
          sp.col[i * 3 + 1] = (0.55 + 0.4 * f) * f
          sp.col[i * 3 + 2] = (0.2 + 0.5 * f * f) * f
        }
        sparks.current.geometry.attributes.position.needsUpdate = true
        sparks.current.geometry.attributes.color.needsUpdate = true
      }
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
          // the puff texture is lit from above: keep it upright, only a little lean
          ;(s.material as THREE.SpriteMaterial).rotation = (p.dir % 1) * 0.5 - 0.25
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
      const sc = impact ? Math.max(12, L * 1.1) : L * 0.2
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
    // sky: black above the atmosphere, butterscotch dust haze near the ground; the haze thins with
    // altitude and thickens with the dust: a storm turns the sky brown and closes the horizon in
    const storm = result?.weather?.storm === 'global' ? 1 : result?.weather?.storm === 'regional' ? 0.45 : 0
    // (a global storm's dust reaches ~60–80 km; above it the sky is black, the haze a band at the limb)
    const f = Math.min(1, Math.max(0, 1 - alt / (70_000 + 15_000 * storm)))
    skyLow.copy(SKY_LOW).lerp(SKY_STORM, storm)
    bg.copy(SKY_HIGH).lerp(skyLow, Math.min(1, f * f * f * (1 + 0.6 * storm)))
    scene.background = bg
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog
      fog.color.copy(bg)
      fog.far = (60_000 + alt * 40) * (1 - 0.85 * storm * f)
      fog.near = fog.far * (0.35 - 0.25 * storm * f)
    }
    // gradient dome: butterscotch horizon, darker zenith; fades out with altitude
    // the dome's horizon is the fog colour, so the fogged ground runs into the sky without a seam
    setSky(sky.current, camera, Math.min(1, f * f * (1 + 0.8 * storm)), skyHorizon.copy(skyLow), skyZenith.copy(SKY_ZENITH).lerp(SKY_STORM_ZENITH, storm))
    // light: a storm takes the sun's edge off and fills the scene with diffuse dust-light
    if (dirLight.current) dirLight.current.intensity = 2.0 * (1 - 0.4 * storm * f)
    if (hemi.current) hemi.current.intensity = 0.6 + 0.9 * storm * f
    // the sun's glare: a cool bluish halo in the dust (Mars sunsets are blue around the sun); dimmed by a storm
    if (sun.current) {
      sun.current.position.copy(camera.position).addScaledVector(sunDir, 60_000)
      ;(sun.current.material as THREE.SpriteMaterial).opacity = (0.25 + 0.5 * f * f) * (1 - 0.7 * storm * f)
    }
    // camera: the film's shots. A slow orbit through the fall and the heating (shaking with the
    // g-load); for the landing burn and the flip a low, wide profile shot that dollies in; the
    // descent and touchdown from near the ground; the aftermath wide. Dragging overrides.
    const tel = result?.entry?.telemetry
    const ignTel = tel?.find((x) => x.burning)
    const tIgn = phase && ignTel ? phase.start + ignTel.t : Infinity
    const tTd = phase ? phase.end : Infinity
    const after = impact && tau >= 0
    // seconds into the first-steps sequence (the aftermath comes first)
    const donePhase = result?.phases.find((p) => p.phase === 'done' && p.label === 'First steps')
    const tauSteps = donePhase ? t - donePhase.start : -1
    let dist: number
    let elev: number
    let shot: string
    if (after) {
      shot = 'wreck'
      dist = Math.max(L * 4.5, 70)
      elev = 0.25
    } else if (isShip && t >= tIgn - 6 && t < tIgn + 14) {
      // the flip: a low, wide profile shot, dollying in
      shot = 'flip'
      const f = smooth((t - (tIgn - 6)) / 20)
      dist = L * (2.9 - 0.9 * f)
      elev = -0.26 + 0.12 * f
    } else if (isShip && t >= tIgn + 14 && t < tTd + 6) {
      shot = 'descent'
      dist = L * 2.6
      elev = 0.06
    } else if (isShip && t >= tIgn - 70 && t < tIgn - 6) {
      shot = 'glide'
      dist = L * 2.7
      elev = -0.15
    } else if (ended && isShip && landed && tauSteps >= 60 && tauSteps < 118) {
      // the first steps: close on the foot of the elevator
      shot = 'steps'
      dist = L * 0.95
      elev = 0.3
    } else if (ended && isShip && landed && tauSteps >= 118) {
      shot = 'base'
      dist = L * 2.7
      elev = 0.1
    } else if (ended) {
      shot = 'landed'
      dist = L * 3.2
      elev = 0.14
    } else {
      shot = 'fall'
      dist = Math.max(L * 3.2, 26) * (1 - 0.15 * k)
      elev = 0.12 + 0.2 * k
    }
    // hold the azimuth through the flip so the profile stays; otherwise the slow orbit
    if (shot !== st.shot) {
      if (shot === 'flip') st.azHold = Math.PI / 2 // from +z: the flip in profile, the sunlit side
      st.shot = shot
    }
    if (playing && autoOrbit() && shot !== 'flip') st.az += dt * (shot === 'descent' ? 0.05 : 0.08)
    if (shot === 'flip') {
      // come round the short way
      let d = st.azHold - st.az
      d = Math.atan2(Math.sin(d), Math.cos(d))
      st.az += d * (1 - Math.exp(-dt * 1.5))
    }
    // arriving from the cruise (the first seconds of the entry): start where the cruise left the
    // camera — behind the ship and above it, the planet filling the view below — and swing round
    // into the fall's framing over a few seconds
    if (!st.init) st.open = phase && t - phase.start < 5 ? 1 : 0
    else st.open *= Math.exp(-dt * 0.45)
    const open = st.open < 0.002 ? 0 : st.open
    const az = st.az + view.az + open * (2.94 - 0.4)
    st.dist += ((dist * view.zoom) - st.dist) * (1 - Math.exp(-dt * (st.dist === 0 ? 1e9 : 1.6)))
    st.el += ((elev + view.el) - st.el) * (1 - Math.exp(-dt * 1.6))
    const camEl = st.el + open * 0.1
    const camDist = st.dist * (1 - 0.5 * open)
    const flat = Math.cos(camEl)
    const lookY = after ? groundY + L * 0.4 : shot === 'descent' || shot === 'landed' ? -L * 0.15 : 0
    // once the crew is out, look toward the activity beside the ship
    const outside = isShip && landed && ended ? smooth((tauSteps - 40) / 20) : 0
    const lookX = shot === 'steps' ? -8 : -20 * outside
    // the first steps and the base are at ground level: aim there, not at the ship's middle
    const lookUp = shot === 'steps' ? groundY + 2.5 - lookY : shot === 'base' ? groundY + 9 - lookY : 6 * outside
    const target = new THREE.Vector3(lookX + Math.cos(az) * camDist * flat, lookY + lookUp + Math.sin(camEl) * camDist, Math.sin(az) * camDist * flat)
    if (!st.init) {
      camera.position.copy(target)
      st.init = true
    } else camera.position.lerp(target, 1 - Math.exp(-Math.min(dt, 0.5) * (view.dragging ? 24 : after ? 12 : 5)))
    // shake: the g-load through the heating, the engines lighting, the touchdown, an impact
    let shake = 0
    const gl = e?.gLoad ?? 0
    if (!ended) shake += Math.max(0, gl - 0.5) * 0.012 * L * (0.5 + 0.5 * k)
    if (t >= tIgn && t < tIgn + 1.2) shake += L * 0.03 * (1 - (t - tIgn) / 1.2)
    if (ended && tau < 0.8 && !impact) shake += L * 0.02 * (1 - tau / 0.8)
    if (impact && tau >= 0 && tau < 1.6) shake += Math.max(2, L * 0.08) * (1 - tau / 1.6) ** 2
    if (shake > 0) {
      camera.position.x += (Math.random() - 0.5) * shake
      camera.position.y += (Math.random() - 0.5) * shake
      camera.position.z += (Math.random() - 0.5) * shake
    }
    // (opening: aimed below the ship, which sits in the upper part of the frame as the cruise left it)
    camera.lookAt(lookX, lookY + lookUp - open * Math.tan(0.25) * camDist, 0)
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
      {/* the ionised wake: a plume pointing back along the velocity, throttled by the heat */}
      <group rotation={[0, 0, -Math.PI / 2]} position={[-L * 0.1, -L * 0.08, 0]}>
        <PlasmaWake L={L} heatRef={st} />
      </group>
      <points ref={sparks} geometry={sparkGeo} visible={false} frustumCulled={false}>
        <pointsMaterial size={isShip ? 0.9 : 0.5} sizeAttenuation vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </points>
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
          <meshStandardMaterial color="#3a2418" roughness={1} transparent opacity={0.55} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
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
        <mesh ref={limb} material={limbMat} position={[0, -R_MARS, 0]} frustumCulled={false}>
          <sphereGeometry args={[R_MARS + 90_000, 128, 64]} />
        </mesh>
      </group>
      {isShip && <FirstSteps groundY={-L / 2 - 2.7} hatchY={2.7 + 19.4} shipR={4.5} crew={crew} />}
      {/* the sun: low in the west; its shadow map follows the ship (always at the origin) */}
      <directionalLight ref={dirLight} position={[300, 400, 200]} intensity={2.0} color="#ffe2c4" castShadow={q.shadowMap > 0} shadow-mapSize={[q.shadowMap || 1, q.shadowMap || 1]} shadow-camera-left={-140} shadow-camera-right={140} shadow-camera-top={140} shadow-camera-bottom={-140} shadow-camera-near={100} shadow-camera-far={1100} shadow-bias={-0.0004} />
      <hemisphereLight ref={hemi} args={['#d8a877', '#4a2c1a', 0.6]} />
      <sprite ref={sun} scale={[9000, 9000, 1]} renderOrder={-9}>
        <spriteMaterial map={sunTex} color="#dfe8ff" transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} fog={false} />
      </sprite>
    </group>
  )
}

/** the wake as a plume: its throttle follows the smoothed heat every frame */
function PlasmaWake({ L, heatRef }: { L: number; heatRef: { heat: number; flip: number } }) {
  const [thr, setThr] = useState(0)
  useFrame(() => {
    const v = Math.round(Math.min(1, heatRef.heat * (1 - heatRef.flip)) * 20) / 20
    if (v !== thr) setThr(v)
  })
  return <Plume kind="plasma" radius={L * 0.16} length={L * 1.6} throttle={thr} expansion={2.6} />
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
