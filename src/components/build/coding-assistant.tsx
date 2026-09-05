"use client"
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


export  function CodingAssistant(){
    return (
        <>
              <Conversation>
            <ConversationContent>
                <Message from="user">
                    <MessageContent>
                        <MessageResponse>
                            Hello
                        </MessageResponse>
                    </MessageContent>
                </Message>

                   <Message from="assistant">
                    <MessageContent>
                        <MessageResponse>
                            pakyu
                        </MessageResponse>
                    </MessageContent>
                </Message>
               
            </ConversationContent>

             <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={(message, _event) => {
                console.log("Submitted:", message)
            }}>
                <PromptInputTextarea />
                <PromptInputSubmit />
            </PromptInput>
        
        </>
  
    )
}
