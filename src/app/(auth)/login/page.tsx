"use client"
import { useRouter } from "next/navigation"
import { z } from "zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { logInSchema }  from "@/lib/schemas/logIn"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { toast } from "sonner"

import { Sparkles } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function LoginPage() {
     const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
     const logInForm = useForm<z.infer<typeof logInSchema>> (
      {resolver: zodResolver(logInSchema), defaultValues:{
        email:"",
        password: "",
      },
      }
    )




    async function  handleLogInSubmit(values:z.infer<typeof logInSchema> ){     
          setIsSubmitting(true)
          console.log("submitted")
       
    
           try{
    
            const {data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          })
    
          if(error) {
             console.log("Error:", error)
          toast.error(error.message)
          return
    
          } 
             toast.success("Successfully Logging In")
             console.log("Logged in User:", data.user)
              console.log("Session:", data.session)
      
    
           router.push("/dashboard")
             
           }finally{
            setIsSubmitting(false)
           }
          
        }
  return (<div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">

 <Card className="bg-card border-r space-y-6">
              
  <CardHeader>
    <CardTitle>
      <div className="pt-6 px-4 pb-4 flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-xl font-black tracking-widest">
              ALY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">MERA</span>
            </div>
      </div>
      </CardTitle>
       <CardDescription>
        <h1 className="text-xl font-black tracking-widest">Welcome Back</h1>
        Log in to continuer building your becoming.
       </CardDescription>
   </CardHeader>
  
  <div className="flex items-center">
     <CardContent >
              <Button className=" flex items-center bg-[#24292e] hover:bg-[#2f363d] text-white rounded-xl px-6 py-5 shadow-lg shadow-black/10 transition-all hover:scale-105" asChild>
              <Link href={"/"} className="flex items-center">
                <SiGithub className="mr-2 h-5 w-5" /> Connect with Github
              </Link>
            </Button>
            <div className="flex items-center w-30 gap-4 mt-4 mb-4">
              
                <Separator /> 
               <div className="flex-1 gap-2"> Or </div>
                <Separator />

            
            </div>
            
              
          <div className="flex-1">
            <Form  {...logInForm} >



            <form  onSubmit={logInForm.handleSubmit(handleLogInSubmit)}>

                 <FormField
                 control={logInForm.control}
                 name="email"
                 render={({field}) => (
                    <FormItem >
                      <FormLabel>Email</FormLabel>
                      <Input placeholder="your@email.com.." {...field}/>
                      <FormMessage/>
                    </FormItem>
                   
  )} />
                  <FormField
                 control={logInForm.control}
                 name="password"
                 render={({field}) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <Input {...field} type="password" placeholder="......" />
                      <FormMessage/>
                    </FormItem>
                   
  )} />
<Button type="submit" disabled={isSubmitting} >
        {isSubmitting ? (<><Spinner className="w-4 h-4" /> <p>Logging in ...</p> </>) : (
             "Log in"
        )

          }   </Button>
        
        
          </form>
          </Form>

          </div>
          
        
  </CardContent>
  </div>
    
              <CardFooter> Don&apos;t have an account? <Link href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">Sign Up</Link></CardFooter>

            </Card>
  </div>
  )
}

