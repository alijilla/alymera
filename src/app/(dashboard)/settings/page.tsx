"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Settings, AlertCircle, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: "Password must be at least 6 characters." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Update password error:", error.message);
      setPasswordMessage({ type: 'error', text: error.message });
    } else {
      setPasswordMessage({ type: 'success', text: "Password updated successfully!" });
      setTimeout(() => {
        setPasswordOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMessage(null);
      }, 2000);
    }
    setPasswordLoading(false);
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Account Section */}
          <Card className="bg-card border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Account Security</CardTitle>
              <CardDescription className="font-medium mt-1">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-xl">Update Password</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        className="rounded-lg" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        className="rounded-lg" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {passwordMessage && (
                      <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {passwordMessage.text}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" className="rounded-xl" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                    <Button className="rounded-xl" onClick={handleUpdatePassword} disabled={passwordLoading}>
                      {passwordLoading ? "Saving..." : "Save Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
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
                     <DialogTitle className="text-center text-xl">Delete Account Unavailable</DialogTitle>
                   </DialogHeader>
                   <p className="text-sm text-muted-foreground font-medium mb-6">
                     Account deletion is currently unavailable as it requires a secure backend endpoint to safely remove auth data.
                   </p>
                   <DialogFooter className="flex w-full sm:justify-center gap-2">
                     <DialogTrigger asChild>
                       <Button type="button" variant="outline" className="rounded-xl flex-1">
                         Close
                       </Button>
                     </DialogTrigger>
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