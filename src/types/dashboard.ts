import type { ReactNode } from 'react'

export type DashboardStat = {
  title: string
  value: string | number
   icon: ReactNode
}

export type ActiveProject = {
  title: string
  name: string
  shortAbout: string
  tasksCompleted: string
  percentage: number
  dueDate: string
   icon: ReactNode
}

export type Task = {
  title: string
  dueDate: string
  
}

export type RecentActivity = {
  title: string
  time: string
   icon: ReactNode
}

export type CareerSnapshot = {
  title: string
  value: string
   icon: ReactNode
}

export type CareerRoadmap = {
  title: string
  completed: number
  total: number
  nextStep: string
 
}