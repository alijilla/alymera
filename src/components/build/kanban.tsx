"use client"
import { format, parseISO } from "date-fns"
import {useEffect, useCallback } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog"
  import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { PlusIcon,  PencilIcon, TrashIcon, MoreVertical } from "lucide-react"
import { tasksSchema } from "@/lib/schemas/taskSchema"
import { z } from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import {DragDropProvider} from '@dnd-kit/react';
import {useDraggable} from '@dnd-kit/react';
import {useDroppable} from '@dnd-kit/react';
const taskStatusValues = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Done",
] as const
import { supabase } from "@/lib/supabase/client"


type Task  = {
  id: string | number
  project_id: string
  name: string
  description: string
  status: string
  due_date: string | null
  milestone_id?: string | null
}

interface KanbanProps {
  projectId: string
}

type TaskFormValues = z.infer<typeof tasksSchema>




export function Kanban({ projectId }: KanbanProps) {


  type DBMilestone = { id: string, name: string }
  const [task, setIsTask] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<DBMilestone[]>([])

  const getTasks = useCallback(async () => {
    console.log("Fetching tasks for project:", projectId);
    try {
      const { data, error } = await supabase 
        .from("tasks") 
        .select("*")
        .eq("project_id", projectId);
       
      if (error) {
        console.error("Task fetch error:", error.message);
        toast.error(`Failed to load tasks: ${error.message}`);
        return;
      }
      
      console.log("Tasks fetched successfully:", data);
      setIsTask(data || []);
    } catch (err) {
      console.error("Unexpected error fetching tasks:", err);
      toast.error("An unexpected error occurred while loading tasks");
    }
  }, [projectId])

  const getMilestones = useCallback(async () => {
    const { data } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", projectId)
    if (data) setMilestones(data)
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      getTasks();
      getMilestones();
    }
  }, [projectId, getTasks, getMilestones]);


const columns = taskStatusValues



const projectTasks = (task).filter((task) => task.project_id === projectId)
   const taskForm  = useForm<TaskFormValues>(
     { resolver: zodResolver(tasksSchema), 
        defaultValues: {
     name: "",
     description: "",
     milestone_id: null,
   },
     }
   )
   
   const editTaskForm = useForm<TaskFormValues>({
  resolver: zodResolver(tasksSchema),
  defaultValues: {
    name: "",
    description: "",
    milestone_id: null,
  },
})
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [editingTask, setEditingTask] = useState<Task | null>(null)
  const selectedStatus = taskForm.watch("status")
  const selectedEditStatus = editTaskForm.watch("status")
   
   async  function onSubmit(values: TaskFormValues) {
     
   
    try{
             
           const {
                   data: { user },
                   error: userError,
                 } = await supabase.auth.getUser()
   
                 if (userError) {
                   console.log("User error:", userError)
                   return
                 }
   
                 if (!user) {
                   console.log("No user is logged in")
                   return
                 }
   
           console.log("Current user:", user.id)
                const { error } = await supabase
                  .from("tasks")
                  .insert({
                    project_id: projectId,
                    name: values.name,
                    description: values.description,
                    status: values.status,
                    due_date: values.due_date ?? null,
                    milestone_id: values.milestone_id === "null" || !values.milestone_id ? null : values.milestone_id,
                  })
                  .select();
                
                if (error) {
                  console.error("Insert error:", error);
                  toast.error(`Failed to create task: ${error.message}`);
                  return;
                }
         
      } catch (err) {
        console.error("Unexpected error creating task:", err);
        toast.error("An unexpected error occurred");
        return;
      }
      
      console.log("Task created:", values);
      taskForm.reset();
      setIsCreateDialogOpen(false);
      await getTasks();
      toast.success("Task Created");
    }
   




   function handleEditTask(task: Task) {
      setEditingTask(task);
      editTaskForm.reset({
      name: task.name,
      description: task.description,
      status: task.status as   "Backlog" | "To Do" |"In Progress"|"In Review"|"Done",
      due_date: task.due_date ?? undefined,
      milestone_id: task.milestone_id ?? null,
      })
   
     setIsEditDialogOpen(true)
   }
    async function onEditSubmit(values: TaskFormValues) {
     try{
               
             const {
                     data: { user },
                     error: userError,
                   } = await supabase.auth.getUser()
     
                   if (userError) {
                     console.log("User error:", userError)
                     return
                   }
     
                   if (!user) {
                     console.log("No user is logged in")
                     return
                   }
     
             console.log("Current user:", user.id)
               const { error } = await supabase 
               .from("tasks") 
               .update({
               project_id: projectId,
               name: values.name,
               description: values.description,
               status: values.status,
               due_date: values.due_date
       ? format(values.due_date, "yyyy-MM-dd")
       : null,
               milestone_id: values.milestone_id === "null" || !values.milestone_id ? null : values.milestone_id,
             })
                .eq("id", editingTask?.id ?? "")
              .select();
              
              if (error) {
                console.error("Update error:", error);
                toast.error(`Failed to update task: ${error.message}`);
                return;
              }
           
        } catch (err) {
          console.error("Unexpected error updating task:", err);
          toast.error("An unexpected error occurred");
          return;
        }
        
        setIsEditDialogOpen(false);
        await getTasks();
        console.log("Task updated:", values);
        toast.success("Task updated successfully");
      }


   async function handleDeleteTask(task: Task) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("User error:", userError);
          toast.error("Authentication error");
          return;
        }

        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", task.id);
      
        if (error) {
          console.error("Delete error:", error);
          toast.error(`Failed to delete task: ${error.message}`);
          return;
        }

        setIsDeleteDialogOpen(false);
        await getTasks();
        toast.success("Task deleted successfully");
      } catch (err) {
        console.error("Unexpected error deleting task:", err);
        toast.error("An unexpected error occurred");
      }
   }
  
   
