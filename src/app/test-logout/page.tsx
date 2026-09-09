"use client"

import { supabase } from "@/lib/supabase/client"

export default function TestLogout() {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log("Logout error:", error)
      return
    }

    console.log("Successfully logged out!")
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}