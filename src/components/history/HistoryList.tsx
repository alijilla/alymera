"use client"

import {
  HistoryCard,
  HistoryItem,
} from "./HistoryCard"

import { EmptyHistory } from "./EmptyHistory"

interface HistoryListProps {
  items: HistoryItem[]
  loading?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

export function HistoryList({
  items,
  loading = false,
  onSelect,
  onDelete,
}: HistoryListProps) {
  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading conversations...
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyHistory />
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          onClick={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}