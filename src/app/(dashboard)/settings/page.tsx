"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Trash2, Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <Settings className="w-8 h-8 text-primary" />
                Settings
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Manage your account preferences and security.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Section */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Account Security</CardTitle>
              <CardDescription className="font-medium mt-1">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-xl">Update Password</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" placeholder="••••••••" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" placeholder="••••••••" className="rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" className="rounded-lg" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="rounded-xl">Cancel</Button>
                    <Button className="rounded-xl">Save Password</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Notifications</CardTitle>
              <CardDescription className="font-medium mt-1">Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Email Notifications</Label>
                  <p className="text-sm font-medium text-muted-foreground">Receive weekly job matches and application updates.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/10">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Application Reminders</Label>
                  <p className="text-sm font-medium text-muted-foreground">Get reminded when you have an upcoming interview.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Appearance Section */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Appearance</CardTitle>
              <CardDescription className="font-medium mt-1">Customize your UI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select defaultValue="system">
                  <SelectTrigger className="rounded-xl bg-muted/20">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="light" className="rounded-lg cursor-pointer">Light Mode</SelectItem>
                    <SelectItem value="dark" className="rounded-lg cursor-pointer">Dark Mode</SelectItem>
                    <SelectItem value="system" className="rounded-lg cursor-pointer">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-card border border-destructive/30 shadow-sm rounded-2xl bg-destructive/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight text-destructive flex items-center gap-2">
                <AlertCircle size={20} />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Permanently delete your account and all of your content. This action cannot be undone.
               </p>
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="destructive" className="w-full rounded-xl flex items-center gap-2 transition-all hover:bg-destructive/90">
                     <Trash2 size={16} /> Delete Account
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-[400px] rounded-2xl text-center p-6">
                   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                     <Trash2 className="h-6 w-6 text-destructive" />
                   </div>
                   <DialogHeader>
                     <DialogTitle className="text-center text-xl">Delete Account?</DialogTitle>
                   </DialogHeader>
                   <p className="text-sm text-muted-foreground font-medium mb-6">
                     Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data will be erased.
                   </p>
                   <DialogFooter className="flex w-full sm:justify-center gap-2">
                     <Button type="button" variant="outline" className="rounded-xl flex-1">
                       Cancel
                     </Button>
                     <Button type="button" variant="destructive" className="rounded-xl flex-1">
                       Delete Permanently
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}