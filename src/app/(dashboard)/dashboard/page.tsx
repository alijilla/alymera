"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import type {
  DashboardStat,
  ActiveProject,
  Task,
  RecentActivity,
  CareerSnapshot,
  CareerRoadmap,
} from "@/types/dashboard"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  FolderKanban,
  CircleCheck,
  Send,
  UserRoundCheck,
  Map,
  ArrowRight,
  CalendarCheck,
  BadgeCheck,
} from "lucide-react"

import { milestones as milestoneData, milestones} from  "@/data/milestonedata"
import { tasks as taskData } from "@/data/taskdata"
import { actproject } from "@/data/projectdata"
type DBProject = {
  id: string
  name: string
  description: string
  status: string
  due_date: string | null
}

type DBTask = {
  id: string
  project_id: string
  name: string
  status: string
  due_date: string | null
}

export default function DashboardPage() {
  const hour = new Date().getHours()

  const [projects, setProjects] = useState<DBProject[]>([])
  const [tasks, setTasks] = useState<DBTask[]>([])
  
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: projectsData } = await supabase.from("projects").select("*")
      if (projectsData) setProjects(projectsData)

      const { data: tasksData } = await supabase.from("tasks").select("*")
      if (tasksData) setTasks(tasksData)
    }
    fetchData()

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const totalProjects = projects.length
  const completedTasks = tasks.filter((t) => t.status === "Done").length

  const stats: DashboardStat[] = [
    {
      title: "Active Projects",
      value:  totalProjects,
      icon: <FolderKanban className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Tasks Completed",
      value: completedTasks,
      icon: <CircleCheck className="w-5 h-5 text-green-500" />
    },
    {
      title: "Applications",
      value: 3,
      icon: <Send className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Career Score",
      value: "30%",
      icon: <UserRoundCheck className="w-5 h-5 text-purple-500" />
    }
  ]
   
  
  // Find first active project
  const firstActiveProject = projects.find(p => p.status === "In Progress" || p.status === "Planning") || projects[0]
  const projectTasks = firstActiveProject ? tasks.filter(t => t.project_id === firstActiveProject.id) : []
  const projectCompletedTasks = projectTasks.filter(t => t.status === "Done").length
  const projectPercentage = projectTasks.length > 0 ? Math.round((projectCompletedTasks / projectTasks.length) * 100) : 0

  // Replace mock with real data
  const upcomingTasks = tasks
    .filter(t => t.status !== "Done")
    .sort((a, b) => new Date(a.due_date || "9999-12-31").getTime() - new Date(b.due_date || "9999-12-31").getTime())
    .slice(0, 4)

  const recent: RecentActivity[] = [
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Finish Kanban UI", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Connect Supabase", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Implement AI Solution", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Write Unit Test", time: "2 hrs ago" },
  ]

  const careerSnapshot: CareerSnapshot[] = [
    { title: "Applications", value: "12", icon: <Send className="h-5 w-5 text-muted-foreground" /> },
    { title: "Interviews", value: "3", icon: <CalendarCheck className="h-5 w-5 text-muted-foreground" /> },
    { title: "Offers", value: "1", icon: <BadgeCheck className="h-5 w-5 text-muted-foreground" /> },
  ]

  const careerRoadmap: CareerRoadmap  = {
    title: "Frontend Developer Roadmap",
    completed: 3,
    total: 6,
    nextStep: "Complete your AI project",
  }

  let greeting = "Good evening"
  if (hour < 12) {
    greeting = "Good morning"
  } else if (hour < 18) {
    greeting = "Good afternoon"
  } else {
    greeting = "Good evening"
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/*Greeting */}
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-4">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {greeting}, <span className="text-purple-600 dark:text-purple-400 bg-clip-text">Alyssa</span>.
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Here is your Workspace Overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-5 shadow-lg shadow-purple-500/20 transition-all hover:scale-105" asChild>
              <Link href={"/aly"}>
                <SparklesIcon className="mr-2 h-5 w-5 text-orange-300" /> Ask Alymera
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>

      {/*Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-muted/50 rounded-xl">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Active Project */}
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {firstActiveProject ? "Active Project" : "No Active Project"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            {firstActiveProject ? (
              <>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                  <Avatar className="size-[40px] flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">{firstActiveProject.name.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-lg">{firstActiveProject.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{firstActiveProject.description}</p>
                  </div>
                </div>

                <div className="space-y-3 p-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="font-bold text-primary">{projectPercentage}%</span>
                  </div>
                  <Progress value={projectPercentage} className="h-2 rounded-full" />
                  <p className="text-xs text-muted-foreground text-right font-medium">{projectCompletedTasks}/{projectTasks.length} tasks completed</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl h-full">
                <p className="text-sm font-medium text-muted-foreground">No projects yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <Link href="/build/" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
              View all projects <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            {firstActiveProject?.due_date && (
            <div className="flex items-center text-xs font-medium text-muted-foreground bg-background border border-border/50 shadow-sm px-3 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5 mr-2 text-primary" />
              {firstActiveProject.due_date}
            </div>
            )}
          </CardFooter>
        </Card>

        {/* Tasks Due Soon */}
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tasks Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 px-4 md:px-6">
            {upcomingTasks.length > 0 ? upcomingTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-4 group p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Checkbox id={t.id} className="rounded-full w-5 h-5 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor={t.id} className="font-medium cursor-pointer group-hover:text-primary transition-colors select-none">
                    {t.name}
                  </Label>
                </div>
                <div className="flex-1 border-b border-dashed border-muted-foreground/20 mx-2" />
                <span className="text-xs font-medium text-muted-foreground bg-background border border-border/50 shadow-sm px-2.5 py-1 rounded-md group-hover:border-primary/30 transition-colors">
                  {t.due_date || "No date"}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl h-full">
                <p className="text-sm font-medium text-muted-foreground">No upcoming tasks</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <Link href="/build/kanban" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
              View all tasks <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Activity */}
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 px-4 md:px-6">
            {recent.map((rec, i) => (
              <div key={i} className="flex items-center group p-2 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                    {rec.icon}
                  </div>
                  <span className="font-medium text-sm group-hover:text-primary transition-colors">{rec.title}</span>
                </div>
                <div className="flex-1 border-b border-dashed border-muted-foreground/10 mx-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">{rec.time}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <Link href="/build/kanban" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
              View all activity <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Career Snapshot */}
        <Card className="bg-card shadow-sm border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Career Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-4 md:px-6">
            <div className="grid grid-cols-3 gap-3">
              {careerSnapshot.map((item) => (
                <div key={item.title} className="flex flex-col items-center justify-center gap-2 p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="p-2.5 bg-background shadow-sm rounded-lg text-primary">
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-xl block">{item.value}</span>
                    <span className="text-xs font-medium text-muted-foreground">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Applications */}
            <div className="border-t border-border/50 pt-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Send className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold">Recent Applications</span>
              </div>

              <div className="space-y-2">
                {[
                  { role: "Frontend Developer", status: "Interview" },
                  { role: "Junior Developer", status: "Applied" },
                  { role: "Web Developer", status: "Ghosted" },
                ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-medium">{app.role}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-background border border-border/50 shadow-sm px-2.5 py-1 rounded-md">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Link href="/career/applications" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
                  View Applications <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="bg-card shadow-md border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-orange-400" />
              Alymera AI Insight
            </h2>
            <p className="text-muted-foreground font-medium">
              Your profile is strong for frontend roles, but consider adding more full-stack projects to stand out.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 rounded-xl px-6 py-5 shadow-lg shadow-purple-500/20 transition-all hover:scale-105" asChild>
            <Link href={"/career/resume/"}>
              Improve my resume <SparklesIcon className="ml-2 h-4 w-4 text-orange-300" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}