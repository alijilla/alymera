import Link from "next/link"
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
          { name: "Kanban",
            href: "/build/kanban",
          },
          { name: "Roadmap",
            href: "/build/roadmap",
          },
          { name: "Coding Assistant",
            href: "/build/coding-assistant",
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
  return (
<SidebarProvider>
      <Sidebar className=" bg-background text-foreground backdrop-blur">
        <SidebarHeader><div className="pt-2.5 px-3 pb-2 text-xl font-black tracking-[0.22em]">ALY<span className="text-[#8b5cf6]">MERA</span></div></SidebarHeader>
        <SidebarContent> 
          <SidebarGroup>
            <SidebarGroupContent>
               <SidebarMenu>
               {navlist.map((navl, i) => (
                <div aria-label={navl.category} key={i} ><span className="mx-3 mb-10 mt-10 text-[10px] tracking-[0.15em] text-muted-foreground">{navl.category}</span>
                {navl.parts.map((tab) => (
                 <SidebarMenuItem key={tab.tabhref}>
                  <Collapsible>
                  <CollapsibleTrigger asChild>
                 <SidebarMenuButton className="flex w-full items-center gap-2.5 mx-3
                 " asChild>
                  <Link href={tab.tabhref}>{tab.icon} {tab.tabname}</Link>
                  </SidebarMenuButton>
                  </CollapsibleTrigger>
                 {tab.drop?.map((dp, d) => (
              <CollapsibleContent key={d}> 
                    <SidebarMenuSub>
                      
                    <SidebarMenuSubItem>                       
                          <SidebarMenuSubButton asChild>
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
        <SidebarFooter>
       <div aria-label="User" className="box-border mt-auto flex flex-wrap gap-3 p-2 items-center">
         
         <Avatar className="size-[32px] flex-shrink-0">
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
        <div>
           <div aria-label="name" className="truncate text-[12.5px]">Alyssa Jade P. Merjilla</div>
        <div aria-label="role" className="text-muted-foreground text-[10px] ">Frontend AI Engineer</div>
        </div>
        <LogOut className="ml-auto w-4 h-4"/>
         </div>  
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center border-b pt-2 px-3 pb-2">
          
          <div className="flex items-center font-extrabold tracking-[0.22em]" >
          <SidebarTrigger />
          <Header />
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
           <BellRingIcon className="w-4 h-4 " />
          </div>
          <div className="flex items-center gap-2 px-2">
          <Avatar className="size-7 flex-shrink-0">
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          </div>    
        </header>
        <main className="
        
        ">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}