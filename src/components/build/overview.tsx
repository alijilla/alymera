"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import  Link  from "next/link"
import { milestones } from  "@/data/milestonedata"
import { tasks } from "@/data/taskdata"
import { calculateProgress, 
  calculateMilestoneComplete, 
  calculateTotalMilestone } from "@/lib/utils"
  import {
  Map,
  ArrowRight,
    Calendar1Icon,
} from "lucide-react"
import { recentActivities } from "@/data/activity"

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

    type Mile = {
    id: string
      project_id: string
    name: string
    description: string
    status: string
    due_date: string | null
  }


type OverviewProps = {
  projectId: string
}
  const next= {
    dueDate: "Sep 7, 2026",
    nextStep: "Complete your AI project",
  }
export function Overview({ projectId }:OverviewProps) {

  const [project, setIsProject] = useState<Project[]>([])
  const [mile, setIsMile] = useState<Mile[]>([])
async function getProjects(){
  
     
       try{
           const {data, error} = await supabase 
           .from("projects") 
           .select("*");
         
 
   if (error) {
     console.log("Project fetch error:", error.message)
     return
   }
 
           setIsProject(data);
       
       } finally{
         
         }
       
     
   }
  useEffect(() =>
 {
 getProjects()
 
 
 },[])

  type DBTask = {
    id: string
    project_id: string
    name: string
    status: string
    due_date: string | null
  }

  const [tasks, setTasks] = useState<DBTask[]>([])

  useEffect(() => {
    async function getTasks() {
      const { data, error } = await supabase.from("tasks").select("*").eq("project_id", projectId)
      if (data) setTasks(data)
    }
    getTasks()

    const channel = supabase
      .channel(`overview-tasks-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, () => {
        getTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const projects = project.find((p) => p.id === projectId)
        
  if (!projects) {
    return <div>Project not found</div>
  }

  const projectActivities = recentActivities.filter(
    (activity) => activity.project_id === projects.id
  )

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === "Done").length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Active Project */}
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              About this Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 px-4 md:px-6">
            <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/30">
              <div>
                <h2 className="font-semibold text-xl mb-1">{projects.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{projects.description}</p>
              </div>
            </div>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">                 
                  {projects.tech_stack.map(item => (
                 <Badge variant="secondary" key={item}
                 className="text-xs px-3 py-1 rounded-md lowercase bg-background border border-border/50 shadow-sm font-medium">
                     {item}                            
                  </Badge>
                  ))}
              </div>
              </div>
      
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <p className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center transition-colors">
            Due Date <ArrowRight className="ml-2 w-4 h-4" />
            </p>
            <div className="flex items-center text-xs font-medium text-muted-foreground bg-background border border-border/50 shadow-sm px-3 py-1.5 rounded-full">
              <Calendar1Icon className="w-3.5 h-3.5 mr-2 text-primary" />
              {projects.due_date}
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-6 md:space-y-8">
            <div className="border border-border/50 bg-card rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <Map className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">Project Progress</span>
              </div>      
              <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-semibold">Progress</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5 rounded-full" />         
            
                <p className="text-xs font-medium text-muted-foreground text-right mt-2">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
            </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-muted/50 to-muted/20 border border-border/50 p-5">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next Step</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{next?.nextStep}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground flex items-center"><Calendar1Icon className="w-3 h-3 mr-1 inline"/>{next?.dueDate}</p>
                </div>
                <Button variant="secondary" size="sm" className="shrink-0 rounded-lg shadow-sm font-medium" asChild>
                  <Link href="/career/roadmap">
                    View Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </CardTitle>
          </CardHeader>        
          <CardContent className="space-y-4 flex-1 px-4 md:px-6 pb-6">
            {projectActivities.map((rec, i) => (
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
        </Card>
        </div>
       </div>
    

    )

}

