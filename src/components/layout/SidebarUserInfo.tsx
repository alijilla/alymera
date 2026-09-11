"use client"

import { LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/types/profile";
import { supabase} from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
function getInitials(name: string) {
  if (!name.trim()) return "A";

  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase();
}

interface SidebarUserInfoProps {
  profile: Profile;
}

export  function SidebarUserInfo() {
  const router = useRouter()
 const [avatarUrl, setAvatarUrl] = useState("")
  const [fullname, setFullname] = useState("")
 async function handleLogout() {
      const { error } = await supabase.auth.signOut()
  
      if (error) {
        console.log("Logout error:", error)
        return
      }
      router.push('/login')
      console.log("Successfully logged out!")
    }

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
    <div className="box-border mt-auto flex flex-wrap gap-3 p-3 items-center hover:bg-muted/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border/50">
      <Avatar className="size-[36px] flex-shrink-0 shadow-sm border border-border/50">
       <AvatarImage
  src={avatarUrl}
  width={1080}
  height={1080}
  className="w-full h-full object-cover"
/>
        <AvatarFallback className="font-bold text-primary bg-primary/10">
          {getInitials(fullname)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div aria-label="name" className="truncate text-sm font-semibold text-foreground leading-tight">
          {fullname}
        </div>
        <div aria-label="role" className="text-muted-foreground text-xs truncate mt-0.5">
         
        </div>
      </div>
      <div className="bg-background/50 p-1.5 rounded-lg shadow-sm border border-border/50 hover:bg-muted transition-colors">
        <LogOut onClick={handleLogout} size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}
