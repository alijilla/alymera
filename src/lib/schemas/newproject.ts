import { z } from "zod"

export const newProjectSchema = z.object ({
      name: z.string().min(1, "Must be atleast 1 char"),
      description: z.string().min(1, "Must be atleast 1 char" ), 
      techstack:z.array(z.string()).optional(),
      status: z.enum(["Planning", "In Progress", "Complete"]),
      dueDate: z.date().optional(),
      imageSrc: z.any().optional(),
})

