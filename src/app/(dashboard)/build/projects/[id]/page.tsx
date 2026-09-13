"use client"
import { use, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SiGithub } from "react-icons/si"

import { supabase } from "@/lib/supabase/client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Roadmap } from "@/components/build/roadmap"
import { CodingAssistant } from "@/components/build/coding-assistant"
import { Overview } from "@/components/build/overview"
import { Kanban } from "@/components/build/kanban"

type Project = {
  id: string
  name: string
  description: string
  image_src: string
  status: string
  tech_stack: string[]
  due_date: string | null
}

export default function ProjectWorkSpace({
  params,
}: {
  params: Promise<{ id: string }>
}) {


 const { id } = use(params)

const searchParams = useSearchParams()

const conversationId =
  searchParams.get("conversationId")

const requestedTab =
  searchParams.get("tab")

const [activeTab, setActiveTab] = useState(
  requestedTab === "ai" ? "ai" : "overview"
)

const [project, setProject] = useState<Project | null>(null)
const [isLoading, setIsLoading] = useState(true)

  const [repoInput, setRepoInput] = useState("")
  const [githubDialogOpen, setGithubDialogOpen] = useState(false)

  useEffect(() => {
    async function getProject() {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Project fetch error:", error)
        setProject(null)
        setIsLoading(false)
        return
      }

      setProject(data as Project)
      setIsLoading(false)
    }

    getProject()
  }, [id])

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="space-y-6">
          {/* Back button skeleton */}
          <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />

          {/* Project header skeleton */}
          <Card className="overflow-hidden rounded-2xl border-border/40">
            <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-9 w-2/3 animate-pulse rounded-lg bg-muted sm:h-10" />
                <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 max-w-xl animate-pulse rounded bg-muted" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-xl bg-muted md:w-40" />
            </div>
          </Card>

          {/* Tabs skeleton */}
          <div className="h-12 w-full animate-pulse rounded-2xl bg-muted sm:w-[500px]" />

          {/* Content skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <h1 className="text-xl font-bold">Project Not Found</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              This project may have been deleted or you may not have access
              to it.
            </p>

            <Button asChild className="mt-6 rounded-xl">
              <Link href="/build">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8">
      <div className="space-y-6 md:space-y-8">
        {/* Back to Projects */}
        <Button
          variant="ghost"
          asChild
          className="rounded-full px-4 text-sm hover:bg-muted/50 sm:px-5"
        >
          <Link href="/build">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>

        {/* Project Header */}
        <Card className="overflow-hidden rounded-2xl border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm">
          <div className="flex flex-col gap-6 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
            {/* Project Information */}
            <CardHeader className="min-w-0 flex-1 space-y-0 p-0">
              <CardTitle>
                <h1 className="break-words text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                  {project.name}
                </h1>
              </CardTitle>

              {project.description && (
                <CardDescription className="mt-2 max-w-3xl break-words text-sm font-medium leading-relaxed sm:text-base">
                  {project.description}
                </CardDescription>
              )}

              {/* Tech Stack */}
              {project.tech_stack?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border/50 bg-background/70 px-3 py-1 text-[10px] font-medium text-muted-foreground sm:text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </CardHeader>

            {/* GitHub Button */}
            <CardContent className="w-full shrink-0 p-0 md:w-auto">
             
            </CardContent>
          </div>
        </Card>

        {/* Workspace */}
        <Tabs
  value={activeTab}
  onValueChange={setActiveTab}
  className="flex min-w-0 flex-col space-y-5 sm:space-y-6"
>
          {/* Responsive Tabs */}
          <div className="w-full overflow-hidden">
            <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-border/50 bg-muted/50 p-1 sm:w-fit sm:rounded-full">
              <TabsTrigger
                value="overview"
                className="shrink-0 rounded-xl px-4 py-2.5 text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm sm:rounded-full sm:px-5 sm:text-sm"
              >
                Overview
              </TabsTrigger>

              <TabsTrigger
                value="kanban"
                className="shrink-0 rounded-xl px-4 py-2.5 text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm sm:rounded-full sm:px-5 sm:text-sm"
              >
                Kanban
              </TabsTrigger>

              <TabsTrigger
                value="roadmap"
                className="shrink-0 rounded-xl px-4 py-2.5 text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm sm:rounded-full sm:px-5 sm:text-sm"
              >
                Roadmap
              </TabsTrigger>

              <TabsTrigger
                value="ai"
                className="shrink-0 rounded-xl px-4 py-2.5 text-xs transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm sm:rounded-full sm:px-5 sm:text-sm"
              >
                Coding AI
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent
            value="overview"
            className="min-w-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Overview projectId={project.id} />
          </TabsContent>

          {/* Kanban */}
          <TabsContent
            value="kanban"
            className="min-w-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Kanban projectId={project.id} />
          </TabsContent>

          {/* Roadmap */}
          <TabsContent
            value="roadmap"
            className="min-w-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Roadmap projectId={project.id} />
          </TabsContent>

          {/* Coding Assistant */}
          <TabsContent
            value="ai"
            className="min-w-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <Card className="min-w-0 overflow-hidden rounded-2xl border-border/40">
             
               <CodingAssistant
  projectId={project.id}
  conversationId={conversationId}
/>
              
            </Card>
          </TabsContent>
        </Tabs>

        {/* GitHub Dialog */}
        <Dialog
          open={githubDialogOpen}
          onOpenChange={setGithubDialogOpen}
        >
          <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect GitHub Repository</DialogTitle>

              <DialogDescription>
                Enter your GitHub repository URL or owner/repo.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 sm:py-4">
              <Input
                placeholder="e.g. facebook/react"
                value={repoInput}
                onChange={(event) =>
                  setRepoInput(event.target.value)
                }
                className="h-11 rounded-xl"
              />
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setGithubDialogOpen(false)}
                className="w-full rounded-xl sm:w-auto"
              >
                Cancel
              </Button>

              <Button className="w-full rounded-xl sm:w-auto">
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}