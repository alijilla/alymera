import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isBuildRoute = request.nextUrl.pathname.startsWith("/build")
  const isCareerRoute = request.nextUrl.pathname.startsWith("/career")
  const isAlyRoute = request.nextUrl.pathname.startsWith("/aly")
  const isProfileRoute = request.nextUrl.pathname.startsWith("/profile")
  const isSettingsRoute = request.nextUrl.pathname.startsWith("/settings")

  const isProtectedRoute =
    isDashboardRoute ||
    isBuildRoute ||
    isCareerRoute ||
    isAlyRoute ||
    isProfileRoute ||
    isSettingsRoute

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"

    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/build/:path*",
    "/career/:path*",
    "/aly/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}