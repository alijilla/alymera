import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import {
  calculateProgress,
  calculateTaskComplete,
  calculateTotalTask,
  makeArray,
} from "@/lib/progress"

//project task tool
export const getProjectTasks = tool({
  description:
    "Get the tasks belonging to a specific ALYMERA project.",
  inputSchema: z.object({
  projectId: z
    .string()
    .uuid()
    .describe("The UUID of the ALYMERA project"),
}),

execute: async ({ projectId }) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, project_id, name, description, status, due_date, milestone_id"
    )
    .eq("project_id", projectId)

    if (error) {
  console.error("getProjectTasks error:", error)
  throw new Error("Failed to retrieve project tasks.")
}
return {
  projectId,
  tasks: data ?? [],
}
},


})

//project milestone tool


export const getProjectMilestones = tool({
  description:
   "Get the milestones belonging to a specific ALYMERA project.",
  inputSchema: z.object({
  projectId: z
    .string()
    .uuid()
    .describe("The UUID of the ALYMERA application"),
}),

execute: async ({ projectId }) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)

    if (error) {
  console.error("getProjectmilestones error:", error)
  throw new Error("Failed to retrieve project milestones.")
}
return {
  projectId,
  milestones: data ?? [],
}
},

})


// Get milestones for the current project
export const getCurrentProjectMilestones = (projectId: string) =>
  tool({
    description:
      "Get the milestones belonging to the current project workspace.",

    inputSchema: z.object({}),

    execute: async () => {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("milestones")
        .select(
          "id, project_id, name, description, status, due_date"
        )
        .eq("project_id", projectId)

      if (error) {
        console.error("getCurrentProjectMilestones error:", error)
        throw new Error("Failed to retrieve project milestones.")
      }

      return {
        projectId,
        milestones: data ?? [],
      }
    },
  })

//Get Applications
export const getApplications = tool({
  description:
    
  "Get the job applications belonging to the authenticated ALYMERA user.",
  inputSchema: z.object({}),

execute: async ({}) => {
  const supabase = await createClient()
  const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)

    if (error) {
  console.error("getApplications error:", error)
  throw new Error("Failed to retrieve project applications.")
}
return {
  applications: data ?? [],
 }
},
})


//Get Progress
export const getProjectProgress = tool({
  description:
    "Get the project progress for a specific ALYMERA project.",

  inputSchema: z.object({
    projectId: z
      .string()
      .uuid()
      .describe("The UUID of the ALYMERA project"),
  }),

  execute: async ({ projectId }) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)

    if (error) {
      console.error("getProjectProgress error:", error)
      throw new Error("Failed to retrieve project task progress.")
    }

    const totalComplete = calculateTaskComplete(
      data ?? [],
      projectId
    )

    const totalTask = calculateTotalTask(
      data ?? [],
      projectId
    )

    const progress = calculateProgress(
      totalComplete,
      totalTask
    )

    return {
      projectId,
      totalComplete,
      totalTask,
      progress,
    }
  },
})


//Get Projects
export const getProjects = tool({
  description:
    
  "Get the projects belonging to the authenticated ALYMERA user.",
  inputSchema: z.object({}),

execute: async ({}) => {
  const supabase = await createClient()
  const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)

    if (error) {
  console.error("getProjects error:", error)
  throw new Error("Failed to retrieve projects.")
}
return {
  projects: data ?? [],
 }
},
})

// Get tasks for the current project
export const getCurrentProjectTasks = (projectId: string) =>
  tool({
    description:
      "Get the tasks belonging to the current project workspace.",

    inputSchema: z.object({}),

    execute: async () => {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, project_id, name, description, status, due_date, milestone_id"
        )
        .eq("project_id", projectId)

      if (error) {
        console.error("getCurrentProjectTasks error:", error)
        throw new Error("Failed to retrieve project tasks.")
      }

      return {
        projectId,
        tasks: data ?? [],
      }
    },
  })

//Create Project
export const createProject = tool({
  description:
    
  "Create a project belonging to the authenticated ALYMERA user.",
   needsApproval: true,
  inputSchema: z.object({
     name: z.string().min(1, "Must be atleast 1 char"),
    description: z.string().min(1, "Must be atleast 1 char" ), 
    status: z.enum(["Planning", "In Progress", "Complete"]),
    tech_stack:z.string().optional(),
    due_date: z.string().optional()
         
  }),

execute: async ({
  name,
  description,
  status,
  tech_stack,
  due_date,
}) =>  {
  const supabase = await createClient()
  const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase 
                      .from("projects")
                      .insert({
                      user_id: user.id,
                      name,
                      description,
                      status,
                      tech_stack: makeArray(tech_stack ?? ""),
                    due_date,})
                 
                        .select();
                    if (error) {
                      console.error("Insert error:", error);
                      return;
                    }
    
return {
  project: data?.[0] ?? null,
}
},
})


