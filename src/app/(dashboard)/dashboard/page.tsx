"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  Sparkles,
  Calendar,
  FolderKanban,
  Send,
  ArrowRight,
  CalendarCheck,
  BadgeCheck,
  XCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo,
} from "lucide-react"

// ======================================================
// Types
// ======================================================

type DBProject = {
  id: string
  name: string
  description: string | null
  status: string
  due_date: string | null
  created_at: string
}

type DBTask = {
  id: string
  project_id: string
  name: string
  status: string
  due_date: string | null
  created_at: string
}

type DBApplication = {
  id: string
  position: string
  company: string | null
  status: string
  date_applied: string | null
  created_at: string
}

type ActivityItem = {
  id: string
  type: "project" | "task" | "application"
  title: string
  description: string
  date: Date
}

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

    async function loadDashboard() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)

        if (!cancelled) {
          setLoading(false)
        }

        return
      }

      if (!user) {
        if (!cancelled) {
          setLoading(false)
        }

        return
      }

      // ----------------------------------------------
      // Profile
      // ----------------------------------------------

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
      }

      // ----------------------------------------------
      // Projects
      // ----------------------------------------------

      const {
        data: projectsData,
        error: projectsError,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (projectsError) {
        console.error("Projects fetch error:", projectsError)
      }

      const userProjects = projectsData ?? []

      // ----------------------------------------------
      // Tasks
      // ----------------------------------------------

      let userTasks: DBTask[] = []

      if (userProjects.length > 0) {
        const projectIds = userProjects.map(
          (project) => project.id
        )

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

      // ----------------------------------------------
      // Applications
      // ----------------------------------------------

      const {
        data: applicationsData,
        error: applicationsError,
      } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (applicationsError) {
        console.error(
          "Applications fetch error:",
          applicationsError
        )
      }

      if (cancelled) return

      setFullname(profileData?.full_name ?? "")
      setProjects(userProjects)
      setTasks(userTasks)
      setApplications(applicationsData ?? [])
      setLoading(false)
    }

    void loadDashboard()

    // ==================================================
    // Realtime dashboard updates
    // ==================================================

    const channel = supabase
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

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
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
  // Loading
  // ====================================================

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <div className="h-40 animate-pulse rounded-2xl bg-muted/50" />

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
      </main>
    )
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
  // Build stats
  // ====================================================

  const activeProjects = projects.filter(
    (project) =>
      project.status === "In Progress" ||
      project.status === "Planning"
  ).length

  const totalProjects = projects.length

  const now = new Date()

  const tasksDueSoon = tasks.filter((task) => {
    if (task.status === "Done") return false
    if (!task.due_date) return false

    const due = new Date(task.due_date)

    if (Number.isNaN(due.getTime())) return false

    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    )

    return diffDays >= 0 && diffDays <= 7
  }).length

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length

  const buildStats = [
    {
      label: "Active Projects",
      value: activeProjects,
      icon: (
        <FolderKanban className="h-5 w-5 text-blue-500" />
      ),
    },
    {
      label: "Tasks Due Soon",
      value: tasksDueSoon,
      icon: (
        <ListTodo className="h-5 w-5 text-orange-500" />
      ),
    },
    {
      label: "Completed Tasks",
      value: completedTasks,
      icon: (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ),
    },
    {
      label: "Total Projects",
      value: totalProjects,
      icon: (
        <BriefcaseBusiness className="h-5 w-5 text-primary" />
      ),
    },
  ]

  // ====================================================
  // Career stats
  // ====================================================

  const appTotal = applications.length

  const appInterviews = applications.filter(
    (application) => application.status === "Interview"
  ).length

  const appOffers = applications.filter(
    (application) => application.status === "Offer"
  ).length

  const appRejectedGhosted = applications.filter(
    (application) =>
      application.status === "Rejected" ||
      application.status === "Ghosted"
  ).length

  const careerStats = [
    {
      label: "Applications",
      value: appTotal,
      icon: (
        <Send className="h-5 w-5 text-blue-500" />
      ),
    },
    {
      label: "Interviews",
      value: appInterviews,
      icon: (
        <CalendarCheck className="h-5 w-5 text-orange-500" />
      ),
    },
    {
      label: "Offers",
      value: appOffers,
      icon: (
        <BadgeCheck className="h-5 w-5 text-green-500" />
      ),
    },
    {
      label: "Rejected / Ghosted",
      value: appRejectedGhosted,
      icon: (
        <XCircle className="h-5 w-5 text-muted-foreground" />
      ),
    },
  ]

  // ====================================================
  // Active project
  // ====================================================

  const firstActiveProject =
    projects.find(
      (project) =>
        project.status === "In Progress" ||
        project.status === "Planning"
    ) ?? projects[0]

  const projectTasks = firstActiveProject
    ? tasks.filter(
        (task) =>
          task.project_id === firstActiveProject.id
      )
    : []

  const projectCompletedTasks = projectTasks.filter(
    (task) => task.status === "Done"
  ).length

  const projectPercentage =
    projectTasks.length > 0
      ? Math.round(
          (projectCompletedTasks / projectTasks.length) *
            100
        )
      : 0

  // ====================================================
  // Upcoming tasks
  // ====================================================

  const upcomingTasks = tasks
    .filter((task) => {
      if (task.status === "Done") return false
      if (!task.due_date) return false

      const due = new Date(task.due_date)

      if (Number.isNaN(due.getTime())) return false

      const diffTime = due.getTime() - now.getTime()
      const diffDays = Math.ceil(
        diffTime / (1000 * 60 * 60 * 24)
      )

      return diffDays >= 0 && diffDays <= 7
    })
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() -
        new Date(b.due_date!).getTime()
    )
    .slice(0, 4)

  // ====================================================
  // Recent applications
  // ====================================================

  const recentApps = applications.slice(0, 3)

  // ====================================================
  // Recent activity
  // ====================================================

  const activityStream: ActivityItem[] = [
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      type: "project" as const,
      title: `Created Project: ${project.name}`,
      description: `Status: ${project.status}`,
      date: new Date(project.created_at),
    })),

    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      type: "task" as const,
      title: `Task Added: ${task.name}`,
      description: `Status: ${task.status}`,
      date: new Date(task.created_at),
    })),

    ...applications.map((application) => ({
      id: `application-${application.id}`,
      type: "application" as const,
      title: `Applied to ${
        application.company || "Unknown Company"
      }`,
      description: `Position: ${application.position} · Status: ${application.status}`,
      date: new Date(application.created_at),
    })),
  ]
    .filter((activity) => !Number.isNaN(activity.date.getTime()))
    .sort(
      (a, b) =>
        b.date.getTime() - a.date.getTime()
    )
    .slice(0, 5)

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
              <span className="text-primary">
                {getFirstName(fullname)}
              </span>
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

      {/* ==================================================
          BUILD STATS
      ================================================== */}

      <section aria-label="Build statistics">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          {buildStats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-5">
                <CardTitle className="max-w-[90px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:max-w-none sm:text-xs">
                  {stat.label}
                </CardTitle>

                <div className="shrink-0 rounded-xl bg-muted/50 p-2">
                  {stat.icon}
                </div>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                <div className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ==================================================
          ACTIVE PROJECT + TASKS
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {/* Active Project */}

        <Card className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              Active Project
            </CardTitle>

            <CardDescription className="text-sm font-medium">
              Your primary focus right now
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-5 px-4 sm:px-6">
            {firstActiveProject ? (
              <>
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="shrink-0 rounded-xl border border-border/40 bg-muted/30 p-3">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">
                      {firstActiveProject.name}
                    </h3>

                    <p className="line-clamp-2 text-sm font-medium text-muted-foreground">
                      {firstActiveProject.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">
                      Progress
                    </span>

                    <span className="font-bold text-primary">
                      {projectPercentage}%
                    </span>
                  </div>

                  <Progress
                   aria-label={`${firstActiveProject?.name ?? "Project"} progress`}
                    value={projectPercentage}
                    className="h-2 rounded-full"
                  />

                  <p className="text-right text-xs font-medium text-muted-foreground">
                    {projectCompletedTasks}/
                    {projectTasks.length} tasks completed
                  </p>
                </div>
              </>
            ) : (
              <EmptyState text="No projects yet" />
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-3 rounded-b-2xl border-t border-border/50 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Link
              href="/build"
              className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              View all projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            {firstActiveProject?.due_date && (
              <div className="flex items-center rounded-full border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <Calendar className="mr-2 h-3.5 w-3.5 text-primary" />
                {formatDate(firstActiveProject.due_date)}
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Tasks Due Soon */}

        <Card className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              Tasks Due Soon
            </CardTitle>

            <CardDescription className="text-sm font-medium">
              Tasks due within the next 7 days
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-2 px-4 sm:px-6">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status === "Done"}
                    disabled={
                      task.status === "Done" ||
                      updatingTaskId === task.id
                    }
                    onCheckedChange={(checked) =>
                      handleTaskComplete(
                        task.id,
                        checked === true
                      )
                    }
                    className="h-5 w-5 shrink-0 rounded-full"
                  />

                  <Label
                    htmlFor={`task-${task.id}`}
                    className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium"
                  >
                    {task.name}
                  </Label>

                  <span className="shrink-0 rounded-md border border-border/50 bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {formatDate(task.due_date)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState text="No tasks due within 7 days" />
            )}
          </CardContent>

          <CardFooter className="rounded-b-2xl border-t border-border/50 bg-muted/10 px-4 py-4 sm:px-6">
            <Link
              href="/build/kanban"
              className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              View all tasks
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* ==================================================
          ACTIVITY + CAREER
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {/* Recent Activity */}

        <Card className="flex flex-col rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              Recent Activity
            </CardTitle>

            <CardDescription className="text-sm font-medium">
              Your latest workspace activity
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 space-y-4 px-4 sm:px-6">
            {activityStream.length > 0 ? (
              activityStream.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 sm:gap-4"
                >
                  <div className="mt-1 shrink-0 rounded-lg bg-muted/30 p-2">
                    {activity.type === "project" && (
                      <FolderKanban className="h-4 w-4 text-primary" />
                    )}

                    {activity.type === "task" && (
                      <ListTodo className="h-4 w-4 text-orange-500" />
                    )}

                    {activity.type === "application" && (
                      <Send className="h-4 w-4 text-blue-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-semibold">
                      {activity.title}
                    </h4>

                    <p className="break-words text-xs text-muted-foreground">
                      {activity.description}
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {formatDateTime(activity.date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState text="No recent activity" />
            )}
          </CardContent>
        </Card>

        {/* Career Snapshot */}

        <Card className="rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-border hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              Career Snapshot
            </CardTitle>

            <CardDescription className="text-sm font-medium">
              Keep track of your job search progress
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6">
            {/* Career Stats */}

            <div className="grid grid-cols-2 gap-3">
              {careerStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border/40 bg-muted/20 p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {stat.icon}

                    <span className="truncate text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">
                      {stat.label}
                    </span>
                  </div>

                  <span className="shrink-0 text-lg font-bold">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Applications */}

            <div className="border-t border-border/50 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Send className="h-4 w-4 text-primary" />
                </div>

                <span className="font-bold">
                  Recent Applications
                </span>
              </div>

              <div className="space-y-2">
                {recentApps.length > 0 ? (
                  recentApps.map((application) => (
                    <div
                      key={application.id}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/30"
                    >
                      <span className="min-w-0 truncate text-sm font-medium">
                        {application.position}
                      </span>

                      <span className="shrink-0 rounded-md border border-border/50 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {application.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-border/50 py-4 text-center text-sm text-muted-foreground">
                    No applications yet
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href="/career/applications"
                  className="flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  View Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================
          ALYMERA AI
      ================================================== */}

      <Card className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-md">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0 space-y-3">
               <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0">
                <Image
                  src="/img/mascot.png"
                   alt="Alymera AI mascot"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>

              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Alymera AI
              </h2>
            </div>

            <p className="max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              Get help deciding what to work on next, organize
              your projects and tasks, and manage your career
              progress with AI.
            </p>
          </div>

          <Button
            className="w-full shrink-0 rounded-xl bg-primary px-6 py-5 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 sm:w-auto"
            asChild
          >
            <Link href="/aly">
              Ask Alymera
              <Sparkles className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>

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