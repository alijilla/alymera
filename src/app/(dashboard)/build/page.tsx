"use client"

import {useState, useEffect} from "react"
import { z } from "zod"
import { supabase } from "@/lib/supabase/client";
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { newProjectSchema } from "@/lib/schemas/newproject"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"



import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CalendarIcon, PlusCircleIcon, MoreVertical, TrashIcon, PencilIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  ArrowRight,
} from "lucide-react"

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



import { makeArray } from "@/lib/utils";
  type Project = {
    id: string
    name: string
    description: string
    image_src: string
    status: string
    tech_stack: string[]
    due_date: string | null
  }

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join(" ")
    .toUpperCase()
}

export default function DashboardPage() {



  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
const [deletingProject, setDeletingProject] = useState<Project | null>(null) 

  const projectForm  = useForm<z.infer<typeof newProjectSchema>>(
    { resolver: zodResolver(newProjectSchema), 
       defaultValues: {
    name: "",
    description: "",
    status: "Planning",
    image_src: "",
    milestones: [],
  },
    }
  )

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
    control: projectForm.control,
    name: "milestones"
  })

  const selectedStatus = projectForm.watch("status")

   const editProjectForm  = useForm<z.infer<typeof newProjectSchema>>(
    { resolver: zodResolver(newProjectSchema), 
       defaultValues: {
    name: "",
    description: "",
    status: "Planning",
    image_src: "",
    milestones: [],
  },
    }
  )
  
  type DBTask = {
    id: string
    project_id: string
    name: string
    status: string
    due_date: string | null
  }

  const isEditselectedStatus = editProjectForm.watch("status")
  const [isProject, setIsProject] = useState<Project[]>([])
  const [tasks, setTasks] = useState<DBTask[]>([]) 
 


  async function getProjects(){
    console.log("Fetching projects...");
    try{
      const {data, error} = await supabase 
      .from("projects") 
      .select("*");
      
      if (error) {
        console.error("Project fetch error:", error.message);
        toast.error(`Failed to load projects: ${error.message}`);
        return;
      }
      
      console.log("Projects fetched successfully:", data);
      setIsProject(data || []);
    } catch (err) {
      console.error("Unexpected error fetching projects:", err);
      toast.error("An unexpected error occurred while loading projects");
    }
  }
  useEffect(() => {
    getProjects()
    
    async function getTasks() {
      const { data } = await supabase.from("tasks").select("*")
      if (data) setTasks(data)
    }
    getTasks()

    const channel = supabase
      .channel('build-page-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        getTasks()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        getProjects()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  
  
  
    async function onSubmit(values: z.infer<typeof newProjectSchema>): Promise<void> {

          
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
                  const { data: newProjectData, error } = await supabase 
                    .from("projects")
                    .insert({
                    user_id: user.id,
                    name: values.name,
                    description:values.description,
                    status: values.status,
                    tech_stack: makeArray(values.tech_stack ?? ""),
                    image_src: "",
                  due_date: values.due_date
            ? format(values.due_date, "yyyy-MM-dd")
            : null,})
                    .select();
                    
                  if (error) {
                    console.error("Insert error:", error);
                    toast.error(`Failed to create project: ${error.message}`);
                    return;
                  }
  
                  if (newProjectData && newProjectData.length > 0) {
                    const newProjectId = newProjectData[0].id;

                    // Image Upload
                    if (values.image_src instanceof File) {
                      const file = values.image_src;
                      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                      
                      if (!allowedTypes.includes(file.type)) {
                        toast.error("Project created, but image must be JPG, PNG, WEBP, or GIF.");
                      } else if (file.size > 5 * 1024 * 1024) {
                        toast.error("Project created, but image must be smaller than 5MB.");
                      } else {
                        const fileExt = file.name.split(".").pop();
                        const fileName = `${crypto.randomUUID()}.${fileExt}`;
                        const filePath = `projects/${user.id}/${newProjectId}/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, file);
                        
                        if (uploadError) {
                          console.error("Upload error:", uploadError);
                          toast.error(`Project created, but image upload failed: ${uploadError.message}`);
                        } else {
                          const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
                          await supabase.from("projects").update({ image_src: publicUrl }).eq("id", newProjectId);
                        }
                      }
                    }

                    if (values.milestones && values.milestones.length > 0) {
                    const milestonesToInsert = values.milestones.map(m => ({
                      project_id: newProjectId,
                      name: m.name,
                      description: m.description,
                      status: m.status,
                      due_date: m.due_date ? format(m.due_date, "yyyy-MM-dd") : null,
                    }));

                    const { error: milestoneError } = await supabase
                      .from("milestones")
                      .insert(milestonesToInsert);

                    if (milestoneError) {
                      console.error("Milestone insert error:", milestoneError);
                      toast.error(`Project created, but failed to add milestones: ${milestoneError.message}`);
                    }
                  }
                }
                
                await getProjects();
      
      } catch (err) {
        console.error("Unexpected error creating project:", err);
        toast.error("An unexpected error occurred");
        return;
      }
      
      console.log("Project created:", values);
      projectForm.reset();
      setIsDialogOpen(false);
      toast.success("Project Created");
    }
  
function handleDelete(project: Project) {
  setDeletingProject(project)
  setIsDeleteDialogOpen(true)
}
  
   async function handleEdit(values: z.infer<typeof newProjectSchema>): Promise<void> {
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
          let finalImageSrc = typeof values.image_src === "string" ? values.image_src : "";
          
          if (values.image_src instanceof File && selectedProjectId) {
            const file = values.image_src;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            
            if (!allowedTypes.includes(file.type)) {
              toast.error("Image must be JPG, PNG, WEBP, or GIF.");
              return;
            }
            if (file.size > 5 * 1024 * 1024) {
              toast.error("Image must be smaller than 5MB.");
              return;
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `projects/${user.id}/${selectedProjectId}/${fileName}`;
            
            const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, file);
            
            if (uploadError) {
              console.error("Upload error:", uploadError);
              toast.error(`Image upload failed: ${uploadError.message}`);
              return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from("project-images").getPublicUrl(filePath);
            finalImageSrc = publicUrl;
          }

          const { error } = await supabase 
          .from("projects") 
          .update({
          user_id: user.id,
          name: values.name,
          description:values.description,
          status: values.status,
          tech_stack: makeArray(values.tech_stack ?? ""),
          image_src: finalImageSrc,
         due_date: values.due_date
  ? format(values.due_date, "yyyy-MM-dd")
  : null,})
           .eq("id", selectedProjectId ?? "")
         .select();
         
         if (error) {
           console.error("Update error:", error);
           toast.error(`Failed to update project: ${error.message}`);
           return;
         }
         
         await getProjects();
      
      } finally{
         setIsEditDialogOpen(false);
      }
    
      console.log("Project updated:", values);
      toast.success("Project updated successfully");
    }

return (
    
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-4">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Projects
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
            Turn your work into structured, career-ready evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
              <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-5 shadow-lg shadow-primary/20 transition-all hover:scale-105" >             
                <PlusCircleIcon className="mr-2 h-5 w-5 text-orange-300" /> Create Project  
              </Button>
              </DialogTrigger>
                
                  <DialogContent className="w-full h-[600px] max-h-[calc(100vh-120px)] shadow-2xl flex flex-col overflow-y-scroll">  

                   <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit(onSubmit, (errors) => console.log("ZOD ERRORS:", errors))} className="space-y-6">
                            <FormDescription>Input Your Project Details.</FormDescription>
                            <FormField 
                            control={projectForm.control}
                              name="name"
                              render={({ field }) => (
                           <FormItem>
                              <FormLabel>Project Name</FormLabel>
                              <FormControl>
                                <Input placeholder="i.eg AI Project Manager"  {...field}  />
                              </FormControl>
                              <FormMessage />
                            </FormItem>

                              )} />

                              <FormField 
                               control={projectForm.control}
                               name="description"
                               render={({ field }) => (
                              <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="i.eg Build an ai powered project manager" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
 
                               )}/>


                             <FormField 
                               control={projectForm.control}
                               name="tech_stack"
                               render={({ field }) => (
                              <FormItem>
                              <FormLabel>Techstack</FormLabel>
                              <FormControl>
                            <Input placeholder="e.g react, typescript, next.js" 
                             {...field}                                                 
                            />

                              </FormControl>
                              <FormMessage />
                            </FormItem>
 
                               )}/>


                                <FormField
                                 control={projectForm.control}
                                 name="image_src"
                                 render={({  field: { onChange, value, ...fieldProps } }) => (
                               <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <FormControl>
                                <Input 
                                type="file" 
                                placeholder="i.eg image" {...fieldProps}
                                onChange={(e) =>
                                  onChange(e.target.files && e.target.files[0])
                                }/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>


                                 )}/>
                           
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="status"
                              render={({ field }) => (
                          <FormItem className="flex flex-col">
                              <FormLabel>Status</FormLabel>
                              <FormControl>

                        <Select  onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status</SelectLabel>
                               
                                    <SelectItem value="Planning">
                                     Planning
                                    </SelectItem>
                                    <SelectItem value="In Progress">
                                     In Progress
                                    </SelectItem>
                                  <SelectItem value="Complete">
                                     Complete
                                    </SelectItem>
                    
                                </SelectGroup>
                              </SelectContent>
                            </Select>                  
                              </FormControl>
                              <FormMessage />
                            </FormItem>
  )}
/>  
                            { selectedStatus === "Complete" ? null :
       
                         
                            <FormField
                              control={projectForm.control}
                              name="due_date"
                              render={({field}) => (<FormItem className="flex flex-col">
                              <FormLabel>DueDate</FormLabel>
                              <FormControl className="flex-1">
                            <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline"> 
                              {field.value ? format(field.value, "PPP") : <><CalendarIcon className="w-4 h-4 mr-2" /> Pick a date</>}
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
                             </div>

                            {/* Milestones Section */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Milestones</h3>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => appendMilestone({ name: "", description: "", status: "Up Coming" })}
                                >
                                  <PlusCircleIcon className="w-4 h-4 mr-2" /> Add Milestone
                                </Button>
                              </div>
                              
                              {milestoneFields.map((field, index) => (
                                <div key={field.id} className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Milestone {index + 1}</h4>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive hover:bg-destructive/10" 
                                      onClick={() => removeMilestone(index)}
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  <FormField
                                    control={projectForm.control}
                                    name={`milestones.${index}.name`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Milestone name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={projectForm.control}
                                    name={`milestones.${index}.description`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Milestone description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={projectForm.control}
                                      name={`milestones.${index}.status`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Status</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="Up Coming">Up Coming</SelectItem>
                                              <SelectItem value="In Progress">In Progress</SelectItem>
                                              <SelectItem value="Complete">Complete</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={projectForm.control}
                                      name={`milestones.${index}.due_date`}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                          <FormLabel className="mt-2.5 mb-1.5">Due Date</FormLabel>
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <FormControl>
                                                <Button variant="outline" className={`pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                              </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                              />
                                            </PopoverContent>
                                          </Popover>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

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

    {isProject.length === 0 ? (
      <Card className="bg-card border border-border/40 shadow-sm rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold text-muted-foreground">No projects yet</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first project to get started</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
              <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2" >             
                <PlusCircleIcon className="mr-2 h-5 w-5" /> Create Project  
              </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{isProject.map((proj) => {

     const projectTasks = tasks.filter(t => t.project_id === proj.id)
     const totalTasks = projectTasks.length
     const completedTasks = projectTasks.filter(t => t.status === "Done").length
     const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (   
  <div key={proj.id} className="h-full">
    
    
    
    
    
    
    
    

   

        {/* Active Project */}
        <Card className="group bg-card shadow-sm flex flex-col h-full border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30" >
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
             <Badge variant="outline" className="bg-muted/50 text-foreground font-medium border-border/50 rounded-full px-2.5 py-0.5">{proj.status}</Badge>
            </CardTitle>

             <div className="flex items-start justify-end px-4 pt-4">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
            
                                      <DropdownMenuContent align="end">
                                          
                                        <DropdownMenuItem onSelect={() => {
                                          setSelectedProjectId(proj.id)
                                          editProjectForm.reset({
                                            name: proj.name,
                                            description: proj.description,
                                            status: proj.status as "Planning" | "In Progress" | "Complete",
                                            tech_stack: proj.tech_stack.join(", "),
                                            image_src: proj.image_src,
                                           due_date: proj.due_date ? parseISO(proj.due_date) : undefined,
                                          })
                                          setIsEditDialogOpen(true)
                                        }}>
                                        <PencilIcon className="mr-2 w-4 h-4" />
                                        Edit
                                        </DropdownMenuItem>
            
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => handleDelete(proj)} className="text-destructive focus:text-destructive">
                                        <TrashIcon className="mr-2 w-4 h-4" />
                                        Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
          </CardHeader>
          <CardContent className="space-y-5 flex-1 px-4 md:px-6 pb-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/30">
            <Avatar className="size-[48px] flex-shrink-0 shadow-sm border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials (proj.name)}</AvatarFallback>
                <AvatarImage 
                 src={proj.image_src}
                className="w-full h-full object-cover"  />
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg line-clamp-1">{proj.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{proj.description}</p>
              </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">                 
                  {proj.tech_stack.map(item => (
                 <Badge variant="secondary" key={item}
                 className="text-[10px] px-2.5 py-0.5 rounded-md lowercase bg-background border border-border/50 shadow-sm font-medium">
                     {item}                            
                  </Badge>
                  ))}
              </div>

              <div className="space-y-2 p-3 bg-muted/10 rounded-xl border border-border/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <span className="font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="text-xs font-medium text-muted-foreground text-right">{completedTasks}/{totalTasks} tasks completed</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between gap-3 border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl mt-auto">
            <Link href={`/build/projects/${proj.id}`} className="inline-flex items-center text-sm font-semibold text-foreground hover:text-primary transition-colors group/link">
              View project <ArrowRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
            <div className="flex items-center text-xs font-medium text-muted-foreground bg-background/80 border border-border/50 px-3 py-1.5 rounded-full whitespace-nowrap">
              <CalendarIcon className="w-3.5 h-3.5 mr-2 text-primary" />
             {proj.due_date
  ? format(parseISO(proj.due_date), "PPP")
  : "No due date"}
            </div>
          </CardFooter>
        </Card>
      
    </div>)
  })}
    
      </div>
    )}
      
      {/* 
        EDIT AND DELETE DIALOGS 
        Moved outside the loop to prevent multiple instances
      */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-full max-w-lg h-[600px] max-h-[calc(100vh-120px)] shadow-2xl flex flex-col overflow-y-scroll">
          <Form {...editProjectForm}>
            <form
              onSubmit={editProjectForm.handleSubmit(
                handleEdit,
                (errors) => console.log("ZOD ERRORS:", errors)
              )}
              className="space-y-6"
            >
              <FormDescription>Input Your Project Details.</FormDescription>

              <FormField
                control={editProjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="i.eg AI Project Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editProjectForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="i.eg Build an ai powered project manager"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editProjectForm.control}
                name="tech_stack"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Techstack</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g react, typescript, next.js"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editProjectForm.control}
                name="image_src"
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        placeholder="i.eg image"
                        {...fieldProps}
                        onChange={(e) =>
                          onChange(e.target.files && e.target.files[0])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editProjectForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Status</SelectLabel>
                              <SelectItem value="Planning">Planning</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Complete">Complete</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditselectedStatus === "Complete" ? (
                  <div />
                ) : (
                  <FormField
                    control={editProjectForm.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <>
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    Pick a date
                                  </>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Milestones</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Manage this project&apos;s milestones from the project workspace.
                </p>
              </div>

              <DialogFooter>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={async () => {
                if (!deletingProject) return
                const { error } = await supabase
                  .from("projects")
                  .delete()
                  .eq("id", deletingProject.id)

                if (error) {
                  console.log("Delete error:", error)
                  toast.error(error.message)
                  return
                }

                setIsDeleteDialogOpen(false)
                setDeletingProject(null)
                getProjects()
                toast.success("Project deleted")
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}