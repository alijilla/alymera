"use client"

import { useEffect, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { supabase } from "@/lib/supabase/client"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

import {
  Sparkles,
  Calendar,
  Briefcase,
  ListTodo,
  FileSearch,
  Square,
  RotateCcw,
} from "lucide-react"

import Mascot from "@/components/hero/Mascot"

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
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

import { Button } from "@/components/ui/button"

type AlymeraAssistantProps = {
  demo?: boolean
  conversationId?: string | null
}

export function AlymeraAssistant({
  demo = false,
  conversationId: existingConversationId = null,
}: AlymeraAssistantProps) {

  const [prompt, setPrompt] = useState("")
const [conversationId, setConversationId] = useState<string | null>(null)

const {
  messages,
  sendMessage,
  status,
  error,
  stop,
  setMessages,
} = useChat({
  transport: new DefaultChatTransport({
    api: "/api/alymera",
    body: {
      assistant: "alymera",
      demo,
      conversationId,
    },
  }),

  onData: (dataPart) => {
   if (dataPart.type === "data-conversationId") {
  if (typeof dataPart.data === "string") {
    setConversationId(dataPart.data)
  }
}
  },
})


useEffect(() => {
  async function loadConversation() {
    // No conversation ID means this is a new chat
    if (!existingConversationId) {
      setConversationId(null)
      return
    }

    // Keep the conversation ID
    setConversationId(existingConversationId)

    // Get messages for this conversation
    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content")
      .eq("conversation_id", existingConversationId)
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

    // Convert Supabase messages to AI SDK messages
    const restoredMessages = (data ?? []).map(
      (message) => ({
        id: message.id,
        role: message.role as "user" | "assistant",
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
}, [existingConversationId, setMessages])
  const isSubmitted = status === "submitted"
  const isStreaming = status === "streaming"
  const isLoading = isSubmitted || isStreaming

  // --------------------------------------------------
  // Send message
  // --------------------------------------------------

const handleSubmit = (text?: string) => {
  const message = (text ?? prompt).trim()

  if (!message || isLoading) return

  sendMessage({
    text: message,
  })

  setPrompt("")
}
  // --------------------------------------------------
  // Suggested prompt
  // --------------------------------------------------

  const handlePromptClick = (text: string) => {
    handleSubmit(text)
  }

  // --------------------------------------------------
  // Friendly tool names
  // --------------------------------------------------

  const getToolLabel = (toolName: string) => {
    const labels: Record<string, string> = {
      getProjects: "Checking your projects",
      getProjectTasks: "Checking your tasks",
      getProjectMilestones: "Checking your milestones",
      getProjectProgress: "Checking project progress",

      createProject: "Creating your project",
      createTask: "Creating your task",
      createMilestone: "Creating your milestone",

      UpdateTask: "Updating your task",

      getApplications: "Checking your applications",
      getResume: "Checking your resume",

      createApplication: "Creating your application",
      UpdateApplication: "Updating your application",
    }

    return labels[toolName] ?? "Working on it"
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="flex h-[min(700px,calc(100dvh-160px))] min-h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm sm:min-h-[580px]">
      {/* ===================================================== */}
      {/* CONVERSATION */}
      {/* ===================================================== */}
   
      <Conversation className="min-h-0 flex-1 bg-gradient-to-b from-background via-background to-muted/20">
        <ConversationContent
          className={`mx-auto flex w-full max-w-4xl flex-col space-y-6 p-3 sm:p-5 md:p-8 ${
            messages.length === 0
              ? "min-h-full justify-end"
              : ""
          }`}
        >
          {/* ================================================= */}
          {/* EMPTY STATE */}
          {/* ================================================= */}

          {messages.length === 0 ? (
            demo ? (
              /* ============================================= */
              /* DEMO */
              /* ============================================= */

              <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-8 pt-6 text-center sm:pt-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10">
                  <Sparkles className="h-8 w-8 text-orange-400" />
                </div>

                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Try Alymera AI
                </h3>

                <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                  Ask a question to experience Alymera&apos;s
                  conversational AI and streaming responses.
                </p>

                <div className="mt-5 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                  Public demonstration · No personal data connected
                </div>
              </div>
            ) : (
              /* ============================================= */
              /* NORMAL */
              /* ============================================= */

              <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-3 pb-6 pt-4 text-center sm:px-4 sm:pb-8 sm:pt-8">
                {/* Mascot */}
                <div className="mb-5 h-24 w-24 overflow-hidden rounded-full border border-primary/20 bg-primary/10 shadow-sm sm:mb-6 sm:h-32 sm:w-32">
                  <Canvas
                    camera={{
                      position: [0, 0, 3],
                    }}
                    dpr={[1, 1.5]}
                  >
                    <ambientLight intensity={1} />

                    <Environment preset="studio" />

                    <group position={[0, -0.5, 0]}>
                      <Mascot reducedMotion={false} />
                    </group>
                  </Canvas>
                </div>

                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How can I help you today?
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  I can help you manage projects, organize tasks,
                  track applications, and decide what to work on
                  next.
                </p>

                {/* AI model */}
                <div className="mt-4 flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>GPT-OSS 120B · Groq</span>
                </div>

                {/* Suggested prompts */}
                <div className="mt-8 w-full max-w-2xl sm:mt-10">
                  <p className="mb-3 px-1 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Try asking Alymera
                  </p>

                  <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                    <SuggestionButton
                      icon={
                        <ListTodo className="h-4 w-4 text-primary" />
                      }
                      text="What&apos;s my next priority?"
                      onClick={() =>
                        handlePromptClick(
                          "What's my next priority?"
                        )
                      }
                    />

                    <SuggestionButton
                      icon={
                        <Calendar className="h-4 w-4 text-green-500" />
                      }
                      text="Create a task for my project."
                      onClick={() =>
                        handlePromptClick(
                          "Create a task for my project."
                        )
                      }
                    />

                    <SuggestionButton
                      icon={
                        <Briefcase className="h-4 w-4 text-blue-500" />
                      }
                      text="Help me manage my job applications."
                      onClick={() =>
                        handlePromptClick(
                          "Help me manage my job applications."
                        )
                      }
                    />

                    <SuggestionButton
                      icon={
                        <FileSearch className="h-4 w-4 text-purple-500" />
                      }
                      text="Show me my upcoming deadlines."
                      onClick={() =>
                        handlePromptClick(
                          "Show me my upcoming deadlines."
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            /* ================================================= */
            /* CHAT */
            /* ================================================= */

            <div className="space-y-6 pb-4">
              {messages.map((message) => (
                <Message
                  from={message.role}
                  key={message.id}
                >
                  <MessageContent from={message.role}>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={index}>
                            {part.text}
                          </MessageResponse>
                        )
                      }

                      if (
                        part.type.startsWith("tool-")
                      ) {
                        const toolName =
                          part.type.replace(
                            "tool-",
                            ""
                          )

                        return (
                          <div
                            key={index}
                            className="my-2 flex w-fit max-w-full items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-2 shadow-sm"
                          >
                            <Sparkles className="h-4 w-4 shrink-0 text-primary" />

                            <span className="break-words text-sm font-medium text-muted-foreground">
                              {getToolLabel(toolName)}
                            </span>
                          </div>
                        )
                      }

                      return null
                    })}
                  </MessageContent>
                </Message>
              ))}

              {/* ================================================= */}
              {/* THINKING */}
              {/* ================================================= */}

              {isSubmitted && (
                <div className="flex items-center">
                  <div className="flex max-w-full items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2.5 sm:px-4 sm:py-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-primary" />

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

              {/* ================================================= */}
              {/* ERROR */}
              {/* ================================================= */}

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Something went wrong.
                      </p>

                      <p className="mt-1 text-xs text-destructive/80">
                        Alymera couldn&apos;t complete that
                        request. Please try again.
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
                            .find(
                              (message) =>
                                message.role === "user"
                            )

                        const textPart =
                          lastUserMessage?.parts.find(
                            (part) =>
                              part.type === "text"
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
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* ===================================================== */}
      {/* INPUT */}
      {/* ===================================================== */}

      <div className="border-t border-border/60 bg-card p-3 sm:p-4 md:p-5">
        <div className="mx-auto w-full max-w-3xl">
<PromptInput
  onSubmit={(message) => {
    handleSubmit(message.text)
  }}
  className="shrink-0 rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
>
            <PromptInputTextarea
              placeholder={
                demo
                  ? "Try asking Alymera..."
                  : "Ask Alymera anything..."
              }
              value={prompt}
              disabled={isLoading}
              className="min-h-[50px] max-h-[200px] resize-none rounded-2xl border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 sm:min-h-[52px] sm:py-3.5"
              onChange={(e) =>
                setPrompt(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
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
                  onClick={stop}
                  aria-label="Stop generating"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-sm transition-all duration-200 hover:scale-105 hover:bg-destructive/90 active:scale-95"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </PromptInputSubmit>
              ) : (
                <PromptInputSubmit
                  disabled={!prompt.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:scale-105 hover:bg-primary/90 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                />
              )}
            </div>
          </PromptInput>

          <p className="mt-2 px-2 text-center text-[10px] leading-4 text-muted-foreground">
            Alymera AI can make mistakes. Verify important
            information before relying on it.
          </p>
        </div>
      </div>
    </div>
  )
}

// ======================================================
// Suggestion Button
// ======================================================

function SuggestionButton({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode
  text: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="group h-auto min-h-14 w-full justify-start rounded-xl border-border/60 bg-card px-4 py-3 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm active:translate-y-0"
    >
      <span className="mr-3 flex shrink-0 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>

      <span className="break-words text-sm leading-5">
        {text}
      </span>
    </Button>
  )
}