function DraggableItem({
  task,
  children,
}: {
  task: Task
  children: React.ReactNode
}) {
  const draggable = useDraggable({
    id: task.id,
  })

  return (
    <Card
      ref={draggable.ref}
      className={`rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing bg-card ${
        draggable.isDragging ? "opacity-50 scale-105 z-50 shadow-lg ring-2 ring-primary/20" : ""
      }`}
    >
      {children}
    </Card>
  )
}
  
function Dropzone({
  column,
  children,

}: {
  column: string
  children: React.ReactNode
  
}) {
  const droppable = useDroppable({
    id: column,
  })

  return (
    <Card ref={droppable.ref} className="bg-muted/30 border-border/50 rounded-2xl shadow-sm h-full flex flex-col min-h-[400px]">
      {children}
    </Card>
  )
}
 

   function kanban(){

 
    return (
              <>
              
                   <DragDropProvider
  onDragEnd={ async (event) => {
    const { source, target } = event.operation

    if (!source || !target) return
    
     const newStatus =
    target.id as (typeof taskStatusValues)[number]
    setIsTask((currentTasks) => 
    currentTasks.map((task) => 
    task.id === source.id
  ? {
    ...task,
    status: target.id as (typeof taskStatusValues)[number],
  } 
  : task

      )
    )

    const {error} = await supabase 
               .from("tasks") 
               .update({ status: newStatus })
               .eq("id", source.id )
              .select();

    if (error) {
      console.log("Task status update error:", error)
      return
    }

 



  }



  }
>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 space-y-4 gap-2">

 
            {columns.map((column) => {
              const columnTasks = projectTasks.filter(
                (task) => task.status === column
              )
        return (
        


         <Dropzone key={column} column={column}>
            <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between border-b border-border/30 mb-3">
              <CardTitle className="text-sm font-bold tracking-wide">{column}</CardTitle>
              <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-semibold text-muted-foreground">{columnTasks.length}</span>
            </CardHeader>
            <CardContent className="space-y-4 px-3 pb-4 flex-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                    <DraggableItem key={task.id} task={task}>
                    <div className="flex flex-row items-start justify-between p-4 pb-2">
                        <p className="font-semibold text-sm leading-tight line-clamp-2 pr-4">
                        {task.name}
                        </p>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleEditTask(task)}>
                            <PencilIcon className="mr-2 w-4 h-4" />
                            Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onSelect={() => handleDeleteTask(task)} className="text-destructive focus:text-destructive">
                            <TrashIcon className="mr-2 w-4 h-4" />
                            Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="px-4 pb-4 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                        </p>

                        <div className="flex items-center text-[10px] font-medium text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded-md">
                        Due{" "}
  {task.due_date
  ? format(parseISO(task.due_date), "PPP")
  : "No due date"}
                        </div>
                    </div>
                    </DraggableItem>
                  
                ))
              ) : (

            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl">
                  <p className="text-xs font-medium text-muted-foreground">No tasks</p>
                </div>
              )}
            </CardContent>
          </Dropzone>
          
        )
      })}
       
    
      </div>
      </DragDropProvider>
              </>



    );
  
   }

 
  return (
    <>
    <div>
        <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
            <div>
              <CardTitle className="text-xl font-bold mb-2">Kanban Board</CardTitle>
              <CardDescription className="text-base text-muted-foreground font-medium">
                Track and manage your project tasks efficiently.
              </CardDescription>
            </div>
            <CardContent className="p-0 flex-shrink-0">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger onClick={(()=> setIsCreateDialogOpen(true))} asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-5 shadow-lg shadow-purple-500/20 transition-all hover:scale-105">             
                    <PlusIcon className="mr-2 h-5 w-5 text-orange-300" /> Add Task 
                  </Button>
                </DialogTrigger>
                
                  <DialogContent>  
                    <DialogTitle>
                    Create task
                    </DialogTitle>
                    
                   <Form {...taskForm}>
                      <form onSubmit={taskForm.handleSubmit(onSubmit, (errors) => console.log("ZOD ERRORS:", errors))} className="space-y-6">
                            <FormDescription>Input Your Project Details.</FormDescription>
                            <FormField 
                            control={taskForm.control}
                              name="name"
                              render={({ field }) => (
                           <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input placeholder="i.eg Polish the Kanban Styl"  {...field}  />
                              </FormControl>
                              <FormMessage />
                            </FormItem>

                              )} />

                              <FormField 
                               control={taskForm.control}
                               name="description"
                               render={({ field }) => (
                              <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g use tailwind css, shadcn/ui and leverage ai " {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
 
                               )}/>
                           

                            <FormField
                              control={taskForm.control}
                              name="status"
                              render={({ field }) => (
                          <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>

                        <Select  onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status</SelectLabel>
                               
                                    <SelectItem value="Backlog">
                                     Backlog
                                    </SelectItem>
                                    <SelectItem value="In Progress">
                                     In Progress
                                    </SelectItem>
                                    <SelectItem value="In Review">
                                     In Review
                                    </SelectItem>
                                  <SelectItem value="Done">
                                     Done
                                    </SelectItem>
                    
                                </SelectGroup>
                              </SelectContent>
                            </Select>                  
                              </FormControl>
                              <FormMessage />
                            </FormItem>
  )}
/>  
                            {selectedStatus === "Done" ? null : (
                            <FormField
                              control={taskForm.control}
                              name="due_date"
                              render={({ field }) => {
                                const selectedDate = field.value ? new Date(field.value) : undefined

                                return (
                                  <FormItem>
                                    <FormLabel>DueDate</FormLabel>
                                    <FormControl className="flex-1">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant="outline">
                                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )
                              }}
                            />
                            )}

                            <FormField
                              control={taskForm.control}
                              name="milestone_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value || "null"}>
                                      <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="Select a Milestone" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          <SelectLabel>Milestones</SelectLabel>
                                          {milestones.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                              {m.name}
                                            </SelectItem>
                                          ))}
                                          <SelectItem value="null">
                                            Other / No Milestone
                                          </SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                      <DialogFooter>
                         <Button type="submit" className="flex-1" >Add</Button>       
                        
                      </DialogFooter>
                           
                      </form>
                       
                    </Form>
                 
               

              </DialogContent>
            </Dialog>
          </CardContent>
          </div>
        </Card>
        <div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>

              </DialogTrigger>
                
                  <DialogContent>  

                <DialogTitle>
                    Edit task
                    </DialogTitle>
                   <Form {...editTaskForm}>
                      <form onSubmit={editTaskForm.handleSubmit(onEditSubmit, (errors) => console.log("ZOD ERRORS:", errors))} className="space-y-6">
                            <FormDescription>Input Your Project Details.</FormDescription>
                            <FormField 
                            control={editTaskForm.control}
                              name="name"
                              render={({ field }) => (
                           <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input placeholder="i.eg Polish the Kanban Styl"  {...field}  />
                              </FormControl>
                              <FormMessage />
                            </FormItem>

                              )} />

                              <FormField 
                               control={editTaskForm.control}
                               name="description"
                               render={({ field }) => (
                              <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g use tailwind css, shadcn/ui and leverage ai " {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
 
                               )}/>
                           

                            <FormField
                              control={editTaskForm.control}
                              name="status"
                              render={({ field }) => (
                          <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>

                        <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status</SelectLabel>
                               
                                    <SelectItem value="Backlog">
                                     Backlog
                                    </SelectItem>
                                    <SelectItem value="In Progress">
                                     In Progress
                                    </SelectItem>
                                    <SelectItem value="In Review">
                                     In Review
                                    </SelectItem>
                                  <SelectItem value="Done">
                                     Done
                                    </SelectItem>
                    
                                </SelectGroup>
                              </SelectContent>
                            </Select>                  
                              </FormControl>
                              <FormMessage />
                            </FormItem>
  )}
