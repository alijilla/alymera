"use client"

import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai"
import { useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { supabase } from "@/lib/supabase/client"
import type { DynamicToolUIPart, ToolUIPart } from "ai"

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"

import { Button } from "@/components/ui/button"

import {
  Sparkles,
  FileSearch,
  CheckCircle2,
  BookmarkPlus,
  Map,
  Briefcase,
  FileText,
  Brain,
  ArrowLeft,
  X,
  RotateCcw,
} from "lucide-react"

type CareerFeature =
  | "resume-analysis"
  | "job-matching"
  | "interview"
  | null

type InterviewMode =
  | "choose"
  | "application"
  | "job-description"
  | null

type Application = {
  id: string
  company: string
  position: string
  location: string | null
  date_applied: string | null
  status: string
  job_description: string | null
  job_url: string | null
  notes: string | null
  created_at: string
}

export function CareerAssistant({
  conversationId: conversationIdProp,
}: {
  conversationId?: string | null
}) {
  // --------------------------------------------------
  // Career Feature State
  // --------------------------------------------------

  const [activeFeature, setActiveFeature] =
    useState<CareerFeature>(null)

  // --------------------------------------------------
  // Interview State
  // --------------------------------------------------

  const [interviewMode, setInterviewMode] =
    useState<InterviewMode>(null)

  const [applications, setApplications] =
    useState<Application[]>([])

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null)

  const [loadingApplications, setLoadingApplications] =
    useState(false)

  // --------------------------------------------------
  // Chat State
  // --------------------------------------------------

  const [prompt, setPrompt] = useState("")

  /*
   * Stores the conversation ID created by the API
   * when starting a brand-new conversation.
   */
  const [createdConversationId, setCreatedConversationId] =
    useState<string | null>(null)

  const conversationId =
    conversationIdProp ??
    createdConversationId

  // --------------------------------------------------
  // Chat
  // --------------------------------------------------

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    addToolApprovalResponse,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/alymera",

      body: {
        assistant: "career",
        conversationId,
      },
    }),

    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses,

    onData: (dataPart) => {
      if (
        dataPart.type ===
        "data-conversationId"
      ) {
        if (
          typeof dataPart.data === "string"
        ) {
          setCreatedConversationId(
            dataPart.data
          )
        }
      }
    },
  })

  // --------------------------------------------------
  // Load Existing Conversation
  // --------------------------------------------------

  useEffect(() => {
    if (!conversationIdProp) {
      return
    }

    async function loadConversation() {
      const { data, error } =
        await supabase
          .from("messages")
          .select(
            "id, role, content, type"
          )
          .eq(
            "conversation_id",
            conversationIdProp
          )
          .order("created_at", {
            ascending: true,
          })

      if (error) {
        console.error(
          "Failed to load conversation:",
          error
        )

        return
      }

      const restoredMessages =
        (data ?? []).map(
          (message) => ({
            id: message.id,

            role: message.role as
              | "user"
              | "assistant",

            parts: [
              {
                type: "text" as const,
                text: message.content,
              },
            ],
          })
        )

      setMessages(restoredMessages)
    }

    loadConversation()
  }, [
    conversationIdProp,
    setMessages,
  ])

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  const isSubmitted =
    status === "submitted"

  const isStreaming =
    status === "streaming"

  const isLoading =
    isSubmitted ||
    isStreaming

  // --------------------------------------------------
  // Input Placeholder
  // --------------------------------------------------

  const getInputPlaceholder = () => {
    if (
      activeFeature ===
      "job-matching"
    ) {
      return "Paste the job description here..."
    }

    if (
      activeFeature ===
      "interview"
    ) {
      if (
        interviewMode ===
        "job-description"
      ) {
        return "Paste the job description here..."
      }

      return "Answer the interview question..."
    }

    return "Ask Career Assistant..."
  }

  // --------------------------------------------------
  // Load Applications
  // --------------------------------------------------

  const loadApplications = async () => {
    setLoadingApplications(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setApplications([])
      setLoadingApplications(false)
      return
    }

    const { data, error } =
      await supabase
        .from("applications")
        .select(
          "id, company, position, location, date_applied, status, job_description, job_url, notes, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })

    if (error) {
      console.error(
        "Failed to load applications:",
        error
      )

      setLoadingApplications(false)
      return
    }

    setApplications(data ?? [])
    setLoadingApplications(false)
  }

  // --------------------------------------------------
  // Submit Message
  // --------------------------------------------------

  const handleSubmit = (
    text?: string
  ) => {
    const message =
      (text ?? prompt).trim()

    if (
      !message ||
      isLoading
    ) {
      return
    }

    // ------------------------------------------------
    // Job Matching
    // ------------------------------------------------

    if (
      activeFeature ===
      "job-matching"
    ) {
      sendMessage(
        {
          text: message,
        },
        {
          body: {
            assistant: "career",
            conversationId,
            feature:
              "job-matching",
            jobDescription:
              message,
          },
        }
      )

      setPrompt("")
      setActiveFeature(null)

      return
    }

    // ------------------------------------------------
    // Interview - Paste Job Description
    // ------------------------------------------------

    if (
      activeFeature ===
        "interview" &&
      interviewMode ===
        "job-description"
    ) {
      sendMessage(
        {
          text:
            "Start an interview for this job. Ask me one question at a time.\n\nJob Description:\n" +
            message,
        },
        {
          body: {
            assistant: "career",
            conversationId,
            feature:
              "interview",
            jobDescription:
              message,
          },
        }
      )

      setPrompt("")
      setInterviewMode(null)

      return
    }

    // ------------------------------------------------
    // Interview Answer
    // ------------------------------------------------

    if (
      activeFeature ===
      "interview"
    ) {
      sendMessage(
        {
          text: message,
        },
        {
          body: {
            assistant: "career",
            conversationId,
            feature:
              "interview",
          },
        }
      )

      setPrompt("")

      return
    }

    // ------------------------------------------------
    // Normal Career Chat
    // ------------------------------------------------

    setActiveFeature(null)

    sendMessage(
      {
        text: message,
      },
      {
        body: {
          assistant: "career",
          conversationId,
          feature: "chat",
        },
      }
    )

    setPrompt("")
  }

  // --------------------------------------------------
  // Quick Prompt
  // --------------------------------------------------

  const handlePromptClick = (
    text: string
  ) => {
    handleSubmit(text)
  }

  // --------------------------------------------------
  // Tool Labels
  // --------------------------------------------------

  const getToolLabel = (
    toolName: string
  ) => {
    const labels: Record<
      string,
      string
    > = {
      getProjects:
        "Checking your projects",

      getProjectTasks:
        "Checking your tasks",

      getProjectMilestones:
        "Checking your milestones",

      getProjectProgress:
        "Checking project progress",

      getApplications:
        "Checking your applications",

      getResume:
        "Checking your resume",

      createApplication:
        "Creating your application",

      UpdateApplication:
        "Updating your application",
    }

    return (
      labels[toolName] ??
      "Working on it"
    )
  }

  // --------------------------------------------------
  // Tool Part Helper
  // --------------------------------------------------

  function isToolPart(
    part: { type: string }
  ): part is
    | ToolUIPart
    | DynamicToolUIPart {
    return part.type.startsWith(
      "tool-"
    )
  }

  // --------------------------------------------------
  // Resume Analysis
  // --------------------------------------------------

  const analyzeResume = () => {
    if (isLoading) {
      return
    }

    setActiveFeature(
      "resume-analysis"
    )

    setInterviewMode(null)

    sendMessage(
      {
        text:
          "Analyze my saved resume.",
      },
      {
        body: {
          assistant: "career",
          conversationId,
          feature:
            "resume-analysis",
        },
      }
    )
  }

  // --------------------------------------------------
  // Job Matching
  // --------------------------------------------------

  const startJobMatching = () => {
    if (isLoading) {
      return
    }

    setActiveFeature(
      "job-matching"
    )

    setInterviewMode(null)
    setPrompt("")
  }

  // --------------------------------------------------
  // Interview Preparation
  // --------------------------------------------------

  const startInterview = () => {
    if (isLoading) {
      return
    }

    /*
     * Do not immediately send an AI message.
     *
     * First let the user choose:
     *
     * 1. Application Tracker
     * 2. Paste Job Description
     * 3. General Practice
     */

    setActiveFeature(
      "interview"
    )

    setInterviewMode(
      "choose"
    )

    setSelectedApplication(
      null
    )

    setPrompt("")

    loadApplications()
  }

  // --------------------------------------------------
  // Select Application
  // --------------------------------------------------

  const selectApplication = (
    application: Application
  ) => {
    setSelectedApplication(
      application
    )

    setInterviewMode(
      "application"
    )
  }

  // --------------------------------------------------
  // Start Application Interview
  // --------------------------------------------------

  const startApplicationInterview =
    () => {
      if (
        isLoading ||
        !selectedApplication
      ) {
        return
      }

      const jobDescription =
        selectedApplication
          .job_description
          ?.trim()

      sendMessage(
        {
          text:
            `Start an interview for my application.

Job Title:
${selectedApplication.position ?? "Unknown"}

Company:
${selectedApplication.company ?? "Unknown"}

${
  jobDescription
    ? `Job Description:
${jobDescription}`
    : "No job description is available for this application."
}

Ask me ONE interview question at a time.`,
        },
        {
          body: {
            assistant: "career",
            conversationId,
            feature:
              "interview",
            applicationId:
              selectedApplication.id,
            jobDescription:
              jobDescription ||
              undefined,
          },
        }
      )

      setInterviewMode(null)
      setSelectedApplication(null)
      setPrompt("")
    }

  // --------------------------------------------------
  // General Interview
  // --------------------------------------------------

  const startGeneralInterview =
    () => {
      if (isLoading) {
        return
      }

      sendMessage(
        {
          text:
            "Start a general interview practice session based on my saved resume. Ask me ONE question at a time and wait for my answer before continuing.",
        },
        {
          body: {
            assistant: "career",
            conversationId,
            feature:
              "interview",
          },
        }
      )

      setInterviewMode(null)
      setPrompt("")
    }

  // --------------------------------------------------
  // Back To Interview Choices
  // --------------------------------------------------

  const backToInterviewChoices =
    () => {
      if (isLoading) {
        return
      }

      setInterviewMode(
        "choose"
      )

      setSelectedApplication(
        null
      )

      setPrompt("")
    }

  // --------------------------------------------------
  // Cancel Interview Setup
  // --------------------------------------------------

  const cancelInterview = () => {
    if (isLoading) {
      return
    }

    setActiveFeature(null)
    setInterviewMode(null)
    setSelectedApplication(null)
    setPrompt("")
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[620px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="shrink-0 border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-4 py-3 sm:px-5 sm:py-4">

        <div className="flex min-w-0 items-center justify-between gap-3">

          <div className="min-w-0">

            <h2 className="flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">

              <Sparkles className="h-5 w-5 shrink-0 text-primary" />

              <span className="truncate">
                Career Assistant
              </span>

            </h2>

            <p className="mt-1 hidden text-xs font-medium leading-relaxed text-muted-foreground sm:block sm:text-sm">
              Analyze jobs, manage applications,
              and prepare for real interviews.
            </p>

          </div>

          <div className="hidden shrink-0 rounded-lg border border-border/50 bg-background/60 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground lg:block">
            AI · Career
          </div>

        </div>

      </div>

      {/* ==================================================
          CONVERSATION
      ================================================== */}

      <Conversation className="min-h-0 flex-1 bg-background/50">

        <ConversationContent className="mx-auto w-full max-w-5xl space-y-5 p-3 sm:p-4 md:p-6 lg:p-8">

          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {messages.length === 0 &&
            !activeFeature && (
              <div className="flex min-h-full w-full flex-col items-center justify-center px-2 py-8 text-center sm:py-12">

                <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-4 shadow-sm">

                  <Briefcase className="h-5 w-5" />

                </div>

                <h3 className="text-lg font-bold text-foreground sm:text-xl">
                  How can I help your career?
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  I can analyze your resume,
                  evaluate job opportunities,
                  manage applications, and
                  practice interviews with you.
                </p>

                <div className="mt-7 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* Analyze Job */}

                  <Button
                    variant="outline"
                    className="h-auto min-h-[76px] min-w-0 justify-start rounded-xl border-border/50 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                    onClick={() =>
                      startJobMatching()
                    }
                  >

                    <FileSearch className="mr-3 h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0">

                      <div className="text-sm font-semibold text-foreground">
                        Analyze a Job
                      </div>

                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Check whether a job is worth applying for
                      </div>

                    </div>

                  </Button>

                  {/* Add Application */}

                  <Button
                    variant="outline"
                    className="h-auto min-h-[76px] min-w-0 justify-start rounded-xl border-border/50 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                    onClick={() =>
                      handlePromptClick(
                        "Add this job to my tracker: "
                      )
                    }
                  >

                    <BookmarkPlus className="mr-3 h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0">

                      <div className="text-sm font-semibold text-foreground">
                        Add to Applications
                      </div>

                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Add a job to your tracker
                      </div>

                    </div>

                  </Button>

                  {/* Update Status */}

                  <Button
                    variant="outline"
                    className="h-auto min-h-[76px] min-w-0 justify-start rounded-xl border-border/50 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                    onClick={() =>
                      handlePromptClick(
                        "Mark [Company] as [Status]"
                      )
                    }
                  >

                    <CheckCircle2 className="mr-3 h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0">

                      <div className="text-sm font-semibold text-foreground">
                        Update Status
                      </div>

                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Mark a job as Interview,
                        Offer, etc.
                      </div>

                    </div>

                  </Button>

                  {/* Next Step */}

                  <Button
                    variant="outline"
                    className="h-auto min-h-[76px] min-w-0 justify-start rounded-xl border-border/50 bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                    onClick={() =>
                      handlePromptClick(
                        "Based on my current applications and skills, what should my next career step be?"
                      )
                    }
                  >

                    <Map className="mr-3 h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0">

                      <div className="text-sm font-semibold text-foreground">
                        Find Next Step
                      </div>

                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Get practical career advice
                      </div>

                    </div>

                  </Button>

                </div>

              </div>
            )}

          {/* ==================================================
              MESSAGES
          ================================================== */}

          {messages.map(
            (message) => (
              <Message
                from={message.role}
                key={message.id}
              >

                <MessageContent
                  from={
                    message.role as
                      | "user"
                      | "assistant"
                  }
                >

                  {message.parts.map(
                    (
                      part,
                      index
                    ) => {

                      // ----------------------------------------
                      // TEXT MESSAGE
                      // ----------------------------------------

                      if (
                        part.type ===
                        "text"
                      ) {
                        return (
                          <MessageResponse
                            key={index}
                          >
                            {
                              part.text
                            }
                          </MessageResponse>
                        )
                      }

                      // ----------------------------------------
                      // TOOL MESSAGE
                      // ----------------------------------------

                      if (
                        isToolPart(
                          part
                        )
                      ) {

                        const toolName =
                          part.type.replace(
                            "tool-",
                            ""
                          )

                        // ------------------------------------
                        // APPROVAL REQUEST
                        // ------------------------------------

                        if (
                          part.state ===
                          "approval-requested"
                        ) {
                          return (
                            <div
                              key={index}
                              className="rounded-lg border p-3"
                            >

                              <div className="mb-2 flex items-center gap-2">

                                <Sparkles className="size-4" />

                                <span className="font-medium">
                                  {
                                    getToolLabel(
                                      toolName
                                    )
                                  }
                                </span>

                              </div>

                              <p className="mb-3 text-sm text-muted-foreground">
                                Alymera wants to perform this
                                action. Do you want to approve it?
                              </p>

                              <div className="flex gap-2">

                                {/* DENY */}

                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    addToolApprovalResponse(
                                      {
                                        id:
                                          part.approval.id,
                                        approved:
                                          false,
                                        reason:
                                          "User denied the action",
                                      }
                                    )
                                  }}
                                >
                                  Deny
                                </Button>

                                {/* APPROVE */}

                                <Button
                                  type="button"
                                  onClick={() => {
                                    addToolApprovalResponse(
                                      {
                                        id:
                                          part.approval.id,
                                        approved:
                                          true,
                                      }
                                    )
                                  }}
                                >
                                  Approve
                                </Button>

                              </div>

                            </div>
                          )
                        }

                        // ------------------------------------
                        // TOOL EXECUTED / OTHER TOOL STATES
                        // ------------------------------------

                        return (
                          <div
                            key={index}
                            className="my-2 flex w-fit max-w-full items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2 shadow-sm"
                          >

                            <Sparkles className="h-4 w-4 shrink-0 text-primary" />

                            <span className="break-words text-sm font-medium text-muted-foreground">
                              {
                                getToolLabel(
                                  toolName
                                )
                              }
                            </span>

                          </div>
                        )
                      }

                      return null
                    }
                  )}

                </MessageContent>

              </Message>
            )
          )}

          {/* ==================================================
              INTERVIEW SETUP
              
              IMPORTANT:
              This comes AFTER messages so previous conversation
              stays above the interview setup.
          ================================================== */}

          {activeFeature ===
            "interview" && (
            <div className="w-full px-2 py-4 sm:px-4 sm:py-6">

              <div className="mx-auto w-full max-w-2xl">

                {/* ------------------------------------------
                    CHOOSE INTERVIEW MODE
                ------------------------------------------ */}

                {interviewMode ===
                  "choose" && (
                  <div className="text-center">

                    <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 p-4 shadow-sm">

                      <Brain className="h-6 w-6 text-primary" />

                    </div>

                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      Interview Prep
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                      Choose how you want to practice.
                      Alymera can tailor the interview
                      to a specific job or help you
                      practice generally.
                    </p>

                    <div className="mt-7 space-y-3">

                      {/* Application */}

                      <Button
                        variant="outline"
                        className="h-auto min-h-[82px] w-full justify-start rounded-xl border-border/50 bg-card px-4 py-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                        onClick={() =>
                          setInterviewMode(
                            "application"
                          )
                        }
                      >

                        <Briefcase className="mr-4 h-6 w-6 shrink-0 text-primary" />

                        <div className="min-w-0">

                          <div className="text-sm font-semibold text-foreground">
                            Practice for an application
                          </div>

                          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Choose a job from your Application Tracker.
                          </div>

                        </div>

                      </Button>

                      {/* Paste JD */}

                      <Button
                        variant="outline"
                        className="h-auto min-h-[82px] w-full justify-start rounded-xl border-border/50 bg-card px-4 py-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                        onClick={() =>
                          setInterviewMode(
                            "job-description"
                          )
                        }
                      >

                        <FileText className="mr-4 h-6 w-6 shrink-0 text-primary" />

                        <div className="min-w-0">

                          <div className="text-sm font-semibold text-foreground">
                            Use a job description
                          </div>

                          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Paste a JD for a specific role.
                          </div>

                        </div>

                      </Button>

                      {/* General */}

                      <Button
                        variant="outline"
                        className="h-auto min-h-[82px] w-full justify-start rounded-xl border-border/50 bg-card px-4 py-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                        onClick={
                          startGeneralInterview
                        }
                      >

                        <Brain className="mr-4 h-6 w-6 shrink-0 text-primary" />

                        <div className="min-w-0">

                          <div className="text-sm font-semibold text-foreground">
                            General practice
                          </div>

                          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Practice without a specific job.
                          </div>

                        </div>

                      </Button>

                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-5"
                      onClick={
                        cancelInterview
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                  </div>
                )}

                {/* ------------------------------------------
                    APPLICATION LIST
                ------------------------------------------ */}

                {interviewMode ===
                  "application" &&
                  !selectedApplication && (
                  <div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        backToInterviewChoices
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    <div className="mt-4 text-center">

                      <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 p-3">

                        <Briefcase className="h-5 w-5 text-primary" />

                      </div>

                      <h3 className="text-lg font-bold">
                        Choose an application
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Alymera will use the saved
                        application details and job
                        description to make the interview
                        more relevant.
                      </p>

                    </div>

                    <div className="mt-6 space-y-3">

                      {loadingApplications ? (
                        <div className="rounded-xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground">
                          Loading your applications...
                        </div>
                      ) : applications.length ===
                        0 ? (
                        <div className="rounded-xl border border-border/50 bg-card p-6 text-center">

                          <Briefcase className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />

                          <p className="text-sm font-semibold">
                            No applications found
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Add a job to your Application
                            Tracker first.
                          </p>

                        </div>
                      ) : (
                        applications.map(
                          (
                            application
                          ) => (
                            <button
                              key={
                                application.id
                              }
                              type="button"
                              onClick={() =>
                                selectApplication(
                                  application
                                )
                              }
                              className="w-full rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <div className="truncate text-sm font-semibold text-foreground">
                                    {
                                      application.position
                                    }
                                  </div>

                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {
                                      application.company
                                    }
                                  </div>

                                </div>

                                {application.status && (
                                  <span className="shrink-0 rounded-full border border-border/50 bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                    {
                                      application.status
                                    }
                                  </span>
                                )}

                              </div>

                            </button>
                          )
                        )
                      )}

                    </div>

                  </div>
                )}

                {/* ------------------------------------------
                    SELECTED APPLICATION
                ------------------------------------------ */}

                {interviewMode ===
                  "application" &&
                  selectedApplication && (
                  <div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedApplication(
                          null
                        )
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Applications
                    </Button>

                    <div className="mt-5 rounded-xl border border-border/50 bg-card p-5">

                      <div className="flex items-start gap-3">

                        <div className="rounded-lg bg-primary/10 p-2">

                          <Briefcase className="h-5 w-5 text-primary" />

                        </div>

                        <div className="min-w-0">

                          <h3 className="text-sm font-semibold">
                            {
                              selectedApplication.position
                            }
                          </h3>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              selectedApplication.company
                            }
                          </p>

                          {selectedApplication.status && (
                            <span className="mt-2 inline-block rounded-full border border-border/50 bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                              {
                                selectedApplication.status
                              }
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="mt-5 rounded-lg bg-muted/40 p-3">

                        <p className="text-xs leading-relaxed text-muted-foreground">

                          {selectedApplication.job_description
                            ? "The saved job description will be used to tailor your interview."
                            : "This application does not have a saved job description. You can still practice based on your resume and application details."}

                        </p>

                      </div>

                      <Button
                        className="mt-4 w-full"
                        onClick={
                          startApplicationInterview
                        }
                        disabled={
                          isLoading
                        }
                      >
                        Start Interview
                      </Button>

                    </div>

                  </div>
                )}

                {/* ------------------------------------------
                    PASTE JOB DESCRIPTION
                ------------------------------------------ */}

                {interviewMode ===
                  "job-description" && (
                  <div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        backToInterviewChoices
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    <div className="mt-5 text-center">

                      <div className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 p-3">

                        <FileText className="h-5 w-5 text-primary" />

                      </div>

                      <h3 className="text-lg font-bold">
                        Use a job description
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Paste the job description below.
                        Alymera will use it with your
                        saved resume to create a
                        role-specific interview.
                      </p>

                    </div>

                    <div className="mt-6">

                      <PromptInput
                        onSubmit={(
                          message
                        ) => {
                          handleSubmit(
                            message.text
                          )
                        }}
                        className="rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
                      >

                        <PromptInputTextarea
                          placeholder="Paste the job description here..."
                          value={prompt}
                          className="min-h-[150px] max-h-[300px] resize-none rounded-2xl border-0 py-3 focus-visible:ring-0"
                          onChange={(
                            e
                          ) =>
                            setPrompt(
                              e.target.value
                            )
                          }
                        />

                        <div className="flex flex-col justify-end p-2">

                          <PromptInputSubmit
                            aria-label="Start interview"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                            disabled={
                              !prompt.trim() ||
                              isLoading
                            }
                          />

                        </div>

                      </PromptInput>

                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ==================================================
              FEATURE STATUS
          ================================================== */}

          {activeFeature &&
            status ===
              "submitted" && (
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">

                <Sparkles className="h-4 w-4 animate-pulse text-primary" />

                <span className="text-sm text-muted-foreground">

                  {activeFeature ===
                  "resume-analysis"
                    ? "Analyzing your resume..."
                    : activeFeature ===
                        "job-matching"
                      ? "Analyzing this job..."
                      : activeFeature ===
                          "interview"
                        ? "Preparing your interview..."
                        : "Thinking..."}

                </span>

                <span className="flex gap-1">

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />

                </span>

              </div>

            </div>
          )}

          {/* ==================================================
              THINKING
          ================================================== */}

          {!activeFeature &&
            status ===
              "submitted" && (
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">

                <Sparkles className="h-4 w-4 text-primary" />

                <span className="text-sm text-muted-foreground">
                  Alymera is thinking
                </span>

                <span className="flex gap-1">

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />

                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />

                </span>

              </div>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

   {/* Error */}
{error && (
  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-destructive">
          AI assistant temporarily unavailable.
        </p>

        <p className="mt-1 text-xs text-destructive/80">
          The AI assistant may have reached its usage limit. Please try again later.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const lastUserMessage =
            [...messages]
              .reverse()
              .find((message) => message.role === "user")

          const textPart =
            lastUserMessage?.parts.find(
              (part) => part.type === "text"
            )

          if (textPart?.type === "text") {
            handleSubmit(textPart.text)
          }
        }}
        className="w-full rounded-lg sm:w-auto"
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  </div>
)}

        </ConversationContent>

        <ConversationScrollButton />

      </Conversation>

      {/* ==================================================
          INPUT AREA
      ================================================== */}

      <div className="shrink-0 border-t border-border/50 bg-card px-3 py-3 sm:px-4 sm:py-4">

        <div className="mx-auto w-full max-w-5xl space-y-3">

          {/* ==================================================
              ACTIVE FEATURE MESSAGE
          ================================================== */}

          {activeFeature ===
            "job-matching" && (
            <div className="flex flex-row rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">

              <p className="text-xs font-medium text-primary">

                Job Matching

                <br />

                <span className="mt-0.5 text-xs text-muted-foreground">
                  Paste the job description into
                  the message box below.
                </span>

              </p>

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveFeature(null)
                  setPrompt("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>

            </div>
          )}

          {/* ==================================================
              INTERVIEW STATUS / INSTRUCTIONS
          ================================================== */}

         {activeFeature ===
  "interview" &&
  interviewMode === null && (
  <div className="flex flex-row rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">

    <p className="text-xs font-medium text-primary">

      Interview Prep

      <br />

      <span className="mt-0.5 text-xs text-muted-foreground">

        Answer the interview question
        naturally. Alymera will evaluate
        your answer and continue.

        <br />

        Type <strong>end interview</strong>
        whenever you want to stop.

      </span>

    </p>

    <div className="flex-1" />

    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="ml-2 h-7 w-7 shrink-0"
      onClick={() => {
        setActiveFeature(null)
      }}
      aria-label="Close interview instructions"
    >
      <X className="h-4 w-4" />
    </Button>

  </div>
)}

          {/* ==================================================
              CHAT INPUT
              
              Hidden during interview setup.
              The job-description setup has its own input.
          ================================================== */}

          {!(
            activeFeature ===
              "interview" &&
            interviewMode !== null
          ) && (
            <PromptInput
              onSubmit={(
                message
              ) => {
                handleSubmit(
                  message.text
                )
              }}
              className="shrink-0 rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
            >

              <PromptInputTextarea
                placeholder={
                  getInputPlaceholder()
                }
                value={prompt}
                className="min-h-[48px] max-h-[120px] resize-none rounded-2xl border-0 py-3 focus-visible:ring-0"
                onChange={(e) =>
                  setPrompt(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                      "Enter" &&
                    !e.shiftKey
                  ) {

                    e.preventDefault()

                    handleSubmit()

                  }

                }}
              />

              <div className="flex flex-col justify-end p-2">

                {isLoading ? (

                  <PromptInputSubmit
                    type="button"
                    onClick={
                      stop
                    }
                    aria-label="Stop generating"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-sm"
                  >
                    ■
                  </PromptInputSubmit>

                ) : (

                  <PromptInputSubmit
                    aria-label="Send message"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    disabled={
                      !prompt.trim()
                    }
                  />

                )}

              </div>

            </PromptInput>
          )}

          {/* ==================================================
              CAREER ACTIONS
          ================================================== */}

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">

            {/* Resume */}

            <Button
              variant="outline"
              onClick={
                analyzeResume
              }
              disabled={
                isLoading ||
                activeFeature !== null
              }
              size="sm"
              className="w-full min-w-0 justify-start rounded-xl border-border/50 hover:bg-muted/50"
            >

              <FileSearch className="mr-2 h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                Analyze Resume
              </span>

            </Button>

            {/* Job Match */}

            <Button
              variant="outline"
              onClick={
                startJobMatching
              }
              disabled={
                isLoading ||
                activeFeature !== null
              }
              size="sm"
              className="w-full min-w-0 justify-start rounded-xl border-border/50 hover:bg-muted/50"
            >

              <Map className="mr-2 h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                Job Match
              </span>

            </Button>

            {/* Interview */}

            <Button
              variant="outline"
              onClick={
                startInterview
              }
              disabled={
                isLoading ||
                activeFeature !== null
              }
              size="sm"
              className="w-full min-w-0 justify-start rounded-xl border-border/50 hover:bg-muted/50"
            >

              <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-primary" />

              <span className="truncate">
                Interview Prep
              </span>

            </Button>

          </div>

          {/* Disclaimer */}

          <div className="text-center">

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Career Assistant can make mistakes.
              Verify important information.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}