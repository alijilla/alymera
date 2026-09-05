import { actproject } from "@/data/projectdata"
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
import { milestones } from  "@/data/milestonedata"
import { tasks } from "@/data/taskdata"
import { calculateProgress, 
  calculateTasksComplete, 
  calculateTotalTask, 
  calculateMilestoneComplete, 
  calculateTotalMilestone } from "@/lib/utils"
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
export default async function ProjectWorkSpace({params} : {params: Promise<{id:string}>}) {
      const {id} = await params;
      const project = actproject.find((project) => project.id === id)
      
      if (!project) {
  return <div>Project not found</div>
}

const next = tasks.find(
  (tasks) => tasks.project_id === project.id && tasks.status === "To Do"

)

const projectActivities = recentActivities.filter(
  (activity) => activity.project_id === project.id
)
const totalMiles = calculateTotalMilestone(milestones, project.id)
const completedMiles = calculateMilestoneComplete(milestones, project.id)
const completedTasks = calculateTasksComplete(tasks, project.id)
const totalTasks = calculateTotalTask(tasks, project.id)

const progress = calculateProgress(completedMiles, totalMiles)

    return (
         <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <Button variant="secondary" asChild>
              
              <Link href="/build/"><ArrowLeft className="w-4 h-4 mr-2"/>Projects</Link>

            </Button>
              <Card className="bg-card border-none shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                  <CardHeader className="p-0">
                    <CardTitle>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {project.name}
                      </h1>
                    </CardTitle>
                    <CardDescription className="text-base mt-2 text-foreground">
                    {project.description}
                    </CardDescription>
                  </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" asChild>
              <Link href={"/"}>
                <SiGithub className="mr-2 h-4 w-4 text-orange-300" /> Connect Github
              </Link>
            </Button>
          </CardContent>
              
                </div>
     </Card>
          <Tabs defaultValue="overview" className="flex flex-col space-y-4">
      <TabsList className="rounded-full bg-muted/50 p-1">
         <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        <TabsTrigger value="roadmap">RoadMap</TabsTrigger>
         <TabsTrigger value="ai">Coding Assistant</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
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

