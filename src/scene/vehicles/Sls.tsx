/**
 * SLS Block 1 + Orion — 98.3 m. Orange SOFI core (8.4 m) with four RS-25s, two 5-segment
 * SRBs (3.7 m × 54 m), LVSA frustum, ICPS, Orion stage adapter, Orion with its launch abort tower.
 */
import { Bell, Decal, FlagUSA, Ogive, Tube, MAT } from '../parts'
import * as THREE from 'three'

const CORE_R = 4.2
const SRB_R = 1.85
const CORE_BASE = 3.0
const CORE_H = 64.6
const SRB_X = CORE_R + SRB_R + 0.35

const foamPanel = new THREE.MeshStandardMaterial({ color: '#c47a2c', roughness: 0.9 })
const nasaBlue = new THREE.MeshStandardMaterial({ color: '#1e3f8a', roughness: 0.7 })

function Srb({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      {/* aft skirt flares out */}
      <Tube r={SRB_R + 0.45} rTop={SRB_R} h={3.2} y={0.3} material={MAT.offwhite} />
      <Tube r={SRB_R} h={50.5} y={3.5} material={MAT.white} segments={48} />
      {/* segment joints */}
      {[13, 22, 31, 40, 49].map((yy) => (
        <mesh key={yy} position={[0, yy, 0]} material={MAT.stainlessDark}>
          <cylinderGeometry args={[SRB_R + 0.03, SRB_R + 0.03, 0.12, 48, 1, true]} />
        </mesh>
      ))}
      {/* forward skirt + nose */}
      <Tube r={SRB_R} h={1.5} y={54} material={MAT.offwhite} />
      <Ogive r={SRB_R} L={4.2} y={55.5} material={MAT.white} />
      {/* nozzle */}
      <Bell rt={0.55} re={1.5} h={2.4} y={0.5} material={MAT.dark} />
      {/* markings */}
      <Decal text="USA" r={SRB_R} a={x > 0 ? 0 : Math.PI} y={46} w={2.2} h={0.9} color="#111" font="bold 200px Helvetica, Arial, sans-serif" />
      <group rotation={[0, x > 0 ? 0 : Math.PI, 0]} position={[0, 43, 0]}>
        <mesh position={[SRB_R + 0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.7, 32]} />
          <meshStandardMaterial color="#1e3f8a" roughness={0.7} polygonOffset polygonOffsetFactor={-1} />
        </mesh>
      </group>
    </group>
  )
}

export default function SlsModel() {
  const coreTop = CORE_BASE + CORE_H // 67.6
  return (
    <group>
      {/* core stage */}
      <group name="core">
        <Tube r={CORE_R} h={CORE_H} y={CORE_BASE} material={MAT.foam} segments={96} />
        {/* engine section boattail (darker foam) */}
        <Tube r={CORE_R + 0.01} h={6} y={CORE_BASE} material={foamPanel} segments={96} />
        {/* intertank ring and forward skirt (darker panels) */}
        <Tube r={CORE_R + 0.01} h={6.7} y={CORE_BASE + 42} material={foamPanel} segments={96} />
        <Tube r={CORE_R + 0.01} h={2.4} y={coreTop - 2.4} material={foamPanel} segments={96} />
        {/* systems tunnel (raceway) */}
        <group rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[CORE_R, CORE_BASE + CORE_H / 2, 0]} material={foamPanel}>
            <boxGeometry args={[0.5, CORE_H - 4, 0.8]} />
          </mesh>
        </group>
        {/* 4 RS-25 in a square */}
        {[[1.95, 1.95], [-1.95, 1.95], [1.95, -1.95], [-1.95, -1.95]].map(([x, z], i) => (
          <Bell key={i} rt={0.38} re={1.2} h={3.4} y={CORE_BASE + 0.5} x={x} z={z} material={MAT.bell} segments={28} />
        ))}
        {/* markings: flag, USA, NASA worm, ESA */}
        <FlagUSA r={CORE_R} a={0} y={CORE_BASE + 36} w={2.6} />
        <Decal text="USA" r={CORE_R} a={0} y={CORE_BASE + 33.2} w={3.2} h={1.3} color="#111" font="bold 200px Helvetica, Arial, sans-serif" />
        <Decal text="NASA" r={CORE_R} a={0} y={CORE_BASE + 30} w={4.4} h={1.2} color="#c8261e" font="bold 190px Helvetica, Arial, sans-serif" />
        <group rotation={[0, Math.PI, 0]} position={[0, CORE_BASE + 34, 0]}>
          <mesh position={[CORE_R + 0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={nasaBlue}>
            <circleGeometry args={[1.5, 32]} />
          </mesh>
        </group>
      </group>

      <group name="srb">
        <Srb x={SRB_X} />
        <Srb x={-SRB_X} />
        {/* attach struts */}
        {[SRB_X, -SRB_X].map((x) =>
          [6, 50].map((yy) => (
            <mesh key={`${x}-${yy}`} position={[x / 2, yy, 0]} material={MAT.dark}>
              <boxGeometry args={[Math.abs(x) - CORE_R - SRB_R + 0.9, 0.5, 0.6]} />
            </mesh>
          )),
        )}
      </group>

      {/* LVSA frustum 8.4 → 5.1 m */}
      <Tube r={CORE_R} rTop={2.55} h={7.6} y={coreTop} material={MAT.white} segments={96} />
      {/* ICPS */}
      <group name="icps">
        <Tube r={2.55} h={10.4} y={coreTop + 7.6} material={MAT.white} segments={64} />
        <Tube r={2.56} h={3.2} y={coreTop + 9.5} material={MAT.foam} segments={64} />
        <FlagUSA r={2.55} a={0} y={coreTop + 15} w={1.4} />
      </group>
      {/* Orion stage adapter */}
      <Tube r={2.55} rTop={2.52} h={1.4} y={coreTop + 18} material={MAT.offwhite} />
      {/* Orion: spacecraft adapter fairing around the ESM, then the crew module under the ogive boost-protective cover */}
      <group name="orion">
        <Tube r={2.52} h={4.6} y={coreTop + 19.4} material={MAT.white} segments={64} />
        <mesh position={[0, coreTop + 19.4 + 2.3, 0]} material={MAT.stainlessDark}>
          <cylinderGeometry args={[2.0, 2.0, 0.08, 48]} />
        </mesh>
        <Ogive r={2.52} L={5.0} y={coreTop + 24} material={MAT.white} segments={64} />
        {/* abort tower: truss + motor */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 0.75, coreTop + 29.9, Math.sin((i / 4) * Math.PI * 2) * 0.75]} material={MAT.dark}>
            <cylinderGeometry args={[0.09, 0.09, 2.0, 8]} />
          </mesh>
        ))}
        <Tube r={0.62} h={4.2} y={coreTop + 30.8} material={MAT.offwhite} segments={32} />
        <Ogive r={0.62} L={1.3} y={coreTop + 35} material={MAT.dark} segments={32} />
        {/* abort motor nozzles */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`n${i}`} position={[Math.cos((i / 4) * Math.PI * 2 + 0.4) * 0.7, coreTop + 31.6, Math.sin((i / 4) * Math.PI * 2 + 0.4) * 0.7]} rotation={[0, 0, 0]} material={MAT.dark}>
            <coneGeometry args={[0.28, 0.6, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
