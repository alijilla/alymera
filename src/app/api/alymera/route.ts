import { groq } from "@ai-sdk/groq"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"

import {
  getProjects,
  getProjectTasks,
  getProjectMilestones,
  getProjectProgress,
  getApplications,
  getResume,
  createProject,
  createTask,
  createMilestone,
  createApplication,
  UpdateTask,
  UpdateApplication,
} from "@/lib/ai/tools"

import { createClient } from "@/lib/supabase/server"
import { systemPrompts } from "@/lib/ai/prompts"

export const maxDuration = 30

export async function POST(req: Request) {

  const projectTools = {
  getProjects,
  getProjectTasks,
  getProjectMilestones,
  getProjectProgress,
  createProject,
  createTask,
  createMilestone,
  UpdateTask,
}

const careerTools = {
  getApplications,
  getResume,
  createApplication,
  UpdateApplication,
}

const alymeraTools = {
  ...projectTools,
  ...careerTools,
}

const codingTools = {
  getProjects,
  getProjectTasks,
  getProjectMilestones,
  getProjectProgress,
  createProject,
  createTask,
  createMilestone,
  UpdateTask,
}
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
     tools:
  assistant === "alymera"
    ? alymeraTools
    : assistant === "career"
      ? careerTools
      : assistant === "coding"
        ? codingTools
        : undefined,
      stopWhen: stepCountIs(5),
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