"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { Sparkles } from "lucide-react"

// ======================================================
// Types
// ======================================================

export type DBProject = {
  id: string
  name: string
  description: string | null
  status: string
  due_date: string | null
  created_at: string
}

export type DBTask = {
  id: string
  project_id: string
  name: string
  status: string
  due_date: string | null
  created_at: string
}

export type DBApplication = {
  id: string
  position: string
  company: string | null
  status: string
  date_applied: string | null
  created_at: string
}

export type ActivityItem = {
  id: string
  type: "project" | "task" | "application"
  title: string
  description: string
  date: Date
}


const DashboardContent = dynamic(() => import("./dashboard-content"), {
  ssr: false,
})

// ======================================================
// Helpers
// ======================================================

export function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there"
}

function formatDate(date: string | null) {
  if (!date) return "No date"

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "No date"
  }

  return parsed.toLocaleDateString()
}

function formatDateTime(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return "Unknown date"
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

// ======================================================
// Dashboard
// ======================================================

export default function DashboardPage() {
  const [projects, setProjects] = useState<DBProject[]>([])
  const [tasks, setTasks] = useState<DBTask[]>([])
  const [applications, setApplications] = useState<DBApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState("")
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // ====================================================
  // Load dashboard data
  // ====================================================

  useEffect(() => {
    let cancelled = false
    let channel: any = null
    let supabaseClient: any = null

    async function init() {
      const { supabase } = await import("@/lib/supabase/client")
      supabaseClient = supabase

      async function loadDashboard() {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          if (!cancelled) setLoading(false)
          return
        }

        if (!user) {
          if (!cancelled) setLoading(false)
          return
        }

        // Parallelize independent fetches
        const [profileRes, projectsRes, applicationsRes] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
          supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
          supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        ])

        if (profileRes.error) console.error("Profile fetch error:", profileRes.error)
        if (projectsRes.error) console.error("Projects fetch error:", projectsRes.error)
        if (applicationsRes.error) console.error("Applications fetch error:", applicationsRes.error)

        const userProjects = projectsRes.data ?? []

        // Tasks (depends on projects)
        let userTasks: DBTask[] = []

        if (userProjects.length > 0) {
          const projectIds = userProjects.map((project) => project.id)

          const {
            data: tasksData,
            error: tasksError,
          } = await supabase
            .from("tasks")
            .select("*")
            .in("project_id", projectIds)
            .order("created_at", { ascending: false })

          if (tasksError) {
            console.error("Tasks fetch error:", tasksError)
          }

          userTasks = tasksData ?? []
        }

        if (cancelled) return

        setFullname(profileRes.data?.full_name ?? "")
        setProjects(userProjects)
        setTasks(userTasks)
        setApplications(applicationsRes.data ?? [])
        setLoading(false)
      }

      await loadDashboard()

      // ==================================================
      // Realtime dashboard updates
      // ==================================================

      channel = supabase
        .channel("dashboard-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tasks",
          },
          () => {
            void loadDashboard()
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "projects",
          },
          () => {
            void loadDashboard()
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "applications",
          },
          () => {
            void loadDashboard()
          }
        )
        .subscribe()
    }

    init()

    return () => {
      cancelled = true
      if (channel && supabaseClient) {
        supabaseClient.removeChannel(channel)
      }
    }
  }, [])

  // ====================================================
  // Task completion
  // ====================================================

  async function handleTaskComplete(
    taskId: string,
    checked: boolean
  ) {
    if (!checked || updatingTaskId) return

    setUpdatingTaskId(taskId)

    const { supabase } = await import("@/lib/supabase/client")
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "Done",
      })
      .eq("id", taskId)

    if (error) {
      console.error("Task update error:", error)
      setUpdatingTaskId(null)
      return
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "Done",
            }
          : task
      )
    )

    setUpdatingTaskId(null)
  }

  // ====================================================
  // Greeting
  // ====================================================

  const hour = new Date().getHours()

  let greeting = "Good evening"

  if (hour < 12) {
    greeting = "Good morning"
  } else if (hour < 18) {
    greeting = "Good afternoon"
  }

  // ====================================================
  // Render
  // ====================================================

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-3 sm:space-y-7 sm:p-5 md:p-6 lg:space-y-8 lg:p-8">
      {/* ==================================================
          GREETING
      ================================================== */}

      <Card className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              {greeting},{" "}
              {loading && !fullname ? (
                <span className="inline-block w-32 h-8 animate-pulse rounded-md bg-muted/60 align-middle"></span>
              ) : (
                <span className="text-primary">
                  {getFirstName(fullname)}
                </span>
              )}
              .
            </CardTitle>

            <CardDescription className="mt-2 text-sm font-medium leading-6 sm:text-base">
              Here&apos;s your workspace overview.
            </CardDescription>
          </div>

          <Button
            className="w-full rounded-xl bg-primary px-6 py-5 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 sm:w-auto"
            asChild
          >
            <Link href="/aly">
              <Sparkles className="mr-2 h-5 w-5" />
              Ask Alymera
            </Link>
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-muted/50"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
            <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-72 animate-pulse rounded-2xl bg-muted/50" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
            <div className="h-80 animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-80 animate-pulse rounded-2xl bg-muted/50" />
          </div>
        </div>
      ) : (
        <DashboardContent
          projects={projects}
          tasks={tasks}
          applications={applications}
          updatingTaskId={updatingTaskId}
          handleTaskComplete={handleTaskComplete}
        />
      )}
    </main>
  )
}

// ======================================================
// Empty State
// ======================================================

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/40 px-4 py-8 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        {text}
      </p>
    </div>
  )
}