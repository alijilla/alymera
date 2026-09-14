"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Hammer,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { SidebarUserInfo } from "./SidebarUserInfo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { supabase } from "@/lib/supabase/client"

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
}

type NavItem = {
  icon: React.ReactNode
  tabname: string
  tabhref: string
  drop?: {
    name: string
    href: string
  }[]
}

type NavCategory = {
  category: string
  parts: NavItem[]
}

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [avatarUrl, setAvatarUrl] = useState("")
  const [fullname, setFullname] = useState("")

  const navlist: NavCategory[] = [
    {
      category: "Workspace",
      parts: [
        {
          icon: <LayoutDashboard className="h-4 w-4" />,
          tabname: "Dashboard",
          tabhref: "/dashboard",
        },
        {
          icon: <Hammer className="h-4 w-4" />,
          tabname: "Build Mode",
          tabhref: "/build",
          drop: [
            {
              name: "Projects",
              href: "/build",
            },
          ],
        },
        {
          icon: <BriefcaseBusiness className="h-4 w-4" />,
          tabname: "Career Mode",
          tabhref: "/career",
          drop: [
            {
              name: "Career Hub",
              href: "/career",
            },
            {
              name: "Applications",
              href: "/career/applications",
            },
            {
              name: "Resume",
              href: "/career/resume",
            },
            {
              name: "Career Assistant",
              href: "/career/assistant",
            },
          ],
        },
        {
          icon: <Sparkles className="h-4 w-4" />,
          tabname: "Alymera AI",
          tabhref: "/aly",
        },
        {
          icon: <History className="h-4 w-4" />,
          tabname: "History",
          tabhref: "/history",
        },
      ],
    },
    {
      category: "You",
      parts: [
        {
          icon: <UserRound className="h-4 w-4" />,
          tabname: "Profile",
          tabhref: "/profile",
        },
        {
          icon: <Settings className="h-4 w-4" />,
          tabname: "Settings",
          tabhref: "/settings",
        },
      ],
    },
  ]

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        return
      }

      if (!user || cancelled) return

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Profile fetch error:", error)
        return
      }

      if (cancelled) return

      setAvatarUrl(data?.avatar_url || "")
      setFullname(data?.full_name || "")
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SidebarProvider>
      <Sidebar
        variant="sidebar"
        className="border-r border-border/50 bg-card text-foreground"
      >
        {/* ───────────────── Logo ───────────────── */}
        <SidebarHeader>
          <div className="flex items-center gap-3 px-4 pb-4 pt-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <div className="text-lg font-black tracking-[0.18em]">
                ALY
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  MERA
                </span>
              </div>

              <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                Build. Apply. Become.
              </p>
            </div>
          </div>
        </SidebarHeader>

        {/* ───────────────── Navigation ───────────────── */}
        <SidebarContent className="px-2">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {navlist.map((navCategory) => (
                  <div
                    key={navCategory.category}
                    className="mb-6"
                  >
                    <div className="mx-3 mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {navCategory.category}
                    </div>

                    <div className="space-y-1">
                      {navCategory.parts.map((item) => {
                        const hasDropdown = Boolean(item.drop?.length)

                        if (!hasDropdown) {
                          return (
                            <SidebarMenuItem key={item.tabhref}>
                              <SidebarMenuButton
                                asChild
                                className="h-10 rounded-xl px-3 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground data-[active=true]:bg-primary/10 data-[active=true]:font-semibold data-[active=true]:text-primary"
                               
                              >
                                <Link href={item.tabhref}>
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105">
                                    {item.icon}
                                  </span>

                                  <span className="truncate text-sm">
                                    {item.tabname}
                                  </span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        }

                        return (
                          <SidebarMenuItem key={item.tabhref}>
                            <Collapsible className="group/collapsible">
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  className="h-10 rounded-xl px-3 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground"
                                 
                                >
                                  <Link
                                    href={item.tabhref}
                                    className="flex min-w-0 flex-1 items-center gap-3"
                                  >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                                      {item.icon}
                                    </span>

                                    <span className="truncate text-sm">
                                      {item.tabname}
                                    </span>
                                  </Link>

                                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <SidebarMenuSub className="ml-5 mt-1 border-l border-border/60 pl-3">
                                  {item.drop?.map((dropItem) => (
                                    <SidebarMenuSubItem
                                      key={dropItem.href}
                                    >
                                      <SidebarMenuSubButton
                                        asChild
                                        className="h-9 rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                      >
                                        <Link href={dropItem.href}>
                                          <span className="truncate text-sm">
                                            {dropItem.name}
                                          </span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ───────────────── User ───────────────── */}
        <SidebarFooter className="border-t border-border/40 p-3">
          <div className="rounded-xl transition-colors hover:bg-muted/50">
            <SidebarUserInfo />
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ───────────────── Main ───────────────── */}
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border/50 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted/60" />

            <div className="min-w-0">
              <Header />
            </div>
          </div>

          <div className=" ml-auto flex items-center gap-1 sm:gap-2">
           

            {/* Avatar */}
            <Link
              href="/profile"
              aria-label="Open profile"
              className="rounded-full p-0.5 transition-opacity hover:opacity-80"
            >
              <Avatar className="h-9 w-9 border border-border/60 shadow-sm">
                <AvatarImage
                  src={avatarUrl}
                  alt={fullname || "Profile"}
                  className="object-cover"
                />

                <AvatarFallback className="bg-primary/10 font-bold text-primary">
                  {getInitials(fullname) || "A"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}