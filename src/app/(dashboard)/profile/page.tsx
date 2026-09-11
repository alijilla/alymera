"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload, UserRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        console.error("Auth error:", authErr);
        setLoading(false);
        return;
      }
      
      if (user) {
        setUserId(user.id);
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileErr) {
          console.error("Profile load error:", profileErr);
        }

        if (profile) {
          setFullName(profile.full_name || "");
          setEmail( user.email || "");
          setPhone(profile.phone || "");
          setLocation(profile.location || "");
          setAvatarUrl(profile.avatar_url || "");
        } else {
          setEmail(user.email || "");
        }
      }
      setLoading(false);






  

    }
    loadProfile();
  }, []);

  const uploadImageToSupabase = async (file: File) => {
  setIsUploading(true);

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `avatars/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    const err = error as Error;
    console.error("Avatar upload error:", err);
    return null;
  } finally {
    setIsUploading(false);
  }
};
  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email: email,
      phone: phone,
      location: location,
      avatar_url: avatarUrl,
    });

    if (error) {
      console.error("Error saving profile:", error.message, error.details, error.hint);
      setMessage({ type: 'error', text: "Failed to save profile. Please try again." });
    } else {
      setMessage({ type: 'success', text: "Profile updated successfully." });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

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
          <CardContent className="p-0 flex-shrink-0 flex items-center gap-4">
            {message && (
              <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message.text}
              </span>
            )}
            <Button onClick={handleSave} disabled={saving} className="rounded-xl shadow-sm transition-all hover:scale-105 flex items-center gap-2">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
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
                <AvatarImage src={avatarUrl } alt="Profile avatar" className="object-cover" />
                <AvatarFallback className="text-4xl font-bold text-primary bg-primary/10">
                  {(fullName || "U").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-3">
            <label className="inline-flex items-center gap-2 mx-auto cursor-pointer rounded-xl border border-dashed border-border/60 px-4 py-2 font-medium transition-all hover:bg-muted/50">
              <Upload size={14} />
              Change Avatar

                        <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                const url = await uploadImageToSupabase(file);

                if (!url || !userId) return;

                const { error } = await supabase
                  .from("profiles")
                  .update({ avatar_url: url })
                  .eq("id", userId);

                if (error) {
                  console.error("Avatar profile update error:", error);
                  return;
                }

                setAvatarUrl(url);
              }}
            />
            </label>
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
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="Enter your full name" 
                    className="rounded-xl bg-muted/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter your email" 
                    disabled 
                    className="rounded-xl bg-muted/20 opacity-70" 
                  />
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Connected to Auth</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="Enter your phone number" 
                    className="rounded-xl bg-muted/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    placeholder="City, Country" 
                    className="rounded-xl bg-muted/20" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}