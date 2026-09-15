"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarCheck,
  Send,
  XCircle,
  Sparkles,
} from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

type Application = {
  id: string
  position: string
  company: string | null
  status: string
  date_applied: string | null
  created_at: string
}

function formatDate(date?: string | null) {
  if (!date) return "Date unknown"

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "Date unknown"
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getStatusClass(status: string) {
  switch (status) {
    case "Interview":
      return "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"

    case "Offer":
      return "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"

    case "Rejected":
      return "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"

    case "Ghosted":
      return "border-muted-foreground/20 bg-muted text-muted-foreground"

    case "Applied":
      return "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"

    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

export default function CareerOverview() {

 const [loading, setLoading] = useState(true)
const [applications, setApplications] = useState<Application[]>([])

useEffect(() => {
  let cancelled = false

  const loadApplications = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (cancelled) return

    if (authError) {
      console.error("Auth error:", authError)
      setLoading(false)
      return
    }

    if (!user) {
      setApplications([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (cancelled) return

    if (error) {
      console.error("Applications fetch error:", error)
      setApplications([])
      setLoading(false)
      return
    }

    setApplications((data ?? []) as Application[])
    setLoading(false)
  }

  loadApplications()

  const channel = supabase
    .channel("career-overview-applications")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "applications",
      },
      async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user || cancelled) return

        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error || cancelled) return

        setApplications((data ?? []) as Application[])
      }
    )
    .subscribe()

  return () => {
    cancelled = true
    supabase.removeChannel(channel)
  }
}, [])
  const stats = useMemo(() => {
    const total = applications.length

    const interviews = applications.filter(
      (application) => application.status === "Interview"
    ).length

    const offers = applications.filter(
      (application) => application.status === "Offer"
    ).length

    const rejected = applications.filter(
      (application) =>
        application.status === "Rejected" ||
        application.status === "Ghosted"
    ).length

    return [
      {
        label: "Applications",
        value: total,
        icon: Send,
        iconClass: "text-blue-500",
      },
      {
        label: "Interviews",
        value: interviews,
        icon: CalendarCheck,
        iconClass: "text-orange-500",
      },
      {
        label: "Offers",
        value: offers,
        icon: BadgeCheck,
        iconClass: "text-green-500",
      },
      {
        label: "Rejected / Ghosted",
        value: rejected,
        icon: XCircle,
        iconClass: "text-muted-foreground",
      },
    ]
  }, [applications])

  const recentApplications = applications.slice(0, 4)

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* HERO */}
        <Card className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm">
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <BriefcaseBusiness className="h-6 w-6 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                      Career Hub
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                      Your career snapshot and recent job search activity.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                asChild
                className="w-full rounded-xl sm:w-auto"
              >
                <Link href="/career/applications">
                  View Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <section
          aria-label="Career statistics"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
        >
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <Card
                key={stat.label}
                className="rounded-2xl border border-border/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 p-4 pb-2 sm:p-5 sm:pb-2">
                  <CardTitle className="min-w-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                    {stat.label}
                  </CardTitle>

                  <div className="shrink-0 rounded-xl bg-muted/60 p-2">
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconClass}`} />
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-1 sm:p-5 sm:pt-1">
                  {loading ? (
                    <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
                  ) : (
                    <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {stat.value}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </section>

        {/* MAIN CONTENT */}
        <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">

          {/* RECENT APPLICATIONS */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="p-5 pb-4 sm:p-6 sm:pb-4">
              <CardTitle className="text-lg font-bold tracking-tight sm:text-xl">
                Recent Applications
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                Your latest job applications.
              </p>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 px-4 sm:px-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-[82px] animate-pulse rounded-xl bg-muted/40"
                    />
                  ))}
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/10 px-5 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Send className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <h3 className="font-semibold">
                    No applications yet
                  </h3>

                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Start tracking your job applications to see your
                    career activity here.
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    className="mt-5"
                  >
                    <Link href="/career/applications">
                      Add Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {application.position}
                      </h3>

                      <p className="truncate text-sm font-medium text-muted-foreground">
                        {application.company || "Unknown Company"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied ·{" "}
                        {formatDate(application.date_applied)}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>

            <CardFooter className="mt-4 border-t border-border/50 bg-muted/10 px-5 py-4 sm:px-6">
              <Link
                href="/career/applications"
                className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                View all applications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>

          {/* NEXT STEPS */}
          <Card className="min-w-0 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm">
            <CardHeader className="p-5 pb-4 sm:p-6 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                AI-powered career guidance.
              </p>
            </CardHeader>

            <CardContent className="flex min-h-[260px] flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-bold sm:text-xl">
                Keep the momentum going
              </h3>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Let Alymera analyze your resume, compare it with job
                descriptions, and help you prepare for interviews.
              </p>

              <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-2 text-left sm:grid-cols-3">
                <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                  <p className="text-xs font-semibold">
                    Resume
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Improve your profile
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                  <p className="text-xs font-semibold">
                    Job Match
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Compare opportunities
                  </p>
                </div>

                <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                  <p className="text-xs font-semibold">
                    Interview
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prepare with AI
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-primary/10 bg-primary/5 px-5 py-4 sm:px-6">
              <Link
                href="/career/assistant"
                className="flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Talk to Career Assistant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  )
}