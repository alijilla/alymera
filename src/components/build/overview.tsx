"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

import {
  PlusIcon,
  Calendar1Icon,
  Map,
  ArrowRight,
  ListTodo,
} from "lucide-react"

import { supabase } from "@/lib/supabase/client"

type Project = {
  id: string
  name: string
  description: string
  image_src: string
  status: string
  tech_stack: string[]
  due_date: string | null
}

type DBTask = {
  id: string
  project_id: string
  name: string
  status: string
  due_date: string | null
  created_at: string
}

type ActivityItem = {
  id: string
  type: "task"
  title: string
  description: string
  date: Date
}

type OverviewProps = {
  projectId: string
}

export function Overview({ projectId }: OverviewProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<DBTask[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /*
   * ------------------------------------------------------------
   * FETCH PROJECT
   * ------------------------------------------------------------
   */

  async function getProject() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (error) {
        console.error("Project fetch error:", error)
        return
      }

      setProject(data)
    } catch (error) {
      console.error("Unexpected project fetch error:", error)
    }
  }

  /*
   * ------------------------------------------------------------
   * FETCH TASKS
   * ------------------------------------------------------------
   */

  async function getTasks() {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Task fetch error:", error)
        return
      }

      setTasks(data ?? [])
    } catch (error) {
      console.error("Unexpected task fetch error:", error)
    }
  }

  /*
   * ------------------------------------------------------------
   * INITIAL LOAD
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) return

    async function loadOverview() {
      setIsLoading(true)

      await Promise.all([
        getProject(),
        getTasks(),
      ])

      setIsLoading(false)
    }

    loadOverview()
  }, [projectId])

  /*
   * ------------------------------------------------------------
   * REAL-TIME TASK UPDATES
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`overview-tasks-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          getTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  /*
   * ------------------------------------------------------------
   * LOADING STATE
   * ------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-6 md:space-y-8">

        {/* PROJECT SKELETON */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:gap-8">

          <Card className="w-full min-w-0 rounded-2xl border-border/50">
            <CardHeader>
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3 rounded-xl bg-muted/30 p-4">
                <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
                <div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
                <div className="h-7 w-24 animate-pulse rounded-md bg-muted" />
              </div>
            </CardContent>

            <CardFooter className="h-16 animate-pulse rounded-b-2xl bg-muted/20" />
          </Card>

          {/* RIGHT SIDE SKELETON */}
          <div className="space-y-6 md:space-y-8">

            <Card className="rounded-2xl border-border/50">
              <CardContent className="space-y-6 p-4 sm:p-6">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
                <div className="h-28 animate-pulse rounded-xl bg-muted/40" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </CardHeader>

              <CardContent className="space-y-5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3"
                  >
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * PROJECT NOT FOUND
   * ------------------------------------------------------------
   */

  if (!project) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Map className="h-6 w-6 text-muted-foreground" />
          </div>

          <h3 className="text-lg font-semibold">
            Project not found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            This project may have been deleted or is no longer available.
          </p>
        </CardContent>
      </Card>
    )
  }

  /*
   * ------------------------------------------------------------
   * PROJECT TASKS
   * ------------------------------------------------------------
   */

  const projectTasks = tasks.filter(
    (task) => task.project_id === projectId
  )

  /*
   * ------------------------------------------------------------
   * PROGRESS
   * ------------------------------------------------------------
   */

  const totalTasks = projectTasks.length

  const completedTasks = projectTasks.filter(
    (task) => task.status === "Done"
  ).length

  const progress =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0

  /*
   * ------------------------------------------------------------
   * NEXT STEP
   * ------------------------------------------------------------
   */

  const incompleteTasks = projectTasks
    .filter((task) => task.status !== "Done")
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1

      return (
        new Date(a.due_date).getTime() -
        new Date(b.due_date).getTime()
      )
    })

  const nextTask = incompleteTasks[0]

  /*
   * ------------------------------------------------------------
   * RECENT ACTIVITY
   * ------------------------------------------------------------
   */

  const activityStream: ActivityItem[] = projectTasks
    .map((task) => ({
      id: `t-${task.id}`,
      type: "task" as const,
      title: `Task Added: ${task.name}`,
      description: `Status: ${task.status}`,
      date: new Date(task.created_at),
    }))
    .filter(
      (activity) =>
        !isNaN(activity.date.getTime())
    )
    .sort(
      (a, b) =>
        b.date.getTime() -
        a.date.getTime()
    )
    .slice(0, 5)

  /*
   * ------------------------------------------------------------
   * BOARD
   * ------------------------------------------------------------
   */

  return (
    <div className="w-full min-w-0">

      <div
        className="
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-6
          xl:grid-cols-2
          xl:gap-8
        "
      >

        {/* =====================================================
            ABOUT PROJECT
        ===================================================== */}

        <Card
          className="
            flex
            min-w-0
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-border/50
            bg-card
            shadow-sm
            transition-all
            duration-300
            hover:border-border
            hover:shadow-md
          "
        >
          <CardHeader className="px-4 pb-4 sm:px-6">
            <CardTitle
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              About this Project
            </CardTitle>
          </CardHeader>

          <CardContent
            className="
              min-w-0
              flex-1
              space-y-6
              px-4
              sm:px-6
            "
          >

            {/* PROJECT INFO */}
            <div
              className="
                min-w-0
                rounded-xl
                bg-muted/30
                p-4
              "
            >
              <h2
                className="
                  break-words
                  text-xl
                  font-semibold
                  leading-tight
                "
              >
                {project.name}
              </h2>

              <p
                className="
                  mt-2
                  break-words
                  text-sm
                  leading-relaxed
                  text-muted-foreground
                "
              >
                {project.description}
              </p>
            </div>

            {/* TECH STACK */}
            {project.tech_stack?.length > 0 && (
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tech Stack
                </p>

                <div className="flex min-w-0 flex-wrap gap-2">
                  {project.tech_stack.map((item) => (
                    <Badge
                      variant="secondary"
                      key={item}
                      className="
                        max-w-full
                        rounded-md
                        border
                        border-border/50
                        bg-background
                        px-3
                        py-1
                        text-xs
                        font-medium
                        lowercase
                        shadow-sm
                      "
                    >
                      <span className="truncate">
                        {item}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          </CardContent>

          {/* DUE DATE */}
          <CardFooter
            className="
              flex
              flex-col
              items-start
              gap-3
              border-t
              border-border/50
              bg-muted/10
              px-4
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
            "
          >
            <p
              className="
                flex
                items-center
                text-sm
                font-semibold
                text-muted-foreground
              "
            >
              Due Date
              <ArrowRight className="ml-2 h-4 w-4" />
            </p>

            <div
              className="
                flex
                w-full
                min-w-0
                items-center
                rounded-full
                border
                border-border/50
                bg-background
                px-3
                py-1.5
                text-xs
                font-medium
                text-muted-foreground
                shadow-sm
                sm:w-auto
              "
            >
              <Calendar1Icon className="mr-2 h-3.5 w-3.5 shrink-0 text-primary" />

              <span className="truncate">
                {project.due_date || "No due date"}
              </span>
            </div>
          </CardFooter>
        </Card>


        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <div className="min-w-0 space-y-6 md:space-y-8">

          {/* ===================================================
              PROJECT PROGRESS
          =================================================== */}

          <Card
            className="
              min-w-0
              rounded-2xl
              border
              border-border/50
              bg-card
              p-0
              shadow-sm
              transition-all
              duration-300
              hover:shadow-md
            "
          >
            <CardContent className="min-w-0 p-4 sm:p-6">

              {/* HEADER */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <Map className="h-5 w-5" />
                </div>

                <span className="text-lg font-bold">
                  Project Progress
                </span>
              </div>

              {/* PROGRESS */}
              <div
                className="
                  min-w-0
                  space-y-3
                  rounded-xl
                  border
                  border-border/50
                  bg-muted/20
                  p-4
                "
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-semibold text-muted-foreground">
                    Progress
                  </span>

                  <span className="shrink-0 font-bold text-primary">
                    {progress}%
                  </span>
                </div>

                <Progress
                  value={progress}
                  aria-label="Project progress"
                  className="h-2.5 rounded-full"
                />

                <p className="text-right text-xs font-medium text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>

              {/* NEXT STEP */}
              <div
                className="
                  mt-6
                  flex
                  min-w-0
                  flex-col
                  gap-4
                  rounded-xl
                  border
                  border-border/50
                  bg-gradient-to-r
                  from-muted/50
                  to-muted/20
                  p-4
                  sm:p-5
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-muted-foreground
                    "
                  >
                    Next Step
                  </p>

                  <p
                    className="
                      mt-1
                      break-words
                      text-sm
                      font-semibold
                      text-foreground
                    "
                  >
                    {nextTask
                      ? nextTask.name
                      : totalTasks > 0
                        ? "All tasks completed"
                        : "Add your first task"}
                  </p>

                  {nextTask?.due_date && (
                    <p
                      className="
                        mt-1
                        flex
                        items-center
                        break-words
                        text-xs
                        font-medium
                        text-muted-foreground
                      "
                    >
                      <Calendar1Icon className="mr-1 h-3 w-3 shrink-0" />

                      {nextTask.due_date}
                    </p>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="
                    w-full
                    shrink-0
                    rounded-lg
                    font-medium
                    shadow-sm
                    sm:w-auto
                  "
                  asChild
                >
                  <Link href="/build">
                    View Tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </CardContent>
          </Card>


          {/* ===================================================
              RECENT ACTIVITY
          =================================================== */}

          <Card
            className="
              flex
              min-w-0
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-border/50
              bg-card
              shadow-sm
              transition-all
              duration-300
              hover:shadow-md
            "
          >
            <CardHeader className="px-4 pb-4 sm:px-6">
              <CardTitle
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Recent Activity
              </CardTitle>
            </CardHeader>

            <CardContent
              className="
                min-w-0
                space-y-5
                px-4
                pb-5
                sm:px-6
              "
            >
              {activityStream.length > 0 ? (
                activityStream.map((activity) => (
                  <div
                    key={activity.id}
                    className="
                      flex
                      min-w-0
                      items-start
                      gap-3
                      sm:gap-4
                    "
                  >

                    {/* ICON */}
                    <div
                      className="
                        mt-1
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-muted/30
                      "
                    >
                      <ListTodo className="h-4 w-4 text-orange-500" />
                    </div>

                    {/* ACTIVITY CONTENT */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className="
                          break-words
                          text-sm
                          font-semibold
                          leading-snug
                          text-foreground
                        "
                      >
                        {activity.title}
                      </h4>

                      <p
                        className="
                          mt-1
                          break-words
                          text-xs
                          text-muted-foreground
                        "
                      >
                        {activity.description}
                      </p>

                      <p
                        className="
                          mt-1
                          break-words
                          text-[10px]
                          text-muted-foreground/60
                        "
                      >
                        {activity.date.toLocaleDateString()}{" "}
                        {activity.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                  </div>
                ))
              ) : (
                <div
                  className="
                    flex
                    min-h-[180px]
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border-2
                    border-dashed
                    border-border/40
                    px-4
                    text-center
                  "
                >
                  <div
                    className="
                      mb-3
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-muted/50
                    "
                  >
                    <ListTodo className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">
                    No recent activity
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Your task activity will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}