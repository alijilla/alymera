import { milestones } from "@/data/milestonedata"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CircleCheck, Circle } from "lucide-react"

type RoadmapProps = {
  projectId: string
}

export function Roadmap({ projectId }: RoadmapProps) {
  const projectMilestones = milestones.filter(
    (milestone) => milestone.project_id === projectId
  )

  return (
    <div className="space-y-4">
      {projectMilestones.map((milestone) => (
        <Card key={milestone.id}>
          <CardContent className="flex gap-4 p-5">

            <div>
              {milestone.status === "Complete" ? (
                <CircleCheck className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {milestone.name}
                </h3>

                <Badge variant="outline">
                  {milestone.status}
                </Badge>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {milestone.description}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Due {milestone.dueDate}
              </p>
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  )
}