//Create Task
export const createTask = tool({
  description:
    
  "Create a task belonging to a specific project or milestone.",
    needsApproval: true,
  inputSchema: z.object({
    name:z.string().min(1, "Must be atleast 1 char"),
    status:z.enum(["Backlog", "To Do", "In Progress", "In Review", "Done"]),
    description:z.string().optional(),
    due_date:z.string().optional(),
    milestone_id:z.string().uuid().nullable().optional(),
     projectId: z
      .string()
      .uuid()
      .describe("The UUID of the ALYMERA project"),
         
  }),

execute: async ({
  name,
  status,
  description,
  due_date,
  milestone_id,
  projectId,
}) => {
  console.log("CREATE TASK EXECUTING:", {
    name,
    projectId,
  })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      name,
      description,
      status,
      due_date,
      milestone_id,
    })
    .select()

  console.log("CREATE TASK RESULT:", {
    task: data?.[0],
    error,
  })

  if (error) {
    console.error("Insert error:", error)
    return
  }

  return {
    task: data?.[0] ?? null,
  }
},
})


//Create Milestone
export const createMilestone = tool({
  description:
    
  "Create a milestone belonging to a specific ALYMERA project.",
   needsApproval: true,
  inputSchema: z.object({
  name: z.string().min(1, "Must be atleast 1 char"),
  description: z.string().min(1, "Must be atleast 1 char"),
  status: z.enum(["Up Coming", "In Progress", "Complete"]),
  due_date: z.string().optional(),
     projectId: z
      .string()
      .uuid()
      .describe("The UUID of the ALYMERA project"),
         
  }),

execute: async ({
  name,
  status,
  description,  
  due_date,
  projectId,
}) =>  {
  const supabase = await createClient()

  const { data, error } = await supabase 
                      .from("milestones")
                      .insert({
                
                        project_id: projectId,
                        name,
                        description,
                        status,
                        due_date,
                  })
   
                 
                        .select();
                    if (error) {
                        console.error("createMilestone error:", error)
                        throw new Error("Failed to create milestone.")
         
                    }
    
return {
  milestone: data?.[0] ?? null,
}
},
})


//Create Application
export const createApplication = tool({
  description:
    
 "Create an application belonging to the authenticated ALYMERA user.",
  needsApproval: true,
  inputSchema: z.object({
  company: z.string().min(1, "Must be atleast 1 char"),
  location: z.string().min(1, "Must be atleast 1 char"),
  position: z.string().min(1, "Must be atleast 1 char"),
  status: z.enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']),
  date_applied: z.string().optional(),
     
         
  }),

execute: async ({
  company,
  location,
  position,
  status,
  date_applied  
 
}) =>  {
  const supabase = await createClient()
 const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase 
                      .from("applications")
                      .insert({
                
                        user_id: user.id,
                       company,
                        location,
                        position,
                        status,
                        date_applied  
                  })
   
                 
                        .select();
                    if (error) {
                        console.error("createApplication error:", error)
                        throw new Error("Failed to create application.")
             
                    }
    
return {
  application: data?.[0] ?? null,
}
},
})


//Update Task
export const UpdateTask = tool({
  description:
    
  "Update a task belonging to a specific project or milestone.",
   needsApproval: true,
  inputSchema: z.object({

         
name: z.string().min(1).optional(),
status: z.enum(["Backlog", "To Do", "In Progress", "In Review", "Done"]).optional(),
description: z.string().optional(),
due_date: z.string().optional(),
milestone_id: z.string().uuid().nullable().optional(),
      taskId: z
      .string()
      .uuid()
      .describe("The UUID of the ALYMERA task"),
  }),

execute: async ({
  name,
  status,
  description,  
  due_date,
  milestone_id,
  taskId,

}) =>  {
  const supabase = await createClient()

  const { data, error } = await supabase 
                      .from("tasks")
                      .update({
                
                        name,
                        description,
                        status,
                        due_date,
                        milestone_id,})
                        .eq("id", taskId)
   
                 
                        .select();
                    if (error) {
                       console.error("updateTask error:", error)
                         throw new Error("Failed to update task.")
                  
                    }
    
return {
  task: data?.[0] ?? null,
}
},
})


