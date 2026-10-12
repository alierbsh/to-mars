/**
 * Long March 10 + Mengzhou — 92.5 m. Three 5 m kerolox cores with seven YF-100K each,
 * a YF-100M second stage, hydrolox third stage, Mengzhou capsule with escape tower.
 * CASC livery: white, blue bands and lettering, national flag.
 */
import { Bell, Decal, FlagPRC, Ogive, Tube, MAT } from '../parts'

const R = 2.5
const CORE_X = 5.35
const BELL_Y = 1.6
const S1 = 55
const BOOSTER = 50

function Engines7({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <Bell rt={0.28} re={0.62} h={1.7} y={BELL_Y + 0.3} />
      {Array.from({ length: 6 }, (_, i) => (
        <Bell key={i} rt={0.28} re={0.62} h={1.7} y={BELL_Y + 0.3} x={1.6 * Math.cos((i / 6) * Math.PI * 2)} z={1.6 * Math.sin((i / 6) * Math.PI * 2)} segments={20} />
      ))}
    </group>
  )
}

function Booster({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <Tube r={R} h={BOOSTER} y={BELL_Y} material={MAT.white} segments={56} />
      <Tube r={R + 0.01} h={1.4} y={BELL_Y + BOOSTER - 4} material={MAT.cascBlue} segments={56} />
      <Tube r={R + 0.01} h={1.6} y={BELL_Y} material={MAT.dark} segments={56} />
      <Ogive r={R} L={6.5} y={BELL_Y + BOOSTER} material={MAT.white} segments={56} />
      <FlagPRC r={R} a={x > 0 ? 0 : Math.PI} y={BELL_Y + 30} w={1.8} />
      <Decal text="CZ-10" r={R} a={x > 0 ? 0 : Math.PI} y={BELL_Y + 24} w={4.5} h={1.4} color="#1e4ea1" font="bold 170px Helvetica, Arial, sans-serif" rotate={Math.PI / 2} />
    </group>
  )
}

export default function LongMarch10Model() {
  const s2y = BELL_Y + S1
  const s3y = s2y + 11
  const scy = s3y + 10
  return (
    <group>
      <group name="lm10-booster">
        <object3D name="plume:lm10-booster" position={[-CORE_X, BELL_Y + 0.3, 0]} userData={{ radius: 2.3, engines: 'YF-100K' }} />
        <object3D name="plume:lm10-booster" position={[CORE_X, BELL_Y + 0.3, 0]} userData={{ radius: 2.3, engines: 'YF-100K' }} />
        <Booster x={-CORE_X} />
        <Booster x={CORE_X} />
        <Engines7 x={-CORE_X} />
        <Engines7 x={CORE_X} />
        {[-1, 1].map((sgn) =>
          [BELL_Y + 3, BELL_Y + BOOSTER - 3].map((yy) => (
            <mesh key={`${sgn}${yy}`} position={[sgn * CORE_X * 0.5, yy, 0]} material={MAT.dark}>
              <boxGeometry args={[CORE_X - 2 * R + 0.6, 0.45, 0.5]} />
            </mesh>
          )),
        )}
      </group>
      <group name="lm10-core">
        <object3D name="plume:lm10-core" position={[0, BELL_Y + 0.3, 0]} userData={{ radius: 2.3, engines: 'YF-100K' }} />
        <Tube r={R} h={S1} y={BELL_Y} material={MAT.white} segments={56} />
        <Tube r={R + 0.01} h={1.6} y={BELL_Y} material={MAT.dark} segments={56} />
        <Tube r={R + 0.01} h={1.4} y={BELL_Y + S1 - 3} material={MAT.cascBlue} segments={56} />
        <Engines7 x={0} />
        <FlagPRC r={R} a={Math.PI / 2} y={BELL_Y + 40} w={1.8} />
        <Decal text="CZ-10" r={R} a={Math.PI / 2} y={BELL_Y + 33} w={5} h={1.6} color="#1e4ea1" font="bold 170px Helvetica, Arial, sans-serif" rotate={Math.PI / 2} />
      </group>
      <group name="lm10-s2">
        <object3D name="plume:lm10-s2" position={[0, s2y, 0]} userData={{ radius: 2.0, engines: 'YF-100M' }} />
        <Tube r={R} h={11} y={s2y} material={MAT.white} segments={56} />
        <Tube r={R + 0.01} h={0.6} y={s2y} material={MAT.cascBlue} segments={56} />
      </group>
      <group name="lm10-s3">
        <object3D name="plume:lm10-s3" position={[0, s3y, 0]} userData={{ radius: 1.5, engines: 'YF-75E' }} />
        <Tube r={R} h={10} y={s3y} material={MAT.white} segments={56} />
        <Tube r={R + 0.01} h={0.6} y={s3y} material={MAT.cascBlue} segments={56} />
      </group>
      {/* Mengzhou: service module, return capsule, escape tower */}
      <group name="mengzhou-sm">
        <Tube r={R} rTop={2.25} h={1.2} y={scy} material={MAT.offwhite} segments={48} />
        <Tube r={2.25} h={4.2} y={scy + 1.2} material={MAT.white} segments={48} />
      </group>
      <group name="mengzhou">
        <Tube r={2.25} rTop={0.9} h={3.6} y={scy + 5.4} material={MAT.white} segments={48} />
        <mesh position={[0, scy + 5.45, 0]} material={MAT.dark}>
          <cylinderGeometry args={[2.25, 2.2, 0.2, 48]} />
        </mesh>
        <Tube r={0.9} h={0.6} y={scy + 9} material={MAT.offwhite} segments={32} />
      </group>
      <group name="fairing">
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 0.5, scy + 10.6, Math.sin((i / 4) * Math.PI * 2) * 0.5]} material={MAT.dark}>
            <cylinderGeometry args={[0.06, 0.06, 2.0, 8]} />
          </mesh>
        ))}
        <Tube r={0.42} h={4.6} y={scy + 11.6} material={MAT.white} segments={32} />
        <Ogive r={0.42} L={1.1} y={scy + 16.2} material={MAT.dark} segments={32} />
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`n${i}`} position={[Math.cos((i / 4) * Math.PI * 2 + 0.4) * 0.6, scy + 12.4, Math.sin((i / 4) * Math.PI * 2 + 0.4) * 0.6]} material={MAT.dark}>
            <coneGeometry args={[0.25, 0.55, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
