"use client"

import { MessageSquare } from "lucide-react"

export function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-medium">
        No conversations yet
      </h3>

      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Your Alymera conversations will appear here.
      </p>
    </div>
  )
}