"use client"

import { supabase } from "@/lib/supabase/client"

export default function TestUpdateProject() {
  async function updateProject() {
    const { data, error } = await supabase
      .from("projects")
      .update({
        status: "In Progress",
      })
      .eq("name", "My First ALYMERA Project")
      .select()

    if (error) {
      console.log("Project update error:", error.message)
      console.log("Error code:", error.code)
      console.log("Error details:", error.details)
      console.log("Error hint:", error.hint)
      return
    }

    console.log("Updated project:", data)
  }

  return (
    <div className="p-10">
      <button
        onClick={updateProject}
        className="rounded-md bg-primary px-4 py-2 text-white"
      >
        Update Project
      </button>
    </div>
  )
}