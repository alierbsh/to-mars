/**
 * Starship V3 — Super Heavy (72.3 m) + Ship (52.1 m), 9 m diameter, 124.4 m stack.
 * Geometry from docs/research (ring counts, fin layout, engine arrangement); unpublished
 * dimensions (flap sizes, chine length, fin size) are eyeballed from photographs.
 * Windward (tiled) side faces +X.
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { Band, Bell, Chine, Decal, Fin, FlagUSA, GridFin, Ogive, OgiveShell, OgiveTip, Tube, MAT, getHexTiles, ringSkinMaterial } from '../parts'

const R = 4.5
const RING = 1.83
export const BOOSTER_H = 72.3
export const SHIP_H = 52.1
const SHIP_CYL = 21 * RING // 38.4 m
const NOSE_L = SHIP_H - SHIP_CYL // ~13.7 m
/** cryogenic frost: a thin white, slightly translucent shell; the rig sets its opacity */
const FROST = new THREE.MeshStandardMaterial({ color: '#f4f6f8', roughness: 0.95, metalness: 0, transparent: true, opacity: 0.0, depthWrite: false })
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
  const skin = useMemo(() => ringSkinMaterial(BOOSTER_H - skirtBottom, RING), [])
  return (
    <group name="superheavy">
      <object3D name="plume:superheavy" position={[0, 1.6, 0]} userData={{ radius: 4.3, engines: 'Raptor 3' }} />
      {/* body: rolled rings, each with its own sheen */}
      <Tube r={R} h={BOOSTER_H - skirtBottom} y={skirtBottom} material={skin} segments={96} />
      {/* frost on the tank sections while loaded on the pad; the rig fades it at liftoff */}
      <group name="frost">
        <Tube r={R + 0.02} h={BOOSTER_H - 5 - 22} y={5} material={FROST} segments={96} />
        <Tube r={R + 0.02} h={3} y={BOOSTER_H - 20} material={FROST} segments={96} />
      </group>
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
  const skin = useMemo(() => ringSkinMaterial(SHIP_CYL, RING), [])
  const skinNose = useMemo(() => ringSkinMaterial(NOSE_L, RING), [])
  const flapTiles = useMemo(() => {
    const t = getHexTiles().clone()
    t.needsUpdate = true
    t.repeat.set(3, 6)
    return Object.assign(new THREE.MeshStandardMaterial({ map: t, color: '#ffffff', metalness: 0.05, roughness: 0.9 }), { userData: { heat: true } })
  }, [])
  const tiles = useMemo(() => {
    const t = getHexTiles().clone()
    t.needsUpdate = true
    t.repeat.set(16, 24)
    return Object.assign(new THREE.MeshStandardMaterial({ map: t, color: '#ffffff', metalness: 0.05, roughness: 0.95 }), { userData: { heat: true } })
  }, [])
  const tilesNose = useMemo(() => {
    const t = getHexTiles().clone()
    t.needsUpdate = true
    t.repeat.set(8, 8)
    return Object.assign(new THREE.MeshStandardMaterial({ map: t, color: '#ffffff', metalness: 0.05, roughness: 0.95 }), { userData: { heat: true } })
  }, [])
  const tipTiles = useMemo(() => Object.assign(MAT.tiles.clone(), { userData: { heat: true } }), [])
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
      {/* cylinder + nose: rolled rings, each with its own sheen */}
      <Tube r={R} h={SHIP_CYL} y={0} material={skin} segments={96} />
      <Ogive r={R} L={NOSE_L} y={SHIP_CYL} material={skinNose} segments={96} />
      {/* frost on the main tanks while loaded */}
      <group name="frost">
        <Tube r={R + 0.02} h={SHIP_CYL - 14} y={2} material={FROST} segments={96} />
      </group>
      {/* crew windows: a row of eight on the leeward side below the nose */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI + ((i - 3.5) / 8) * 1.4
        return (
          <mesh key={`w${i}`} position={[Math.cos(a) * (R + 0.03), SHIP_CYL - 1.6, Math.sin(a) * (R + 0.03)]} rotation={[0, -a, 0]} material={MAT.glass}>
            <boxGeometry args={[0.08, 0.7, 0.45]} />
          </mesh>
        )
      })}
      <FlagUSA r={R} a={Math.PI + 0.55} y={SHIP_CYL - 5.5} w={1.4} />
      {welds.map((wy) => (
        <Band key={wy} r={R} y={wy} />
      ))}
      {/* heat shield: windward half of the body, nose and a full tip cap */}
      <Tube r={R + 0.06} h={SHIP_CYL + 0.1} y={-0.05} material={tiles} segments={64} thetaStart={-Math.PI / 2} thetaLength={Math.PI} open />
      <OgiveShell r={R} L={NOSE_L} y={SHIP_CYL} material={tilesNose} thetaStart={-Math.PI / 2} thetaLength={Math.PI} scale={1.013} />
      <OgiveTip r={R} L={NOSE_L} y={SHIP_CYL} tipLength={2.2} material={tipTiles} />
      {/* engines: 3 sea-level centre + 3 vacuum outer, hanging in the skirt */}
      {[0, 1, 2].map((i) => (
        <Bell key={`sl${i}`} rt={BELL_SL.rt} re={BELL_SL.re} h={BELL_SL.h} y={0.4} x={1.0 * Math.cos((i / 3) * 2 * Math.PI + Math.PI / 6)} z={1.0 * Math.sin((i / 3) * 2 * Math.PI + Math.PI / 6)} />
      ))}
      {[0, 1, 2].map((i) => (
        <Bell key={`vac${i}`} rt={BELL_VAC.rt} re={BELL_VAC.re} h={BELL_VAC.h} y={1.2} x={3.0 * Math.cos((i / 3) * 2 * Math.PI + Math.PI / 6 + Math.PI / 3)} z={3.0 * Math.sin((i / 3) * 2 * Math.PI + Math.PI / 6 + Math.PI / 3)} segments={28} />
      ))}
      {/* aft flaps on the sides (±90° from windward): steel, with the tiled face proud on the windward side, and the hinge aerocover at the root */}
      {[Math.PI / 2, -Math.PI / 2].map((a, i) => (
        <group key={`aft${i}`}>
          <Fin outline={aftFlap} thickness={0.5} r={R - 0.2} a={a} y={1.2} material={MAT.stainlessDark} />
          <Fin outline={aftFlap.map(([x, yy]) => [x * 0.97, yy * 0.97] as [number, number])} thickness={0.1} r={R - 0.15} a={a} y={1.35} material={flapTiles} tilt={0} proud={a > 0 ? -0.3 : 0.3} />
          <group rotation={[0, a, 0]}>
            <mesh position={[R - 0.4, 6.0, 0]} rotation={[0, 0, 0]} material={flapTiles}>
              <cylinderGeometry args={[0.9, 0.9, 10, 16, 1, false, 0, Math.PI]} />
            </mesh>
          </group>
        </group>
      ))}
      {/* forward flaps, moved leeward (~140° apart), on the lower nose: steel with a tiled windward face and the aerocover */}
      {[Math.PI - (70 * Math.PI) / 180, Math.PI + (70 * Math.PI) / 180].map((a, i) => (
        <group key={`fwd${i}`}>
          <Fin outline={fwdFlap} thickness={0.35} r={R - 1.2} a={a} y={SHIP_CYL + 1.2} material={MAT.stainlessDark} tilt={-0.2} />
          <Fin outline={fwdFlap.map(([x, yy]) => [x * 0.96, yy * 0.96] as [number, number])} thickness={0.08} r={R - 1.15} a={a} y={SHIP_CYL + 1.3} material={flapTiles} tilt={-0.2} proud={i === 0 ? 0.22 : -0.22} />
          <group rotation={[0, a, 0]}>
            <mesh position={[R - 1.0, SHIP_CYL + 3.6, 0]} material={flapTiles}>
              <cylinderGeometry args={[0.55, 0.55, 5.4, 12, 1, false, 0, Math.PI]} />
            </mesh>
          </group>
        </group>
      ))}
      <Decal text="SPACEX" r={R} a={Math.PI} y={SHIP_CYL - 8} w={5} h={1} color="#2a2d31" font="bold 150px Helvetica, Arial, sans-serif" />
      {/* landing legs (Mars ship): six, stowed flat along the skirt; the entry scene swings each `leg` out
          and slides its `legExt` extension down so the feet reach below the engine bells */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6
        return (
          <group key={`leg${i}`} position={[Math.cos(a) * (R - 0.1), 6.0, Math.sin(a) * (R - 0.1)]} rotation={[0, -a + Math.PI / 2, 0]}>
            <group name="leg">
              <mesh position={[0, -3, 0.28]} material={MAT.stainlessDark} castShadow>
                <boxGeometry args={[0.6, 6, 0.45]} />
              </mesh>
              <group name="legExt" position={[0, -4.2, 0.28]}>
                <mesh material={MAT.dark} castShadow>
                  <boxGeometry args={[0.42, 3.6, 0.32]} />
                </mesh>
                <mesh position={[0, -1.9, 0]} material={MAT.dark} castShadow>
                  <cylinderGeometry args={[0.75, 1.0, 0.3, 12]} />
                </mesh>
              </group>
            </group>
          </group>
        )
      })}
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
