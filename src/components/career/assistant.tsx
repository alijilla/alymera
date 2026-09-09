"use client"
import { useState } from "react"
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
  const [jobDescription, setJobDescription] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function handleSubmit() {
    if (!jobDescription.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: jobDescription,
      }
    ]);

    setJobDescription("");

    // Mock AI Response
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `**Match Score:** 75%\n\n**Matched Skills:**\n- React\n- Next.js\n- TypeScript\n- Tailwind CSS\n\n**Missing Skills:**\n- GraphQL\n- Jest\n\n**Strengths:**\nYour experience with Next.js and Tailwind matches well with the core responsibilities of this role. You also have the required 3+ years of frontend experience.\n\n**Suggestions:**\nConsider highlighting any testing experience you have (even if not Jest specifically). You might want to brush up on GraphQL concepts before an interview.`,
      }
    ]);
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
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left">
                   <FileSearch className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Analyze a Job</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Paste a description to get a match score</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left">
                   <BookmarkPlus className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Add to Applications</div>
                     <div className="text-xs text-muted-foreground mt-0.5">"Add this job to my tracker"</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left">
                   <CheckCircle2 className="w-5 h-5 text-purple-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Update Status</div>
                     <div className="text-xs text-muted-foreground mt-0.5">"Mark XYZ Corp as Interview"</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left">
                   <Map className="w-5 h-5 text-orange-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Find Next Step</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Get career path suggestions</div>
                   </div>
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <Message from={message.role} key={i}>
                <MessageContent>
                  <MessageResponse>
                    {message.content}
                  </MessageResponse>
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="p-4 bg-muted/20 border-t border-border/50">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
            Ask Career Assistant
          </label>
          <PromptInput onSubmit={handleSubmit} className="shrink-0 bg-background rounded-xl border border-border/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
            <PromptInputTextarea
              placeholder="Paste a job description or give me a command..."
              value={jobDescription}
              className="min-h-[60px] max-h-[250px] border-0 focus-visible:ring-0 resize-none rounded-xl"
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex flex-col justify-end p-2 pb-1 pr-1">
              <PromptInputSubmit
                className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all h-8 w-8 flex items-center justify-center"
                disabled={!jobDescription.trim()}
              >
              </PromptInputSubmit>
            </div>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
