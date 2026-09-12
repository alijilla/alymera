"use client"
import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

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

import type {
  ResumeAnalysis,
  JobMatch,
  Interview,
} from "@/lib/ai/schemas"
export function CareerAssistant() {

  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null)
const [isAnalyzingResume, setIsAnalyzingResume] = useState(false)
const [resumeAnalysisError, setResumeAnalysisError] = useState<string | null>(null)

  const [prompt, setPrompt] = useState("")
const [jobDescription, setJobDescription] = useState("")


const [jobMatch, setJobMatch] = useState<JobMatch | null>(null)
const [isMatchingJob, setIsMatchingJob] = useState(false)
const [jobMatchError, setJobMatchError] = useState<string | null>(null)

const [interview, setInterview] = useState<Interview | null>(null)
const [isGeneratingInterview, setIsGeneratingInterview] = useState(false)
const [interviewError, setInterviewError] = useState<string | null>(null)



  const analyzeResume = async () => {
  setIsAnalyzingResume(true)
  setResumeAnalysisError(null)

  try {
    const response = await fetch("/api/alymera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [],
        assistant: "career",
        demo: false,
        feature: "resume-analysis",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze resume.")
    }

    const data = await response.json()

    setResumeAnalysis(data)
  } catch (error) {
    console.error(error)
    setResumeAnalysisError(
      "Unable to analyze your resume. Please try again."
    )
  } finally {
    setIsAnalyzingResume(false)
  }
}

const jobMatching = async () => {
  setIsMatchingJob(true)
  setJobMatchError(null)

  try {
    const response = await fetch("/api/alymera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [],
        assistant: "career",
        demo: false,
        feature: "job-matching",
        jobDescription,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to match job.")
    }

    const data = await response.json()

    setJobMatch(data)
  } catch (error) {
    console.error(error)
    setJobMatchError(
      "Unable to analyze this job description. Please try again."
    )
  } finally {
    setIsMatchingJob(false)
  }
}

