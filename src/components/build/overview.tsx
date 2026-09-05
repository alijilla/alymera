import { actproject } from "@/data/projectdata"
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
  calculateTasksComplete, 
  calculateTotalTask, 
  calculateMilestoneComplete, 
  calculateTotalMilestone } from "@/lib/utils"
  import {
  Map,
  ArrowRight,
    Calendar1Icon,
} from "lucide-react"
import { recentActivities } from "@/data/activity"



type OverviewProps = {
  projectId: string
}
  const next= {
    dueDate: "Sep 7, 2026",
    nextStep: "Complete your AI project",
  }
export function Overview({ projectId }:OverviewProps) {
 const project = actproject.find(
    (project) => project.id === projectId)
      
      if (!project) {
  return <div>Project not found</div>
}


const projectActivities = recentActivities.filter(
  (activity) => activity.project_id === project.id
)
const totalMiles = calculateTotalMilestone(milestones, project.id)
const completedMiles = calculateMilestoneComplete(milestones, project.id)
const completedTasks = calculateTasksComplete(tasks, project.id)
const totalTasks = calculateTotalTask(tasks, project.id)

const progress = calculateProgress(completedMiles, totalMiles)
 
    return (



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
                  <p className="mt-1 text-sm font-bold">{next?.nextStep}</p>
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
    

    )

}

