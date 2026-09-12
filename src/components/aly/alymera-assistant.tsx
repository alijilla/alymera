"use client";

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Briefcase, ListTodo, FileSearch } from "lucide-react";

export function AlymeraAssistant() {
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
    <div className="flex h-[600px] md:h-[700px] flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden transition-all duration-300">
      <Conversation className="min-h-0 flex-1 bg-background/50">
        <ConversationContent className="p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center w-full max-w-3xl mx-auto h-full">
              <div className="bg-orange-500/10 p-4 rounded-full mb-6 shadow-sm border border-orange-500/20">
                <Sparkles className="w-10 h-10 text-orange-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">How can I help you today?</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                I can help you manage your projects, track your career goals, and keep your workspace organized. Just ask!
              </p>
              
              <div className="mt-10 w-full max-w-2xl">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-left pl-2">Suggested prompts</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Button variant="outline" onClick={() => handlePromptClick("What's my next priority?")} className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left whitespace-normal">
                     <ListTodo className="w-4 h-4 text-primary mr-3 shrink-0" />
                     <span className="text-sm">What&apos;s my next priority?</span>
                  </Button>
                  <Button variant="outline" onClick={() => handlePromptClick("Create a task for my project.")} className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left whitespace-normal">
                     <Calendar className="w-4 h-4 text-green-500 mr-3 shrink-0" />
                     <span className="text-sm">Create a task for my project.</span>
                  </Button>
                  <Button variant="outline" onClick={() => handlePromptClick("Help me manage my job applications.")} className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left whitespace-normal">
                     <Briefcase className="w-4 h-4 text-blue-500 mr-3 shrink-0" />
                     <span className="text-sm">Help me manage my job applications.</span>
                  </Button>
                  <Button variant="outline" onClick={() => handlePromptClick("Show me my upcoming deadlines.")} className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left whitespace-normal">
                     <FileSearch className="w-4 h-4 text-purple-500 mr-3 shrink-0" />
                     <span className="text-sm">Show me my upcoming deadlines.</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
                       {/* Messages */}
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

          {/* Error */}
          {error && (
            <div className="text-sm text-destructive">
              Sorry, something went wrong. Please try again.
            </div>
          )}
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
  );
}
