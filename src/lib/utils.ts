"use client"

import { useState, useEffect } from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



    type Mile = {
    id: string
      project_id: string
    name: string
    description: string
    status: string
    due_date: string | null
  }

  
type Task  = {
  id: string | number
  project_id: string
  name: string
  description: string
  status: string
  due_date: string | null
}
export function useMilestones() {
  const [mile, setIsMile] = useState<Mile[]>([])

  useEffect(() => {
    async function getMilestone() {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")

      if (error) {
        console.log("Project fetch error:", error.message)
        return
      }

      setIsMile(data ?? [])
    }

    getMilestone()
  }, [])

  return mile
}

export function useTasks() {
  const [task, setIsTask] = useState<Task[]>([])

  useEffect(() => {
    async function getTasks() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")

      if (error) {
        console.log("Project fetch error:", error.message)
        return
      }

      setIsTask(data ?? [])
    }

    getTasks()
  }, [])

  return task
}

export function makeArray(stack: string){
  return stack
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean)

}

export function calculateProgress(
  Completed: number,
  Total: number
) {
  if (Total === 0) return 0

  return Math.round((Completed / Total) * 100)
}

export function calculateTaskComplete(task: Task[], projectId: string) {
  const completedTasks = task.filter(
    (task) =>
      task.project_id === projectId &&
      task.status === "Complete"
  )

  return completedTasks.length
}
export function calculateTotalTask(task: Task[], projectId: string){
   const completedTasks = task.filter(
    (task) =>
      task.project_id === projectId 
   )

   return completedTasks.length
}

export function calculateMilestoneComplete(milestones: Mile[], projectId: string) {
  const completedMilestone = milestones.filter(
    (milestone) =>
      milestone.project_id === projectId &&
      milestone.status === "Complete"
  )

  return completedMilestone.length
}
export function calculateTotalMilestone(milestones: Mile[], projectId: string){
   const completedMilestone = milestones.filter(
    (milestone) =>
      milestone.project_id === projectId 
   )

   return completedMilestone.length
}


//const totalApplications = applications.length