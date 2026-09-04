import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { milestones as milestoneData, milestones} from  "@/data/milestonedata"
import { tasks as taskData } from "@/data/taskdata"
import { actproject } from "@/data/projectdata"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join(" ")
    .toUpperCase()
}

export function calculateProgress(
  Completed: number,
  Total: number
) {
  if (Total === 0) return 0

  return Math.round((Completed / Total) * 100)
}

export function calculateTasksComplete(tasks: typeof taskData, projectId: string) {
  const completedTasks = tasks.filter(
    (task) =>
      task.project_id === projectId &&
      task.status === "Done"
  )

  return completedTasks.length
}

export function calculateTotalTask(tasks: typeof taskData, projectId: string){
   const totalTasks = tasks.filter(
    (task) => 
      task.project_id === projectId 
   )

   return totalTasks.length
}

export function calculateMilestoneComplete(milestones: typeof milestoneData, projectId: string) {
  const completedMilestone = milestones.filter(
    (milestone) =>
      milestone.project_id === projectId &&
      milestone.status === "Complete"
  )

  return completedMilestone.length
}
export function calculateTotalMilestone(milestones: typeof milestoneData, projectId: string){
   const completedMilestone = milestones.filter(
    (milestone) =>
      milestone.project_id === projectId 
   )

   return completedMilestone.length
}

const totalProjects = actproject.length

const totalTasks = taskData.length

const completedTasks = taskData.filter(
  (task) => task.status === "Done"
).length

//const totalApplications = applications.length