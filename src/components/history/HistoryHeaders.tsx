"use client"

import { Clock, Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type HistoryHeaderProps = {
  onDeleteAll: () => void
  hasHistory: boolean
}

export function HistoryHeader({
  onDeleteAll,
  hasHistory,
}: HistoryHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />

          <h1 className="text-2xl font-semibold">
            History
          </h1>
        </div>

        {hasHistory && (
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/20 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete all
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Delete all conversations?
                </DialogTitle>

                <DialogDescription>
                  This will permanently delete all of your
                  conversations and their messages. This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="rounded-md border px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </DialogTrigger>

                <button
                  type="button"
                  onClick={onDeleteAll}
                  className="rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete all
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        View your previous conversations with Alymera.
      </p>
    </div>
  )
}