import { createElement, type ReactNode } from "react"
import {
  CircleCheck,
  CirclePlus,
  ArrowRight,
  Milestone,
} from "lucide-react"

export type RecentActivity = {
  id: string
  project_id: string
  icon: ReactNode
  title: string
  time: string
}

export const recentActivities: RecentActivity[] = [
  // ─────────────────────────
  // AI PORTFOLIO - p1
  // ─────────────────────────
  {
    id: "a1",
    project_id: "p1",
    icon: createElement(CircleCheck, { className: "w-4 h-4 text-green-500" }),
    title: "Completed AI chat integration",
    time: "2 days ago",
  },
  {
    id: "a2",
    project_id: "p1",
    icon: createElement(Milestone, { className: "w-4 h-4 text-purple-500" }),
    title: "Completed AI Integration milestone",
    time: "3 days ago",
  },
  {
    id: "a3",
    project_id: "p1",
    icon: createElement(CircleCheck, { className: "w-4 h-4 text-green-500" }),
    title: "Deployed portfolio to Vercel",
    time: "5 days ago",
  },

  // ─────────────────────────
  // CAREER MANAGER - p2
  // ─────────────────────────
  {
    id: "a4",
    project_id: "p2",
    icon: createElement(CircleCheck, { className: "w-4 h-4 text-green-500" }),
    title: "Completed job application form",
    time: "3 hrs ago",
  },
  {
    id: "a5",
    project_id: "p2",
    icon: createElement(ArrowRight, { className: "w-4 h-4 text-orange-500" }),
    title: "Started application tracker",
    time: "5 hrs ago",
  },
  {
    id: "a6",
    project_id: "p2",
    icon: createElement(CirclePlus, { className: "w-4 h-4 text-blue-500" }),
    title: "Added Career Intelligence milestone",
    time: "Yesterday",
  },

  // ─────────────────────────
  // AI PROJECT MANAGER - p3
  // ─────────────────────────
  {
    id: "a7",
    project_id: "p3",
    icon: createElement(CircleCheck, { className: "w-4 h-4 text-green-500" }),
    title: "Completed project cards",
    time: "2 hrs ago",
  },
  {
    id: "a8",
    project_id: "p3",
    icon: createElement(ArrowRight, { className: "w-4 h-4 text-orange-500" }),
    title: "Started Kanban board",
    time: "4 hrs ago",
  },
  {
    id: "a9",
    project_id: "p3",
    icon: createElement(CirclePlus, { className: "w-4 h-4 text-blue-500" }),
    title: "Created Project Management milestone",
    time: "Yesterday",
  },
  {
    id: "a10",
    project_id: "p3",
    icon: createElement(CircleCheck, { className: "w-4 h-4 text-green-500" }),
    title: "Completed dashboard",
    time: "Yesterday",
  },
]