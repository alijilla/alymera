import { Sparkles, ShieldCheck } from "lucide-react"

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { AlymeraAssistant } from "@/components/aly/alymera-assistant"

export default async function AlymeraAIPage({
  searchParams,
}: {
  searchParams: Promise<{
    conversationId?: string
  }>
}) {
  const params = await searchParams

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6 lg:p-8">
      <Card className="overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
              <Sparkles className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />

              <span className="break-words">
                Alymera AI
              </span>
            </CardTitle>

            <CardDescription className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              Your AI workspace assistant. Ask about projects,
              tasks, career, or what to work on next.
            </CardDescription>
          </div>

          <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                AI Assistant
              </span>

              <span>
                GPT-OSS 120B · Groq
              </span>
            </div>
          </div>
        </div>
      </Card>

      <section
        aria-label="Alymera AI assistant"
        className="w-full min-w-0"
      >
        <AlymeraAssistant
          conversationId={params.conversationId}
        />
      </section>
    </main>
  )
}