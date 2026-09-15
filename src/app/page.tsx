"use client"

import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowRight, Sparkles } from "lucide-react"

const Scene = dynamic(
  () => import("@/components/hero/TestScene"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-transparent" />
    ),
  }
)

export default function LandingPage() {
  const router = useRouter()

  const getStarted = () => {
    router.push("/login")
  }

  const tryAlymera = () => {
    router.push("/aly-demo")
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 3D background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-full"
      >
        <Scene />
      </div>

      {/* Very subtle readability layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-r from-background/65 via-background/20 to-transparent"
      />

      {/* Header */}
      <header className="relative z-20 flex w-full items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Go to ALYMERA home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <span className="text-lg font-black tracking-[0.18em] sm:text-xl">
            ALY
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
              MERA
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={tryAlymera}
          className="hidden rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:bg-background/70 sm:inline-flex"
        >
          Try Alymera AI
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-7xl items-start px-5 pb-10 pt-10 sm:px-8 sm:pt-16 md:items-center md:px-12 md:pt-0 lg:px-16">
        <div className="w-full max-w-2xl">
          {/* Product label */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-md sm:mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered career workspace
          </div>

          {/* Brand */}
          <h1 className="text-5xl font-black tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            ALY
            <span className="bg-gradient-to-r from-primary via-primary to-orange-400 bg-clip-text text-transparent">
              MERA
            </span>
          </h1>

          {/* Tagline */}
          <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Build.
            <span className="text-primary"> Apply.</span>
            <br />
            Become.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-xl text-base leading-7  text-foreground/70 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
            One AI-powered workspace to build projects, manage job
            applications, and grow your career — all in one place.
          </p>

          {/* Actions */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={getStarted}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:w-auto"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={tryAlymera}
              className="inline-flex w-full items-center justify-center rounded-xl border border-border/60 bg-background/50 px-7 py-3.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:border-primary/30 hover:bg-background/70 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:w-auto"
            >
              Explore Alymera AI
            </button>
          </div>

          {/* Supporting text */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground sm:mt-7">
            <span>Projects</span>
            <span aria-hidden="true">•</span>
            <span>Career</span>
            <span aria-hidden="true">•</span>
            <span>AI Assistance</span>
          </div>
        </div>
      </section>
    </main>
  )
}