// src/app/test-supabase/page.tsx

"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export default function TestSupabase() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")

      console.log("Data:", data)
      console.log("Error:", error)
    }

    testConnection()
  }, [])

  return "Testing Supabase..."
}