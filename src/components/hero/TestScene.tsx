"use client";
import { useEffect, useState } from "react";
import React from "react";
import { Canvas} from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import Mascot from "@/components/hero/Mascot"
import Workspace from "@/components/hero/Workspace"
import BackgroundShader from "./Backgroundshader";
export default function Hero3D() {
const [reducedMotion, setReducedMotion] = useState(() =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
);
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  // Check if the screen is narrower than a standard tablet (768px)
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  
  handleResize(); // Check immediately on load
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
useEffect(() => {
  const mediaQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const handleChange = (event: MediaQueryListEvent) => {
    setReducedMotion(event.matches);
  };
console.log("reducedMotion:", reducedMotion);
  mediaQuery.addEventListener("change", handleChange);

  return () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}, []);
  return (
    <div className="w-full h-full">
    <Canvas 
  camera={{ position: [0, 0, 3.3] }} 
  dpr={[1, 2]} 
  eventSource={typeof window !== "undefined" ? document.body : undefined}
>     
       
        <ambientLight intensity={1} />
        <pointLight position={[0, 0, -5]} color="#a855f7" intensity={2} />
      
        <React.Suspense fallback={null}>
          <Environment preset="studio" />
    <BackgroundShader reducedMotion={reducedMotion} />
       <group 
  position={isMobile ? [0, -1.8, 0] : [2.5, 0, 0]} 
  rotation={isMobile ? [0, -0.2, 0] : [0, -0.5, 0]}
  scale={isMobile ? 0.5 : 1}
>    <Float
  floatIntensity={reducedMotion ? 0 : 1}
  rotationIntensity={reducedMotion ? 0 : 1}
  speed={reducedMotion ? 0 : 2}
>
          <group position={isMobile ?[0.2, 1.4, 0]: [0, 1.4, 0]} >
           <Mascot reducedMotion={reducedMotion} />
           </group>
           </Float>
          

<Float
  floatIntensity={reducedMotion ? 0 : 0}
  speed={reducedMotion ? 0 : 2}
>
         <group position={isMobile ? [-0.8, 1,1]:[0, -0.8,1]} rotation={isMobile ?[0, 1, 0]:[0, -0.2, 0]}>
            <Workspace />
            </group>
            </Float>
          </group>


        
        </React.Suspense>
      </Canvas>
    </div>
  );
}
