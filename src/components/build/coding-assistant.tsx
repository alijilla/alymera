"use client"

import { useEffect, useState } from "react"
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { DynamicToolUIPart, ToolUIPart } from "ai"
import { supabase } from "@/lib/supabase/client"
import { Bug, Lightbulb, ListTodo, Notebook, RotateCcw, Sparkle, Sparkles } from "lucide-react"
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

import { Button } from "../ui/button"

export function CodingAssistant({
  projectId,
  conversationId: conversationIdProp,
}: {
  projectId?: string
  conversationId?: string | null
})  {
  const [prompt, setPrompt] = useState("")

 
const [conversationId, setConversationId] =
  useState<string | null>(conversationIdProp ?? null)

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
      assistant: "coding",
      conversationId,
       projectId,
    },
  }),

    sendAutomaticallyWhen:
      lastAssistantMessageIsCompleteWithApprovalResponses,
  onData: (dataPart) => {
   if (dataPart.type === "data-conversationId") {
  if (typeof dataPart.data === "string") {
    setConversationId(dataPart.data)
  }
}
  },
})

  // --------------------------------------------------
  // Suggested prompt
  // --------------------------------------------------

  const handlePromptClick = (text: string) => {
    handleSubmit(text)
  }


useEffect(() => {
  async function loadConversation() {
    // No conversation ID means this is a new chat
    if (!conversationIdProp) {
  setConversationId(null)
  return
}

setConversationId(conversationIdProp)

    // Get messages for this conversation
    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content")
      .eq("conversation_id",conversationIdProp)
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
}, [conversationIdProp, setMessages])
  const isSubmitted = status === "submitted"
  const isStreaming = status === "streaming"
  const isLoading = isSubmitted || isStreaming

  // --------------------------------------------------
  // Send message
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

    }

    return labels[toolName] ?? "Working on it"
  }


  function isToolPart(
  part: { type: string }
): part is ToolUIPart | DynamicToolUIPart {
  return part.type.startsWith("tool-")
}
const handleSubmit = (text?: string) => {
  const message = (text ?? prompt).trim()

  if (!message || isLoading) return

  sendMessage({
    text: message,
  })

  setPrompt("")
}
  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">

      {/* Header */}
      <div className="border-b border-border/50 px-6 py-4 bg-muted/30">
        <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
          <span className="text-primary"><Sparkle className="w-4 h-4"/></span>
          Coding Assistant
        </h2>

        <p className="text-xs font-medium text-muted-foreground mt-0.5">
          Ask questions about your project and code.
        </p>
      </div>

      {/* Conversation */}
      <Conversation className="min-h-0 flex-1 bg-background/50">
        <ConversationContent className="p-4 md:p-6 space-y-4">

          {/* Welcome */}
          {messages.length === 0 && (
            <>
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center w-full max-w-2xl mx-auto">
                <div className="bg-primary/10 p-4 rounded-full mb-4 shadow-sm border border-primary/20">
                  <span className="text-4xl block animate-bounce">
                    💻
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">
                  Hi there! I&apos;m your Coding Assistant.
                </h3>

                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Feel free to ask me anything about how I can help you plan, write, or debug your code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mx-auto">

                <Button
                  variant="outline"
                  className="rounded-xl border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                  onClick={() =>
                    handlePromptClick(
                      "Help me break this task into smaller steps."
                    )
                  }
                >
                  <span className="mr-3 text-orange-400 text-lg">
                   <ListTodo className="w-4 h-4"/>
                  </span>

                  <span className="font-semibold text-sm text-left text-foreground">
                    Plan a task
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                  onClick={() =>
                    handlePromptClick(
                      "Help me debug this code."
                    )
                  }
                >
                  <span className="mr-3 text-green-500 text-lg">
                    <Bug className="w-4 h-4" />
                  </span>

                  <span className="font-semibold text-sm text-left text-foreground">
                    Debug code
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                  onClick={() =>
                    handlePromptClick(
                      "Explain this code to me."
                    )
                  }
                >
                  <span className="mr-3 text-blue-400 text-lg">
                    <Lightbulb className="w-4 h-4" />
                  </span>

                  <span className="font-semibold text-sm text-left text-foreground">
                    Explain code
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl border-border/50 bg-card hover:bg-muted/50 hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                  onClick={() =>
                    handlePromptClick(
                      "How can I improve this code?"
                    )
                  }
                >
                  <span className="mr-3 text-purple-400 text-lg">
                    <Notebook className="w-4 h-4" />
                  </span>

                  <span className="font-semibold text-sm text-left text-foreground">
                    Improve code
                  </span>
                </Button>

              </div>
            </>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <Message
              from={message.role as "user" | "assistant"}
              key={message.id}
            >
              <MessageContent from={message.role as "user" | "assistant"}>
                                 {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={index}>
                            {part.text}
                          </MessageResponse>
                        )
                      }

                      if (
                       isToolPart(part)
                      ) {
                        const toolName =
                          part.type.replace(
                            "tool-",
                            ""
                          )

                           if (part.state === "approval-requested") {
    return (
      <div
        key={index}
        className="rounded-lg border p-3"
      >
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-4" />
          <span className="font-medium">
            {getToolLabel(toolName)}
          </span>
        </div>

        <p className="mb-3 text-sm text-muted-foreground">
          Alymera wants to perform this action. Do you want to approve it?
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>{
                console.log("APPROVING TOOL:", {
    approvalId: part.approval.id,
    toolName,
  })
              addToolApprovalResponse({
                id: part.approval.id,
                approved: false,
                reason: "User denied the action",
              })
            }}
          >
            Deny
          </Button>

          <Button
            type="button"
            onClick={() =>
              addToolApprovalResponse({
                id: part.approval.id,
                approved: true,
              })
            }
          >
            Approve
          </Button>
        </div>
      </div>
    )
  }


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
          
          {/* Error */}
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

      {/* Input */}
      <div className="p-4 bg-card border-t border-border/50">

        <div className="max-w-3xl mx-auto w-full">
<PromptInput
  onSubmit={(message) => {
    handleSubmit(message.text)
  }}
  className="shrink-0 rounded-2xl border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10"
>

            <PromptInputTextarea
              placeholder="Ask Coding Assistant..."
              value={prompt}
              className="min-h-[50px] max-h-[250px] py-3.5 border-0 focus-visible:ring-0 resize-none rounded-2xl"
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />

            <div className="flex flex-col justify-end p-2 pb-2 pr-2">

              {isLoading ? (
                <PromptInputSubmit
                  type="button"
                  onClick={stop}
                  className="rounded-xl bg-destructive text-destructive-foreground shadow-sm transition-all h-9 w-9 flex items-center justify-center"
                >
                  ■
                </PromptInputSubmit>
              ) : (
                <PromptInputSubmit
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all h-9 w-9 flex items-center justify-center"
                  disabled={!prompt.trim()}
                />
              )}

            </div>

          </PromptInput>

          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground">
              Alymera AI can make mistakes. Consider verifying important information.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}