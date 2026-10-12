/**
 * New Glenn — 98 m, 7 m diameter. GS1 with seven BE-4s, two fixed strakes, four forward fins
 * and six landing legs; hydrolox GS2; 7 m composite fairing. White with the blue feather.
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { Bell, Decal, Fin, Ogive, Tube, MAT } from '../parts'

const R = 3.5
const BELL_Y = 1.6
const GS1 = 55
const GS2 = 20
const FAIRING_CYL = 10
const FAIRING_NOSE = 11.4

function Feather({ y, a }: { y: number; a: number }) {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 512
    const ctx = c.getContext('2d')!
    ctx.strokeStyle = '#1546c2'
    ctx.lineWidth = 26
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(60, 470)
    ctx.quadraticCurveTo(70, 200, 200, 40)
    ctx.stroke()
    ctx.lineWidth = 18
    for (let i = 0; i < 6; i++) {
      const t = 0.25 + i * 0.12
      const x = 60 + (200 - 60) * t * t
      const yy = 470 - (470 - 40) * t
      ctx.beginPath()
      ctx.moveTo(x, yy)
      ctx.quadraticCurveTo(x + 50, yy - 10, x + 70, yy - 70)
      ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <group rotation={[0, a, 0]} position={[0, y, 0]}>
      <mesh position={[R + 0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 8]} />
        <meshStandardMaterial map={tex} transparent roughness={0.7} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
    </group>
  )
}

export default function NewGlennModel() {
  const strake: Array<[number, number]> = [
    [0, 0],
    [1.6, 0.4],
    [1.3, 7],
    [0, 9],
  ]
  const fin: Array<[number, number]> = [
    [0, 0],
    [2.2, 0.3],
    [1.9, 4.5],
    [0, 6.5],
  ]
  const leg: Array<[number, number]> = [
    [0, 0],
    [0.7, 0],
    [0.4, 9],
    [0, 9.5],
  ]
  return (
    <group>
      <group name="gs1">
        <Tube r={R} h={GS1} y={BELL_Y} material={MAT.white} segments={80} />
        <Tube r={R + 0.01} h={2.2} y={BELL_Y} material={MAT.dark} segments={80} />
        {/* seven BE-4 */}
        <Bell rt={0.45} re={0.95} h={2.4} y={BELL_Y + 0.4} />
        {Array.from({ length: 6 }, (_, i) => (
          <Bell key={i} rt={0.45} re={0.95} h={2.4} y={BELL_Y + 0.4} x={2.3 * Math.cos((i / 6) * Math.PI * 2)} z={2.3 * Math.sin((i / 6) * Math.PI * 2)} segments={24} />
        ))}
        {/* two fixed strakes, six legs, four forward fins */}
        {[Math.PI / 2, -Math.PI / 2].map((a, i) => (
          <Fin key={`s${i}`} outline={strake} thickness={0.6} r={R - 0.2} a={a} y={BELL_Y + 1.5} material={MAT.white} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <Fin key={`l${i}`} outline={leg} thickness={0.7} r={R - 0.3} a={(i / 6) * Math.PI * 2 + Math.PI / 6} y={BELL_Y + 2.2} material={MAT.offwhite} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <Fin key={`f${i}`} outline={fin} thickness={0.45} r={R - 0.2} a={(i / 4) * Math.PI * 2 + Math.PI / 4} y={BELL_Y + GS1 - 7.5} material={MAT.white} />
        ))}
        <Feather y={BELL_Y + 36} a={0} />
        <Decal text="NEW GLENN" r={R} a={Math.PI} y={BELL_Y + 30} w={12} h={1.6} color="#1546c2" font="bold 150px Helvetica, Arial, sans-serif" rotate={Math.PI / 2} />
        <Decal text="BLUE ORIGIN" r={R} a={0} y={BELL_Y + 20} w={8} h={1.2} color="#1546c2" font="bold 150px Helvetica, Arial, sans-serif" rotate={Math.PI / 2} />
      </group>
      <group name="gs2">
        <Tube r={R} h={GS2} y={BELL_Y + GS1} material={MAT.white} segments={80} />
        <Tube r={R + 0.01} h={0.3} y={BELL_Y + GS1} material={MAT.blue} segments={80} />
        {[0, 1].map((i) => (
          <Bell key={i} rt={0.35} re={1.1} h={2.6} y={BELL_Y + GS1 + 0.3} x={1.4 * (i ? 1 : -1)} segments={24} />
        ))}
      </group>
      <group name="fairing">
        <Tube r={R} h={FAIRING_CYL} y={BELL_Y + GS1 + GS2} material={MAT.white} segments={80} />
        <Ogive r={R} L={FAIRING_NOSE} y={BELL_Y + GS1 + GS2 + FAIRING_CYL} material={MAT.white} segments={80} />
        <Feather y={BELL_Y + GS1 + GS2 + 5} a={0} />
      </group>
    </group>
  )
}
