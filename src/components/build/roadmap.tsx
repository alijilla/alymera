"use client"

import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import {
  CircleCheck,
  Circle,
  Map,
  CalendarDays,
  ArrowDown,
} from "lucide-react"

type RoadmapProps = {
  projectId: string
}

type Mile = {
  id: string
  project_id: string
  name: string
  description: string
  status: string
  due_date: string | null
}

export function Roadmap({ projectId }: RoadmapProps) {
  const [mile, setIsMile] = useState<Mile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  /*
   * ------------------------------------------------------------
   * FETCH MILESTONES
   * ------------------------------------------------------------
   */


useEffect(() => {
  let cancelled = false

  async function loadMilestones() {
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
      .order("due_date", { ascending: true })

    if (cancelled) return

    if (error) {
      console.error("Milestone fetch error:", error)
      setIsLoading(false)
      return
    }

    setIsMile(data ?? [])
    setIsLoading(false)
  }

  if (projectId) {
    loadMilestones()
  }

  return () => {
    cancelled = true
  }
}, [projectId])

  /*
   * ------------------------------------------------------------
   * LOADING STATE
   * ------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl space-y-6">

        {/* HEADER SKELETON */}
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        {/* MILESTONE SKELETONS */}
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex gap-4"
          >
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted" />

            <Card className="w-full rounded-2xl border-border/50">
              <CardContent className="space-y-4 p-5">
                <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-16 animate-pulse rounded-xl bg-muted/50" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * EMPTY STATE
   * ------------------------------------------------------------
   */

  if (mile.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <Card
          className="
            rounded-2xl
            border-2
            border-dashed
            border-border/50
            bg-muted/5
            shadow-none
          "
        >
          <CardContent
            className="
              flex
              min-h-[320px]
              flex-col
              items-center
              justify-center
              px-5
              py-12
              text-center
              sm:px-8
            "
          >
            <div
              className="
                mb-5
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-primary/10
                text-primary
              "
            >
              <Map className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-bold">
              No Milestones Yet
            </h3>

            <p
              className="
                mt-2
                max-w-md
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              You haven&apos;t added any milestones to this
              project&apos;s roadmap yet. Milestones help you
              track the major phases of your project.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * ROADMAP
   * ------------------------------------------------------------
   */

  return (
    <div className="w-full max-w-4xl">

      {/* ========================================================
          ROADMAP HEADER
      ======================================================== */}

      <div className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
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

          <div className="min-w-0">
            <h2 className="text-lg font-bold sm:text-xl">
              Project Roadmap
            </h2>

            <p className="text-xs text-muted-foreground sm:text-sm">
              Track your project milestones from start to finish.
            </p>
          </div>
        </div>
      </div>


      {/* ========================================================
          TIMELINE
      ======================================================== */}

      <div className="relative">

        {/* DESKTOP TIMELINE LINE */}

        <div
          className="
            absolute
            bottom-5
            left-5
            top-5
            hidden
            w-px
            bg-border
            sm:block
          "
        />

        {/* MOBILE TIMELINE LINE */}

        <div
          className="
            absolute
            bottom-5
            left-[19px]
            top-5
            w-px
            bg-border
            sm:hidden
          "
        />

        <div className="space-y-6 sm:space-y-8">

          {mile.map((milestone, index) => {

            const isComplete =
              milestone.status === "Complete"

            const isCurrent =
              !isComplete &&
              index ===
                mile.findIndex(
                  (item) =>
                    item.status !== "Complete"
                )

            return (
              <div
                key={milestone.id}
                className="
                  relative
                  flex
                  min-w-0
                  gap-4
                  sm:gap-6
                "
              >

                {/* ==================================================
                    TIMELINE NODE
                ================================================== */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-background
                  "
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      shadow-sm
                      transition-all
                      duration-300

                      ${
                        isComplete
                          ? "border-green-500 bg-green-500 text-white"
                          : isCurrent
                            ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/10"
                            : "border-border bg-background text-muted-foreground"
                      }
                    `}
                  >
                    {isComplete ? (
                      <CircleCheck className="h-5 w-5" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                </div>


                {/* ==================================================
                    MILESTONE CARD
                ================================================== */}

                <Card
                  className={`
                    min-w-0
                    flex-1
                    overflow-hidden
                    rounded-2xl
                    border
                    shadow-sm
                    transition-all
                    duration-300

                    ${
                      isComplete
                        ? "border-green-500/20 bg-green-500/[0.03]"
                        : isCurrent
                          ? "border-primary/30 bg-primary/[0.02] shadow-md"
                          : "border-border/50 bg-card"
                    }

                    hover:border-primary/30
                    hover:shadow-md
                  `}
                >
                  <CardContent className="min-w-0 p-4 sm:p-5 md:p-6">

                    {/* TOP ROW */}

                    <div
                      className="
                        flex
                        min-w-0
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >

                      {/* TITLE */}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">

                          <h3
                            className="
                              min-w-0
                              break-words
                              text-base
                              font-bold
                              leading-snug
                              text-foreground
                              sm:text-lg
                            "
                          >
                            {milestone.name}
                          </h3>

                          {isCurrent && (
                            <Badge
                              className="
                                shrink-0
                                rounded-full
                                bg-primary/10
                                px-2.5
                                py-0.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                text-primary
                                hover:bg-primary/10
                              "
                            >
                              Current
                            </Badge>
                          )}

                        </div>
                      </div>


                      {/* STATUS */}

                      <Badge
                        variant={
                          isComplete
                            ? "default"
                            : "outline"
                        }
                        className={`
                          w-fit
                          shrink-0
                          rounded-full
                          px-3
                          py-1
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-wide

                          ${
                            isComplete
                              ? "border-transparent bg-green-500 text-white hover:bg-green-500"
                              : "bg-muted/30 text-muted-foreground"
                          }
                        `}
                      >
                        {milestone.status}
                      </Badge>

                    </div>


                    {/* DESCRIPTION */}

                    {milestone.description && (
                      <div
                        className="
                          mt-4
                          min-w-0
                          rounded-xl
                          border
                          border-border/30
                          bg-muted/30
                          p-3
                          sm:p-4
                        "
                      >
                        <p
                          className="
                            break-words
                            text-xs
                            leading-relaxed
                            text-muted-foreground
                            sm:text-sm
                          "
                        >
                          {milestone.description}
                        </p>
                      </div>
                    )}


                    {/* BOTTOM META */}

                    <div
                      className="
                        mt-4
                        flex
                        min-w-0
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >

                      {/* DUE DATE */}

                      <div
                        className="
                          flex
                          min-w-0
                          max-w-full
                          items-center
                          gap-1.5
                          rounded-lg
                          border
                          border-border/40
                          bg-muted/40
                          px-2.5
                          py-1.5
                          text-[10px]
                          font-semibold
                          text-muted-foreground
                          sm:text-xs
                        "
                      >
                        <CalendarDays
                          className="
                            h-3.5
                            w-3.5
                            shrink-0
                            text-primary
                          "
                        />

                        <span className="shrink-0">
                          Due
                        </span>

                        <span
                          className="
                            truncate
                            text-foreground
                          "
                        >
                          {milestone.due_date ||
                            "No due date"}
                        </span>
                      </div>

                    </div>

                  </CardContent>
                </Card>

              </div>
            )
          })}

        </div>
      </div>


      {/* ========================================================
          ROADMAP END
      ======================================================== */}

      <div
        className="
          mt-8
          flex
          items-center
          gap-3
          pl-1
          sm:mt-10
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
            bg-muted/30
          "
        >
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </div>

        <p className="text-xs font-medium text-muted-foreground">
          Keep moving forward
        </p>
      </div>

    </div>
  )
}