const interviewing = async () => {
  setIsGeneratingInterview(true)
  setInterviewError(null)

  try {
    const response = await fetch("/api/alymera", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [],
        assistant: "career",
        demo: false,
        feature: "interview",
        jobDescription,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate interview.")
    }

    const data = await response.json()

    setInterview(data)
  } catch (error) {
    console.error(error)
    setInterviewError(
      "Unable to generate interview questions. Please try again."
    )
  } finally {
    setIsGeneratingInterview(false)
  }
}



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
      assistant: "career",
    },
  }),
})

  // Chat status
  const isSubmitted = status === "submitted"
  const isStreaming = status === "streaming"
  const isLoading = isSubmitted || isStreaming

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
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Analyze this job description and give me a match score: ")
                            }>
                   <FileSearch className="w-5 h-5 text-blue-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Analyze a Job</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Paste a description to get a match score</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Add this job to my tracker: ")
                            }>
                   <BookmarkPlus className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Add to Applications</div>
                     <div className="text-xs text-muted-foreground mt-0.5">&rdquo;Add this job to my tracker&rdquo;</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left"
                 onClick={() =>
                                handlePromptClick("Mark [Company] as [Status]")
                            }>
                   <CheckCircle2 className="w-5 h-5 text-purple-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Update Status</div>
                     <div className="text-xs text-muted-foreground mt-0.5">&rdquo;Mark XYZ Corp as Interview&rdquo;</div>
                   </div>
                </Button>
                <Button variant="outline" className="h-auto py-3 px-4 rounded-xl justify-start bg-card hover:bg-muted/50 border-border/50 hover:border-primary/30 transition-all text-left" onClick={() =>
                                handlePromptClick("Based on my current applications and skills, what should my next career step be?")
                            }>
                   <Map className="w-5 h-5 text-orange-400 mr-3 shrink-0" />
                   <div>
                     <div className="font-semibold text-sm text-foreground">Find Next Step</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Get career path suggestions</div>
                   </div>
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
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
            
          ))
     
          
          )}

          {/* THINKING INDICATOR */}
        
            {status === "submitted" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
        
                  <Sparkles className="h-4 w-4 text-primary" />
        
                  <span className="text-sm text-muted-foreground">
                    Alymera is thinking
                  </span>
        
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </span>
        
                </div>
              </div>
            )}
        
          {error && (
            <div className="text-sm text-destructive">
              Sorry, something went wrong. Please try again.
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
          <div className="space-y-2">
  <label className="text-sm font-medium">
    Job Description
  </label>

  <textarea
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
    placeholder="Paste a job description here..."
    className="min-h-[160px] w-full rounded-lg border bg-background p-3 text-sm"
  />
</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
  <Button
    variant="outline"
    onClick={analyzeResume}
    disabled={isAnalyzingResume}
    className="h-auto flex-col gap-2 py-4"
  >
    <FileSearch className="h-5 w-5" />
    <span>
      {isAnalyzingResume ? "Analyzing..." : "Analyze Resume"}
    </span>
  </Button>

  <Button
    variant="outline"
    onClick={jobMatching}
    disabled={isMatchingJob}
    className="h-auto flex-col gap-2 py-4"
  >
    <Map className="h-5 w-5" />
    <span>
      {isMatchingJob ? "Matching..." : "Job Matching"}
    </span>
  </Button>

  <Button
    variant="outline"
    onClick={interviewing}
    disabled={isGeneratingInterview}
    className="h-auto flex-col gap-2 py-4"
  >
    <CheckCircle2 className="h-5 w-5" />
    <span>
      {isGeneratingInterview ? "Generating..." : "Interview Prep"}
    </span>
  </Button>
</div>

{resumeAnalysis && (
  <div className="mt-6 space-y-5 rounded-xl border p-5">
    <div>
      <h3 className="text-lg font-semibold">Resume Analysis</h3>
      <p className="text-sm text-muted-foreground">
        AI analysis of your stored resume.
      </p>
    </div>

    <div className="text-center">
      <p className="text-sm text-muted-foreground">ATS Score</p>
      <p className="text-4xl font-bold">
        {resumeAnalysis.atsScore}/100
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {resumeAnalysis.atsExplanation}
      </p>
    </div>

    <div>
      <h4 className="font-medium">Professional Headline</h4>
      <p className="text-sm text-muted-foreground">
        {resumeAnalysis.professionalHeadline}
      </p>
    </div>

    <div>
      <h4 className="font-medium">Professional Summary</h4>
      <p className="text-sm text-muted-foreground">
        {resumeAnalysis.professionalSummary}
      </p>
    </div>

    <div>
      <h4 className="font-medium">Strengths</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {resumeAnalysis.strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Weaknesses</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {resumeAnalysis.weaknesses.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Recommendations</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {resumeAnalysis.recommendations.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">
        Hireability Assessment
      </h4>
      <p className="text-sm">
        {resumeAnalysis.hireabilityAssessment}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {resumeAnalysis.hireabilityExplanation}
      </p>
    </div>
  </div>
)}

{jobMatch && (
  <div className="mt-6 space-y-5 rounded-xl border p-5">
    <div>
      <h3 className="text-lg font-semibold">Job Match</h3>
      <p className="text-sm text-muted-foreground">
        How well your resume matches this job description.
      </p>
    </div>

    <div className="text-center">
      <p className="text-sm text-muted-foreground">
        Match Score
      </p>
      <p className="text-4xl font-bold">
        {jobMatch.matchScore}/100
      </p>
    </div>

    <div>
      <h4 className="font-medium">Matched Skills</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {jobMatch.matchedSkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Missing Skills</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {jobMatch.missingSkills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Strengths</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {jobMatch.strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Recommendations</h4>
      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {jobMatch.recommendations.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Explanation</h4>
      <p className="text-sm text-muted-foreground">
        {jobMatch.explanation}
      </p>
    </div>
  </div>
)}

{interview && (
  <div className="mt-6 space-y-5 rounded-xl border p-5">
    <div>
      <h3 className="text-lg font-semibold">
        Interview Preparation
      </h3>
      <p className="text-sm text-muted-foreground">
        AI-generated interview questions based on the
        resume and job description.
      </p>
    </div>

    <div className="space-y-4">
      <h4 className="font-medium">Interview Questions</h4>

      {interview.questions.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border p-4"
        >
          <p className="font-medium">
            {index + 1}. {item.question}
          </p>

          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Category:</span>{" "}
              {item.category}
            </p>

            <p>
              <span className="font-medium">Difficulty:</span>{" "}
              {item.difficulty}
            </p>

            <p>
              <span className="font-medium">Focus:</span>{" "}
              {item.focus}
            </p>
          </div>
        </div>
      ))}
    </div>

    <div>
      <h4 className="font-medium">Preparation Tips</h4>

      <ul className="list-disc pl-5 text-sm text-muted-foreground">
        {interview.preparationTips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>

    <div>
      <h4 className="font-medium">Explanation</h4>
      <p className="text-sm text-muted-foreground">
        {interview.explanation}
      </p>
    </div>
  </div>
)}

          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
              Alymera AI can make mistakes. Consider verifying important information.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
