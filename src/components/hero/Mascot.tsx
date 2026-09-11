"use client"
import { useRef } from "react";
import { useFrame, useThree  } from "@react-three/fiber";
import * as THREE from "three"
import {useState} from "react"
export default function Mascot() {

const mascotRef = useRef<THREE.Group>(null)
const materialRef = useRef<THREE.MeshStandardMaterial>(null)
const color = useRef(new THREE.Color("purple"))
const [hovered, setHovered] = useState(false)
useFrame((state) => {
  if (!mascotRef.current || !materialRef.current) return

  // 1. Follow the pointer
  const targetY = state.pointer.x * 0.4
  const targetX = -state.pointer.y * 0.2

  mascotRef.current.rotation.y = THREE.MathUtils.lerp(
    mascotRef.current.rotation.y,
    targetY,
    0.1
  )

  mascotRef.current.rotation.x = THREE.MathUtils.lerp(
    mascotRef.current.rotation.x,
    targetX,
    0.1
  )

  // 2. Smooth hover scale
  const targetScale = hovered ? 1.08 : 1

  mascotRef.current.scale.x = THREE.MathUtils.lerp(
    mascotRef.current.scale.x,
    targetScale,
    0.08
  )

  mascotRef.current.scale.y = THREE.MathUtils.lerp(
    mascotRef.current.scale.y,
    targetScale,
    0.08
  )

  mascotRef.current.scale.z = THREE.MathUtils.lerp(
    mascotRef.current.scale.z,
    targetScale,
    0.08
  )

  // 3. Smooth hover color
  const targetColor = new THREE.Color(
    hovered ? "#d805c6" : "#9333ea"
  )

  color.current.lerp(targetColor, 0.05)

  materialRef.current.color.copy(color.current)
})
  return (

    <group ref={mascotRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}>
    <mesh>
      <sphereGeometry args={[0.6, 64, 64]} />
      <meshStandardMaterial ref={materialRef} color="purple" />
    </mesh>
        <mesh position={ [0.3, 0, 0.4]}>
      <sphereGeometry args={[0.3, 64, 64]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={ [-0.3, 0, 0.4]}>
      <sphereGeometry args={[0.3, 64, 64]} />
      <meshStandardMaterial color="white" />
    </mesh>
    
    <mesh position={ [0.3, 0, 0.53]}>
      <sphereGeometry args={[0.2, 64, 64]} />
      <meshStandardMaterial color="black" />
    </mesh>
    <mesh position={ [-0.3, 0, 0.53]}>
      <sphereGeometry args={[0.2, 64, 64]} />
      <meshStandardMaterial color="black" />
    </mesh>

    <mesh position={ [0.4, 0, 0.6]}>
      <sphereGeometry args={[0.1, 64, 64]} />
      <meshStandardMaterial color="white" />
    </mesh>
    <mesh position={ [-0.4, 0, 0.6]}>
      <sphereGeometry args={[0.1, 64, 64]} />
      <meshStandardMaterial color="white" />
    </mesh>
    </group>
    
  );
}
