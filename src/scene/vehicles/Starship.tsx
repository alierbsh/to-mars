/**
 * Starship V3 — Super Heavy (72.3 m) + Ship (52.1 m), 9 m diameter, 124.4 m stack.
 * Geometry from docs/research (ring counts, fin layout, engine arrangement); unpublished
 * dimensions (flap sizes, chine length, fin size) are eyeballed from photographs.
 * Windward (tiled) side faces +X.
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { Band, Bell, Chine, Decal, Fin, GridFin, Ogive, OgiveShell, OgiveTip, Tube, MAT, getHexTiles } from '../parts'

const R = 4.5
const RING = 1.83
export const BOOSTER_H = 72.3
export const SHIP_H = 52.1
const SHIP_CYL = 21 * RING // 38.4 m
const NOSE_L = SHIP_H - SHIP_CYL // ~13.7 m
const BELL_SL = { rt: 0.28, re: 0.65, h: 1.7 }
const BELL_VAC = { rt: 0.28, re: 1.2, h: 2.6 }

export function SuperHeavy({ hotStage = true }: { hotStage?: boolean }) {
  const skirtBottom = 1.6 // bells hang below
  const welds = useMemo(() => Array.from({ length: 33 }, (_, i) => skirtBottom + 4 * 1.4 + (i + 1) * RING).filter((y) => y < BOOSTER_H - 1.5), [])
  const engines = useMemo(() => {
    const list: Array<[number, number]> = []
    for (let i = 0; i < 3; i++) list.push([0.78 * Math.cos((i / 3) * 2 * Math.PI), 0.78 * Math.sin((i / 3) * 2 * Math.PI)])
    for (let i = 0; i < 10; i++) list.push([2.15 * Math.cos((i / 10) * 2 * Math.PI + 0.3), 2.15 * Math.sin((i / 10) * 2 * Math.PI + 0.3)])
    for (let i = 0; i < 20; i++) list.push([3.78 * Math.cos((i / 20) * 2 * Math.PI), 3.78 * Math.sin((i / 20) * 2 * Math.PI)])
    return list
  }, [])
  return (
    <group name="superheavy">
      <object3D name="plume:superheavy" position={[0, 1.6, 0]} userData={{ radius: 4.3, engines: 'Raptor 3' }} />
      {/* body */}
      <Tube r={R} h={BOOSTER_H - skirtBottom} y={skirtBottom} material={MAT.stainless} segments={96} />
      {/* aft heat-affected skirt */}
      <Tube r={R + 0.01} h={4 * 1.4} y={skirtBottom} material={MAT.heatTint} segments={96} />
      {/* thrust structure plate */}
      <mesh position={[0, skirtBottom + 0.05, 0]} material={MAT.dark}>
        <cylinderGeometry args={[R - 0.05, R - 0.05, 0.1, 64]} />
      </mesh>
      {welds.map((y) => (
        <Band key={y} r={R} y={y} />
      ))}
      {/* engines */}
      {engines.map(([x, z], i) => (
        <Bell key={i} rt={BELL_SL.rt} re={BELL_SL.re} h={BELL_SL.h} y={skirtBottom + 0.3} x={x} z={z} material={i < 13 ? MAT.bell : MAT.bellHot} segments={20} />
      ))}
      {/* chines on the LOX tank */}
      {[45, 135, 225, 315].map((deg) => (
        <Chine key={deg} r={R} a={(deg * Math.PI) / 180} y={skirtBottom + 5} h={24} w={0.55} material={MAT.stainless} />
      ))}
      {/* V3: three larger grid fins, 90/90/180, lower than the old interstage position */}
      {[0, 90, 270].map((deg) => (
        <GridFin key={deg} r={R} a={(deg * Math.PI) / 180} y={BOOSTER_H - 6.5} w={4.6} hh={2.3} repeat={[4, 2]} />
      ))}
      {/* catch pins */}
      {[45, 315].map((deg) => (
        <group key={deg} rotation={[0, (deg * Math.PI) / 180, 0]} position={[0, BOOSTER_H - 8.5, 0]}>
          <mesh position={[R + 0.3, 0, 0]} material={MAT.stainlessDark}>
            <cylinderGeometry args={[0.25, 0.25, 0.8, 16]} />
          </mesh>
        </group>
      ))}
      {/* integrated hot-stage section: vented band */}
      {hotStage && (
        <>
          <Tube r={R + 0.015} h={1.8} y={BOOSTER_H - 1.8} material={MAT.dark} segments={96} />
          {Array.from({ length: 24 }, (_, i) => (
            <group key={i} rotation={[0, (i / 24) * Math.PI * 2, 0]} position={[0, BOOSTER_H - 0.9, 0]}>
              <mesh position={[R + 0.03, 0, 0]} material={MAT.black}>
                <boxGeometry args={[0.1, 1.1, 0.6]} />
              </mesh>
            </group>
          ))}
        </>
      )}
      <Decal text="SPACEX" r={R} a={Math.PI} y={BOOSTER_H - 12} w={6} h={1.2} color="#2a2d31" font="bold 150px Helvetica, Arial, sans-serif" />
    </group>
  )
}

