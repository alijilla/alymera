import { z } from "zod"

export const milestoneSchema = z.object({
  name: z.string().min(1, "Must be atleast 1 char"),
  description: z.string().min(1, "Must be atleast 1 char"),
  status: z.enum(["Up Coming", "In Progress", "Complete"]),
  due_date: z.date().optional(),
})

export const newProjectSchema = z.object ({
      name: z.string().min(1, "Must be atleast 1 char"),
      description: z.string().min(1, "Must be atleast 1 char" ), 
      status: z.enum(["Planning", "In Progress", "Complete"]),
      tech_stack:z.string().optional(),
      image_src: z.any().optional(),
      due_date: z.date().optional(),
      milestones: z.array(milestoneSchema).optional(),
})

   export const tasksSchema = z.object ({    
    name:z.string().min(1, "Must be atleast 1 char"),
    status:z.enum(["Backlog", "To Do", "In Progress", "In Review", "Done"]),
    description:z.string().optional(),
    due_date:z.string().optional(),
    milestone_id:z.string().nullable().optional(),
   })