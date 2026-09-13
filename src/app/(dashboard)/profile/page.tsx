"use client"

import { useEffect, useState } from "react"
import {
  Link as LinkIcon,
  MapPin,
  Phone,
  Save,
  Upload,
  UserRound,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase/client"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")

  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        if (!cancelled) setLoading(false)
        return
      }

      if (!user || cancelled) {
        if (!cancelled) setLoading(false)
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? "")

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "full_name, phone, location, avatar_url, github_url, linkedin_url, portfolio_url"
        )
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Profile load error:", error)
      }

      if (!cancelled && profile) {
        setFullName(profile.full_name ?? "")
        setPhone(profile.phone ?? "")
        setLocation(profile.location ?? "")
        setAvatarUrl(profile.avatar_url ?? "")
        setGithubUrl(profile.github_url ?? "")
        setLinkedinUrl(profile.linkedin_url ?? "")
        setPortfolioUrl(profile.portfolio_url ?? "")
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  async function uploadImageToSupabase(file: File) {
    if (!userId) return null

    setIsUploading(true)

    try {
      const fileExt = file.name.split(".").pop() || "jpg"
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `avatars/${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Avatar upload error:", error)

      setMessage({
        type: "error",
        text: "Failed to upload avatar.",
      })

      return null
    } finally {
      setIsUploading(false)
    }
  }

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file || !userId) return

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select an image file.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image must be smaller than 5 MB.",
      })
      return
    }

    const url = await uploadImageToSupabase(file)

    if (!url) return

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", userId)

    if (error) {
      console.error("Avatar profile update error:", error)

      setMessage({
        type: "error",
        text: "Avatar uploaded but could not be saved.",
      })

      return
    }

    setAvatarUrl(url)

    setMessage({
      type: "success",
      text: "Avatar updated successfully.",
    })
  }

  async function handleSave() {
    if (!userId) return

    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
        phone,
        location,
        avatar_url: avatarUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl,
      })

    if (error) {
      console.error("Profile save error:", error)

      setMessage({
        type: "error",
        text: "Failed to save profile. Please try again.",
      })
    } else {
      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      })
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="h-32 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      </main>
    )
  }

  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6 lg:p-8">
      {/* Header */}
      <Card className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              <UserRound className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              Profile
            </CardTitle>

            <CardDescription className="mt-2 max-w-2xl text-sm font-medium leading-6 sm:text-base">
              Manage your professional identity and public presence.
            </CardDescription>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl shadow-sm sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      {/* Status */}
      {message && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Identity */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Professional Identity
          </CardTitle>

          <CardDescription>
            This is how you identify yourself inside ALYMERA.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="h-28 w-28 shrink-0 border-4 border-background shadow-md">
              <AvatarImage
                src={avatarUrl}
                alt={fullName || "Profile avatar"}
                className="object-cover"
              />

              <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-2xl font-bold tracking-tight">
                {fullName || "Your Name"}
              </h2>

              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {location || "Add your location"}
              </p>

              <label
                className={`mt-4 inline-flex cursor-pointer items-center rounded-xl border border-dashed border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 ${
                  isUploading ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Change Avatar"}

                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Personal Information
          </CardTitle>

          <CardDescription>
            Keep your basic profile information up to date.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="rounded-xl bg-muted/30 opacity-70"
              />
              <p className="text-xs text-muted-foreground">
                Managed by your authentication account.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </span>
              </Label>

              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </span>
              </Label>

              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, Country"
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Links */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Professional Links
          </CardTitle>

          <CardDescription>
            Add links to your work and professional profiles.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="github">
              <span className="inline-flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                GitHub
              </span>
            </Label>

            <Input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="https://github.com/username"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">
              <span className="inline-flex items-center gap-2">
               <LinkIcon className="h-4 w-4" />
                LinkedIn
              </span>
            </Label>

            <Input
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolio">
              <span className="inline-flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Portfolio
              </span>
            </Label>

            <Input
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              placeholder="https://yourportfolio.com"
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}