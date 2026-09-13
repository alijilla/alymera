"use client"

import { useState } from "react"
import {
  AlertCircle,
  KeyRound,
  LockKeyhole,
  Settings,
  Trash2,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleUpdatePassword = async () => {
    setPasswordMessage(null)

    if (!newPassword || !confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in both password fields.",
      })
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Passwords do not match.",
      })
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Update password error:", error)

      setPasswordMessage({
        type: "error",
        text: error.message || "Failed to update password.",
      })

      setPasswordLoading(false)
      return
    }

    setPasswordMessage({
      type: "success",
      text: "Password updated successfully.",
    })

    setPasswordLoading(false)

    setTimeout(() => {
      setPasswordOpen(false)
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage(null)
    }, 1500)
  }

  const handlePasswordDialogChange = (open: boolean) => {
    setPasswordOpen(open)

    if (!open) {
      setNewPassword("")
      setConfirmPassword("")
      setPasswordMessage(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6 lg:p-8">
      {/* Header */}
      <Card className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="p-5 sm:p-6 md:p-8">
          <CardHeader className="p-0">
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              <Settings className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              <span>Settings</span>
            </CardTitle>

            <CardDescription className="mt-2 max-w-2xl text-sm font-medium leading-6 sm:text-base">
              Manage your account security and important account actions.
            </CardDescription>
          </CardHeader>
        </div>
      </Card>

      {/* Account Security */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <LockKeyhole className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg font-bold tracking-tight">
                Account Security
              </CardTitle>

              <CardDescription className="mt-1 text-sm leading-5">
                Keep your ALYMERA account secure by managing your password.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="flex flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Password
                </p>

                <p className="text-xs text-muted-foreground">
                  Update your account password
                </p>
              </div>
            </div>

            <Button
              onClick={() => setPasswordOpen(true)}
              className="w-full rounded-xl sm:w-auto"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-2xl border-destructive/30 bg-destructive/[0.03] shadow-sm">
        <CardHeader className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg font-bold tracking-tight text-destructive">
                Danger Zone
              </CardTitle>

              <CardDescription className="mt-1 text-sm leading-5">
                Permanent account actions that cannot be easily undone.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Delete Account
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                Permanently remove your ALYMERA account and associated
                content. This feature is currently unavailable.
              </p>
            </div>

            <Button
              variant="destructive"
              className="w-full shrink-0 rounded-xl sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordOpen}
        onOpenChange={handlePasswordDialogChange}
      >
        <DialogContent className="w-[calc(100%-1rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Change Password
            </DialogTitle>

            <DialogDescription>
              Choose a new password with at least 8 characters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password
              </Label>

              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                className="rounded-xl"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm New Password
              </Label>

              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                className="rounded-xl"
                autoComplete="new-password"
              />
            </div>

            {passwordMessage && (
              <div
                role="alert"
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
                  passwordMessage.type === "success"
                    ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                    : "border-destructive/20 bg-destructive/10 text-destructive"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handlePasswordDialogChange(false)}
              disabled={passwordLoading}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleUpdatePassword}
              disabled={
                passwordLoading ||
                !newPassword ||
                !confirmPassword
              }
              className="w-full rounded-xl sm:w-auto"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}