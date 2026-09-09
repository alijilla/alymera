"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, Trash2, Save, Briefcase, GraduationCap, PencilLine, FileText } from "lucide-react";
import { mockResume } from "@/lib/mocks/career";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function ResumePage() {
  const [loading, setLoading] = useState(false);
  const resume = mockResume;

  const [isExpDialogOpen, setIsExpDialogOpen] = useState(false);
  const [isEduDialogOpen, setIsEduDialogOpen] = useState(false);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <FileText className="w-8 h-8 text-primary" />
                Resume
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Your professional profile, used by Alymera AI to match you with jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-border/50 shadow-sm transition-all hover:bg-muted/50">
                <Upload size={16} className="mr-2 text-primary" />
                Upload PDF
              </Button>
              <Button className="rounded-xl shadow-sm transition-all hover:scale-105">
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Personal Info, Summary, Skills) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue={resume.personal.name} placeholder="John Doe" className="rounded-xl bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" defaultValue={resume.personal.email} placeholder="john@example.com" className="rounded-xl bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={resume.personal.phone} placeholder="+1 234 567 8900" className="rounded-xl bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input defaultValue={resume.personal.location} placeholder="City, State" className="rounded-xl bg-muted/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[120px] rounded-xl bg-muted/20 resize-none" 
                defaultValue={resume.summary}
                placeholder="Write a brief summary of your professional background..." 
              />
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                className="min-h-[100px] rounded-xl bg-muted/20 resize-none" 
                defaultValue={resume.skills.join(', ')}
                placeholder="React, Next.js, TypeScript..." 
              />
              <p className="text-xs text-muted-foreground mt-2 font-medium">Separate skills with commas.</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Experience, Education, Projects) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Experience */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-500" />
                  Experience
                </CardTitle>
                <CardDescription className="font-medium mt-1">Your work history</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.experience.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/10">
                  <Briefcase className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No experience added yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Add your work experience to build your professional profile.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{exp.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{exp.company}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {exp.startDate} – {exp.endDate || "Present"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                          <PencilLine size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Dialog open={isExpDialogOpen} onOpenChange={setIsExpDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 rounded-xl border-dashed border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all font-medium">
                    <Plus size={16} className="mr-2" /> Add Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Experience</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input placeholder="e.g. Frontend Developer" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input placeholder="e.g. Tech Corp" className="rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="e.g. Remote" className="rounded-lg" />
                      </div>
                      <div className="flex items-end pb-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="current" className="rounded" />
                          <label htmlFor="current" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Currently Working
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="month" className="rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input type="month" className="rounded-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea placeholder="Describe your responsibilities and achievements..." className="min-h-[100px] rounded-lg resize-none" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExpDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={() => setIsExpDialogOpen(false)} className="rounded-xl">Save Experience</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                  Education
                </CardTitle>
                <CardDescription className="font-medium mt-1">Your academic background</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.education.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/10">
                  <GraduationCap className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">No education added yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Add your education history to complete your resume.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resume.education.map((edu, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{edu.degree}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{edu.school}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {edu.startDate} – {edu.endDate || "Present"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                          <PencilLine size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Dialog open={isEduDialogOpen} onOpenChange={setIsEduDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-2 rounded-xl border-dashed border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all font-medium">
                    <Plus size={16} className="mr-2" /> Add Education
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Education</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input placeholder="e.g. B.S. Computer Science" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label>School</Label>
                      <Input placeholder="e.g. State University" className="rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="month" className="rounded-lg" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input type="month" className="rounded-lg" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEduDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={() => setIsEduDialogOpen(false)} className="rounded-xl">Save Education</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">Projects</CardTitle>
                <CardDescription className="font-medium mt-1">Notable work</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               {resume.projects.map((proj, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/20 transition-colors gap-4">
                    <div>
                      <h3 className="font-bold text-foreground">{proj.name}</h3>
                      <p className="text-xs font-medium text-primary mt-0.5">{proj.technologies?.join(', ')}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2">{proj.description}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                        <PencilLine size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 rounded-xl border-dashed border-border/60 hover:bg-muted/50 hover:border-primary/30 transition-all font-medium">
                  <Plus size={16} className="mr-2" /> Add Project
                </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
