import { z } from "zod"
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>
export type JobMatch = z.infer<typeof jobMatchSchema>
export type Interview = z.infer<typeof  interviewSchema>
export const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  atsExplanation: z.string(),

  professionalHeadline: z.string(),

  professionalSummary: z.string(),

  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  recommendations: z.array(z.string()),

  hireabilityAssessment: z.string(),
  hireabilityExplanation: z.string(),
})

export const jobMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),

  matchedSkills: z.array(z.string()),

  missingSkills: z.array(z.string()),

  strengths: z.array(z.string()),

  recommendations: z.array(z.string()),

  explanation: z.string(),
})

export const interviewSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      difficulty: z.string(),
      focus: z.string(),
    })
  ),

  preparationTips: z.array(z.string()),

  explanation: z.string(),
})