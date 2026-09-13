"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface HistoryFiltersProps {
  value: string
  onChange: (value: string) => void
}

export function HistoryFilters({
  value,
  onChange,
}: HistoryFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search conversations..."
        className="pl-9"
      />
    </div>
  )
}