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

export default function DashboardPage() {
  const hour = new Date().getHours()
  const stats = [
    {
      title: "Active Projects",
      value: 2,
      description: "+1 this week",
      icon: <FolderKanban className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Tasks Completed",
      value: 3,
      description: "+2 this week",
      icon: <CircleCheck className="w-5 h-5 text-green-500" />
    },
    {
      title: "Applications",
      value: 3,
      description: "+2 this week",
      icon: <Send className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Career Score",
      value: "30%",
      description: "+2 this week",
      icon: <UserRoundCheck className="w-5 h-5 text-purple-500" />
    }
  ]

  const actproject = {
    title: "Active Project",
    name: "AI Project Manager",
    shortAbout: "Build an AI powered project management",
    tasksCompleted: "12/16 tasks completed",
    percentage: 78,
    dueDate: "Sep 20, 2026",
    icon: (
      <Avatar className="size-[40px] flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">AJ</AvatarFallback>
      </Avatar>
    )
  }

  const task = [
    { title: "Finish Kanban UI", dueDate: "Today" },
    { title: "Connect Supabase", dueDate: "Tomorrow" },
    { title: "Implement AI Solution", dueDate: "Sep 5" },
    { title: "Write Unit Test", dueDate: "Sep 7" },
  ]

  const recent = [
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Finish Kanban UI", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Connect Supabase", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Implement AI Solution", time: "2 hrs ago" },
    { icon: <CircleCheck className="w-4 h-4 text-green-500" />, title: "Write Unit Test", time: "2 hrs ago" },
  ]

  const careerSnapshot = [
    { title: "Applications", value: "12", icon: <Send className="h-5 w-5 text-muted-foreground" /> },
    { title: "Interviews", value: "3", icon: <CalendarCheck className="h-5 w-5 text-muted-foreground" /> },
    { title: "Offers", value: "1", icon: <BadgeCheck className="h-5 w-5 text-muted-foreground" /> },
  ]

  const careerRoadmap = {
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
      <Card className="bg-card border-none shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {greeting}, <span className="text-purple-600 dark:text-purple-400">Alyssa</span>.
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-foreground">
              Here is your Workspace Overview.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
              <Link href={"/aly"}>
                <SparklesIcon className="mr-2 h-4 w-4 text-orange-300" /> Ask Alymera
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>

      {/*Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Project */}
        <Card className="bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {actproject.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              {actproject.icon}
              <div>
                <h2 className="font-semibold text-lg">{actproject.name}</h2>
                <p className="text-sm text-muted-foreground">{actproject.shortAbout}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{actproject.percentage}%</span>
              </div>
              <Progress value={actproject.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{actproject.tasksCompleted}</p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Link href="/build/" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
              View all projects <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Calendar className="w-4 h-4 mr-2" />
              {actproject.dueDate}
            </div>
          </CardFooter>
        </Card>

        {/* Tasks Due Soon */}
        <Card className="bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tasks Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {task.map((t) => (
              <div key={t.title} className="flex items-center gap-4 group">
                <div className="flex items-center gap-3">
                  <Checkbox id={t.title} className="rounded-full" />
                  <Label htmlFor={t.title} className="font-medium cursor-pointer group-hover:text-primary transition-colors">
                    {t.title}
                  </Label>
                </div>
                <div className="flex-1 border-b border-dashed border-muted-foreground/20 mx-2" />
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {t.dueDate}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Link href="/build/kanban" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
              View all tasks <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {recent.map((rec, i) => (
              <div key={i} className="flex items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                    {rec.icon}
                  </div>
                  <span className="font-medium text-sm">{rec.title}</span>
                </div>
                <div className="flex-1" />
                <p className="text-xs text-muted-foreground">{rec.time}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Link href="/build/kanban" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
              View all activity <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Career Snapshot */}
        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Career Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {careerSnapshot.map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                  <div className="flex-1 border-b border-dashed border-muted-foreground/20 mx-2" />
                  <span className="font-bold text-lg">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Career Roadmap */}
            <div className="border-t pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <span className="font-semibold">Career Roadmap</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{careerRoadmap.title}</span>
                  <span className="font-bold text-primary">
                    {Math.round((careerRoadmap.completed / careerRoadmap.total) * 100)}%
                  </span>
                </div>
                <Progress value={(careerRoadmap.completed / careerRoadmap.total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {careerRoadmap.completed} of {careerRoadmap.total} milestones completed
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Step</p>
                  <p className="mt-1 text-sm font-bold">{careerRoadmap.nextStep}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" asChild>
                  <Link href="/career/roadmap">
                    Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="bg-card shadow-sm border border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-orange-400" />
              Alymera AI Insight
            </h2>
            <p className="text-muted-foreground">
              Your profile is strong for frontend roles, but consider adding more full-stack projects to stand out.
            </p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shrink-0" asChild>
            <Link href={"/career/resume/"}>
              Improve my resume <SparklesIcon className="ml-2 h-4 w-4 text-orange-300" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}