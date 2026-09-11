"use client";
"use client"

import { Check, ArrowRight, Briefcase, FolderKanban } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import React from "react";
import { Html } from '@react-three/drei'

export default function Workspace() {
  return (

<group>

<Html
 transform position={[0, 0, 0.04]} scale={0.2}>
 <Card className="w-[300px] rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Alymera Workspace
          </p>

          <h2 className="mt-1 text-lg font-bold tracking-tight">
            Your workspace
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Projects</span>
            </div>

            <p className="text-xl font-bold">12</p>
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <p className="mb-2 text-[11px] font-medium text-muted-foreground">
              In Progress
            </p>

            <p className="text-xl font-bold">7</p>
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Career Match</span>
            </div>

            <p className="text-xl font-bold">92%</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Progress</span>
            <span className="text-xs font-medium text-muted-foreground">
              67%
            </span>
          </div>

          <Progress value={67} className="h-2" />
        </div>

        {/* Tasks */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" />
            </div>

            <span className="text-xs font-medium">
              Design landing page
            </span>
          </div>


          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-primary/30">
              <ArrowRight className="h-3 w-3 text-primary" />
            </div>

            <span className="text-xs font-medium">
              Apply to 5 jobs
            </span>

            <Badge
              variant="secondary"
              className="ml-auto rounded-md px-2 py-0.5 text-[10px]"
            >
              Next
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
</Html>
  </group> 
    
  );
}
