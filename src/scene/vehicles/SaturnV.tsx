/**
 * Saturn V + Apollo CSM — 110.6 m. S-IC (10.06 m, five F-1s, four fins and engine fairings),
 * S-II, S-IVB with its tapered aft interstage, IU, SLA, service and command modules, LES.
 * Black-and-white roll pattern approximated from the Apollo 11 configuration.
 */
import { Bell, Decal, Fin, FlagUSA, Ogive, Tube, MAT } from '../parts'

const R1 = 5.03
const R3 = 3.3
const BELL_Y = 2.6

function Quadrants({ r, y, h, n = 4, offset = 0 }: { r: number; y: number; h: number; n?: number; offset?: number }) {
  // alternating black arcs around the body
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Tube key={i} r={r + 0.02} h={h} y={y} material={MAT.black} segments={24} thetaStart={offset + (i / n) * Math.PI * 2} thetaLength={Math.PI / n} open />
      ))}
    </>
  )
}

function UnitedStates({ r, y, a }: { r: number; y: number; a: number }) {
  return (
    <>
      <Decal text="UNITED STATES" r={r} a={a} y={y} w={12} h={1.6} color="#111" font="bold 120px Helvetica, Arial, sans-serif" rotate={-Math.PI / 2} />
      <FlagUSA r={r} a={a} y={y + 8} w={2.2} />
    </>
  )
}

