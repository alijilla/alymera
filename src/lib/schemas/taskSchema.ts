   import { z } from "zod"


   export const tasksSchema = z.object ({    
    name:z.string().min(1, "Must be atleast 1 char"),
    status:z.enum(["Backlog", "To Do", "In Progress", "In Review", "Done"]),
    description:z.string().optional(),
    due_date:z.string().optional(),
    milestone_id:z.string().nullable().optional(),
   })
   
   
