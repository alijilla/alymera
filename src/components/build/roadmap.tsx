"use client"

import { supabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CircleCheck, Circle } from "lucide-react"

type RoadmapProps = {
  projectId: string
}
    type Mile = {
    id: string
      project_id: string
    name: string
    description: string
    status: string
    due_date: string | null
  }

export function Roadmap({ projectId }: RoadmapProps) {
  const [mile, setIsMile] = useState<Mile[]>([])
   async function getMilestone(){
       try{
           const {data, error} = await supabase 
           .from("milestones") 
           .select("*")
           .eq("project_id", projectId);
         
   if (error) {
     console.log("Milestone fetch error:", error.message)
     return
   }
 
           setIsMile(data);
       
       } finally{
         
         }
   }
  useEffect(() =>
 {
 getMilestone()
 
 
 },[])



  return (
    <div className="space-y-4 max-w-4xl">
      {mile.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
          </div>
          <h3 className="text-lg font-bold mb-2">No Milestones Yet</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            You haven&apos;t added any milestones to this project&apos;s roadmap. 
            Milestones help you track major phases of your project.
          </p>
        </div>
      ) : (
        mile.map((milestone) => (
          <Card 
            key={milestone.id} 
            className="bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <CardContent className="flex items-start gap-4 p-5 md:p-6">

              <div className="mt-0.5 shrink-0 bg-background rounded-full shadow-sm p-1 border border-border/50">
                {milestone.status === "Complete" ? (
                  <CircleCheck className="h-6 w-6 text-green-500 fill-green-500/10" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/50" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-base md:text-lg text-foreground">
                    {milestone.name}
                  </h3>
                  
                  <div className="shrink-0">
                    <Badge 
                      variant={milestone.status === "Complete" ? "default" : "outline"} 
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        milestone.status === "Complete" ? "bg-green-500 hover:bg-green-600 text-white border-transparent" : "text-muted-foreground bg-muted/30"
                      }`}
                    >
                      {milestone.status}
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {milestone.description}
                  </p>
                </div>

                <p className="text-xs font-medium text-muted-foreground bg-muted/50 w-fit px-2.5 py-1 rounded-md border border-border/40 flex items-center">
                  <span className="opacity-75 mr-1">Due</span> 
                  <span className="text-foreground">{milestone.due_date}</span>
                </p>
              </div>

            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}