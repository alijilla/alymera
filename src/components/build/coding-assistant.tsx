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
  PromptInputBody,
} from "@/components/ai-elements/prompt-input"

import { Button } from "../ui/button"
type ChatMessage = {
    role:"user" | "assistant";
    content: string;
};
export  function CodingAssistant(){

    const [question, setQuestion] = useState(" ");
    const [answer, setAnswer] = useState(" ");
    const [messages, setMessages] = useState<ChatMessage[]>([])
    
    async function handleSubmit(){
         setMessages((previousMessages) => [
        ...previousMessages,
        {
            role:"user",
            content: question,
        }
    ]);
        setQuestion(" ")
        setMessages((previousMessages) => [
        ...previousMessages,
        {
            role:"assistant",
            content: "I can help you break down your project, organize your tasks, and provide coding suggestions.",
        }
    ]);

    }
   
   
    return (

      <div className="flex h-[600px] flex-col rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border/50 px-6 py-4 bg-muted/30">
                <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <span className="text-purple-500">✨</span> Coding Assistant
                </h2>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Ask questions about your project and code.
                </p>
              </div>
        
  <Conversation className="min-h-0 flex-1 bg-background/50">
            <ConversationContent className="p-4 md:p-6 space-y-4">

                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm py-12 text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4 shadow-sm border border-primary/20">
                          <span className="text-4xl block animate-bounce">👋</span>
                        </div>
                        <p className="font-semibold text-foreground text-base">Hi there! I&apos;m your Coding assistant.</p>
                        <p className="mt-1 text-xs max-w-xs mx-auto">Feel free to ask me anything about how I can help with your project!</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                        <Button
                            variant="outline"
                            className="rounded-xl border-border/50 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                            onClick={() =>
                                setQuestion("Help me break this task into smaller steps.")
                            }
                            >
                            <span className="mr-2 text-orange-400 text-lg">✨</span> 
                            <span className="font-medium text-sm text-left">Plan a task</span>
                            </Button>

                            <Button
                            variant="outline"
                            className="rounded-xl border-border/50 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                            onClick={() =>
                                setQuestion("Help me debug this code.")
                            }
                            >
                            <span className="mr-2 text-green-500 text-lg">🐛</span> 
                            <span className="font-medium text-sm text-left">Debug code</span>
                            </Button>

                            <Button
                            variant="outline"
                            className="rounded-xl border-border/50 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                            onClick={() =>
                                setQuestion("Explain this code to me.")
                            }
                            >
                            <span className="mr-2 text-blue-400 text-lg">💡</span> 
                            <span className="font-medium text-sm text-left">Explain code</span>
                            </Button>

                            <Button
                            variant="outline"
                            className="rounded-xl border-border/50 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all justify-start h-auto py-3 px-4 shadow-sm"
                            onClick={() =>
                                setQuestion("How can I improve this code?")
                            }
                            >
                            <span className="mr-2 text-purple-400 text-lg">📝</span> 
                            <span className="font-medium text-sm text-left">Improve code</span>
                            </Button>
               
                    </div>
                            
                
                   {messages.map((message, i) => (

                    <Message from={message.role} key={i} >
                    <MessageContent>
                        <MessageResponse>
                            {message.content}
                        </MessageResponse>
                    </MessageContent>
                </Message>
                   ))}      
            </ConversationContent>

             <ConversationScrollButton />
        </Conversation>
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <PromptInput onSubmit={handleSubmit} className="shrink-0 bg-background rounded-xl border border-border/50 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all" >
                   <PromptInputTextarea 
                   placeholder="Ask about your code..."
                     value={question}
                     className="min-h-[44px] border-0 focus-visible:ring-0 resize-none rounded-xl"
                   onChange={(e) => setQuestion(e.target.value)} />
                  
                  <PromptInputSubmit   
                  className="rounded-lg mr-1 mb-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                  size="icon-sm" 
                  disabled={!question.trim()}/>
                </PromptInput> 
              </div>
        
</div>
  
    )
}

