"use client"
import { useRouter } from "next/navigation"

import dynamic from "next/dynamic"
const Scene = dynamic(
  () => import("@/components/hero/TestScene"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-2xl bg-primary/10 animate-pulse" />
    ),
  }
)
export default function LandingPage() {
  

 const router = useRouter()

 function getStarted(){
  router.push("/login")

 }
  return (
<main className="min-h-screen bg-background m-auto px-4">
  <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-10 px-6 py-16 md:flex-row md:justify-between">
    
    <div className="max-w-2xl text-center md:text-left">
      <div className="text-5xl font-black tracking-tight md:text-7xl">
        ALY
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">
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

      <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
        <button
          onClick={getStarted}
          className="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          Get Started
        </button>

        <button className="rounded-xl border border-border px-6 py-3 font-medium transition hover:bg-muted">
          Explore ALYMERA
        </button>
      </div>
    </div>

    <div className="relative h-[420px] w-[420px] md:h-[520px] md:w-[520px]">
      <Scene />
    </div>

  </section>
</main>
  );
}