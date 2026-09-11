"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, Trash2, Save, Briefcase, GraduationCap, PencilLine, FileText, Award, FolderGit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase/client";

// --- Type Definitions ---
type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
};

type Skill = {
  id: string;
  skill: string;
  category: string;
};

type Experience = {
  id: string;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
};

type Education = {
  id: string;
  degree: string;
  school: string;
  start_date: string;
  end_date: string;
};

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issue_month: string | null;
  issue_year: string | null;
  credential_url: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  techStack?: string[];
  tech_stack?: string[]; // Supabase snake_case fallback
};

type ResumeProject = Project & {
  resume_project_id: string;
  project_id: string;
};

export default function ResumePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);

  // Data states
  const [personal, setPersonal] = useState<ProfileData>({ full_name: "", email: "", phone: "", location: "" });
  const [summary, setSummary] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [resumeProjects, setResumeProjects] = useState<ResumeProject[]>([]);

  const [allProjects, setAllProjects] = useState<Project[]>([]);

  // Dialog States - Personal
  const [editPersonalOpen, setEditPersonalOpen] = useState<boolean>(false);
  const [personalForm, setPersonalForm] = useState<ProfileData>({ full_name: "", email: "", phone: "", location: "" });

  // Dialog States - Summary
  const [editSummaryOpen, setEditSummaryOpen] = useState<boolean>(false);
  const [summaryForm, setSummaryForm] = useState<string>("");

  // Dialog States - Skills
  const [addSkillsOpen, setAddSkillsOpen] = useState<boolean>(false);
  const [skillsInput, setSkillsInput] = useState<string>("");
  
  // Dialog States - Experience
  const [expDialogOpen, setExpDialogOpen] = useState<boolean>(false);
  const [expForm, setExpForm] = useState({ id: null as string | null, title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });

  // Dialog States - Education
  const [eduDialogOpen, setEduDialogOpen] = useState<boolean>(false);
  const [eduForm, setEduForm] = useState({ id: null as string | null, degree: "", school: "", startDate: "", endDate: "" });

  // Dialog States - Certification
  const [certDialogOpen, setCertDialogOpen] = useState<boolean>(false);
  const [certForm, setCertForm] = useState({ id: null as string | null, name: "", issuer: "", date: "", credentialUrl: "" });

  // Dialog States - Projects
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState<boolean>(false);
  
  // Delete Confirmation States
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{type: string, id: string} | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) console.error("Auth error:", authErr);
      if (!user) return;
      setUserId(user.id);

      // Load Profile
      const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profileErr) console.error("Profile fetch error:", profileErr);
      
      if (profile) {
        setPersonal({
          full_name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || ""
        });
      }

      // Fetch Build Mode Projects
      const { data: projectsData, error: projectsErr } = await supabase.from('projects').select('*');
      if (projectsErr) console.error("Projects fetch error:", projectsErr);
      if (projectsData) setAllProjects(projectsData as Project[]);

      // Load or Create Resume - Using limit(1) to avoid PGRST116 (multiple rows) errors
      const { data: resumes, error: resumeFetchErr } = await supabase.from('resumes').select('*').eq('user_id', user.id).limit(1);
      if (resumeFetchErr) console.error("Resume fetch error:", resumeFetchErr);
      
      let resumeData = resumes && resumes.length > 0 ? resumes[0] : null;
      
      if (!resumeData) {
         const { data: newResume, error: insertResumeErr } = await supabase.from('resumes').insert({ user_id: user.id, prof_summary: "" }).select().single();
         if (insertResumeErr) console.error("Resume insert error:", insertResumeErr);
         resumeData = newResume;
      }

      if (resumeData) {
         setResumeId(resumeData.id);
         setSummary(resumeData.prof_summary || "");

         // Load Relational Data
         const [expRes, eduRes, certRes, skillsRes, rpRes] = await Promise.all([
           supabase.from('experiences').select('*').eq('resume_id', resumeData.id).order('start_date', { ascending: false }),
           supabase.from('educations').select('*').eq('resume_id', resumeData.id).order('start_date', { ascending: false }),
           supabase.from('certifications').select('*').eq('resume_id', resumeData.id).order('issue_year', { ascending: false }),
           supabase.from('skills').select('*').eq('resume_id', resumeData.id),
           supabase.from('resume_projects').select('*, projects(*)').eq('resume_id', resumeData.id).order('display_order', { ascending: true })
         ]);

         if (expRes.error) console.error("Experiences fetch error:", expRes.error);
         if (eduRes.error) console.error("Educations fetch error:", eduRes.error);
         if (certRes.error) console.error("Certifications fetch error:", certRes.error);
         if (skillsRes.error) console.error("Skills fetch error:", skillsRes.error);
         if (rpRes.error) console.error("Resume Projects fetch error:", rpRes.error);

         if (expRes.data) setExperience(expRes.data as Experience[]);
         if (eduRes.data) setEducation(eduRes.data as Education[]);
         if (certRes.data) setCertifications(certRes.data as Certification[]);
         if (skillsRes.data) setSkills(skillsRes.data as Skill[]);
         
         if (rpRes.data) {
           setResumeProjects(rpRes.data.map(rp => {
             // Handle cases where foreign key inner joins return arrays or objects
             const projectData = Array.isArray(rp.projects) ? rp.projects[0] : rp.projects;
             return {
               resume_project_id: rp.id,
               project_id: rp.project_id,
               ...(projectData || {})
             };
           }) as ResumeProject[]);
         }
      }
    }
    loadData();
  }, []);

  const confirmDelete = (type: string, id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    if (type === 'experience') {
      const { error } = await supabase.from('experiences').delete().eq('id', id);
      if (!error) setExperience(experience.filter(e => e.id !== id));
      else console.error("Delete experience error:", error);
    } else if (type === 'education') {
      const { error } = await supabase.from('educations').delete().eq('id', id);
      if (!error) setEducation(education.filter(e => e.id !== id));
      else console.error("Delete education error:", error);
    } else if (type === 'certification') {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (!error) setCertifications(certifications.filter(c => c.id !== id));
      else console.error("Delete certification error:", error);
    } else if (type === 'skill') {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (!error) setSkills(skills.filter(s => s.id !== id));
      else console.error("Delete skill error:", error);
    } else if (type === 'project') {
      const { error } = await supabase.from('resume_projects').delete().eq('id', id);
      if (!error) setResumeProjects(resumeProjects.filter(rp => rp.resume_project_id !== id));
      else console.error("Delete resume project error:", error);
    }
    
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // --- Handlers for Data Updates ---

  const openPersonalDialog = () => {
    setPersonalForm(personal);
    setEditPersonalOpen(true);
  };

  const savePersonalDialog = async () => {
    if (!userId) return;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: personalForm.full_name,
      email: personalForm.email,
      phone: personalForm.phone,
      location: personalForm.location
    });
    
    if (!error) {
       setPersonal(personalForm);
       setEditPersonalOpen(false);
    } else {
       console.error("Update profile error:", error.message, error.details, error.hint);
    }
  };
 
  useEffect(() => {
  async function testSupabase() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)

    console.log("SUPABASE TEST DATA:", data)
    console.log("SUPABASE TEST ERROR:", error)
  }

  testSupabase()
}, [])

  const openSummaryDialog = () => {
    setSummaryForm(summary);
    setEditSummaryOpen(true);
  };

  const saveSummaryDialog = async () => {
    if (!resumeId) return;
    const { error } = await supabase.from('resumes').update({
      prof_summary: summaryForm
    }).eq('id', resumeId);
    
    if (!error) {
       setSummary(summaryForm);
       setEditSummaryOpen(false);
    } else {
       console.error("Update summary error:", error.message, error.details, error.hint);
    }
  };

  const openSkillsDialog = () => {
    setSkillsInput("");
    setAddSkillsOpen(true);
  };

  const saveSkillsDialog = async () => {
    if (!resumeId) return;
    const newSkillNames = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    if (newSkillNames.length === 0) {
       setAddSkillsOpen(false);
       return;
    }
    
    const payload = newSkillNames.map(s => ({
      resume_id: resumeId,
      skill: s,
      category: 'General'
    }));
  
    const { data, error } = await supabase.from('skills').insert(payload).select();
    if (data && !error) {
       setSkills([...skills, ...(data as Skill[])]);
       setAddSkillsOpen(false);
    } else {
       console.error("Insert skills error:", error?.message, error?.details, error?.hint);
    }
  };

  const openExpDialog = (exp: Experience | null) => {
    if (exp) {
      setExpForm({ 
        id: exp.id, 
        title: exp.job_title || "", 
        company: exp.company || "", 
        location: exp.location || "", 
        startDate: exp.start_date || "", 
        endDate: exp.end_date || "", 
        current: exp.currently_working || false, 
        description: exp.description || "" 
      });
    } else {
      setExpForm({ id: null, title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" });
    }
    setExpDialogOpen(true);
  };

  const saveExpDialog = async () => {
    if (!resumeId) return;
    const payload = {
      resume_id: resumeId,
      job_title: expForm.title,
      company: expForm.company,
      location: expForm.location,
      start_date: expForm.startDate,
      end_date: expForm.endDate,
      currently_working: expForm.current,
      description: expForm.description
    };
    
    if (expForm.id) {
      const { data, error } = await supabase.from('experiences').update(payload).eq('id', expForm.id).select().single();
      if (data && !error) {
         setExperience(experience.map(e => e.id === expForm.id ? (data as Experience) : e));
         setExpDialogOpen(false);
      } else console.error("Update experience error:", error?.message, error?.details);
    } else {
      const { data, error } = await supabase.from('experiences').insert(payload).select().single();
      if (data && !error) {
         setExperience([data as Experience, ...experience]);
         setExpDialogOpen(false);
      } else console.error("Insert experience error:", error?.message, error?.details);
    }
  };

  const openEduDialog = (edu: Education | null) => {
    if (edu) {
      setEduForm({
        id: edu.id,
        degree: edu.degree || "",
        school: edu.school || "",
        startDate: edu.start_date || "",
        endDate: edu.end_date || ""
      });
    } else {
      setEduForm({ id: null, degree: "", school: "", startDate: "", endDate: "" });
    }
    setEduDialogOpen(true);
  };

  const saveEduDialog = async () => {
    if (!resumeId) return;
    const payload = {
      resume_id: resumeId,
      degree: eduForm.degree,
      school: eduForm.school,
      start_date: eduForm.startDate,
      end_date: eduForm.endDate
    };
    
    if (eduForm.id) {
      const { data, error } = await supabase.from('educations').update(payload).eq('id', eduForm.id).select().single();
      if (data && !error) {
         setEducation(education.map(e => e.id === eduForm.id ? (data as Education) : e));
         setEduDialogOpen(false);
      } else console.error("Update education error:", error?.message, error?.details);
    } else {
      const { data, error } = await supabase.from('educations').insert(payload).select().single();
      if (data && !error) {
         setEducation([data as Education, ...education]);
         setEduDialogOpen(false);
      } else console.error("Insert education error:", error?.message, error?.details);
    }
  };

  const openCertDialog = (cert: Certification | null) => {
    if (cert) {
      const dateStr = cert.issue_month ? `${cert.issue_month} ${cert.issue_year || ''}` : (cert.issue_year || '');
      setCertForm({
        id: cert.id,
        name: cert.title || "",
        issuer: cert.issuer || "",
        date: dateStr.trim(),
        credentialUrl: cert.credential_url || ""
      });
    } else {
      setCertForm({ id: null, name: "", issuer: "", date: "", credentialUrl: "" });
    }
    setCertDialogOpen(true);
  };

  const saveCertDialog = async () => {
    if (!resumeId) return;
    const parts = certForm.date.split(' ');
    const issue_month = parts.length > 1 ? parts[0] : null;
    const issue_year = parts.length > 1 ? parts[1] : parts[0];
  
    const payload = {
      resume_id: resumeId,
      title: certForm.name,
      issuer: certForm.issuer,
      issue_month,
      issue_year,
      credential_url: certForm.credentialUrl
    };
    
    if (certForm.id) {
      const { data, error } = await supabase.from('certifications').update(payload).eq('id', certForm.id).select().single();
      if (data && !error) {
         setCertifications(certifications.map(c => c.id === certForm.id ? (data as Certification) : c));
         setCertDialogOpen(false);
      } else console.error("Update certification error:", error?.message, error?.details);
    } else {
      const { data, error } = await supabase.from('certifications').insert(payload).select().single();
      if (data && !error) {
         setCertifications([data as Certification, ...certifications]);
         setCertDialogOpen(false);
      } else console.error("Insert certification error:", error?.message, error?.details);
    }
  };

  const handleAddProject = async (project: Project) => {
    if (!resumeId) return;
    const { data, error } = await supabase.from('resume_projects').insert({
      resume_id: resumeId,
      project_id: project.id,
      display_order: resumeProjects.length
    }).select();

    if (error) {
       console.error("Add resume project error:", error.message, error.details, error.hint, error);
       return;
    }

    if (data && data.length > 0) {
       const insertedRow = data[0];
       setResumeProjects([...resumeProjects, {
         resume_project_id: insertedRow.id,
         project_id: project.id,
         ...project
       }]);
       setAddProjectDialogOpen(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* HEADER CARD */}
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
            </div>
          </CardContent>
        </div>
      </Card>

      {/* MAIN CONTENT BODY */}
      <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-6 md:p-10 space-y-12">
        
        {/* PERSONAL INFO */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Personal Information</h2>
            <Button variant="ghost" size="sm" onClick={openPersonalDialog} className="text-muted-foreground hover:text-primary rounded-lg">
              <PencilLine size={16} className="mr-2" /> Edit
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Full Name</p>
              <p className="text-foreground text-base">{personal.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Email</p>
              <p className="text-foreground text-base">{personal.email || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Phone</p>
              <p className="text-foreground text-base">{personal.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 font-medium">Location</p>
              <p className="text-foreground text-base">{personal.location || "—"}</p>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        {/* PROFESSIONAL SUMMARY */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Professional Summary</h2>
            <Button variant="ghost" size="sm" onClick={openSummaryDialog} className="text-muted-foreground hover:text-primary rounded-lg">
              <PencilLine size={16} className="mr-2" /> Edit
            </Button>
          </div>
          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
            {summary || <span className="text-muted-foreground italic">No summary provided.</span>}
          </p>
        </section>

        <div className="h-px bg-border/40" />

        {/* SKILLS */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-tight">Skills</h2>
            <Button variant="outline" size="sm" onClick={openSkillsDialog} className="rounded-xl border-dashed">
              <Plus size={16} className="mr-2" /> Add Skills
            </Button>
          </div>
          {skills && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s: Skill) => (
                <div key={s.id} className="px-3 py-1 bg-muted/30 border border-border/50 rounded-full text-sm font-medium flex items-center gap-2">
                  {s.skill}
                  <button onClick={() => confirmDelete('skill', s.id)} className="text-muted-foreground hover:text-destructive focus:outline-none">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No skills added yet.</p>
          )}
        </section>

        <div className="h-px bg-border/40" />

        {/* EXPERIENCE */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold tracking-tight">Experience</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => openExpDialog(null)} className="rounded-xl border-dashed">
              <Plus size={16} className="mr-2" /> Add Experience
            </Button>
          </div>
          
          {experience && experience.length > 0 ? (
            <div className="space-y-4">
              {experience.map((exp: Experience) => (
                <div key={exp.id} className="group relative pl-4 border-l-2 border-border/40 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{exp.job_title}</h3>
                      <p className="text-primary font-medium text-sm">{exp.company} <span className="text-muted-foreground font-normal ml-2">{exp.location}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.start_date} – {exp.currently_working ? "Present" : exp.end_date}
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openExpDialog(exp)} className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                        <PencilLine size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete('experience', exp.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm mt-3 text-muted-foreground whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No experience added yet.</p>
          )}
        </section>

        <div className="h-px bg-border/40" />

        {/* EDUCATION */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold tracking-tight">Education</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => openEduDialog(null)} className="rounded-xl border-dashed">
              <Plus size={16} className="mr-2" /> Add Education
            </Button>
          </div>
          
          {education && education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu: Education) => (
                <div key={edu.id} className="group relative pl-4 border-l-2 border-border/40 hover:border-primary/50 transition-colors flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{edu.degree}</h3>
                    <p className="text-primary font-medium text-sm">{edu.school}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {edu.start_date} – {edu.end_date}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => openEduDialog(edu)} className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                      <PencilLine size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete('education', edu.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No education added yet.</p>
          )}
        </section>

        <div className="h-px bg-border/40" />

        {/* CERTIFICATIONS */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold tracking-tight">Certifications</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => openCertDialog(null)} className="rounded-xl border-dashed">
              <Plus size={16} className="mr-2" /> Add Certification
            </Button>
          </div>
          
          {certifications && certifications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((cert: Certification) => (
                <div key={cert.id} className="group flex justify-between items-start p-4 bg-muted/20 border border-border/50 rounded-xl">
                  <div>
                    <h3 className="font-bold text-foreground">{cert.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{cert.issuer}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cert.issue_month ? cert.issue_month + ' ' : ''}{cert.issue_year || ''}
                    </p>
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 block">View Credential</a>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => openCertDialog(cert)} className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                      <PencilLine size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete('certification', cert.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic">No certifications added yet.</p>
          )}
        </section>

        <div className="h-px bg-border/40" />

        {/* PROJECTS */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold tracking-tight">Projects</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setAddProjectDialogOpen(true)} className="rounded-xl border-dashed">
              <Plus size={16} className="mr-2" /> Add from Projects
            </Button>
          </div>
          
          {resumeProjects && resumeProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {resumeProjects.map((proj: ResumeProject) => (
                <div key={proj.resume_project_id} className="group relative flex flex-col justify-between p-5 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-foreground text-lg">{proj.name}</h3>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete('project', proj.resume_project_id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive rounded-lg">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    {(proj.techStack || proj.tech_stack) && (proj.techStack || proj.tech_stack)!.length > 0 && (
                      <p className="text-xs font-medium text-primary mt-1">{(proj.techStack || proj.tech_stack)!.join(', ')}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{proj.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl bg-muted/10">
              <FolderGit2 className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground">No projects yet.</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Create a project in Build Mode to add it to your resume.</p>
            </div>
          )}
        </section>

      </div>

      {/* DIALOGS */}
      
      {/* Edit Personal Info */}
      <Dialog open={editPersonalOpen} onOpenChange={setEditPersonalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={personalForm.full_name} onChange={e => setPersonalForm({...personalForm, full_name: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={personalForm.email} onChange={e => setPersonalForm({...personalForm, email: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={personalForm.phone} onChange={e => setPersonalForm({...personalForm, phone: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={personalForm.location} onChange={e => setPersonalForm({...personalForm, location: e.target.value})} className="rounded-lg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPersonalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={savePersonalDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Summary */}
      <Dialog open={editSummaryOpen} onOpenChange={setEditSummaryOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Professional Summary</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={summaryForm} 
              onChange={e => setSummaryForm(e.target.value)} 
              className="min-h-[150px] rounded-lg resize-none" 
              placeholder="Write a brief summary of your professional background..." 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSummaryOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveSummaryDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skills */}
      <Dialog open={addSkillsOpen} onOpenChange={setAddSkillsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Skills</DialogTitle>
            <DialogDescription>Add new skills. Separate multiple skills with commas.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              value={skillsInput} 
              onChange={e => setSkillsInput(e.target.value)} 
              className="min-h-[100px] rounded-lg resize-none" 
              placeholder="React, Next.js, PostgreSQL..." 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSkillsOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveSkillsDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Experience */}
      <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{expForm.id ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={expForm.location} onChange={e => setExpForm({...expForm, location: e.target.value})} className="rounded-lg" />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="current-exp" checked={expForm.current} onCheckedChange={(c: boolean) => setExpForm({...expForm, current: c})} className="rounded" />
                  <label htmlFor="current-exp" className="text-sm font-medium leading-none">Currently Working</label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input value={expForm.startDate} onChange={e => setExpForm({...expForm, startDate: e.target.value})} placeholder="e.g. Jan 2020" className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input value={expForm.endDate} onChange={e => setExpForm({...expForm, endDate: e.target.value})} disabled={expForm.current} placeholder="e.g. Present" className="rounded-lg disabled:opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="min-h-[100px] rounded-lg resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveExpDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Education */}
      <Dialog open={eduDialogOpen} onOpenChange={setEduDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{eduForm.id ? "Edit Education" : "Add Education"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>School</Label>
              <Input value={eduForm.school} onChange={e => setEduForm({...eduForm, school: e.target.value})} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input value={eduForm.startDate} onChange={e => setEduForm({...eduForm, startDate: e.target.value})} placeholder="e.g. 2018" className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input value={eduForm.endDate} onChange={e => setEduForm({...eduForm, endDate: e.target.value})} placeholder="e.g. 2022" className="rounded-lg" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEduDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveEduDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Certification */}
      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{certForm.id ? "Edit Certification" : "Add Certification"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>Issuer</Label>
              <Input value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date (e.g. Jan 2023)</Label>
                <Input value={certForm.date} onChange={e => setCertForm({...certForm, date: e.target.value})} placeholder="e.g. Jan 2023" className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input value={certForm.credentialUrl} onChange={e => setCertForm({...certForm, credentialUrl: e.target.value})} placeholder="https://..." className="rounded-lg" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={saveCertDialog} className="rounded-xl">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project from Build Mode */}
      <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Project to Resume</DialogTitle>
            <DialogDescription>Select an existing project from Build Mode to feature on your resume.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto py-4 space-y-3 flex-1">
            {allProjects.length > 0 ? (
              allProjects.filter(p => !resumeProjects.some(rp => rp.project_id === p.id)).length > 0 ? (
                allProjects
                  .filter(p => !resumeProjects.some(rp => rp.project_id === p.id))
                  .map(p => (
                    <div key={p.id} className="p-3 border border-border/50 rounded-xl hover:bg-muted/20 flex justify-between items-center transition-colors">
                      <div>
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg shrink-0 ml-4" onClick={() => handleAddProject(p)}>
                        Add
                      </Button>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-6">All your projects are already on your resume.</p>
              )
            ) : (
              <p className="text-sm text-center text-muted-foreground py-6">No projects found in Build Mode.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete {itemToDelete?.type}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to remove this item from your resume?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={executeDelete} className="rounded-xl">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
