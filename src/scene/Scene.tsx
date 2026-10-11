import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

/**
 * Placeholder stage: a generic stainless-steel rocket standing in space with
 * Mars in the background. The real, dimensionally accurate vehicle models and
 * the mission camera rig replace this once the catalogue is in.
 */
function PlaceholderRocket() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* booster */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 4, 48]} />
        <meshStandardMaterial color="#cfd3d6" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* ship */}
      <mesh position={[0, 5.2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 2.4, 48]} />
        <meshStandardMaterial color="#d8dbde" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* nose */}
      <mesh position={[0, 7.1, 0]}>
        <coneGeometry args={[0.45, 1.4, 48]} />
        <meshStandardMaterial color="#d8dbde" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* engines */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.22, -0.15, Math.sin(a) * 0.22]}>
            <coneGeometry args={[0.12, 0.35, 24, 1, true]} />
            <meshStandardMaterial color="#6b6f73" metalness={0.8} roughness={0.5} side={2} />
          </mesh>
        )
      })}
    </group>
  )
}

function Mars() {
  return (
    <mesh position={[9, 2, -14]}>
      <sphereGeometry args={[4, 64, 64]} />
      <meshStandardMaterial color="#b9502f" roughness={0.95} metalness={0} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [7, 3, 9], fov: 40 }} dpr={[1, 2]}>
      <color attach="background" args={['#02040a']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 8, 6]} intensity={2.2} color="#fff4e6" />
      <Stars radius={120} depth={60} count={6000} factor={3} saturation={0} fade speed={0.3} />
      <PlaceholderRocket />
      <Mars />
      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.6} minDistance={4} maxDistance={40} />
    </Canvas>
  )
}
