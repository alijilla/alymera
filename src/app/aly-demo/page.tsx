import { AlymeraAssistant } from "@/components/aly/alymera-assistant"

export default function AlymeraDemoPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Alymera AI
            </h1>

            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Demo
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Experience Alymera&apos;s AI-powered workspace assistant.
          </p>
        </div>

        <AlymeraAssistant demo />
      </div>
    </main>
  )
}