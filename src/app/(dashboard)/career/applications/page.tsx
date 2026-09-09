"use client";

import { useState } from "react";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2, Edit, Plus, Send } from 'lucide-react';
import { mockApplications } from '@/lib/mocks/career';

export default function ApplicationsPage() {
  const [apps, setApps] = useState(mockApplications);
  const [loading, setLoading] = useState(false);
  
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editApp, setEditApp] = useState<typeof mockApplications[number] | null>(null);
  
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setEditApp(null);
    setShowEdit(false);
    setShowCreate(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      title: { value: string };
      company: { value: string };
      location: { value: string };
      status: { value: string };
    };
    const newApp = {
      id: Date.now().toString(),
      title: target.title.value,
      company: target.company.value,
      location: target.location.value,
      status: target.status.value as 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    if (showEdit && editApp) {
      setApps((prev) => prev.map((a) => (a.id === editApp.id ? newApp : a)));
    } else {
      setApps((prev) => [newApp, ...prev]);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      setApps((prev) => prev.filter((a) => a.id !== deleteId));
    }
    setShowDelete(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <Send className="w-8 h-8 text-primary" />
                Applications
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Track and manage your job applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button onClick={() => setShowCreate(true)} className="rounded-xl shadow-sm transition-all hover:scale-105 shrink-0">
              <Plus size={16} className="mr-2" /> Add Application
            </Button>
          </CardContent>
        </div>
      </Card>

      <Card className="bg-card border border-border/50 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {apps.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                 <Send className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No applications yet</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                Start tracking your job search by adding your first application here.
              </p>
              <Button onClick={() => setShowCreate(true)} variant="outline" className="rounded-xl">
                <Plus size={16} className="mr-2" /> Add Application
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">Job Title</TableHead>
                    <TableHead className="font-semibold text-foreground">Company</TableHead>
                    <TableHead className="font-semibold text-foreground">Location</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Applied Date</TableHead>
                    <TableHead className="text-right font-semibold text-foreground pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((app) => (
                    <TableRow key={app.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-foreground">{app.title}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{app.company}</TableCell>
                      <TableCell className="text-muted-foreground">{app.location || "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background border border-border/50 shadow-sm text-muted-foreground">
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{app.appliedDate}</TableCell>
                      <TableCell className="text-right pr-4 space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setEditApp(app); setShowEdit(true); }}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { setDeleteId(app.id); setShowDelete(true); }}>
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || showEdit} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{showEdit ? 'Edit Application' : 'Add Application'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Job Title</label>
              <Input id="title" name="title" defaultValue={editApp?.title} placeholder="e.g. Frontend Developer" required className="rounded-lg bg-muted/20" />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">Company</label>
              <Input id="company" name="company" defaultValue={editApp?.company} placeholder="e.g. Tech Corp" required className="rounded-lg bg-muted/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label htmlFor="location" className="text-sm font-medium">Location</label>
                 <Input id="location" name="location" defaultValue={editApp?.location} placeholder="e.g. Remote" className="rounded-lg bg-muted/20" />
               </div>
               <div className="space-y-2">
                 <label htmlFor="status" className="text-sm font-medium">Status</label>
                 <Select name="status" defaultValue={editApp?.status ?? 'Applied'}>
                   <SelectTrigger className="rounded-lg bg-muted/20">
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl">
                     {['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'].map((s) => (
                       <SelectItem key={s} value={s} className="rounded-lg cursor-pointer">
                         {s}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl">{showEdit ? 'Save Changes' : 'Add Application'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDelete} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl text-center p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Delete Application?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-medium mb-6">
            Are you sure you want to delete this application? This action cannot be undone.
          </p>
          <DialogFooter className="flex w-full sm:justify-center gap-2">
            <Button type="button" variant="outline" onClick={() => setShowDelete(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="rounded-xl flex-1">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
