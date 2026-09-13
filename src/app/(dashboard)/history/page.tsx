"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { supabase } from "@/lib/supabase/client"

import { HistoryHeader } from "@/components/history/HistoryHeaders"
import { HistoryFilters } from "@/components/history/HistoryFilters"
import { HistoryList } from "@/components/history/HistoryList"
import { HistoryItem } from "@/components/history/HistoryCard"

export default function HistoryPage() {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)

      // Get logged-in user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        setLoading(false)
        return
      }

      if (!user) {
        setLoading(false)
        return
      }

      // Get user's conversations
      const {
        data,
        error,
      } = await supabase
        .from("conversations")
        .select(
  "id, title, created_at, updated_at, assistant, project_id"
)
        .eq("user_id", user.id)
        .order("updated_at", {
          ascending: false,
        })

      if (error) {
        console.error("History fetch error:", error)
        setLoading(false)
        return
      }

      // Convert Supabase data to HistoryItem
      const items: HistoryItem[] = (data ?? []).map(
        (conversation) => ({
          id: conversation.id,
          title:
            conversation.title || "New conversation",
          created_at: conversation.updated_at,
          assistant: conversation.assistant,
          project_id: conversation.project_id,
        })
      )

      setHistory(items)
      setLoading(false)
    }

    loadHistory()
  }, [])

  // Search conversations
  const filteredHistory = history.filter((item) =>
    item.title
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Delete from UI for now
  const handleDelete = (id: string) => {
    setHistory((current) =>
      current.filter((item) => item.id !== id)
    )
  }

  // Open conversation
  const handleSelect = (id: string) => {
    const conversation = history.find(
      (item) => item.id === id
    )

    if (!conversation) return

   if (conversation.assistant === "coding") {
  if (!conversation.project_id) {
    console.error(
      "Coding conversation has no project_id"
    )
    return
  }

  router.push(
    `/build/projects/${conversation.project_id}?tab=ai&conversationId=${id}`
  )
} else if (conversation.assistant === "career") {
      router.push(
        `/career?conversationId=${id}`
      )
    } else {
      router.push(
        `/aly?conversationId=${id}`
      )
    }
  }

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <HistoryHeader />

        <HistoryFilters
          value={search}
          onChange={setSearch}
        />

        <HistoryList
          items={filteredHistory}
          loading={loading}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </div>
    </main>
  )
}