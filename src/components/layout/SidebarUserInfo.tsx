import React from "react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/types/profile";

function getInitials(name: string) {
  return name.split(" ").map(word => word[0]).join(" ").toUpperCase();
}

interface SidebarUserInfoProps {
  profile: Profile;
}

export function SidebarUserInfo({ profile }: SidebarUserInfoProps) {
  return (
    <div className="box-border mt-auto flex flex-wrap gap-3 p-3 items-center hover:bg-muted/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-border/50">
      <Avatar className="size-[36px] flex-shrink-0 shadow-sm border border-border/50">
        <AvatarImage src={profile.imageSrc} className="w-full h-full object-cover" />
        <AvatarFallback className="font-bold text-primary bg-primary/10">
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div aria-label="name" className="truncate text-sm font-semibold text-foreground leading-tight">
          {profile.name}
        </div>
        <div aria-label="role" className="text-muted-foreground text-xs truncate mt-0.5">
          {profile.role}
        </div>
      </div>
      <div className="bg-background/50 p-1.5 rounded-lg shadow-sm border border-border/50 hover:bg-muted transition-colors">
        <LogOut size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}
