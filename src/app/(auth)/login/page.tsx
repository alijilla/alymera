"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { supabase } from "@/lib/supabase/client"
import { logInSchema } from "@/lib/schemas/logIn"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { toast } from "sonner"
import { Sparkles, ArrowLeft } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

import { Canvas } from "@react-three/fiber"

const BackgroundShader = dynamic(
  () => import("@/components/hero/Backgroundshader"),
  {
    ssr: false,
  }
)

export default function LoginPage() {
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
 
const [reducedMotion, setReducedMotion] = useState(() =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
)

  const logInForm = useForm<z.infer<typeof logInSchema>>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


useEffect(() => {
  const mediaQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  )

  const handleChange = (event: MediaQueryListEvent) => {
    setReducedMotion(event.matches)
  }

  mediaQuery.addEventListener("change", handleChange)

  return () => {
    mediaQuery.removeEventListener("change", handleChange)
  }
}, [])

  async function handleLogInSubmit(
    values: z.infer<typeof logInSchema>
  ) {
    setIsSubmitting(true)

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

      if (error) {
        toast.error(error.message)
        return
      }

      console.log("Logged in user:", data.user)

      toast.success("Successfully logged in")

      router.push("/dashboard")
    } catch (error) {
      console.error("Unexpected login error:", error)

      toast.error(
        "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
      {/* Background shader */}
<div
  aria-hidden="true"
  className="pointer-events-none fixed inset-0 z-0"
>
  <Canvas
    camera={{ position: [0, 0, 3] }}
    dpr={[1, 1.5]}
  >
    <BackgroundShader reducedMotion={reducedMotion} />
  </Canvas>
</div>

{/* Readability overlay */}
<div
  aria-hidden="true"
  className="pointer-events-none fixed inset-0 z-[1] bg-background/45 backdrop-blur-[1px]"
/>

      {/* Back to landing */}
      <Link
        href="/"
        aria-label="Back"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background/80 hover:text-foreground sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="absolute left-4 top-4 z-20 hidden xs:inline">
          Back
        </span>
      </Link>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-md">
        {/* Brand */}
        <div className="px-5 pt-7 sm:px-8 sm:pt-9">
          <div className="flex flex-col items-center text-center">
            <Link
              href="/"
              className="group flex items-center gap-2"
              aria-label="ALYMERA home"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>

              <div className="text-xl font-black tracking-[0.2em] sm:text-2xl">
                ALY
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  MERA
                </span>
              </div>
            </Link>

            <div className="mt-7 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome Back
              </h1>

              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Log in to continue building your future.
              </p>
            </div>
          </div>
        </div>

        <CardContent className="px-5 pb-6 pt-7 sm:px-8 sm:pt-8">
          <Form {...logInForm}>
            <form
              onSubmit={logInForm.handleSubmit(
                handleLogInSubmit
              )}
              className="space-y-5"
            >
              {/* Email */}
              <FormField
                control={logInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        className="h-11 rounded-xl bg-background/70"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={logInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                    </div>

                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 rounded-xl bg-background/70"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-11 w-full rounded-xl font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Logging in...
                  </span>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        {/* Sign Up */}
        <CardFooter className="border-t border-border/50 px-5 py-5 sm:px-8 sm:py-6">
          <p className="w-full text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}