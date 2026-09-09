"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export default function TestUser() {
  useEffect(() => {
    async function getCurrentUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log("Current user:", user)
      console.log("Error:", error)
    }

    getCurrentUser()
  }, [])

  return <div>Checking current user...</div>
}