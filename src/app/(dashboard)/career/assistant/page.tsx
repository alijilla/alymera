"use client";

import { CareerAssistant } from "@/components/career/assistant";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function CareerAssistantPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      <CareerAssistant />
    </div>
  );
}
