"use client"
import Link from "next/link"
import {useState, useEffect} from "react"
import { Header } from "@/components/layout/header"
import { LogOut, UserRoundCheck } from "lucide-react";
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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarUserInfo } from "./SidebarUserInfo";
import {
  LayoutDashboard,
  Hammer,
  BellRingIcon,
  Kanban,
  Map,
  Code2,
  BriefcaseBusiness,
  Compass,
  Send,
  FileText,
  Sparkles,
  UserRound,
  Settings,
} from "lucide-react";
import { Profile } from "@/types/profile"
import { supabase } from "@/lib/supabase/client"

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join(" ")
    .toUpperCase()
}

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 type NavItem = {
  icon: React.ReactNode;
  tabname: string;
  tabhref: string;
  drop?: {
   name: string;
   href: string;
  }[];
 };

 type NavCategory = {
  category: string;
  parts: NavItem[];
 };

 const [avatarUrl, setAvatarUrl] = useState("")
 const navlist: NavCategory[] = [
  {
    category: "WORKSPACE",
    parts: [
      {
        icon:<LayoutDashboard className="w-4 h-4 m-1" />,
        tabname: "Dashboard",
        tabhref: "/dashboard",
      },
      { icon:<Hammer className="w-4 h-4 m-1" />,
        tabname: "Build Mode",
        tabhref: "/build",
        drop: [
          { name: "Projects",
            href: "/build",
          },
      
        ],
      },
      { icon:<BriefcaseBusiness className="w-4 h-4 m-1" />,
        tabname: "Career Mode",
        tabhref: "/career",
        drop: [
          { name: "Career Hub",
            href: "/career",
          },
          { name: "Applications",
            href: "/career/applications",
          },
          { name: "Resume",
            href: "/career/resume",
          },
          { name: "Career Assistant",
            href: "/career/assistant",
          },
        ],
      },
      { icon:<Sparkles className="w-4 h-4 m-1" />,
        tabname: "Alymera AI",
        tabhref: "/aly",
      },
    ],
  },
  {
    category: "YOU",
    parts: [
      { icon:<UserRound className="w-4 h-4 m-1" />,
        tabname: "Profile",
        tabhref: "/profile",
      },
      { icon:<Settings className="w-4 h-4 m-1" />,
        tabname: "Settings",
        tabhref: "/settings",
      },
    ],
  },
];
 const [fullname, setFullname] = useState("")
useEffect(() => {
  async function loadProfile() {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) {
      console.error("Auth error:", authErr);
      return;
    }

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return;
    }

    setAvatarUrl(data?.avatar_url || "");
    setFullname(data?.full_name || "");
   
  }

  loadProfile();
}, []);

  return (
<SidebarProvider>
      <Sidebar className="bg-card border-r border-border/50 text-foreground">
        <SidebarHeader>
          <div className="pt-6 px-4 pb-4 flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-xl font-black tracking-widest">
              ALY<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-orange-400">MERA</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2"> 
          <SidebarGroup>
            <SidebarGroupContent>
               <SidebarMenu>
               {navlist.map((navl, i) => (
                <div aria-label={navl.category} key={i} className="mb-6">
                  <div className="mx-4 mb-3 mt-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {navl.category}
                  </div>
                {navl.parts.map((tab) => (
                 <SidebarMenuItem key={tab.tabhref}>
                  <Collapsible>
                  <CollapsibleTrigger asChild>
                 <SidebarMenuButton className="flex w-full items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-muted/50 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium group" asChild>
                  <Link href={tab.tabhref}>
                    <span className="group-hover:scale-110 transition-transform duration-200">{tab.icon}</span> 
                    <span className="text-sm">{tab.tabname}</span>
                  </Link>
                  </SidebarMenuButton>
                  </CollapsibleTrigger>
                 {tab.drop?.map((dp, d) => (
              <CollapsibleContent key={d}> 
                    <SidebarMenuSub className="pl-9 pr-2 border-l-2 border-muted/50 ml-5 my-1">
                      
                    <SidebarMenuSubItem>                       
                          <SidebarMenuSubButton className="rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground" asChild>
                            <Link href={dp.href}>{dp.name}</Link>
                          </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    </SidebarMenuSub> 
                    </CollapsibleContent>
                  ))}
                     </Collapsible>

                </SidebarMenuItem>

                 
                ))}
                
                </div>

               ))}
                  
              </SidebarMenu>

    </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
        <SidebarUserInfo />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex items-center border-b border-border/50 pt-2 px-4 pb-2 sticky top-0 z-50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          
          <div className="flex items-center font-bold tracking-wider" >
          <SidebarTrigger className="mr-2 hover:bg-muted/50 rounded-lg transition-colors" />
          <Header />
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
           <div className="p-2 hover:bg-muted/50 rounded-full transition-colors cursor-pointer border border-transparent hover:border-border/50">
             <BellRingIcon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
           </div>
          </div>
          <div className="flex items-center gap-2 px-3">
         <Avatar className="size-[36px] flex-shrink-0 cursor-pointer shadow-sm border border-border/50 hover:opacity-90 transition-opacity">
            <AvatarImage 
            src={avatarUrl}
            className="w-full h-full object-cover" />
            <AvatarFallback className="font-bold text-primary bg-primary/10">{getInitials(fullname)}</AvatarFallback>
          </Avatar>
          </div>    
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}