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
      const stats = [
    {
      title: "Progress",
      value:  `${progress}%`,
      icon: <FolderKanban className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Tasks Completed",
      value: `${completedTasks}/${totalTasks}`,
      icon: <CircleCheck className="w-5 h-5 text-green-500" />
    },
    {
      title: "Status",
      value: project.status,
      icon: <Send className="w-5 h-5 text-orange-500" />
    },
  ]   
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Project */}
        <Card className="bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              About this Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              
              <div>
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">                 
                  {project.techStack.map(item => (
                 <Badge variant="secondary" key={item}
                 className="text-xs px-3 py-1 rounded-md lowercase">
                     {item}                            
                  </Badge>
                  ))}
              </div>
              </div>
      
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
            DueDate <ArrowRight className="ml-2 w-4 h-4" />
            </p>
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Calendar1Icon className="w-4 h-4 mr-2" />
              {project.dueDate}
            </div>
          </CardFooter>
        </Card>

                      <div className="space-y-6">
            <div className="border-t pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                <span className="font-semibold">Milestone</span>
              </div>

             
              <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />         
            </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-right">
                  {completedMiles} of {totalMiles} milestones completed
                </p>

                    <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Next Step</p>
                  <p className="mt-1 text-sm font-bold">{next?.name} All task Complete</p>
                  <p className="mt-1 text-sm font-bold">{next?.dueDate}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" asChild>
                  <Link href="/career/roadmap">
                    View Tasks <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>


            <Card className="bg-card shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </CardTitle>
          </CardHeader>
         


         
          <CardContent className="space-y-4 flex-1">
            {projectActivities.map((rec, i) => (
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
        </Card>
        </div>
       </div>
      </TabsContent>
      <TabsContent value="kanban">
        {columns.map((column) => {
     const columnTasks = tasks.filter(
    (task) =>
      task.project_id === project.id &&
      task.status === column
  )

      return (
        <Card key={column} title={column}>
          <CardTitle>{column}</CardTitle>
          <CardContent> 
             {columnTasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="space-y-1 p-4">
            <p className="font-medium">{task.name}</p>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <p className="text-xs text-muted-foreground">Due {task.dueDate}</p>
          </CardContent>
        </Card>
      ))}
          </CardContent>
        </Card>
  )
     })}

      </TabsContent>
      <TabsContent value="roadmap"><Roadmap projectId={project.id} /></TabsContent>
      <TabsContent value="ai">Coding Assistant</TabsContent>
    </Tabs>
            </div>

    )

}

