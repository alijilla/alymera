"use client"

import { supabase } from "@/lib/supabase/client"

export default function TestProjects() {
  async function getProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")

    if (error) {
      console.log("Project fetch error:", error.message)
      console.log("Error code:", error.code)
      console.log("Error details:", error.details)
      console.log("Error hint:", error.hint)
      return
    }

    console.log("Projects:", data)
  }

  return (
    <div className="p-10">
      <button
        onClick={getProjects}
        className="rounded-md bg-primary px-4 py-2 text-white"
      >
        Get My Projects
      </button>
    </div>
  )
}