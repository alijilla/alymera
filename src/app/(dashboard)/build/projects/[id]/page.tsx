"use client"
import {useState, useEffect} from "react"
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import  Link  from "next/link"
import { ArrowLeft, Calendar1Icon, PlusIcon } from "lucide-react"
import { SiGithub } from "react-icons/si";
  import {
  FolderKanban,
  CircleCheck,
  CirclePlus,
  Send,
  UserRoundCheck,
  Map,
  ArrowRight,
  CalendarCheck,
  BadgeCheck,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { recentActivities } from "@/data/activity"
import { Roadmap } from "@/components/build/roadmap"
import { CodingAssistant } from "@/components/build/coding-assistant"
import { Overview } from "@/components/build/overview"
import { Kanban } from "@/components/build/kanban"

  type Project = {
    id: string
    name: string
    description: string
    image_src: string
    status: string
    tech_stack: string[]
    due_date: string | null
  }


const columns = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Done",
]

  const next= {
    dueDate: "Sep 7, 2026",
    nextStep: "Complete your AI project",
  }
export default function ProjectWorkSpace({params} : {params: Promise<{id:string}>}) {
      const [project, setProject] = useState<Project | null>(null)    
      
         
  useEffect(() =>{
      async function getProject(){
        const {id} = await params;
        const {data, error} = await supabase 
        .from("projects")
        .select()
        .eq("id", id)
        .single();
        if(error){
      console.log("Project fetch error:", error.message)
      console.log("Error code:", error.code)
      console.log("Error details:", error.details)
      console.log("Error hint:", error.hint)
        }
        setProject(data as Project ?? null)
      }

   
      getProject()
     },[params])
       



      if (!project) {
  return <div>Project not found</div>
}

const projectActivities = recentActivities.filter(
  (activity) => activity.project_id === project.id
)

    return (
         <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
            <Button variant="ghost" className="hover:bg-muted/50 rounded-full pr-6" asChild>
              <Link href="/build/"><ArrowLeft className="w-4 h-4 mr-2"/>Back to Projects</Link>
            </Button>
            
            <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
                  <CardHeader className="p-0">
                    <CardTitle>
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {project.name}
                      </h1>
                    </CardTitle>
                    <CardDescription className="text-base mt-2 text-muted-foreground font-medium max-w-2xl">
                    {project.description}
                    </CardDescription>
                  </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button className="bg-[#24292e] hover:bg-[#2f363d] text-white rounded-xl px-6 py-5 shadow-lg shadow-black/10 transition-all hover:scale-105" asChild>
              <Link href={"/"}>
                <SiGithub className="mr-2 h-5 w-5" /> Connect Github
              </Link>
            </Button>
          </CardContent>
              
                </div>
     </Card>
          <Tabs defaultValue="overview" className="flex flex-col space-y-6">
      <TabsList className="rounded-full bg-muted/50 p-1 w-full md:w-auto self-start border border-border/50">
         <TabsTrigger value="overview" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">Overview</TabsTrigger>
        <TabsTrigger value="kanban" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">Kanban Board</TabsTrigger>
        <TabsTrigger value="roadmap" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">Roadmap</TabsTrigger>
         <TabsTrigger value="ai" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">Coding Assistant</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
        <Overview projectId={project.id} />
      </TabsContent>
      <TabsContent value="kanban">
      <Kanban projectId={project.id} />
      </TabsContent>
      <TabsContent value="roadmap"><Roadmap projectId={project.id} /></TabsContent>
      <TabsContent value="ai">
            <Card>
      <CardContent className="p-4">
       <CodingAssistant />
      </CardContent>
    </Card>
       
        
        </TabsContent>
    </Tabs>
            </div>

    )

}