export default function SaturnVModel() {
  const sicTop = BELL_Y + 39.5 // 42.1 m stage incl. engine section
  const siiTop = sicTop + 24.8
  const sivbTop = siiTop + 17.8
  const fin: Array<[number, number]> = [
    [0, 0],
    [3.2, 0],
    [1.4, 2.6],
    [0, 3.0],
  ]
  return (
    <group>
      <group name="s-ic">
        <object3D name="plume:s-ic" position={[0, BELL_Y + 0.4, 0]} userData={{ radius: 4.6, engines: 'F-1' }} />
        <Tube r={R1} h={39.5} y={BELL_Y} material={MAT.white} segments={96} />
        {/* roll pattern: black stripes on the engine fairing section, intertank quadrants, forward quadrants */}
        <Quadrants r={R1} y={BELL_Y + 0.2} h={9.6} n={4} offset={Math.PI / 8} />
        <Quadrants r={R1} y={BELL_Y + 21.5} h={4.6} n={2} offset={0} />
        <Quadrants r={R1} y={sicTop - 2.2} h={2.2} n={4} offset={Math.PI / 8} />
        {/* four fins + conical engine fairings */}
        {[45, 135, 225, 315].map((deg) => (
          <Fin key={deg} outline={fin} thickness={0.35} r={R1 - 0.2} a={(deg * Math.PI) / 180} y={BELL_Y + 0.2} material={MAT.white} />
        ))}
        {[45, 135, 225, 315].map((deg) => (
          <group key={`f${deg}`} rotation={[0, (deg * Math.PI) / 180, 0]} position={[0, BELL_Y + 0.2, 0]}>
            <mesh position={[R1 - 0.5, 4.5, 0]} rotation={[0, 0, 0]} material={MAT.white}>
              <coneGeometry args={[1.6, 9, 24, 1, false, -Math.PI / 2, Math.PI]} />
            </mesh>
          </group>
        ))}
        {/* five F-1 engines: centre + four at the corners */}
        <Bell rt={0.6} re={1.85} h={4.3} y={BELL_Y + 0.4} segments={32} />
        {[45, 135, 225, 315].map((deg) => (
          <Bell key={`e${deg}`} rt={0.6} re={1.85} h={4.3} y={BELL_Y + 0.4} x={3.4 * Math.cos((deg * Math.PI) / 180)} z={3.4 * Math.sin((deg * Math.PI) / 180)} segments={32} />
        ))}
        <UnitedStates r={R1} y={BELL_Y + 30} a={0} />
        <UnitedStates r={R1} y={BELL_Y + 30} a={Math.PI} />
      </group>
      <group name="s-ii">
        <object3D name="plume:s-ii" position={[0, sicTop, 0]} userData={{ radius: 3.6, engines: 'J-2' }} />
        <Tube r={R1} h={24.8} y={sicTop} material={MAT.white} segments={96} />
        {/* aft interstage stripes + forward skirt quadrants */}
        <Quadrants r={R1} y={sicTop} h={5.3} n={4} offset={Math.PI / 8} />
        <Quadrants r={R1} y={siiTop - 2.0} h={2.0} n={2} offset={Math.PI / 2} />
        <UnitedStates r={R1} y={sicTop + 10} a={Math.PI / 2} />
        <UnitedStates r={R1} y={sicTop + 10} a={-Math.PI / 2} />
      </group>
      <group name="s-ivb">
        <object3D name="plume:s-ivb" position={[0, siiTop + 2, 0]} userData={{ radius: 2.0, engines: 'J-2' }} />
        {/* tapered aft interstage 10.06 → 6.6 m with two black quadrants */}
        <Tube r={R1} rTop={R3} h={5.8} y={siiTop} material={MAT.white} segments={96} />
        {[0, 1].map((i) => (
          <mesh key={i} position={[0, siiTop + 2.9, 0]} material={MAT.black}>
            <cylinderGeometry args={[R3 + 0.03, R1 + 0.03, 5.8, 24, 1, true, i * Math.PI + Math.PI / 4, Math.PI / 2]} />
          </mesh>
        ))}
        <Tube r={R3} h={12} y={siiTop + 5.8} material={MAT.white} segments={64} />
        <UnitedStates r={R3} y={siiTop + 8.5} a={0} />
        {/* APS pods */}
        {[0, Math.PI].map((a, i) => (
          <group key={i} rotation={[0, a + Math.PI / 2, 0]} position={[0, siiTop + 7.2, 0]}>
            <mesh position={[R3 + 0.3, 0, 0]} material={MAT.offwhite}>
              <boxGeometry args={[0.7, 2.2, 1.4]} />
            </mesh>
          </group>
        ))}
        {/* instrument unit */}
        <Tube r={R3 + 0.01} h={0.9} y={sivbTop} material={MAT.dark} segments={64} />
      </group>
      <group name="apollo-sm">
        {/* SLA frustum + service module (bare metal) */}
        <Tube r={R3} rTop={1.95} h={8.5} y={sivbTop + 0.9} material={MAT.white} segments={64} />
        <Tube r={1.95} h={4.7} y={sivbTop + 9.4} material={MAT.silver} segments={48} />
      </group>
      <group name="apollo">
        {/* command module cone */}
        <Tube r={1.95} rTop={0.45} h={3.5} y={sivbTop + 14.1} material={MAT.silver} segments={48} />
        <mesh position={[0, sivbTop + 14.2, 0]} material={MAT.dark}>
          <cylinderGeometry args={[1.95, 1.9, 0.2, 48]} />
        </mesh>
      </group>
      <group name="fairing">
        {/* boost protective cover + LES tower + motor */}
        <Tube r={1.97} rTop={0.47} h={3.5} y={sivbTop + 14.1} material={MAT.offwhite} segments={48} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 0.5, sivbTop + 19.1, Math.sin((i / 4) * Math.PI * 2) * 0.5]} material={MAT.dark}>
            <cylinderGeometry args={[0.06, 0.06, 3.0, 8]} />
          </mesh>
        ))}
        <Tube r={0.33} h={4.3} y={sivbTop + 20.6} material={MAT.offwhite} segments={24} />
        <Ogive r={0.33} L={1.4} y={sivbTop + 24.9} material={MAT.dark} segments={24} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`n${i}`} position={[Math.cos((i / 4) * Math.PI * 2) * 0.5, sivbTop + 21.3, Math.sin((i / 4) * Math.PI * 2) * 0.5]} material={MAT.dark}>
            <coneGeometry args={[0.2, 0.5, 10]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
