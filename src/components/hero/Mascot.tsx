"use client"
import { useRef } from "react";
import { useFrame, useThree  } from "@react-three/fiber";
import * as THREE from "three"
import {useState} from "react"
export default function Mascot() {

  const mascotRef = useRef<THREE.Group>(null);
const { pointer } = useThree()
const [hovered, setHovered] = useState(false)
  const color = useRef(new THREE.Color("purple"))
  useFrame((state) => {
  if (!mascotRef.current) return;

  const targetY = state.pointer.x; // turning left/right
const targetX = -state.pointer.y; // looking up/down
 
  mascotRef.current.rotation.y =THREE.MathUtils.lerp(mascotRef.current.rotation.y, targetY, 0.1);
  mascotRef.current.rotation.x = THREE.MathUtils.lerp(mascotRef.current.rotation.x, targetX, 0.1);
});


const materialRef = useRef<THREE.MeshStandardMaterial>(null)

useFrame(() => {
  if (!materialRef.current) return

  const targetColor = new THREE.Color(hovered ? "red" : "purple")

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