//Update  Application Status
export const UpdateApplication = tool({
  description:
    
  "Update an application status belonging to the authenticated ALYMERA user.",
   needsApproval: true,
  inputSchema: z.object({

status: z.enum(['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted']),

      applicationId: z
      .string()
      .uuid()
     .describe("The UUID of the ALYMERA job application"),
  }),

execute: async ({
 
  status,
 applicationId,

}) =>  {
 const supabase = await createClient()
 const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase 
                      .from("applications")
                      .update({
            
                        status,
                     
                  })
                  .eq("id", applicationId)
                   .eq("user_id", user.id)
   
                 
                        .select();
                    if (error) {
                        console.error("updateApplication error:", error)
                        throw new Error("Failed to update application.")
             
                    }
    
return {
  application: data?.[0] ?? null,
}
},
})



export async function getResumeData() {

   const supabase = await createClient()
  const {
  data: { user },
} = await supabase.auth.getUser()
 
if (!user) {
  throw new Error("Unauthorized")
}
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .limit(1)

  const resume = data?.[0] ?? null

  if (error) {
  console.error("getResume error:", error)
  throw new Error("Failed to retrieve resume.")
}
if (!resume) {
  return {
    resume: null,
  }
}

 const [expRes, eduRes, certRes, skillsRes, rpRes] = await Promise.all([
           supabase.from('experiences').select('*').eq('resume_id', resume.id).order('start_date', { ascending: false }),
           supabase.from('educations').select('*').eq('resume_id', resume.id).order('start_date', { ascending: false }),
           supabase.from('certifications').select('*').eq('resume_id', resume.id).order('issue_year', { ascending: false }),
           supabase.from('skills').select('*').eq('resume_id', resume.id),
           supabase.from('resume_projects').select('*, projects(*)').eq('resume_id', resume.id).order('display_order', { ascending: true })
         ]);

        if (expRes.error) {
  throw new Error("Failed to retrieve experiences.")
}

        if (eduRes.error) {
        throw new Error("Failed to retrieve educations.")
        }

        if (certRes.error) {
        throw new Error("Failed to retrieve certifications.")
        }

        if (skillsRes.error) {
        throw new Error("Failed to retrieve skills.")
        }

        if (rpRes.error) {
        throw new Error("Failed to retrieve resume projects.")
        }


    
return {
  resume,
  experiences: expRes.data ?? [],
  educations: eduRes.data ?? [],
  certifications: certRes.data ?? [],
  skills: skillsRes.data ?? [],
  projects: rpRes.data ?? [],
}
}

//Get Resume
export const getResume = tool({
  description:
    
  "Get the resume belonging to the authenticated ALYMERA user.",
  inputSchema: z.object({}),

execute: async ({}) => {
  return getResumeData()
},
})

export function createProjectContextTools(projectId: string) {
  return {
    getCurrentProjectTasks: tool({
      description:
        "Get the tasks belonging to the current project. The project is determined by the current workspace.",

      inputSchema: z.object({}),

      execute: async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from("tasks")
          .select(
            "id, project_id, name, description, status, due_date, milestone_id"
          )
          .eq("project_id", projectId)

        if (error) {
          console.error("getCurrentProjectTasks error:", error)
          throw new Error("Failed to retrieve project tasks.")
        }

        return {
          projectId,
          tasks: data ?? [],
        }
      },
    }),

    getCurrentProjectMilestones: tool({
      description:
        "Get the milestones belonging to the current project. The project is determined by the current workspace.",

      inputSchema: z.object({}),

      execute: async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from("milestones")
          .select("*")
          .eq("project_id", projectId)

        if (error) {
          console.error("getCurrentProjectMilestones error:", error)
          throw new Error("Failed to retrieve project milestones.")
        }

        return {
          projectId,
          milestones: data ?? [],
        }
      },
    }),

    getCurrentProjectProgress: tool({
      description:
        "Get the progress of the current project. The project is determined by the current workspace.",

      inputSchema: z.object({}),

      execute: async () => {
        const supabase = await createClient()

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)

        if (error) {
          console.error("getCurrentProjectProgress error:", error)
          throw new Error("Failed to retrieve project progress.")
        }

        const totalComplete = calculateTaskComplete(
          data ?? [],
          projectId
        )

        const totalTask = calculateTotalTask(
          data ?? [],
          projectId
        )

        const progress = calculateProgress(
          totalComplete,
          totalTask
        )

        return {
          projectId,
          totalComplete,
          totalTask,
          progress,
        }
      },
    }),
  }
}