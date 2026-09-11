"use client"
import { useRouter } from "next/navigation"
import Hero3D from "@/components/hero/TestScene"
export default function LandingPage() {
 const router = useRouter()

 function getStarted(){
  router.push("/login")

 }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      
      <div className="flex flex-row items-center m-auto gap-4 px-4">

     
      {/* A themed card using your custom colors */}
      <div className="p-8 border rounded-xl bg-card border-border shadow-lg flex flex-col items-center">
        
        {/* Main text using 'foreground' */}
       
         <div className="text-5xl font-black tracking-widest">
           <h1>ALY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">MERA</span></h1>
              
           </div>
        
        {/* Subtitle using 'muted-foreground' */}
        <h2 className="mt-4 text-3xl text-foreground">
         Build. Apply. Become
        </h2>

       {/* Subtitle using 'muted-foreground' */}
        <p className="mt-4 text-2xl text-muted-foreground">
         AI-powered workspace designed for developers and graduating students who manage both software projects and job applications
        </p>
        
        <div className="flex gap-4 mt-8">
          {/* A button using the bright 'primary' background and 'primary-foreground' text */}
          <button className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90" onClick={getStarted}>
            Get Started
          </button>
          
        </div>


      </div>
        
        <div className="px-4 border rounded-xl items-center bg-primary/20 w-[400px] h-[400px]">
          <Hero3D />
        </div>
       </div>
    </main>
  );
}