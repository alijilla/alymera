"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload, UserRound } from "lucide-react";
import { mockProfile } from "@/lib/mocks/career";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const profile = mockProfile;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <UserRound className="w-8 h-8 text-primary" />
                Profile
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Manage your personal profile and public presence.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button className="rounded-xl shadow-sm transition-all hover:scale-105 flex items-center gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-lg font-bold tracking-tight">Your Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                <AvatarImage src={profile.avatarUrl || "/img/icon.png"} alt="Profile avatar" className="object-cover" />
                <AvatarFallback className="text-4xl font-bold text-primary bg-primary/10">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-3">
                <Button variant="outline" size="sm" className="rounded-xl border-dashed border-border/60 hover:bg-muted/50 transition-all font-medium flex items-center gap-2 mx-auto">
                  <Upload size={14} /> Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground font-medium max-w-[200px] mx-auto">
                  Recommended size: 256x256px. Max file size: 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Personal Information</CardTitle>
              <CardDescription className="font-medium mt-1">Update your details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={profile.name} placeholder="Enter your full name" className="rounded-xl bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile.email} placeholder="Enter your email" disabled className="rounded-xl bg-muted/20 opacity-70" />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Connected to Auth</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  className="min-h-[120px] rounded-xl bg-muted/20 resize-none" 
                  defaultValue={profile.bio} 
                  placeholder="Tell us a little bit about yourself..." 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}