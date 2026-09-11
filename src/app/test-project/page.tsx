"use client"
import {useState} from "react"
import { supabase } from "@/lib/supabase/client"
  type Project = {
    id: string
    name: string
    
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
    const { data, error } = await supabase.from("profiles").select("*")

    // 3. Check the result
    if (error) {
      console.log("Project creation error:", error)
      return
    }

    setProjects(data ?? [])
    console.log("Created project:", data)
  }

async function createMile() {
  const { data: profile, error: projectError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .single()

  if (projectError) {
    console.log("Project fetch error:", projectError)
    return
  }

  console.log("Project ID:", profile.id)

  const { data, error } = await supabase
    .from("applications")
    .insert([
    
  {
    user_id: profile.id,
    company: "Concentrix",
    location: "Makati City, Metro Manila",
    positon: "CSR",
    date_applied: "2026-07-06",
    status: "Rejected",
    description: "Declined job offer",
   
  },
    {
    user_id: profile.id,
    company: "pJ lhuilier",
    location: "Makati City, Metro Manila",
    positon: "Software Engineer",
    date_applied: "2026-07-16",
    status: "Applied",
    description: "Declined job offer",
   
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