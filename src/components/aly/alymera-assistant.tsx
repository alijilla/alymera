"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

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
  Calendar,
  Briefcase,
  ListTodo,
  FileSearch,
} from "lucide-react"
type AlymeraAssistantProps = {
  demo?: boolean
}
export function AlymeraAssistant({
  demo = false,
}: AlymeraAssistantProps)  {
  const [prompt, setPrompt] = useState("")

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/alymera",
      body: {
        assistant: "alymera",
         demo,
      },
    }),
  })

  // Chat status
  const isSubmitted = status === "submitted"
  const isStreaming = status === "streaming"
  const isLoading = isSubmitted || isStreaming

  // Suggested prompt
  const handlePromptClick = (text: string) => {
    setPrompt(text)
  }

  // Send message
  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return

    sendMessage({
      text: prompt.trim(),
    })

    setPrompt("")
  }

  return (
    <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:h-[700px]">

      {/* ========================================================= */}
      {/* CONVERSATION */}
      {/* ========================================================= */}

      <Conversation className="min-h-0 flex-1 bg-gradient-to-b from-background via-background to-muted/20">

        <ConversationContent className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">

{/* ========================================================= */}
{/* EMPTY STATE / CHAT */}
{/* ========================================================= */}

{messages.length === 0 ? (
  demo ? (
    /* ===================================================== */
    /* DEMO EMPTY STATE */
    /* ===================================================== */

    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-full border border-orange-500/20 bg-orange-500/10 p-4">
        <Sparkles className="h-10 w-10 text-orange-400" />
      </div>

      <h3 className="text-2xl font-bold">
        Try Alymera AI
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Ask a question to experience Alymera&apos;s
        conversational AI and streaming responses.
      </p>

      <p className="mt-4 text-xs text-muted-foreground">
        Public demonstration • No personal ALYMERA data connected
      </p>
    </div>
  ) : (
    /* ===================================================== */
    /* NORMAL ALYMERA EMPTY STATE */
    /* ===================================================== */

    <div className="flex h-full w-full max-w-3xl mx-auto flex-col items-center justify-center px-4 py-8 text-center">

      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        How can I help you today?
      </h3>

      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
        I can help you manage projects, organize tasks, track
        applications, and decide what to work on next.
      </p>

      {/* Suggested Prompts */}
      <div className="mt-10 w-full max-w-2xl">

        <p className="mb-3 px-1 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Try asking Alymera
        </p>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">

          <Button
            variant="outline"
            onClick={() =>
              handlePromptClick("What's my next priority?")
            }
            className="group h-auto min-h-14 justify-start rounded-xl border-border/60 bg-card px-4 py-3 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-sm"
          >
            <ListTodo className="mr-3 h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:scale-110" />

            <span className="text-sm">
              What&apos;s my next priority?
            </span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              handlePromptClick("Create a task for my project.")
            }
            className="group h-auto min-h-14 justify-start rounded-xl border-border/60 bg-card px-4 py-3 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500/30 hover:bg-muted/40 hover:shadow-sm"
          >
            <Calendar className="mr-3 h-4 w-4 shrink-0 text-green-500 transition-transform duration-200 group-hover:scale-110" />

            <span className="text-sm">
              Create a task for my project.
            </span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              handlePromptClick(
                "Help me manage my job applications."
              )
            }
            className="group h-auto min-h-14 justify-start rounded-xl border-border/60 bg-card px-4 py-3 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-muted/40 hover:shadow-sm"
          >
            <Briefcase className="mr-3 h-4 w-4 shrink-0 text-blue-500 transition-transform duration-200 group-hover:scale-110" />

            <span className="text-sm">
              Help me manage my job applications.
            </span>
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              handlePromptClick(
                "Show me my upcoming deadlines."
              )
            }
            className="group h-auto min-h-14 justify-start rounded-xl border-border/60 bg-card px-4 py-3 text-left whitespace-normal transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/30 hover:bg-muted/40 hover:shadow-sm"
          >
            <FileSearch className="mr-3 h-4 w-4 shrink-0 text-purple-500 transition-transform duration-200 group-hover:scale-110" />

            <span className="text-sm">
              Show me my upcoming deadlines.
            </span>
          </Button>

        </div>
      </div>
    </div>
  )
) : (
  /* ========================================================= */
  /* CHAT MESSAGES */
  /* ========================================================= */

  <div className="space-y-6 pb-4">

    {messages.map((message) => (
      <Message
        from={message.role}
        key={message.id}
      >
        <MessageContent>
          {message.parts.map((part, index) =>
            part.type === "text" ? (
              <MessageResponse key={index}>
                {part.text}
              </MessageResponse>
            ) : null
          )}
        </MessageContent>
      </Message>
    ))}

    {/* THINKING INDICATOR */}

    {status === "submitted" && (
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

    {/* ERROR */}

    {error && (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Sorry, something went wrong. Please try again.
      </div>
    )}

  </div>
)}

        </ConversationContent>

        <ConversationScrollButton />

      </Conversation>


      {/* ========================================================= */}
      {/* INPUT AREA */}
      {/* ========================================================= */}

      <div className="border-t border-border/60 bg-card p-4 md:p-5">

        <div className="mx-auto w-full max-w-3xl">

          <PromptInput
            onSubmit={handleSubmit}
            className="
              shrink-0
              rounded-2xl
              border
              border-border/60
              bg-background/80
              shadow-sm
              backdrop-blur-sm
              transition-all
              duration-200
              focus-within:border-primary/50
              focus-within:ring-4
              focus-within:ring-primary/10
            "
          >

            <PromptInputTextarea
              placeholder="Ask Alymera anything..."
              value={prompt}
              className="
                min-h-[52px]
                max-h-[250px]
                resize-none
                rounded-2xl
                border-0
                bg-transparent
                px-4
                py-3.5
                text-sm
                placeholder:text-muted-foreground/60
                focus-visible:ring-0
              "
              onChange={(e) => setPrompt(e.target.value)}
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

            {/* ===================================================== */}
            {/* SEND / STOP BUTTON */}
            {/* ===================================================== */}

            <div className="flex flex-col justify-end p-2">

              {isLoading ? (

                <PromptInputSubmit
                  type="button"
                  onClick={stop}
                  aria-label="Stop generating"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-destructive
                    text-destructive-foreground
                    shadow-sm
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:bg-destructive/90
                    active:scale-95
                  "
                >
                  <span className="text-xs font-bold">
                    ■
                  </span>
                </PromptInputSubmit>

              ) : (

                <PromptInputSubmit
                  disabled={!prompt.trim()}
                  aria-label="Send message"
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary
                    text-primary-foreground
                    shadow-sm
                    transition-all
                    duration-200
                    hover:scale-105
                    hover:bg-primary/90
                    active:scale-95
                    disabled:pointer-events-none
                    disabled:opacity-40
                  "
                />

              )}

            </div>

          </PromptInput>


          {/* ===================================================== */}
          {/* DISCLAIMER */}
          {/* ===================================================== */}

          <p className="
            mt-2
            text-center
            text-[10px]
            leading-4
            text-muted-foreground
          ">
            Alymera AI can make mistakes. Consider verifying
            important information.
          </p>

        </div>
      </div>

    </div>
  )
}