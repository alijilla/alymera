import { groq } from "@ai-sdk/groq"
import {
  convertToModelMessages,
  generateText,
  Output,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"
import {
  interviewSchema,
  jobMatchSchema,
  resumeAnalysisSchema,
} from "@/lib/ai/schemas"
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
  feature,
  jobDescription,
}: {
  messages: UIMessage[]
  assistant: keyof typeof systemPrompts
  demo?: boolean
  feature?: string
  jobDescription?: string
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


  if (assistant === "career" && feature === "interview") {
  const resumeResult = await getResume.execute(
    {},
    {
      toolCallId: "interview",
      messages: [],
      context: {},
    }
  )

  const interview = await generateText({
    model: groq("openai/gpt-oss-120b"),

    system: selectedPrompt,

    prompt: `
Generate interview preparation based on the user's resume
and the following job description.

Resume:
${JSON.stringify(resumeResult)}

Job Description:
${jobDescription ?? ""}
`,

    output: Output.object({
      schema: interviewSchema,
    }),
  })

  return Response.json(interview.output)
}
   
if (assistant === "career" && feature === "job-matching") {
  const resumeResult = await getResume.execute(
    {},
    {
      toolCallId: "job-matching",
      messages: [],
      context: {},
    }
  )

 const analysis = await generateText({
  model: groq("openai/gpt-oss-120b"),

  system: selectedPrompt,

  prompt: `
Compare the user's resume against the following job description.

Resume:
${JSON.stringify(resumeResult)}

Job Description:
${jobDescription ?? ""}
`,

  output: Output.object({
    schema: jobMatchSchema,
  }),
})

return Response.json(analysis.output)
}

if (assistant === "career" && feature === "resume-analysis") {
  const resumeResult = await getResume.execute(
    {},
    {
      toolCallId: "resume-analysis",
      messages: [],
      context: {},
    }
  )

  const analysis = await generateText({
    model: groq("openai/gpt-oss-120b"),

    system: selectedPrompt,

    prompt: `
Analyze the following resume and return your analysis.

Resume data:
${JSON.stringify(resumeResult)}
`,

    output: Output.object({
      schema: resumeAnalysisSchema,
    }),
  })

console.log("RESUME FOR ANALYSIS:", resumeResult)
console.log("RESUME ANALYSIS OUTPUT:", analysis.output)

return Response.json(analysis.output)
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