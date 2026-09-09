"use client";

import { CareerAssistant } from "@/components/career/assistant";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function CareerAssistantPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                 <Sparkles className="w-8 h-8 text-blue-500" />
                 Career Assistant
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Analyze job descriptions against your resume and get tailored insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
          </CardContent>
        </div>
      </Card>
      <CareerAssistant />
    </div>
  );
}
