import Link from "next/link"
import { LogOut } from "lucide-react";
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


export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 const navlist = [
  {
    category: "WORKSPACE",
    parts: [
      {
        tabname: "Dashboard",
        tabhref: "/dashboard",
      },
      {
        tabname: "Build Mode",
        tabhref: "/build",
        drop: [
          {
            name: "Projects",
            href: "/build",
          },
          {
            name: "Kanban",
            href: "/build/kanban",
          },
          {
            name: "Roadmap",
            href: "/build/roadmap",
          },
          {
            name: "Coding Assistant",
            href: "/build/coding-assistant",
          },
        ],
      },
      {
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
        tabname: "Alymera AI",
        tabhref: "/aly",
      },
    ],
  },
  {
    category: "YOU",
    parts: [
      {
        tabname: "Profile",
        tabhref: "/profile",
      },
      {
        tabname: "Settings",
        tabhref: "/settings",
      },
    ],
  },
];
  return (
<SidebarProvider>
      <Sidebar className="bg-[#080611e0]">
        <SidebarHeader><div> ALY<span className="text-[#8b5cf6]">MERA</span></div></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
               <SidebarMenu>
               {navlist.map((navl, i) => (
                <div aria-label={navl.category} key={i}>{navl.category} 
                {navl.parts.map((tab) => (
                 <SidebarMenuItem key={tab.tabhref}>
                  <Collapsible>
                  <CollapsibleTrigger asChild>
                 <SidebarMenuButton asChild>
                  <Link href={tab.tabhref}> {tab.tabname}</Link>
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
       <div aria-label="User" className="box-border mt-auto flex flex-wrap gap-1 p-2 items-center">
         
         <Avatar className="size-[32px] flex-shrink-0">
            <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
        <div>
           <div aria-label="name" className="truncate text-[12.5px]">Alyssa Jade P. Merjilla</div>
        <div aria-label="role" className="text-muted text-[10px] ">Frontend AI Engineer</div>
        </div>
        <LogOut className="ml-auto w-4 h-4"/>
         </div>  
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header>
          <SidebarTrigger />
        </header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}