/>  
                            { selectedEditStatus === "Done" ? null :
       
                         
                            <FormField
                              control={editTaskForm.control}
                              name="due_date"
                              render={({field}) => (<FormItem>
                              <FormLabel>DueDate</FormLabel>
                              <FormControl className="flex-1">
                            <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline"> 
                              {field.value ? format(parseISO(field.value), "PPP") : "Pick a date"}
                              </Button>                             
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value ? parseISO(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)}
                              />
                            </PopoverContent>
                          </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem> )}               
                            />
                  
                            }

                            <FormField
                              control={editTaskForm.control}
                              name="milestone_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value || "null"}>
                                      <SelectTrigger className="w-[280px]">
                                        <SelectValue placeholder="Select a Milestone" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          <SelectLabel>Milestones</SelectLabel>
                                          {milestones.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                              {m.name}
                                            </SelectItem>
                                          ))}
                                          <SelectItem value="null">
                                            Other / No Milestone
                                          </SelectItem>
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                      <DialogFooter>
                         <Button type="submit" className="flex-1" >Save</Button>
                        
                      </DialogFooter>
                           
                      </form>
                       
                    </Form>
                 
               

              </DialogContent>
            </Dialog>


        </div>
        <div>

  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
   <DialogContent>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              setIsDeleteDialogOpen(false)
               toast.success("Task deleted")
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
   </DialogContent>

  </Dialog>

        </div>
    </div>

      {kanban()}
 
    </>
  )
}

