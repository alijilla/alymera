"use client"

import React, { useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Float } from "@react-three/drei"

import Mascot from "@/components/hero/Mascot"
import Workspace from "@/components/hero/Workspace"
import BackgroundShader from "./Backgroundshader"

export default function Hero3D() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: isMobile
            ? [0, 0, 4.5]
            : [0, 0, 3.3],
        }}
        dpr={[1, 2]}
        eventSource={
          typeof window !== "undefined"
            ? document.body
            : undefined
        }
      >
        {/* Lighting */}
        <ambientLight intensity={1} />

        <pointLight
          position={[0, 0, -5]}
          color="#a855f7"
          intensity={2}
        />

        <React.Suspense fallback={null}>
          {/* Environment */}
          <Environment preset="studio" />

          {/* Shader Background */}
          <BackgroundShader
            reducedMotion={reducedMotion}
          />

          {/* Hero 3D Composition */}
          <group
            position={
              isMobile
                ? [0, -2, 0]
                : [2.5, 0, 0]
            }
            rotation={
              isMobile
                ? [0, -0.2, 0]
                : [0, -0.5, 0]
            }
            scale={
              isMobile
                ? 0.4
                : 1
            }
          >
            {/* Mascot */}
            <Float
              floatIntensity={
                reducedMotion ? 0 : 1
              }
              rotationIntensity={
                reducedMotion ? 0 : 1
              }
              speed={
                reducedMotion ? 0 : 2
              }
            >
              <group
                position={
                  isMobile
                    ? [0.2, 1.4, 0]
                    : [0, 1.4, 0]
                }
              >
                <Mascot
                  reducedMotion={reducedMotion}
                />
              </group>
            </Float>

            {/* Workspace */}
            <Float
              floatIntensity={1}
              rotationIntensity={0}
              speed={
                reducedMotion ? 0 : 2
              }
            >
              <group
                position={
                  isMobile
                    ? [-0.8, 1.2, 1]
                    : [0, -0.8, 1]
                }
                rotation={
                  isMobile
                    ? [0, 1, 0]
                    : [0, -0.2, 0]
                }
              >
                <Workspace />
              </group>
            </Float>
          </group>
        </React.Suspense>
      </Canvas>
    </div>
  )
}