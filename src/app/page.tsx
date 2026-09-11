"use client"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

const Scene = dynamic(
  () => import("@/components/hero/TestScene"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-primary/10" />
    ),
  }
)

export default function LandingPage() {
  const router = useRouter()

  function getStarted() {
    router.push("/login")
  }

  return (
    <main className="  relative flex  flex-col min-h-screen md:items-center md:justify-center  p-6 md:p-12 lg:p-24">

      {/* 3D background */}
<div className=" fixed inset-0 -z-10 h-full w-full">
  <Scene />
</div>

      {/* Hero content */}
      <section className="relative z-10 mx-auto w-full max-w-7xl">
        <div className=" max-w-2xl text-center md:text-left">

          <div className="text-5xl font-black tracking-tight md:text-7xl">
            ALY
            <span className="bg-gradient-to-r from-purple-800 to-orange-400 bg-clip-text text-transparent">
              MERA
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Build. Apply. Become.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            An AI-powered workspace for developers and graduating students to
            build projects, manage applications, and grow their careers.
          </p>

          <div className="mt-8">
            <button
              onClick={getStarted}
              className=" rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>

        </div>
      </section>
    </main>
  )
}