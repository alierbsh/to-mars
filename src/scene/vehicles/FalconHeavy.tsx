/**
 * Falcon Heavy + Crew Dragon — 70 m. Three 3.66 m cores (white, black interstage/legs — Block 5),
 * 27 Merlin 1D in octawebs, titanium grid fins, side-booster nose cones, Dragon 2 with trunk.
 */
import { Bell, Decal, Fin, GridFin, Ogive, Tube, MAT } from '../parts'
import * as THREE from 'three'

const R = 1.83
const CORE_X = 4.05
const BODY = 41.2
const BELL_Y = 1.5

const soot = new THREE.MeshStandardMaterial({ color: '#d9d9d6', roughness: 0.6 })
const panel = new THREE.MeshStandardMaterial({ color: '#1c2430', roughness: 0.4, metalness: 0.5 })

function Octaweb({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <Bell rt={0.2} re={0.46} h={1.4} y={BELL_Y} />
      {Array.from({ length: 8 }, (_, i) => (
        <Bell key={i} rt={0.2} re={0.46} h={1.4} y={BELL_Y} x={1.18 * Math.cos((i / 8) * Math.PI * 2)} z={1.18 * Math.sin((i / 8) * Math.PI * 2)} segments={20} />
      ))}
    </group>
  )
}

function Core({ x, side }: { x: number; side: boolean }) {
  const legOutline: Array<[number, number]> = [
    [0, 0],
    [0.55, 0],
    [0.35, 10.5],
    [0, 11],
  ]
  return (
    <group position={[x, 0, 0]}>
      <Tube r={R} h={BODY} y={BELL_Y} material={MAT.white} segments={48} />
      {/* black Block-5 thermal protection at the base + raceway */}
      <Tube r={R + 0.01} h={1.2} y={BELL_Y} material={MAT.black} segments={48} />
      {/* four landing legs */}
      {[45, 135, 225, 315].map((deg) => (
        <Fin key={deg} outline={legOutline} thickness={0.55} r={R - 0.25} a={(deg * Math.PI) / 180} y={BELL_Y + 0.3} material={MAT.black} />
      ))}
      {/* grid fins near the top */}
      {[45, 135, 225, 315].map((deg) => (
        <GridFin key={deg} r={R} a={(deg * Math.PI) / 180} y={BELL_Y + BODY - 1.2} w={1.6} hh={0.9} repeat={[2, 1]} />
      ))}
      {side ? (
        <Ogive r={R} L={5.0} y={BELL_Y + BODY} material={MAT.white} segments={48} />
      ) : (
        <Tube r={R} h={4.5} y={BELL_Y + BODY} material={MAT.black} segments={48} />
      )}
      <Decal text="SPACEX" r={R} a={Math.PI / 2} y={BELL_Y + 24} w={6} h={1.1} color="#2a2d31" font="bold 150px Helvetica, Arial, sans-serif" rotate={Math.PI / 2} />
      <group position={[x, 0, 0]} />
    </group>
  )
}

export default function FalconHeavyModel() {
  const s2y = BELL_Y + BODY + 4.5 // 47.2
  return (
    <group>
      <group name="side">
        <object3D name="plume:side" position={[-CORE_X, BELL_Y, 0]} userData={{ radius: 1.7, engines: 'Merlin 1D' }} />
        <object3D name="plume:side" position={[CORE_X, BELL_Y, 0]} userData={{ radius: 1.7, engines: 'Merlin 1D' }} />
        <Core x={-CORE_X} side />
        <Core x={CORE_X} side />
        <Octaweb x={-CORE_X} />
        <Octaweb x={CORE_X} />
        {/* attach points */}
        {[-1, 1].map((sgn) =>
          [BELL_Y + 2, BELL_Y + BODY - 2].map((yy) => (
            <mesh key={`${sgn}${yy}`} position={[sgn * CORE_X * 0.5, yy, 0]} material={MAT.dark}>
              <boxGeometry args={[CORE_X - 2 * R + 0.5, 0.4, 0.4]} />
            </mesh>
          )),
        )}
      </group>
      <group name="center">
        <object3D name="plume:center" position={[0, BELL_Y, 0]} userData={{ radius: 1.7, engines: 'Merlin 1D' }} />
        <Core x={0} side={false} />
        <Octaweb x={0} />
      </group>
      <group name="s2">
        <object3D name="plume:s2" position={[0, s2y - 3.2, 0]} userData={{ radius: 1.6, engines: 'Merlin Vacuum' }} />
        <Tube r={R} h={12.6} y={s2y} material={MAT.white} segments={48} />
        <Tube r={R + 0.01} h={0.5} y={s2y + 4} material={soot} segments={48} />
        <Bell rt={0.3} re={1.6} h={3.4} y={s2y + 0.2} segments={28} />
      </group>
      {/* Crew Dragon: trunk with solar panel half, capsule, nose cone */}
      <group name="dragon-sm">
        <Tube r={R} h={3.6} y={s2y + 12.6} material={MAT.white} segments={48} />
        <Tube r={R + 0.02} h={3.4} y={s2y + 12.7} material={panel} segments={48} thetaStart={-Math.PI / 2} thetaLength={Math.PI} open />
      </group>
      <group name="dragon">
        <object3D name="plume:dragon" position={[0, s2y + 16.2, 0]} userData={{ radius: 1.6, engines: 'SuperDraco' }} />
        <Tube r={2.0} rTop={1.35} h={2.9} y={s2y + 16.2} material={MAT.white} segments={48} />
        <mesh position={[0, s2y + 16.25, 0]} material={MAT.dark}>
          <cylinderGeometry args={[2.0, 1.95, 0.2, 48]} />
        </mesh>
        <Tube r={1.35} rTop={1.2} h={0.6} y={s2y + 19.1} material={MAT.white} segments={48} />
        <Ogive r={1.2} L={1.6} y={s2y + 19.7} material={MAT.white} segments={48} />
        {/* SuperDraco pods */}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i / 4) * Math.PI * 2 + Math.PI / 4, 0]} position={[0, s2y + 17.2, 0]}>
            <mesh position={[1.75, 0, 0]} material={MAT.dark}>
              <boxGeometry args={[0.5, 1.2, 0.9]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
