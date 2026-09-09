"use client"
import {useState} from "react"
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

export default function TestProject() {
  const [projects, setProjects] = useState<Project[]>([])

  async function createProject() {
    // 1. Get the currently logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.log("User error:", userError)
      return
    }

    if (!user) {
      console.log("No user is logged in")
      return
    }

    console.log("Current user:", user.id)

    // 2. Create a project belonging to that user
    const { data, error } = await supabase.from("projects").select("*")

    // 3. Check the result
    if (error) {
      console.log("Project creation error:", error)
      return
    }

    setProjects(data ?? [])
    console.log("Created project:", data)
  }

async function createMile() {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .limit(1)
    .single()

  if (projectError) {
    console.log("Project fetch error:", projectError)
    return
  }

  console.log("Project ID:", project.id)

  const { data, error } = await supabase
    .from("tasks")
    .insert([{
    project_id: project.id,
    name: "Build application tracker",
    status: "In Progress",
    description: "Track applications through different stages.",
     due_date: "2026-09-05",
  },
  {
    project_id: project.id,
    name: "Add application filters",
    status: "To Do",
    description: "Filter applications by status and job type.",
     due_date: "2026-09-08",
  },

  {
    project_id: project.id,
    name: "Create job matching UI",
    status: "To Do",
    description: "Create the interface for AI job matching.",
     due_date: "2026-09-11",
  },
  {
    project_id: project.id,
    name: "Analyze job descriptions",
    status: "Backlog",
    description: "Prepare job descriptions for AI analysis.",
     due_date: "2026-09-13",
  },
  {
    project_id: project.id,
    name: "Generate career insights",
    status: "Backlog",
    description: "Generate AI-powered career recommendations.",
     due_date: "2026-09-15",
  },

  {
    project_id: project.id,
    name: "Run application tests",
    status: "Backlog",
    description: "Test the Career Manager features.",
     due_date: "2026-09-17",
  },
  {
    project_id: project.id,
    name: "Fix production issues",
    status: "Backlog",
    description: "Fix bugs discovered during testing.",
     due_date: "2026-09-19",
  },
  {
    project_id: project.id,
    name: "Deploy Career Manager",
    status: "Backlog",
    description: "Deploy the application to production.",
    due_date: "2026-09-20",
  },

])
    .select()

  if (error) {
    console.log("Milestone creation error:", error)
    return
  }

  console.log("Created milestones:", data)
}

  return (
    <>
    <div className="p-10">
      <button
        onClick={createProject}
        className="rounded-md bg-primary px-4 py-2 text-white"
      >
        Create Test Project
      </button>
    </div>



<div className="p-10">
      <button
        onClick={createMile}
        className="rounded-md bg-primary px-4 py-2 text-white"
      >
        Create Test Milestone
      </button>
    </div>
    </>
  )
}