export function Ship({ y = BOOSTER_H }: { y?: number }) {
  const tiles = useMemo(() => {
    const t = getHexTiles().clone()
    t.needsUpdate = true
    t.repeat.set(16, 24)
    return new THREE.MeshStandardMaterial({ map: t, color: '#ffffff', metalness: 0.05, roughness: 0.95 })
  }, [])
  const tilesNose = useMemo(() => {
    const t = getHexTiles().clone()
    t.needsUpdate = true
    t.repeat.set(8, 8)
    return new THREE.MeshStandardMaterial({ map: t, color: '#ffffff', metalness: 0.05, roughness: 0.95 })
  }, [])
  const welds = useMemo(() => Array.from({ length: 20 }, (_, i) => (i + 1) * RING), [])
  const aftFlap: Array<[number, number]> = [
    [0, 0],
    [4.4, 0.3],
    [4.0, 3.2],
    [2.2, 9.0],
    [0, 9.6],
  ]
  const fwdFlap: Array<[number, number]> = [
    [0, 0],
    [2.0, 0.5],
    [1.5, 2.8],
    [0.5, 5.2],
    [0, 5.4],
  ]
  return (
    <group name="ship" position={[0, y, 0]}>
      <object3D name="plume:ship" position={[0, 0.3, 0]} userData={{ radius: 3.6, engines: 'Raptor 3' }} />
      {/* cylinder + nose */}
      <Tube r={R} h={SHIP_CYL} y={0} material={MAT.stainless} segments={96} />
      <Ogive r={R} L={NOSE_L} y={SHIP_CYL} material={MAT.stainless} segments={96} />
      {welds.map((wy) => (
        <Band key={wy} r={R} y={wy} />
      ))}
      {/* heat shield: windward half of the body, nose and a full tip cap */}
      <Tube r={R + 0.06} h={SHIP_CYL + 0.1} y={-0.05} material={tiles} segments={64} thetaStart={-Math.PI / 2} thetaLength={Math.PI} open />
      <OgiveShell r={R} L={NOSE_L} y={SHIP_CYL} material={tilesNose} thetaStart={-Math.PI / 2} thetaLength={Math.PI} scale={1.013} />
      <OgiveTip r={R} L={NOSE_L} y={SHIP_CYL} tipLength={2.2} material={MAT.tiles} />
      {/* engines: 3 sea-level centre + 3 vacuum outer, hanging in the skirt */}
      {[0, 1, 2].map((i) => (
        <Bell key={`sl${i}`} rt={BELL_SL.rt} re={BELL_SL.re} h={BELL_SL.h} y={0.4} x={1.0 * Math.cos((i / 3) * 2 * Math.PI + Math.PI / 6)} z={1.0 * Math.sin((i / 3) * 2 * Math.PI + Math.PI / 6)} />
      ))}
      {[0, 1, 2].map((i) => (
        <Bell key={`vac${i}`} rt={BELL_VAC.rt} re={BELL_VAC.re} h={BELL_VAC.h} y={1.2} x={3.0 * Math.cos((i / 3) * 2 * Math.PI + Math.PI / 6 + Math.PI / 3)} z={3.0 * Math.sin((i / 3) * 2 * Math.PI + Math.PI / 6 + Math.PI / 3)} segments={28} />
      ))}
      {/* aft flaps on the sides (±90° from windward), tiled on the windward face */}
      {[Math.PI / 2, -Math.PI / 2].map((a, i) => (
        <group key={`aft${i}`}>
          <Fin outline={aftFlap} thickness={0.5} r={R - 0.2} a={a} y={1.2} material={MAT.stainless} />
          <Fin outline={aftFlap.map(([x, yy]) => [x * 0.98, yy * 0.98] as [number, number])} thickness={0.12} r={R - 0.15} a={a} y={1.3} material={MAT.tiles} tilt={0} />
        </group>
      ))}
      {/* forward flaps, moved leeward (~140° apart), on the lower nose */}
      {[Math.PI - (70 * Math.PI) / 180, Math.PI + (70 * Math.PI) / 180].map((a, i) => (
        <Fin key={`fwd${i}`} outline={fwdFlap} thickness={0.35} r={R - 1.2} a={a} y={SHIP_CYL + 1.2} material={MAT.stainless} tilt={-0.2} />
      ))}
      <Decal text="SPACEX" r={R} a={Math.PI} y={SHIP_CYL - 8} w={5} h={1} color="#2a2d31" font="bold 150px Helvetica, Arial, sans-serif" />
    </group>
  )
}

export default function StarshipModel({ shipOffset = 0, boosterOffset = 0 }: { shipOffset?: number; boosterOffset?: number }) {
  return (
    <group>
      <group position={[0, boosterOffset, 0]}>
        <SuperHeavy />
      </group>
      <Ship y={BOOSTER_H + shipOffset} />
    </group>
  )
}
