"use client"

import { Clock } from "lucide-react"

export function HistoryHeader() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />

        <h1 className="text-2xl font-semibold">
          History
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        View your previous conversations with Alymera.
      </p>
    </div>
  )
}