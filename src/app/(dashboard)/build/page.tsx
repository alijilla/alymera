"use client"

import {useState} from "react"
import { z } from "zod"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { newProjectSchema } from "@/lib/schemas/newproject"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { format } from "date-fns"
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



import { actproject } from "@/data/projectdata"
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
import { CalendarIcon, PlusCircleIcon, SparklesIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowRight,
} from "lucide-react"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { milestones } from  "@/data/milestonedata"
import { tasks } from "@/data/taskdata"
import { calculateProgress, 
  calculateTasksComplete, 
  calculateTotalTask, 
  calculateMilestoneComplete, 
  calculateTotalMilestone } from "@/lib/utils"




export default function DashboardPage() {


  const projectForm  = useForm<z.infer<typeof newProjectSchema>>(
    { resolver: zodResolver(newProjectSchema), 
       defaultValues: {
    name: "",
    description: "",
    imageSrc: "",
    
  },
    }
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const selectedStatus = projectForm.watch("status")
  
    function onSubmit(values: z.infer<typeof newProjectSchema>) {
    console.log(values)
    projectForm.reset()
    setIsDialogOpen(false) 
  }
  
  




  return (
    
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
    
      <Card className="bg-card border-none shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Projects
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-foreground">
            Turn your work into structured, career-ready evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" >             
                <PlusCircleIcon className="mr-2 h-4 w-4 text-orange-300" /> Create Project  
            </Button>
              </DialogTrigger>
                
                  <DialogContent>  

                    ()
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
                               name="techstack"
                               render={({ field }) => (
                              <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                            <Input placeholder="e.g react, typescript, next.js" 
                             value={field.value?.join(", ") ?? ""}
                             onChange={(e) => {
                              const value = e.target.value
                             field.onChange(
                                      value
                                        .split(",")
                                        .map((tech) => tech.trim())
                                        .filter(Boolean)
                                        )
                                      }}                                                   
                            />

                              </FormControl>
                              <FormMessage />
                            </FormItem>
 
                               )}/>


                                <FormField
                                 control={projectForm.control}
                                 name="imageSrc"
                                 render={({  field: { value, onChange, ...fieldProps } }) => (
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
                           

                            <FormField
                              control={projectForm.control}
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
        </div>
      </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{actproject.map((proj) => {

        const totalTasks = calculateTotalTask(tasks, proj.id)
        const completedTasks = calculateTasksComplete(tasks, proj.id)

        const progress = calculateProgress(completedTasks, totalTasks)
   return (   
   
   <div  key={proj.id}>
        {/* Active Project */}
        <Card className="bg-card shadow-sm flex flex-col" >
          <CardHeader>
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
             <Badge>{proj.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
            <Avatar className="size-[40px] flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials (proj.name)}</AvatarFallback>
                <AvatarImage 
                src={proj.imageSrc}
                className="w-full h-full object-cover"  />
              </Avatar>
              <div>
                <h2 className="font-semibold text-lg">{proj.name}</h2>
                <p className="text-sm text-muted-foreground">{proj.description}</p>
              </div>
            </div>

            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">                 
                  {proj.techStack.map(item => (
                 <Badge variant="secondary" key={item}
                 className="text-xs px-3 py-1 rounded-md lowercase">
                     {item}                            
                  </Badge>
                  ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{completedTasks}/{totalTasks} task completed</p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <Link href={`/build/projects/${proj.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors">
              View project <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {proj.dueDate}
            </div>
          </CardFooter>
        </Card>
      
    </div>)
  })}
    
      </div>
      
    </div>
  )
}