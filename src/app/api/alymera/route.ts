import { groq } from "@ai-sdk/groq"
import { createOpenAI } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
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

import {
  systemPrompts,
  careerFeaturePrompts,
} from "@/lib/ai/prompts"

export const maxDuration = 30
//const openrouter = createOpenAI({
  //apiKey: process.env.OPENROUTER_API_KEY,
 // baseURL: "https://openrouter.ai/api/v1",
//})

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
      applicationId,
      projectId,
      conversationId,
    }: {
      messages: UIMessage[]
      assistant: keyof typeof systemPrompts
      demo?: boolean
      feature?: string
      jobDescription?: string
      applicationId?: string
      projectId?: string
      conversationId?: string
    } = await req.json()

    // ============================================================
    // VALIDATE ASSISTANT
    // ============================================================

    const selectedPrompt = systemPrompts[assistant]

    if (!selectedPrompt) {
      return new Response("Invalid assistant.", {
        status: 400,
      })
    }

    const supabase = await createClient()

    // ============================================================
    // AUTH
    // ============================================================

    let user = null

    if (!demo) {
      const {
        data: { user: authenticatedUser },
      } = await supabase.auth.getUser()

      if (!authenticatedUser) {
        return new Response("Unauthorized.", {
          status: 401,
        })
      }

      user = authenticatedUser
    }

    // ============================================================
    // CAREER INTERVIEW / JOB MATCHING CONTEXT
    // ============================================================

    let resolvedJobDescription =
      jobDescription?.trim() || null

    let applicationContext = ""

    // ------------------------------------------------------------
    // If an application was selected, retrieve it from Supabase.
    // We use the user's own application as the source of truth.
    // ------------------------------------------------------------

    if (
      !demo &&
      user &&
      assistant === "career" &&
      applicationId
    ) {
      const { data: application, error: applicationError } =
        await supabase
          .from("applications")
          .select(
            `
              id,
              company,
              position,
              location,
              date_applied,
              status,
              job_description,
              job_url,
              notes
            `
          )
          .eq("id", applicationId)
          .eq("user_id", user.id)
          .maybeSingle()

      if (applicationError) {
        console.error(
          "Application lookup error:",
          applicationError
        )

        return new Response(
          "Failed to load application.",
          {
            status: 500,
          }
        )
      }

      if (!application) {
        return new Response(
          "Application not found.",
          {
            status: 404,
          }
        )
      }

      // Prefer the saved JD from the application.
      if (application.job_description?.trim()) {
        resolvedJobDescription =
          application.job_description.trim()
      }

      applicationContext = `
==================================================
APPLICATION CONTEXT
==================================================

Company:
${application.company || "Not provided"}

Position:
${application.position || "Not provided"}

Location:
${application.location || "Not provided"}

Application Status:
${application.status || "Not provided"}

Use this information only as context.
Do not invent responsibilities, requirements,
technologies, or company details that are not provided.
`
    }

    // ============================================================
    // FIND EXISTING CONVERSATION CONTEXT
    // ============================================================

    let existingConversation = null

    if (
      !demo &&
      user &&
      conversationId
    ) {
      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from("conversations")
        .select(
          "id, assistant, project_id, job_description"
        )
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (conversationError) {
        console.error(
          "Conversation lookup error:",
          conversationError
        )

        return new Response(
          "Failed to load conversation.",
          {
            status: 500,
          }
        )
      }

      if (!conversation) {
        return new Response(
          "Conversation not found.",
          {
            status: 404,
          }
        )
      }

      existingConversation = conversation

      // If this is a later interview turn and the client
      // didn't send the JD again, recover it from the conversation.
      if (
        assistant === "career" &&
        feature === "interview" &&
        !resolvedJobDescription &&
        conversation.job_description
      ) {
        resolvedJobDescription =
          conversation.job_description
      }
    }

    // ============================================================
    // CREATE CONVERSATION
    // ============================================================

    let activeConversationId = conversationId

    if (
      !demo &&
      user &&
      !activeConversationId
    ) {
   const { data: conversation, error: conversationError } =
  await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: "New conversation",
      assistant,
      project_id:
        assistant === "coding"
          ? projectId ?? null
          : null,

      job_description:
        assistant === "career" &&
        (feature === "job-matching" ||
          feature === "interview")
          ? resolvedJobDescription
          : null,

      interview_status:
        assistant === "career" &&
        feature === "interview"
          ? "active"
          : null,
    })
    .select("id")
    .single()

      if (conversationError) {
        console.error(
          "Conversation creation error:",
          conversationError
        )

        return new Response(
          "Failed to create conversation.",
          {
            status: 500,
          }
        )
      }

      activeConversationId = conversation.id
    }

    // ============================================================
    // SAVE / UPDATE JD ON EXISTING CONVERSATION
    // ============================================================

    if (
      !demo &&
      user &&
      activeConversationId &&
      assistant === "career" &&
      (feature === "job-matching" ||
        feature === "interview") &&
      resolvedJobDescription
    ) {
      const { error: updateError } =
        await supabase
          .from("conversations")
          .update({
            job_description:
              resolvedJobDescription,
          })
          .eq("id", activeConversationId)
          .eq("user_id", user.id)

      if (updateError) {
        console.error(
          "Failed to save job description:",
          updateError
        )
      }
    }

    // ============================================================
    // BUILD CAREER FEATURE PROMPT
    // ============================================================

    let featurePrompt: string | null = null

    if (
      assistant === "career" &&
      feature &&
      feature in careerFeaturePrompts
    ) {
      featurePrompt =
        careerFeaturePrompts[
          feature as keyof typeof careerFeaturePrompts
        ]
    }

    // ------------------------------------------------------------
    // JOB MATCHING
    // ------------------------------------------------------------

    if (
      assistant === "career" &&
      feature === "job-matching"
    ) {
      if (!resolvedJobDescription) {
        return new Response(
          JSON.stringify({
            error:
              "A job description is required for job matching.",
          }),
          {
            status: 400,
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        )
      }

      featurePrompt = `${featurePrompt ?? selectedPrompt}

${applicationContext}

==================================================
JOB DESCRIPTION
==================================================

${resolvedJobDescription}
`
    }

    // ------------------------------------------------------------
    // INTERVIEW
    // ------------------------------------------------------------

    if (
      assistant === "career" &&
      feature === "interview"
    ) {
      /*
       * JD is OPTIONAL for interviews.
       *
       * If a JD exists:
       *   → make the interview role-specific.
       *
       * If no JD exists:
       *   → conduct general/resume-based interview practice.
       */

      if (resolvedJobDescription) {
        featurePrompt = `${featurePrompt ?? selectedPrompt}

${applicationContext}

==================================================
TARGET JOB DESCRIPTION
==================================================

${resolvedJobDescription}

==================================================
INTERVIEW CONTEXT
==================================================

This interview is specifically for the target role
described above.

Use BOTH:
1. The job description — what the employer is looking for.
2. The user's saved resume — what the user actually knows,
   has built, and has experienced.

Prioritize questions that realistically reflect this role.

Do not invent requirements or experience.
`
      } else {
        featurePrompt = `${featurePrompt ?? selectedPrompt}

${applicationContext}

==================================================
GENERAL INTERVIEW CONTEXT
==================================================

No job description is currently available.

Conduct the interview using the user's saved resume
and general interview expectations.

Do not pretend that you know the exact requirements
of a specific employer or role.
`
      }
    }

    // ============================================================
    // FINAL SYSTEM PROMPT
    // ============================================================

    const basePrompt =
      featurePrompt ?? selectedPrompt

    // ============================================================
    // SAVE USER MESSAGE
    // ============================================================

    if (
      !demo &&
      user &&
      activeConversationId
    ) {
      const latestUserMessage = [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "user"
        )

      if (latestUserMessage) {
        const content =
          latestUserMessage.parts
            .filter(
              (part) =>
                part.type === "text"
            )
            .map(
              (part) =>
                part.text
            )
            .join("\n")

        if (content.trim()) {
          const { error: messageError } =
            await supabase
              .from("messages")
              .insert({
                conversation_id:
                  activeConversationId,
                role: "user",
                content,
                type:
                  feature ===
                  "resume-analysis"
                    ? "resume-analysis"
                    : feature ===
                        "job-matching"
                      ? "job-matching"
                      : feature ===
                          "interview"
                        ? "interview"
                        : "chat",
              })

          if (messageError) {
            console.error(
              "User message save error:",
              messageError
            )
          }
        }
      }
    }

    // ============================================================
    // STREAM AI RESPONSE  {*/ model: openrouter("x-ai/grok-4.1-fast:free"),*/}
    // ============================================================

    const result = streamText({
   
     model: groq("openai/gpt-oss-120b"),

      system: basePrompt,

      messages:
        await convertToModelMessages(
          messages
        ),

      tools:
        assistant === "alymera"
          ? alymeraTools
          : assistant === "career"
            ? careerTools
            : assistant === "coding"
              ? codingTools
              : undefined,
      

      stopWhen: stepCountIs(5),

       maxRetries: 0,
    })

    // ============================================================
    // CREATE UI STREAM
    // ============================================================

  const stream = createUIMessageStream({
  originalMessages: messages,

  execute: async ({ writer }) => {
    if (!demo && activeConversationId) {
      writer.write({
        type: "data-conversationId",
        data: activeConversationId,
      })
    }

    const uiStream = result.toUIMessageStream()

    writer.merge(uiStream)
  },

  onError: (error) => {
    console.error("STREAM ERROR:", error)

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 429
    ) {
      return "You've reached the AI usage limit. Please try again later."
    }

    return "AI is temporarily unavailable. Please try again later."
  },
        // ========================================================
        // SAVE ASSISTANT RESPONSE
        // ========================================================

        onFinish: async ({
          messages:
            finishedMessages,
        }) => {
          if (
            !demo &&
            user &&
            activeConversationId
          ) {
            const responseMessage =
              finishedMessages
                .filter(
                  (message) =>
                    message.role ===
                    "assistant"
                )
                .at(-1)

            if (responseMessage) {
              const assistantContent =
                responseMessage.parts
                  .filter(
                    (part) =>
                      part.type ===
                      "text"
                  )
                  .map(
                    (part) =>
                      part.text
                  )
                  .join("\n")

              if (
                assistantContent.trim()
              ) {
                const {
                  error:
                    assistantMessageError,
                } =
                  await supabase
                    .from("messages")
                    .insert({
                      conversation_id:
                        activeConversationId,
                      role: "assistant",
                      content:
                        assistantContent,
                      type:
                        feature ===
                        "resume-analysis"
                          ? "resume-analysis"
                          : feature ===
                              "job-matching"
                            ? "job-matching"
                            : feature ===
                                "interview"
                              ? "interview"
                              : "chat",
                    })

                if (
                  assistantMessageError
                ) {
                  console.error(
                    "Assistant message save error:",
                    assistantMessageError
                  )
                }
              }
            }

            // Update conversation timestamp
            await supabase
              .from("conversations")
              .update({
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                activeConversationId
              )
              .eq(
                "user_id",
                user.id
              )
          }
        },
      })

    return createUIMessageStreamResponse({
      stream,
    })
  } catch (error: unknown) {
  console.error("AI error:", error)

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 429
  ) {
    return new Response(
      JSON.stringify({
        error:
          "You've reached the AI usage limit. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }

  return new Response(
    JSON.stringify({
      error:
        "Something went wrong. Please try again.",
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}}