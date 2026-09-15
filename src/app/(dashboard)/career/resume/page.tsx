"use client"

import { useEffect, useState } from "react"
import {
  Award,
  Briefcase,
  FileText,
  FolderGit2,
  GraduationCap,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

import { supabase } from "@/lib/supabase/client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --------------------------------------------------
// Types
// --------------------------------------------------

type ProfileData = {
  full_name: string
  email: string
  phone: string
  location: string
}

type Skill = {
  id: string
  skill: string
  category: string
}

type Experience = {
  id: string
  job_title: string
  company: string
  location: string | null
  start_date: string
  end_date: string | null
  currently_working: boolean
  description: string | null
}

type Education = {
  id: string
  degree: string
  school: string
  start_date: string
  end_date: string
}

type Certification = {
  id: string
  title: string
  issuer: string
  issue_month: string | null
  issue_year: string | null
  credential_url: string | null
}

type Project = {
  id: string
  name: string
  description: string
  tech_stack?: string[]
  techStack?: string[]
}

type ResumeProject = Project & {
  resume_project_id: string
  project_id: string
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function ResumePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [personal, setPersonal] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  })

  const [summary, setSummary] = useState("")
  const [skills, setSkills] = useState<Skill[]>([])
  const [experience, setExperience] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [resumeProjects, setResumeProjects] = useState<ResumeProject[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])

  // --------------------------------------------------
  // Dialog state
  // --------------------------------------------------

  const [editPersonalOpen, setEditPersonalOpen] = useState(false)
  const [editSummaryOpen, setEditSummaryOpen] = useState(false)
  const [addSkillsOpen, setAddSkillsOpen] = useState(false)
  const [expDialogOpen, setExpDialogOpen] = useState(false)
  const [eduDialogOpen, setEduDialogOpen] = useState(false)
  const [certDialogOpen, setCertDialogOpen] = useState(false)
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const [itemToDelete, setItemToDelete] = useState<{
    type: string
    id: string
  } | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // --------------------------------------------------
  // Forms
  // --------------------------------------------------

  const [personalForm, setPersonalForm] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
  })

  const [summaryForm, setSummaryForm] = useState("")
  const [skillsInput, setSkillsInput] = useState("")

  const [expForm, setExpForm] = useState({
    id: null as string | null,
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  })

  const [eduForm, setEduForm] = useState({
    id: null as string | null,
    degree: "",
    school: "",
    startDate: "",
    endDate: "",
  })

  // type="month" uses YYYY-MM in the browser.
  const [certForm, setCertForm] = useState({
    id: null as string | null,
    name: "",
    issuer: "",
    date: "",
    credentialUrl: "",
  })

  // --------------------------------------------------
  // Load data
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          return
        }

        if (!user || cancelled) return

        setUserId(user.id)

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
        }

        if (profile && !cancelled) {
          setPersonal({
            full_name: profile.full_name ?? "",
            email: profile.email ?? user.email ?? "",
            phone: profile.phone ?? "",
            location: profile.location ?? "",
          })
        }

        const {
          data: projectsData,
          error: projectsError,
        } = await supabase.from("projects").select("*")

        if (projectsError) {
          console.error("Projects fetch error:", projectsError)
        }

        if (projectsData && !cancelled) {
          setAllProjects(projectsData as Project[])
        }

        const {
          data: resumes,
          error: resumeError,
        } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .limit(1)

        if (resumeError) {
          console.error("Resume fetch error:", resumeError)
        }

        let resumeData = resumes?.[0] ?? null

        if (!resumeData) {
          const {
            data: newResume,
            error: createResumeError,
          } = await supabase
            .from("resumes")
            .insert({
              user_id: user.id,
              prof_summary: "",
            })
            .select()
            .single()

          if (createResumeError) {
            console.error("Resume creation error:", createResumeError)
          }

          resumeData = newResume
        }

        if (!resumeData || cancelled) return

        setResumeId(resumeData.id)
        setSummary(resumeData.prof_summary ?? "")

        const [
          experiencesResult,
          educationResult,
          certificationsResult,
          skillsResult,
          projectsResult,
        ] = await Promise.all([
          supabase
            .from("experiences")
            .select("*")
            .eq("resume_id", resumeData.id)
            .order("start_date", { ascending: false }),

          supabase
            .from("educations")
            .select("*")
            .eq("resume_id", resumeData.id)
            .order("start_date", { ascending: false }),

          supabase
            .from("certifications")
            .select("*")
            .eq("resume_id", resumeData.id)
            .order("issue_year", { ascending: false }),

          supabase
            .from("skills")
            .select("*")
            .eq("resume_id", resumeData.id),

          supabase
            .from("resume_projects")
            .select("*, projects(*)")
            .eq("resume_id", resumeData.id)
            .order("display_order", { ascending: true }),
        ])

        if (cancelled) return

        if (experiencesResult.error) {
          console.error("Experience fetch error:", experiencesResult.error)
        }

        if (educationResult.error) {
          console.error("Education fetch error:", educationResult.error)
        }

        if (certificationsResult.error) {
          console.error(
            "Certification fetch error:",
            certificationsResult.error
          )
        }

        if (skillsResult.error) {
          console.error("Skills fetch error:", skillsResult.error)
        }

        if (projectsResult.error) {
          console.error(
            "Resume projects fetch error:",
            projectsResult.error
          )
        }

        setExperience((experiencesResult.data ?? []) as Experience[])
        setEducation((educationResult.data ?? []) as Education[])
        setCertifications(
          (certificationsResult.data ?? []) as Certification[]
        )
        setSkills((skillsResult.data ?? []) as Skill[])

        if (projectsResult.data) {
          const mappedProjects = projectsResult.data.map((rp) => {
            const projectData = Array.isArray(rp.projects)
              ? rp.projects[0]
              : rp.projects

            return {
              resume_project_id: rp.id,
              project_id: rp.project_id,
              ...(projectData ?? {}),
            }
          })

          setResumeProjects(mappedProjects as ResumeProject[])
        }
      } catch (error) {
        console.error("Resume page load error:", error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [])

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const confirmDelete = (type: string, id: string) => {
    setItemToDelete({ type, id })
    setDeleteConfirmOpen(true)
  }

  const executeDelete = async () => {
    if (!itemToDelete || deleting) return

    setDeleting(true)

    const { type, id } = itemToDelete

    try {
      let error = null

      if (type === "experience") {
        const result = await supabase
          .from("experiences")
          .delete()
          .eq("id", id)
          .eq("resume_id", resumeId ?? "")

        error = result.error

        if (!error) {
          setExperience((prev) => prev.filter((item) => item.id !== id))
        }
      }

      if (type === "education") {
        const result = await supabase
          .from("educations")
          .delete()
          .eq("id", id)
          .eq("resume_id", resumeId ?? "")

        error = result.error

        if (!error) {
          setEducation((prev) => prev.filter((item) => item.id !== id))
        }
      }

      if (type === "certification") {
        const result = await supabase
          .from("certifications")
          .delete()
          .eq("id", id)
          .eq("resume_id", resumeId ?? "")

        error = result.error

        if (!error) {
          setCertifications((prev) => prev.filter((item) => item.id !== id))
        }
      }

      if (type === "skill") {
        const result = await supabase
          .from("skills")
          .delete()
          .eq("id", id)
          .eq("resume_id", resumeId ?? "")

        error = result.error

        if (!error) {
          setSkills((prev) => prev.filter((item) => item.id !== id))
        }
      }

      if (type === "project") {
        const result = await supabase
          .from("resume_projects")
          .delete()
          .eq("id", id)
          .eq("resume_id", resumeId ?? "")

        error = result.error

        if (!error) {
          setResumeProjects((prev) =>
            prev.filter((item) => item.resume_project_id !== id)
          )
        }
      }

      if (error) {
        console.error("Delete error:", error)
        return
      }

      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  // --------------------------------------------------
  // Personal
  // --------------------------------------------------

  const openPersonalDialog = () => {
    setPersonalForm(personal)
    setEditPersonalOpen(true)
  }

  const savePersonalDialog = async () => {
    if (!userId || saving) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          full_name: personalForm.full_name.trim(),
          email: personalForm.email.trim(),
          phone: personalForm.phone.trim(),
          location: personalForm.location.trim(),
        })

      if (error) {
        console.error("Profile update error:", error)
        return
      }

      setPersonal({
        full_name: personalForm.full_name.trim(),
        email: personalForm.email.trim(),
        phone: personalForm.phone.trim(),
        location: personalForm.location.trim(),
      })
      setEditPersonalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const openSummaryDialog = () => {
    setSummaryForm(summary)
    setEditSummaryOpen(true)
  }

  const saveSummaryDialog = async () => {
    if (!resumeId || saving) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("resumes")
        .update({ prof_summary: summaryForm.trim() })
        .eq("id", resumeId)

      if (error) {
        console.error("Summary update error:", error)
        return
      }

      setSummary(summaryForm.trim())
      setEditSummaryOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Skills
  // --------------------------------------------------

  const openSkillsDialog = () => {
    setSkillsInput("")
    setAddSkillsOpen(true)
  }

  const saveSkillsDialog = async () => {
    if (!resumeId || saving) return

    const names = skillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (names.length === 0) {
      setAddSkillsOpen(false)
      return
    }

    setSaving(true)

    try {
      const existingNames = new Set(
        skills.map((skill) => skill.skill.trim().toLowerCase())
      )

      const uniqueNames = names.filter(
        (skill, index) =>
          names.findIndex(
            (item) => item.toLowerCase() === skill.toLowerCase()
          ) === index && !existingNames.has(skill.toLowerCase())
      )

      if (uniqueNames.length === 0) {
        setAddSkillsOpen(false)
        return
      }

      const payload = uniqueNames.map((skill) => ({
        resume_id: resumeId,
        skill,
        category: "General",
      }))

      const { data, error } = await supabase
        .from("skills")
        .insert(payload)
        .select()

      if (error) {
        console.error("Skills insert error:", error)
        return
      }

      setSkills((prev) => [...prev, ...(data as Skill[])])
      setAddSkillsOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Experience
  // --------------------------------------------------

  const openExpDialog = (exp: Experience | null) => {
    if (exp) {
      setExpForm({
        id: exp.id,
        title: exp.job_title ?? "",
        company: exp.company ?? "",
        location: exp.location ?? "",
        startDate: exp.start_date ?? "",
        endDate: exp.end_date ?? "",
        current: exp.currently_working ?? false,
        description: exp.description ?? "",
      })
    } else {
      setExpForm({
        id: null,
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      })
    }

    setExpDialogOpen(true)
  }

  const saveExpDialog = async () => {
    if (!resumeId || saving) return

    if (!expForm.title.trim() || !expForm.company.trim()) return
    if (!expForm.startDate) return
    if (!expForm.current && !expForm.endDate) return

    setSaving(true)

    try {
      const payload = {
        resume_id: resumeId,
        job_title: expForm.title.trim(),
        company: expForm.company.trim(),
        location: expForm.location.trim() || null,
        start_date: expForm.startDate,
        end_date: expForm.current ? null : expForm.endDate,
        currently_working: expForm.current,
        description: expForm.description.trim() || null,
      }

      if (expForm.id) {
        const { data, error } = await supabase
          .from("experiences")
          .update(payload)
          .eq("id", expForm.id)
          .eq("resume_id", resumeId)
          .select()
          .single()

        if (error) {
          console.error("Experience update error:", error)
          return
        }

        if (!data) {
          console.error("Experience update returned no data.")
          return
        }

        setExperience((prev) =>
          prev.map((item) =>
            item.id === expForm.id ? (data as Experience) : item
          )
        )
      } else {
        const { data, error } = await supabase
          .from("experiences")
          .insert(payload)
          .select()
          .single()

        if (error) {
          console.error("Experience insert error:", error)
          return
        }

        if (!data) {
          console.error("Experience insert returned no data.")
          return
        }

        setExperience((prev) => [data as Experience, ...prev])
      }

      setExpDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Education
  // --------------------------------------------------

  const openEduDialog = (edu: Education | null) => {
    if (edu) {
      setEduForm({
        id: edu.id,
        degree: edu.degree ?? "",
        school: edu.school ?? "",
        startDate: edu.start_date ?? "",
        endDate: edu.end_date ?? "",
      })
    } else {
      setEduForm({
        id: null,
        degree: "",
        school: "",
        startDate: "",
        endDate: "",
      })
    }

    setEduDialogOpen(true)
  }

  const saveEduDialog = async () => {
    if (!resumeId || saving) return

    if (!eduForm.degree.trim() || !eduForm.school.trim()) return
    if (!eduForm.startDate || !eduForm.endDate) return

    setSaving(true)

    try {
      const payload = {
        resume_id: resumeId,
        degree: eduForm.degree.trim(),
        school: eduForm.school.trim(),
        start_date: eduForm.startDate,
        end_date: eduForm.endDate,
      }

      if (eduForm.id) {
        const { data, error } = await supabase
          .from("educations")
          .update(payload)
          .eq("id", eduForm.id)
          .eq("resume_id", resumeId)
          .select()
          .single()

        if (error) {
          console.error("Education update error:", error)
          return
        }

        if (!data) {
          console.error("Education update returned no data.")
          return
        }

        setEducation((prev) =>
          prev.map((item) =>
            item.id === eduForm.id ? (data as Education) : item
          )
        )
      } else {
        const { data, error } = await supabase
          .from("educations")
          .insert(payload)
          .select()
          .single()

        if (error) {
          console.error("Education insert error:", error)
          return
        }

        if (!data) {
          console.error("Education insert returned no data.")
          return
        }

        setEducation((prev) => [data as Education, ...prev])
      }

      setEduDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Certifications
  // --------------------------------------------------

  const openCertDialog = (cert: Certification | null) => {
    if (cert) {
      const date = certificationDateToInput(
        cert.issue_month,
        cert.issue_year
      )

      setCertForm({
        id: cert.id,
        name: cert.title ?? "",
        issuer: cert.issuer ?? "",
        date,
        credentialUrl: cert.credential_url ?? "",
      })
    } else {
      setCertForm({
        id: null,
        name: "",
        issuer: "",
        date: "",
        credentialUrl: "",
      })
    }

    setCertDialogOpen(true)
  }

  const saveCertDialog = async () => {
    if (!resumeId || saving) return

    if (!certForm.name.trim() || !certForm.issuer.trim()) return

    setSaving(true)

    try {
      const { issueMonth, issueYear } = parseCertificationDate(certForm.date)

      const payload = {
        resume_id: resumeId,
        title: certForm.name.trim(),
        issuer: certForm.issuer.trim(),
        issue_month: issueMonth,
        issue_year: issueYear,
        credential_url: certForm.credentialUrl.trim() || null,
      }

      if (certForm.id) {
        const { data, error } = await supabase
          .from("certifications")
          .update(payload)
          .eq("id", certForm.id)
          .eq("resume_id", resumeId)
          .select()
          .single()

        if (error) {
          console.error("Certification update error:", error)
          return
        }

        if (!data) {
          console.error("Certification update returned no data.")
          return
        }

        setCertifications((prev) =>
          prev.map((item) =>
            item.id === certForm.id ? (data as Certification) : item
          )
        )
      } else {
        const { data, error } = await supabase
          .from("certifications")
          .insert(payload)
          .select()
          .single()

        if (error) {
          console.error("Certification insert error:", error)
          return
        }

        if (!data) {
          console.error("Certification insert returned no data.")
          return
        }

        setCertifications((prev) => [data as Certification, ...prev])
      }

      setCertDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Projects
  // --------------------------------------------------

  const handleAddProject = async (project: Project) => {
    if (!resumeId || saving) return

    const alreadyAdded = resumeProjects.some(
      (item) => item.project_id === project.id
    )

    if (alreadyAdded) return

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from("resume_projects")
        .insert({
          resume_id: resumeId,
          project_id: project.id,
          display_order: resumeProjects.length,
        })
        .select()
        .single()

      if (error) {
        console.error("Add resume project error:", error)
        return
      }

      if (!data) {
        console.error("Add resume project returned no data.")
        return
      }

      setResumeProjects((prev) => [
        ...prev,
        {
          resume_project_id: data.id,
          project_id: project.id,
          ...project,
        },
      ])

      setAddProjectDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="h-40 animate-pulse rounded-2xl border bg-muted/30" />

        <div className="rounded-2xl border bg-card p-6 sm:p-10">
          <div className="space-y-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-3 sm:p-6 lg:p-8">
      <Card className="overflow-hidden rounded-2xl border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
          <CardHeader className="min-w-0 p-0">
            <CardTitle className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <FileText className="h-7 w-7 shrink-0 text-primary sm:h-8 sm:w-8" />
              Resume
            </CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">
              Build your professional profile. Alymera AI uses this information
              to help you match with jobs and prepare for interviews.
            </CardDescription>
          </CardHeader>

          <div className="hidden rounded-xl border border-primary/10 bg-background/60 px-4 py-3 text-xs text-muted-foreground md:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI-ready resume profile</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm sm:p-8 md:p-10">
        <div className="space-y-10 sm:space-y-12">
          {/* Personal Information */}
          <section>
            <SectionHeader
              title="Personal Information"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openPersonalDialog}
                  className="rounded-lg text-muted-foreground hover:text-primary"
                >
                  <PencilLine className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              }
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InfoItem label="Full Name" value={personal.full_name} />
              <InfoItem label="Email" value={personal.email} />
              <InfoItem label="Phone" value={personal.phone} />
              <InfoItem label="Location" value={personal.location} />
            </div>
          </section>

          <Divider />

          {/* Summary */}
          <section>
            <SectionHeader
              title="Professional Summary"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openSummaryDialog}
                  className="rounded-lg text-muted-foreground hover:text-primary"
                >
                  <PencilLine className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              }
            />

            {summary ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground sm:text-base">
                {summary}
              </p>
            ) : (
              <EmptyText>
                Add a short professional summary about yourself.
              </EmptyText>
            )}
          </section>

          <Divider />

          {/* Skills */}
          <section>
            <SectionHeader
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              title="Skills"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openSkillsDialog}
                  className="rounded-xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Skills
                </Button>
              }
            />

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-sm font-medium"
                  >
                    <span className="break-words">{skill.skill}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${skill.skill}`}
                      onClick={() => confirmDelete("skill", skill.id)}
                      className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>
                No skills added yet. Add the technologies and abilities you want
                employers to see.
              </EmptyText>
            )}
          </section>

          <Divider />

          {/* Experience */}
          <section>
            <SectionHeader
              icon={<Briefcase className="h-5 w-5 text-primary" />}
              title="Experience"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openExpDialog(null)}
                  className="rounded-xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Experience
                </Button>
              }
            />

            {experience.length > 0 ? (
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="group relative border-l-2 border-border/50 pl-4 sm:pl-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-bold sm:text-lg">
                          {exp.job_title}
                        </h3>
                        <p className="mt-1 break-words text-sm font-medium text-primary">
                          {exp.company}
                        </p>
                        {exp.location && (
                          <p className="mt-0.5 break-words text-xs text-muted-foreground">
                            {exp.location}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(exp.start_date) || "Start date"} – {" "}
                          {exp.currently_working
                            ? "Present"
                            : formatDate(exp.end_date) || "End date"}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <IconButton
                          label="Edit experience"
                          onClick={() => openExpDialog(exp)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete experience"
                          destructive
                          onClick={() => confirmDelete("experience", exp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>

                    {exp.description && (
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<Briefcase className="h-7 w-7" />}
                title="No experience added"
                description="Add your work experience, internship, or relevant professional experience."
              />
            )}
          </section>

          <Divider />

          {/* Education */}
          <section>
            <SectionHeader
              icon={<GraduationCap className="h-5 w-5 text-orange-500" />}
              title="Education"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEduDialog(null)}
                  className="rounded-xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Education
                </Button>
              }
            />

            {education.length > 0 ? (
              <div className="space-y-5">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="group relative border-l-2 border-border/50 pl-4 sm:pl-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-bold sm:text-lg">
                          {edu.degree}
                        </h3>
                        <p className="mt-1 break-words text-sm font-medium text-primary">
                          {edu.school}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(edu.start_date) || "Start date"} – {" "}
                          {formatDate(edu.end_date) || "End date"}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <IconButton
                          label="Edit education"
                          onClick={() => openEduDialog(edu)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete education"
                          destructive
                          onClick={() => confirmDelete("education", edu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<GraduationCap className="h-7 w-7" />}
                title="No education added"
                description="Add your degree, school, and graduation information."
              />
            )}
          </section>

          <Divider />

          {/* Certifications */}
          <section>
            <SectionHeader
              icon={<Award className="h-5 w-5 text-green-500" />}
              title="Certifications"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCertDialog(null)}
                  className="rounded-xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Certification
                </Button>
              }
            />

            {certifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="group rounded-xl border border-border/50 bg-muted/10 p-4 transition-colors hover:bg-muted/20 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-bold">{cert.title}</h3>
                        <p className="mt-1 break-words text-sm font-medium text-muted-foreground">
                          {cert.issuer}
                        </p>
                        {(cert.issue_month || cert.issue_year) && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {cert.issue_month ? `${cert.issue_month} ` : ""}
                            {cert.issue_year ?? ""}
                          </p>
                        )}
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                          >
                            View Credential
                          </a>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        <IconButton
                          label="Edit certification"
                          onClick={() => openCertDialog(cert)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete certification"
                          destructive
                          onClick={() =>
                            confirmDelete("certification", cert.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock
                icon={<Award className="h-7 w-7" />}
                title="No certifications added"
                description="Showcase certifications and credentials that support your career goals."
              />
            )}
          </section>

          <Divider />

          {/* Projects */}
          <section>
            <SectionHeader
              icon={<FolderGit2 className="h-5 w-5 text-blue-500" />}
              title="Projects"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddProjectDialogOpen(true)}
                  className="rounded-xl border-dashed"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add from Projects
                </Button>
              }
            />

            {resumeProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {resumeProjects.map((project) => {
                  const tech = project.techStack ?? project.tech_stack ?? []

                  return (
                    <div
                      key={project.resume_project_id}
                      className="group flex min-w-0 flex-col rounded-xl border border-border/50 bg-muted/10 p-4 transition-all hover:bg-muted/20 hover:shadow-sm sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold sm:text-lg">
                            {project.name}
                          </h3>

                          {tech.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {tech.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <IconButton
                          label="Remove project from resume"
                          destructive
                          onClick={() =>
                            confirmDelete("project", project.resume_project_id)
                          }
                          className="opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>

                      {project.description && (
                        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyBlock
                icon={<FolderGit2 className="h-7 w-7" />}
                title="No projects added"
                description="Choose projects from Build Mode to feature them on your resume."
              />
            )}
          </section>
        </div>
      </div>

      {/* --------------------------------------------------
          Personal Dialog
      -------------------------------------------------- */}

      <Dialog open={editPersonalOpen} onOpenChange={setEditPersonalOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Keep your contact information up to date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3">
            <FormField label="Full Name">
              <Input
                value={personalForm.full_name}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
            </FormField>

            <FormField label="Email">
              <Input
                type="email"
                value={personalForm.email}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
              />
            </FormField>

            <FormField label="Phone">
              <Input
                value={personalForm.phone}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </FormField>

            <FormField label="Location">
              <Input
                value={personalForm.location}
                onChange={(e) =>
                  setPersonalForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </FormField>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditPersonalOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={savePersonalDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Dialog open={editSummaryOpen} onOpenChange={setEditSummaryOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Professional Summary</DialogTitle>
            <DialogDescription>
              Write a concise summary of your professional background.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={summaryForm}
            onChange={(e) => setSummaryForm(e.target.value)}
            placeholder="Frontend developer with experience building..."
            className="min-h-[180px] resize-none rounded-xl"
          />

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditSummaryOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSummaryDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skills */}
      <Dialog open={addSkillsOpen} onOpenChange={setAddSkillsOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Skills</DialogTitle>
            <DialogDescription>
              Separate multiple skills with commas.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, Next.js, TypeScript, Supabase..."
            className="min-h-[120px] resize-none rounded-xl"
          />

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setAddSkillsOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSkillsDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Adding..." : "Add Skills"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience */}
      <Dialog open={expDialogOpen} onOpenChange={setExpDialogOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {expForm.id ? "Edit Experience" : "Add Experience"}
            </DialogTitle>
            <DialogDescription>
              Add professional experience to your resume.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65dvh] space-y-4 overflow-y-auto px-1 py-2">
            <FormField label="Job Title">
              <Input
                value={expForm.title}
                onChange={(e) =>
                  setExpForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Frontend Developer"
              />
            </FormField>

            <FormField label="Company">
              <Input
                value={expForm.company}
                onChange={(e) =>
                  setExpForm((prev) => ({
                    ...prev,
                    company: e.target.value,
                  }))
                }
                placeholder="Company name"
              />
            </FormField>

            <FormField label="Location">
              <Input
                value={expForm.location}
                onChange={(e) =>
                  setExpForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Remote / Manila"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Start Date">
                <Input
                  type="date"
                  value={expForm.startDate}
                  onChange={(e) =>
                    setExpForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="date"
                  value={expForm.endDate}
                  disabled={expForm.current}
                  onChange={(e) =>
                    setExpForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="currently-working"
                checked={expForm.current}
                onCheckedChange={(checked) =>
                  setExpForm((prev) => ({
                    ...prev,
                    current: checked === true,
                    endDate: checked === true ? "" : prev.endDate,
                  }))
                }
              />
              <Label htmlFor="currently-working" className="cursor-pointer">
                I currently work here
              </Label>
            </div>

            <FormField label="Description">
              <Textarea
                value={expForm.description}
                onChange={(e) =>
                  setExpForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your responsibilities and achievements..."
                className="min-h-[120px] resize-none"
              />
            </FormField>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setExpDialogOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveExpDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Education */}
      <Dialog open={eduDialogOpen} onOpenChange={setEduDialogOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {eduForm.id ? "Edit Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription>
              Add your education and graduation information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <FormField label="Degree">
              <Input
                value={eduForm.degree}
                onChange={(e) =>
                  setEduForm((prev) => ({
                    ...prev,
                    degree: e.target.value,
                  }))
                }
                placeholder="Bachelor of Science in Information Technology"
              />
            </FormField>

            <FormField label="School">
              <Input
                value={eduForm.school}
                onChange={(e) =>
                  setEduForm((prev) => ({
                    ...prev,
                    school: e.target.value,
                  }))
                }
                placeholder="University / College"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Start Date">
                <Input
                  type="date"
                  value={eduForm.startDate}
                  onChange={(e) =>
                    setEduForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </FormField>

              <FormField label="End Date">
                <Input
                  type="date"
                  value={eduForm.endDate}
                  onChange={(e) =>
                    setEduForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEduDialogOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveEduDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification */}
      <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {certForm.id ? "Edit Certification" : "Add Certification"}
            </DialogTitle>
            <DialogDescription>
              Add a certification or professional credential.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <FormField label="Certification Title">
              <Input
                value={certForm.name}
                onChange={(e) =>
                  setCertForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Oracle Certified..."
              />
            </FormField>

            <FormField label="Issuer">
              <Input
                value={certForm.issuer}
                onChange={(e) =>
                  setCertForm((prev) => ({
                    ...prev,
                    issuer: e.target.value,
                  }))
                }
                placeholder="Oracle"
              />
            </FormField>

            <FormField label="Issue Date">
              <Input
                type="month"
                value={certForm.date}
                onChange={(e) =>
                  setCertForm((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
              />
            </FormField>

            <FormField label="Credential URL">
              <Input
                type="url"
                value={certForm.credentialUrl}
                onChange={(e) =>
                  setCertForm((prev) => ({
                    ...prev,
                    credentialUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </FormField>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setCertDialogOpen(false)}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCertDialog}
              disabled={saving}
              className="w-full rounded-xl sm:w-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project */}
      <Dialog
        open={addProjectDialogOpen}
        onOpenChange={setAddProjectDialogOpen}
      >
        <DialogContent className="flex max-h-[85dvh] w-[calc(100%-1rem)] max-w-lg flex-col rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Project to Resume</DialogTitle>
            <DialogDescription>
              Select a project from Build Mode.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-3">
            {(() => {
              const availableProjects = allProjects.filter(
                (project) =>
                  !resumeProjects.some(
                    (resumeProject) => resumeProject.project_id === project.id
                  )
              )

              if (availableProjects.length === 0) {
                return (
                  <div className="py-10 text-center">
                    <FolderGit2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium">
                      No projects available
                    </p>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Create a project in Build Mode first, or all existing
                      projects may already be on your resume.
                    </p>
                  </div>
                )
              }

              return availableProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="break-words text-sm font-semibold">
                      {project.name}
                    </h4>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => handleAddProject(project)}
                    className="shrink-0 rounded-lg"
                  >
                    {saving ? "..." : "Add"}
                  </Button>
                </div>
              ))
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Delete {itemToDelete?.type === "project"
                ? "project"
                : itemToDelete?.type ?? "item"}?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The item will be removed from your
              resume.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={deleting}
              className="w-full rounded-xl sm:w-auto"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// --------------------------------------------------
// Date helpers
// --------------------------------------------------

function formatDate(date: string | null | undefined) {
  if (!date) return ""

  // PostgreSQL DATE values normally arrive as YYYY-MM-DD.
  // Appending T00:00:00 avoids timezone shifting the displayed day.
  const parsed = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}

const certificationMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function certificationDateToInput(
  issueMonth: string | null,
  issueYear: string | null
) {
  if (!issueYear) return ""

  if (!issueMonth) return issueYear

  const normalized = issueMonth.trim().toLowerCase()

  const monthIndex = certificationMonths.findIndex(
    (month) => month.toLowerCase() === normalized
  )

  if (monthIndex === -1) {
    const numericMonth = Number(issueMonth)

    if (numericMonth >= 1 && numericMonth <= 12) {
      return `${issueYear}-${String(numericMonth).padStart(2, "0")}`
    }

    return issueYear
  }

  return `${issueYear}-${String(monthIndex + 1).padStart(2, "0")}`
}

function parseCertificationDate(value: string) {
  if (!value) {
    return {
      issueMonth: null as string | null,
      issueYear: null as string | null,
    }
  }

  // Browser month input: YYYY-MM
  const monthInputMatch = value.match(/^(\d{4})-(\d{2})$/)

  if (monthInputMatch) {
    const year = monthInputMatch[1]
    const monthNumber = Number(monthInputMatch[2])

    return {
      issueMonth:
        certificationMonths[monthNumber - 1] ?? null,
      issueYear: year,
    }
  }

  // Backward-compatible handling for an old value such as "Sep 2026".
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return {
      issueMonth: parts[0],
      issueYear: parts[1],
    }
  }

  return {
    issueMonth: null,
    issueYear: parts[0] ?? null,
  }
}

// --------------------------------------------------
// Small UI helpers
// --------------------------------------------------

function Divider() {
  return <div className="h-px bg-border/40" />
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  )
}

function EmptyBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border/50 bg-muted/10 px-5 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-foreground sm:text-base">
        {value || "—"}
      </p>
    </div>
  )
}

function SectionHeader({
  title,
  icon,
  action,
}: {
  title: string
  icon?: React.ReactNode
  action: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h2 className="break-words text-lg font-bold tracking-tight sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</span>
      {children}
    </label>
  )
}

function IconButton({
  children,
  label,
  destructive = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  label: string
  destructive?: boolean
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={onClick}
      className={`h-8 w-8 rounded-lg ${
        destructive
          ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:text-primary"
      } ${className}`}
    >
      {children}
    </Button>
  )
}
