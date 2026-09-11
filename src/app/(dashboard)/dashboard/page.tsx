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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Calendar, SparklesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  CircleCheck,
  Send,
  ArrowRight,
  CalendarCheck,
  BadgeCheck,
  XCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ListTodo
} from "lucide-react"

type DBProject = {
  id: string
  name: string
  description: string
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
  type: 'project' | 'task' | 'application'
  title: string
  description: string
  date: Date
}

  export function getFirstName(name: string) {
   return name.split(" ")[0];
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<DBProject[]>([])
  const [tasks, setTasks] = useState<DBTask[]>([])
  const [applications, setApplications] = useState<DBApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState("")
  useEffect(() => {
  async function loadProfile() {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.error("Auth error:", authErr);
      return;
    }

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return;
    }

  
    setFullname(data?.full_name || "");
  }

  loadProfile();
}, []);
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: projectsData } = await supabase.from("projects").select("*").eq('user_id', user.id)
      if (projectsData) setProjects(projectsData)

      // Fetch tasks that belong to the user's projects
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id)
        const { data: tasksData } = await supabase.from("tasks").select("*").in('project_id', projectIds)
        if (tasksData) setTasks(tasksData)
      }

      const { data: appsData } = await supabase.from("applications").select("*").eq('user_id', user.id).order('created_at', { ascending: false })
      if (appsData) setApplications(appsData)

      setLoading(false)
    }
    fetchData()

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => fetchData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const activeProjects = projects.filter(p => p.status === "In Progress" || p.status === "Planning").length
  const totalProjects = projects.length
  
  const now = new Date()
  const tasksDueSoon = tasks.filter(t => {
    if (t.status === "Done") return false
    if (!t.due_date) return false
    const due = new Date(t.due_date)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7 // Due within 7 days
  }).length
  
  const completedTasks = tasks.filter((t) => t.status === "Done").length

  // Build Overview Stats
  const buildStats = [
    { label: "Active Projects", value: activeProjects, icon: <FolderKanban className="w-5 h-5 text-blue-500" /> },
    { label: "Tasks Due Soon", value: tasksDueSoon, icon: <ListTodo className="w-5 h-5 text-orange-500" /> },
    { label: "Completed Tasks", value: completedTasks, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
    { label: "Total Projects", value: totalProjects, icon: <BriefcaseBusiness className="w-5 h-5 text-purple-500" /> },
  ]

  // Career Stats
  const appTotal = applications.length
  const appInterviews = applications.filter(a => a.status === 'Interview').length
  const appOffers = applications.filter(a => a.status === 'Offer').length
  const appRejectedGhosted = applications.filter(a => a.status === 'Rejected' || a.status === 'Ghosted').length

  const careerStats = [
    { label: "Applications", value: appTotal, icon: <Send className="w-5 h-5 text-blue-500" /> },
    { label: "Interviews", value: appInterviews, icon: <CalendarCheck className="w-5 h-5 text-orange-500" /> },
    { label: "Offers", value: appOffers, icon: <BadgeCheck className="w-5 h-5 text-green-500" /> },
    { label: "Rejected / Ghosted", value: appRejectedGhosted, icon: <XCircle className="w-5 h-5 text-muted-foreground" /> },
  ]
  
  // Find first active project
  const firstActiveProject = projects.find(p => p.status === "In Progress" || p.status === "Planning") || projects[0]
  const projectTasks = firstActiveProject ? tasks.filter(t => t.project_id === firstActiveProject.id) : []
  const projectCompletedTasks = projectTasks.filter(t => t.status === "Done").length
  const projectPercentage = projectTasks.length > 0 ? Math.round((projectCompletedTasks / projectTasks.length) * 100) : 0

  const upcomingTasks = tasks
    .filter(t => t.status !== "Done")
    .sort((a, b) => new Date(a.due_date || "9999-12-31").getTime() - new Date(b.due_date || "9999-12-31").getTime())
    .slice(0, 4)

  const recentApps = applications.slice(0, 3)

  // Generate Recent Activity Stream
  const activityStream: ActivityItem[] = [
    ...projects.map(p => ({
      id: `p-${p.id}`,
      type: 'project' as const,
      title: `Created Project: ${p.name}`,
      description: `Status: ${p.status}`,
      date: new Date(p.created_at)
    })),
    ...tasks.map(t => ({
      id: `t-${t.id}`,
      type: 'task' as const,
      title: `Task Added: ${t.name}`,
      description: `Status: ${t.status}`,
      date: new Date(t.created_at)
    })),
    ...applications.map(a => ({
      id: `a-${a.id}`,
      type: 'application' as const,
      title: `Applied to ${a.company || 'Unknown Company'}`,
      description: `Position: ${a.position} - Status: ${a.status}`,
      date: new Date(a.created_at)
    }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 5)

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>
  }
 const hour = new Date().getHours()

let greeting = "Good evening"
  if (hour < 12) {
    greeting = "Good morning"
  } else if (hour < 18) {
    greeting = "Good afternoon"
  } else {
    greeting = "Good evening"
  }



  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
 
      {/*Greeting */}
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-4">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {greeting}, <span className="text-purple-600 dark:text-purple-400 bg-clip-text">{getFirstName(fullname)}</span>.
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
      {/* BUILD STATS */}
      <div className="space-y-4">
       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {buildStats.map((stat) => (
             <Card key={stat.label} className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
               <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                 {stat.label}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Active Project Card */}
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Active Project</CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Your primary focus right now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 px-4 md:px-6">
            {firstActiveProject ? (
              <>
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-muted/30 rounded-xl border border-border/40 group-hover:border-primary/30 transition-colors">
                    <FolderKanban className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{firstActiveProject.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground line-clamp-1">{firstActiveProject.description || "No description provided."}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-sm">
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
              {new Date(firstActiveProject.due_date).toLocaleDateString()}
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
                  {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No date"}
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
          <CardContent className="space-y-4 flex-1 px-4 md:px-6 overflow-y-auto">
            {activityStream.length > 0 ? activityStream.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-muted/30 rounded-lg">
                  {activity.type === 'project' && <FolderKanban className="w-4 h-4 text-purple-500" />}
                  {activity.type === 'task' && <ListTodo className="w-4 h-4 text-orange-500" />}
                  {activity.type === 'application' && <Send className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl h-full">
                <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
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
            <div className="grid grid-cols-2 gap-3">
              {careerStats.map((stat) => (
                <div key={stat.label} className="p-3 bg-muted/20 border border-border/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-xs font-semibold text-muted-foreground uppercase">{stat.label}</span>
                  </div>
                  <span className="font-bold text-lg">{stat.value}</span>
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
                {recentApps.length > 0 ? recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-medium">{app.position}</span>
                    <span className="text-xs font-medium text-muted-foreground bg-background border border-border/50 shadow-sm px-2.5 py-1 rounded-md">
                      {app.status}
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-xl border-border/50">No applications yet</p>
                )}
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
              Alymera AI
            </h2>
            <p className="text-muted-foreground font-medium">
              AI Insight coming soon. Connect your Resume and track more applications to let Alymera AI suggest your next career move.
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