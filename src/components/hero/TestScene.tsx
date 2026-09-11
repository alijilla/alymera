"use client";

import React from "react";
import { Canvas} from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import Mascot from "@/components/hero/Mascot"
import Workspace from "@/components/hero/Workspace"
export default function Hero3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3] }} dpr={[1, 2]}>
        {/* Pure white background for the glass to refract */}
       
        <ambientLight intensity={1} />
        <pointLight position={[0, 0, -5]} color="#a855f7" intensity={2} />
      
        <React.Suspense fallback={null}>
          <Environment preset="studio" />
           <Float
             floatIntensity={1}
            floatingRange={[
                undefined,
                0.5
            ]}
            rotationIntensity={1}
            speed={2}
           >
          <group position={[0, 1.7, -1]} >
            <Mascot />
           </group>
           </Float>

            <Float
           floatIntensity={0}
            floatingRange={[
                undefined,
                0.5
            ]}
           
            speed={2}
            >
                        <group position={[0, -0.4,1]} rotation={[0, -0.2, 0]}>
            <Workspace />
            </group>
            </Float>

            
        </React.Suspense>
      </Canvas>
    </div>
  );
}
