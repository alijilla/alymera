"use client";

import { useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, Calendar, Briefcase, ListTodo, FileSearch, ArrowRight } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: React.ReactNode;
};

export function AlymeraAssistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptClick = (text: string) => {
    setPrompt(text);
  };

  const handleSubmit = () => {
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setPrompt("");
    setIsLoading(true);

    // Mock AI response delay
    setTimeout(() => {
      setIsLoading(false);
      let responseContent: React.ReactNode = "I can help with that. Could you provide more details?";

      if (userMessage.includes("task")) {
        responseContent = (
          <div className="space-y-4 w-full">
            <p>I created this task for your project.</p>
            <Card className="bg-background border border-border/50 shadow-sm w-full max-w-sm rounded-xl">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">Implement Authentication</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">To Do</p>
                </div>
                <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Sep 12
                </div>
              </CardContent>
            </Card>
          </div>
        );
      } else if (userMessage.includes("application") || userMessage.includes("job")) {
        responseContent = (
          <div className="space-y-4 w-full">
            <p>I updated your application status.</p>
            <Card className="bg-background border border-border/50 shadow-sm w-full max-w-sm rounded-xl">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">Frontend Developer</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Company Name</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Interview
                </span>
              </CardContent>
            </Card>
          </div>
        );
      } else if (userMessage.includes("priority")) {
        responseContent = (
          <div className="space-y-4 w-full">
            <p>Based on your upcoming deadlines, here is what you should focus on today:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Review the design system pull request.</li>
              <li>Prepare for your Interview with XYZ Corp tomorrow.</li>
              <li>Complete the Kanban Board UI task.</li>
            </ul>
          </div>
        );
      }

      setMessages((prev) => [...prev, { role: "assistant", content: responseContent }]);
    }, 1000);
  };

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
                     <span className="text-sm">What's my next priority?</span>
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
              {messages.map((message, i) => (
                <Message from={message.role} key={i}>
                  <MessageContent>
                    <MessageResponse className="text-sm md:text-base leading-relaxed break-words">
                      {message.content}
                    </MessageResponse>
                  </MessageContent>
                </Message>
              ))}
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>
                       <div className="flex space-x-2 items-center h-6">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                      </div>
                    </MessageResponse>
                  </MessageContent>
                </Message>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-4 bg-card border-t border-border/50">
        <div className="max-w-3xl mx-auto w-full">
          <PromptInput onSubmit={handleSubmit} className="shrink-0 bg-background rounded-2xl border border-border/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
            <PromptInputTextarea
              placeholder="Ask Alymera..."
              value={prompt}
              className="min-h-[50px] max-h-[250px] py-3.5 border-0 focus-visible:ring-0 resize-none rounded-2xl"
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex flex-col justify-end p-2 pb-2 pr-2">
              <PromptInputSubmit
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all h-9 w-9 flex items-center justify-center"
                disabled={!prompt.trim() || isLoading}
              >
              </PromptInputSubmit>
            </div>
          </PromptInput>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">Alymera AI can make mistakes. Consider verifying important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
