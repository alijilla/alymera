"use client"

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
import { SignUpSchema }  from "@/lib/schemas/logIn"
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

export default function SignupPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const SubmitForm = useForm<z.infer<typeof SignUpSchema>> (
      {resolver: zodResolver(SignUpSchema), defaultValues:{
        name:"",
        email:"",
        password: "",
        password_conf: "",
      },
      }
    )

   async function handleSignUpSubmit(values:z.infer<typeof SignUpSchema> ){     
      setIsSubmitting(true)
      console.log("submitted")
      SubmitForm.reset()

       try{

         const {data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if(error) {
         console.log("Error:", error)
      toast.error(error.message)
      return

      } 
         toast.success("Successfully Signing up")
         console.log("User:", data.user)
  

      
         
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
              <h1 className="text-xl font-black tracking-widest">Create your account</h1>
              One workspace for what you build and who you become.
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
            <Form  {...SubmitForm} >



            <form  onSubmit={SubmitForm.handleSubmit(handleSignUpSubmit)}>
               <FormField
                 control={SubmitForm.control}
                 name="name"
                 render={({field}) => (
                    <FormItem >
                      <FormLabel>FullName</FormLabel>
                      <Input placeholder="Juan D. Tamad.." {...field}/>
                      <FormMessage/>
                    </FormItem>
                   
  )} />
                 <FormField
                 control={SubmitForm.control}
                 name="email"
                 render={({field}) => (
                    <FormItem >
                      <FormLabel>Email</FormLabel>
                      <Input placeholder="your@email.com.." {...field}/>
                      <FormMessage/>
                    </FormItem>
                   
  )} />
                  <FormField
                 control={SubmitForm.control}
                 name="password"
                 render={({field}) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <Input type="password" placeholder="......" {...field}/>
                      <FormMessage/>
                    </FormItem>
                   
  )} />

              <FormField
                 control={SubmitForm.control}
                 name="password_conf"
                 render={({field}) => (
                    <FormItem>
                      <FormLabel>Password Confirmation</FormLabel>
                      <Input type="password" placeholder="......" {...field}/>
                      <FormMessage/>
                    </FormItem>
                   
  )} />
         
          <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (<><Spinner className="w-4 h-4" /><p>Signing up...</p></>) : (
             "Create your account"
        )

          }   </Button>
        
          </form>
          </Form>

          </div>
          
          

            
 


            </CardContent>
  </div>
    
              <CardFooter> Already have an account? <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">Log In</Link></CardFooter>

            </Card>
  </div>
  )
}

