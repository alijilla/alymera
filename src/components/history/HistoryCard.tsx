"use client"

import {
  MessageSquare,
  MoreVertical,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

export interface HistoryItem {
  id: string
  title: string
  created_at: string
  assistant: "coding" | "alymera" | "career"
  isActive?: boolean
  project_id?: string | null
}

interface HistoryCardProps {
  item: HistoryItem
  onClick?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return ""
  }

  return parsedDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function HistoryCard({
  item,
  onClick,
  onDelete,
}: HistoryCardProps) {
  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all",
        item.isActive
          ? "border-primary/30 bg-primary/10 shadow-sm"
          : "border-transparent bg-card hover:border-border/50 hover:bg-muted/40"
      )}
      onClick={() => onClick?.(item.id)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "shrink-0 rounded-lg p-2",
            item.isActive
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground group-hover:text-primary"
          )}
        >
          <MessageSquare className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-sm font-medium",
              item.isActive
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {item.title}
          </p>

          <p className="text-xs text-muted-foreground">
            {formatDate(item.created_at)}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Conversation options"
            className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-32 rounded-xl"
        >
          <DropdownMenuItem
            className="cursor-pointer rounded-lg text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(item.id)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}