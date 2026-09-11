import React from 'react';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';



// This grabs the [0 to 1] coordinates of the plane and passes them to the Fragment shader.
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;


const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse; // <--- 1. Receive the mouse!
  varying vec2 vUv;
  
  void main() {
   //gets the exact pixel on the screen so that the aurora perfectly fits any monitor size
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 colorBottom = vec3(0.05, 0.0, 0.15); 
    vec3 colorTop = vec3(0.6, 0.2, 0.9);      

   
    // sin() creates a wave u_time animates it and u_mouse let moving the mouse left and right will physically push the waves with cursor moves.
    float wave = sin((st.x * 5.0) + (u_time * 0.5) + (u_mouse.x * 3.0)) * 0.3;
    
    //Blends the 2 colors vertically and adds the sine wave to bend and distort the gradient into aurora
    vec3 finalColor = mix(colorBottom, colorTop, st.y + wave);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
// 1. Accept the prop
export default function BackgroundShader({ reducedMotion }: { reducedMotion: boolean }) {
  const { size } = useThree(); 
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state) => {
    if (materialRef.current) {
      
      // 2. Only advance time if reducedMotion is false!
      if (!reducedMotion) {
        materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
      }
      
      materialRef.current.uniforms.u_resolution.value.set(state.size.width, state.size.height);
      materialRef.current.uniforms.u_mouse.value.set(state.pointer.x, state.pointer.y);
    }
  });

  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[100, 100]} />
      <shaderMaterial 
        ref={materialRef}
        // ADD IT TO THE STARTING UNIFORMS
        uniforms={{ 
          u_time: { value: 0.0 },
          u_resolution: { value: new THREE.Vector2(size.width, size.height) },
         // NEW: Starting mouse position
          u_mouse: { value: new THREE.Vector2(0, 0) } 

       
       
        }}
        
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader} 
      />
    </mesh>
  );
}