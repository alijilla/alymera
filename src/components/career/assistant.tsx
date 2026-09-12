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
import { Sparkles, FileSearch, CheckCircle2, BookmarkPlus, Map } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function CareerAssistant() {

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
        assistant: "coding",
      },
    }),
  })

  const isLoading =
    status === "submitted" || status === "streaming"

  const handlePromptClick = (text: string) => {
    setPrompt(text)
  }

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return

    sendMessage({
      text: prompt.trim(),
    })

    setPrompt("")
  }

  return (
    <div className="flex h-[700px] flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden transition-all duration-300">
      <div className="border-b border-border/50 px-6 py-5 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent">
        <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" /> Career Assistant
        </h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Analyze jobs, manage applications, and keep your job search organized.
        </p>
      </div>

      <Conversation className="min-h-0 flex-1 bg-background/50">
        <ConversationContent className="p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center w-full max-w-2xl mx-auto">
              <div className="bg-blue-500/10 p-4 rounded-full mb-4 shadow-sm border border-blue-500/20">
                <span className="text-4xl block animate-bounce">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">How can I help your career?</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                I can analyze job descriptions, track your applications, and recommend the next steps in your career journey.
              </p>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Analyze this job description and give me a match score: ")
                            }>
                   <FileSearch className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Analyze a Job</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Paste a description to get a match score</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Add this job to my tracker: ")
                            }>
                   <BookmarkPlus className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Add to Applications</div>
                     <div className="text-xs text-muted-foreground mt-0.5">&rdquo;Add this job to my tracker&rdquo;</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Mark [Company] as [Status]")
                            }>
                   <CheckCircle2 className="w-5 h-5 text-purple-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Update Status</div>
                     <div className="text-xs text-muted-foreground mt-0.5">&rdquo;Mark XYZ Corp as Interview&rdquo;</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left" onClick={() =>
                                handlePromptClick("Based on my current applications and skills, what should my next career step be?")
                            }>
                   <Map className="w-5 h-5 text-orange-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Find Next Step</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Get career path suggestions</div>
                   </div>
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
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
            
          ))
     
          
          )}

          {error && (
            <div className="text-sm text-destructive">
              Sorry, something went wrong. Please try again.
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

     {/* Input */}
      <div className="p-4 bg-card border-t border-border/50">

        <div className="max-w-3xl mx-auto w-full">

          <PromptInput
            onSubmit={handleSubmit}
            className="shrink-0 bg-background rounded-2xl border border-border/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all"
          >

            <PromptInputTextarea
              placeholder="Ask Alymera..."
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
            <p className="text-[10px] text-muted-foreground">
              Alymera AI can make mistakes. Consider verifying important information.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
