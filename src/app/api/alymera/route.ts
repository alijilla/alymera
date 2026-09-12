import { groq } from "@ai-sdk/groq"
import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"

import { createClient } from "@/lib/supabase/server"
import { systemPrompts } from "@/lib/ai/prompts"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const {
      messages,
      assistant,
      demo = false,
    }: {
      messages: UIMessage[]
      assistant: keyof typeof systemPrompts
      demo?: boolean
    } = await req.json()

    const selectedPrompt = systemPrompts[assistant]

    if (!selectedPrompt) {
      return new Response("Invalid assistant.", {
        status: 400,
      })
    }

    // Require authentication for normal ALYMERA usage
    if (!demo) {
      const supabase = await createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return new Response("Unauthorized.", {
          status: 401,
        })
      }
    }

    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      system: selectedPrompt,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("AI error:", error)

    return new Response(
      "Sorry, something went wrong.",
      {
        status: 500,
      }
    )
  }
}