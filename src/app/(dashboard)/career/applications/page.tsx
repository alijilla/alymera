"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, Edit, Plus, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type DBApplication = {
  id: string;
  user_id?: string;
  position: string;
  company: string | null;
  location: string | null;
  status: string;
  date_applied: string | null;
  job_description?: string | null;
  created_at?: string;
};

const applicationStatuses = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<DBApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editApp, setEditApp] = useState<DBApplication | null>(null);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApps() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError) {
        console.error("Auth error:", authError);
        setApps([]);
        setLoading(false);
        return;
      }

      if (!user) {
        setApps([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Fetch applications error:", error.message);
        setApps([]);
      } else {
        setApps((data ?? []) as DBApplication[]);
      }

      setLoading(false);
    }

    loadApps();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setEditApp(null);
    setShowEdit(false);
    setShowCreate(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get("title") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const status = String(formData.get("status") ?? "Applied");

    if (!title || !company) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User error or no user logged in");
      return;
    }

    const applicationData = {
      user_id: user.id,
      company,
      location: location || null,
      position: title,
      date_applied:
        editApp?.date_applied ||
        new Date().toISOString().split("T")[0],
      status,
    };

    if (showEdit && editApp) {
      const { data, error } = await supabase
        .from("applications")
        .update(applicationData)
        .eq("id", editApp.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error.message);
        return;
      }

      if (data) {
        setApps((prev) =>
          prev.map((application) =>
            application.id === editApp.id
              ? (data as DBApplication)
              : application
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("applications")
        .insert(applicationData)
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error.message);
        return;
      }

      if (data) {
        setApps((prev) => [data as DBApplication, ...prev]);
      }
    }

    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user.");
      return;
    }

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", deleteId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete error:", error.message);
      return;
    }

    setApps((prev) => prev.filter((app) => app.id !== deleteId));

    setShowDelete(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-36 rounded-2xl bg-muted/50 animate-pulse" />

        <Card className="rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="h-10 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/50 animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-primary/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 sm:p-6 md:p-8 gap-5">
          <CardHeader className="p-0 min-w-0">
            <CardTitle>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                <Send className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0" />
                <span>Applications</span>
              </h1>
            </CardTitle>

            <CardDescription className="text-sm sm:text-base mt-2 text-muted-foreground font-medium">
              Track and manage your job applications.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 w-full md:w-auto">
            <Button
              onClick={() => setShowCreate(true)}
              className="rounded-xl shadow-sm transition-all hover:scale-105 w-full md:w-auto"
            >
              <Plus size={16} className="mr-2" />
              Add Application
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Applications */}
      <Card className="bg-card border border-border/50 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {apps.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                <Send className="w-8 h-8 text-muted-foreground/50" />
              </div>

              <h3 className="text-lg font-bold text-foreground">
                No applications yet
              </h3>

              <p className="text-sm font-medium text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                Start tracking your job search by adding your first
                application here.
              </p>

              <Button
                onClick={() => setShowCreate(true)}
                variant="outline"
                className="rounded-xl"
              >
                <Plus size={16} className="mr-2" />
                Add Application
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground">
                      Job Title
                    </TableHead>

                    <TableHead className="font-semibold text-foreground">
                      Company
                    </TableHead>

                    <TableHead className="font-semibold text-foreground">
                      Location
                    </TableHead>

                    <TableHead className="font-semibold text-foreground">
                      Status
                    </TableHead>

                    <TableHead className="font-semibold text-foreground">
                      Applied Date
                    </TableHead>

                    <TableHead className="text-right font-semibold text-foreground pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {apps.map((app) => (
                    <TableRow
                      key={app.id}
                      className="group hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground max-w-[220px]">
                        <span className="block truncate">
                          {app.position}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground font-medium max-w-[180px]">
                        <span className="block truncate">
                          {app.company || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground max-w-[180px]">
                        <span className="block truncate">
                          {app.location || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background border border-border/50 shadow-sm text-muted-foreground whitespace-nowrap">
                          {app.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {app.date_applied
                          ? new Date(
                              app.date_applied
                            ).toLocaleDateString()
                          : "—"}
                      </TableCell>

                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${app.position}`}
                            className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setEditApp(app);
                              setShowEdit(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${app.position}`}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setDeleteId(app.id);
                              setShowDelete(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
      <Dialog
        open={showCreate || showEdit}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
      >
        <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[500px] max-h-[90dvh] overflow-y-auto rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {showEdit ? "Edit Application" : "Add Application"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSave}
            className="grid gap-4 py-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Job Title
              </label>

              <Input
                id="title"
                name="title"
                defaultValue={editApp?.position ?? ""}
                placeholder="e.g. Frontend Developer"
                required
                className="rounded-lg bg-muted/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="company"
                className="text-sm font-medium"
              >
                Company
              </label>

              <Input
                id="company"
                name="company"
                defaultValue={editApp?.company ?? ""}
                placeholder="e.g. Tech Corp"
                required
                className="rounded-lg bg-muted/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="location"
                  className="text-sm font-medium"
                >
                  Location
                </label>

                <Input
                  id="location"
                  name="location"
                  defaultValue={editApp?.location ?? ""}
                  placeholder="e.g. Remote"
                  className="rounded-lg bg-muted/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium"
                >
                  Status
                </label>

                <Select
                  name="status"
                  defaultValue={editApp?.status ?? "Applied"}
                >
                  <SelectTrigger
                    id="status"
                    className="rounded-lg bg-muted/20 w-full"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent className="rounded-xl">
                    {applicationStatuses.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="rounded-lg cursor-pointer"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4 flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="rounded-xl w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl w-full sm:w-auto"
              >
                {showEdit ? "Save Changes" : "Add Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={showDelete}
        onOpenChange={(open) => {
          if (!open) {
            setShowDelete(false);
            setDeleteId(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-1rem)] sm:max-w-[400px] rounded-2xl text-center p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Delete Application?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground font-medium mb-6">
            Are you sure you want to delete this application? This action
            cannot be undone.
          </p>

          <DialogFooter className="flex w-full sm:justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDelete(false);
                setDeleteId(null);
              }}
              className="rounded-xl flex-1"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl flex-1"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}