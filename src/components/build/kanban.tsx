"use client"

import { actproject } from "@/data/projectdata"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format } from "date-fns"
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

import { tasks } from "@/data/taskdata"
import { PlusIcon,  PencilIcon, TrashIcon, ChevronLeft, MoreVertical } from "lucide-react"
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

type TaskStatus = (typeof taskStatusValues)[number]

interface Task {
  id: string | number
  project_id: string
  name: string
  description: string
  status: TaskStatus
  dueDate?: Date | string
}

interface KanbanProps {
  projectId: string
}

type TaskFormValues = z.infer<typeof tasksSchema>

const columns: TaskStatus[] = [...taskStatusValues]


export function Kanban({ projectId }: KanbanProps) {
const [editingTask, setEditingTask] = useState<Task | null>(null)
 const projectTasks = (tasks as Task[]).filter((task) => task.project_id === projectId)
   const taskForm  = useForm<TaskFormValues>(
     { resolver: zodResolver(tasksSchema), 
        defaultValues: {
     name: "",
     description: "",
     
   },
     }
   )

   const editTaskForm = useForm<TaskFormValues>({
  resolver: zodResolver(tasksSchema),
  defaultValues: {
    name: "",
    description: "",
  },
})
   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const selectedStatus = taskForm.watch("status")
  const selectedEditStatus = editTaskForm.watch("status")
   
     function onSubmit(values: TaskFormValues) {
     console.log(values)
     taskForm.reset()
     setIsCreateDialogOpen(false) 
     toast.success("Task Created")
   }
   
   
   function handleEditTask(task: Task) {
     setEditingTask(task)
     editTaskForm.reset({
       name: task.name,
       description: task.description,
       status: task.status,
       dueDate: task.dueDate instanceof Date ? task.dueDate : undefined,
     })
     setIsEditDialogOpen(true)
   }
    const onEditSubmit = (values: TaskFormValues) => {
     console.log(values)
     setEditingTask(null)
     editTaskForm.reset()
     setIsEditDialogOpen(false)
     toast.success("Task Updated")
   }
    if (!projectTasks.length) {
    return <div>tasks not found</div>
  }


   function handleDeleteTask(task: Task) {
      console.log("deleted")
    setIsDeleteDialogOpen(true)
    
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
      className={draggable.isDragging ? "opacity-50" : ""}
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
    <Card ref={droppable.ref} >
      {children}
    </Card>
  )
}
 

 

 
  return (
    <>
    <div>
        <Card>
        <CardDescription className="text-base mt-2 text-foreground">
          Track and Manage your project tasks
        </CardDescription>
       <CardContent className="p-0 flex-shrink-0">

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger onClick={(()=> setIsCreateDialogOpen(true))}asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" >             
                <PlusIcon className="mr-2 h-4 w-4 text-orange-300" /> Add Task 
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
                            { selectedStatus === "Done" ? null :
       
                         
                            <FormField
                              control={taskForm.control}
                              name="dueDate"
                              render={({field}) => (<FormItem>
                              <FormLabel>DueDate</FormLabel>
                              <FormControl className="flex-1">
                            <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline"> 
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              </Button>                             
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                            </PopoverContent>
                          </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem> )}               
                            />
                  
                            }

                      <DialogFooter>
                         <Button type="submit" className="flex-1" >Add</Button>       
                        
                      </DialogFooter>
                           
                      </form>
                       
                    </Form>
                 
               

              </DialogContent>
            </Dialog>
          </CardContent>

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
                              name="dueDate"
                              render={({field}) => (<FormItem>
                              <FormLabel>DueDate</FormLabel>
                              <FormControl className="flex-1">
                            <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline"> 
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              </Button>                             
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                            </PopoverContent>
                          </Popover>
                              </FormControl>
                              <FormMessage />
                            </FormItem> )}               
                            />
                  
                            }

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


      <DragDropProvider
  onDragEnd={(event) => {
    const { source, target } = event.operation

    if (!source || !target) return

    console.log(source.id)
    console.log(target.id)
  }}
>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 space-y-4 gap-2">

 
      {columns.map((column) => {
        const columnTasks = projectTasks.filter((task) => task.status === column)

        return (
          
         <Dropzone key={column} column={column}>
            <CardHeader>
              <CardTitle className="">{column}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                    <DraggableItem key={task.id} task={task}>
                    <CardHeader>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary">
                            <MoreVertical className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleEditTask(task)}>
                            <PencilIcon className="mr-2 w-4 h-4" />
                            Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onSelect={() => handleDeleteTask(task)}>
                            <TrashIcon className="mr-2 w-4 h-4" />
                            Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>

                    <CardContent className="space-y-1 p-4">
                        <p className="font-medium md:text-[15px]">
                        {task.name}
                        </p>

                        <p className="text-sm text-muted-foreground md:text-[10px]">
                        {task.description}
                        </p>

                        <p className="text-xs text-muted-foreground md:text-[10px]">
                        Due{" "}
                        {task.dueDate instanceof Date
                            ? task.dueDate.toLocaleDateString()
                            : task.dueDate}
                        </p>
                    </CardContent>
                    </DraggableItem>
                  
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tasks</p>
              )}
            </CardContent>
          </Dropzone>
          
        )
      })}
       
    
      </div>
      </DragDropProvider>
    </>
  )
}

