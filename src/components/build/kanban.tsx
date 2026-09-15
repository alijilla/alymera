"use client"

import { useCallback, useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { supabase } from "@/lib/supabase/client"
import { tasksSchema } from "@/lib/schemas/taskSchema"

import { DragDropProvider } from "@dnd-kit/react"
import { useDraggable, useDroppable } from "@dnd-kit/react"

import { toast } from "sonner"

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MoreVertical,
  CalendarDays,
  Flag,
  Loader2,
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

import {
  Dialog,
  DialogHeader,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"

const taskStatusValues = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Done",
] as const

type TaskStatus = (typeof taskStatusValues)[number]

type Task = {
  id: string
  project_id: string
  name: string
  description: string
  status: string
  due_date: string | null
  milestone_id?: string | null
}

type DBMilestone = {
  id: string
  name: string
}

interface KanbanProps {
  projectId: string
}

type TaskFormValues = z.infer<typeof tasksSchema>

export function Kanban({ projectId }: KanbanProps) {

  const [mobileStatus, setMobileStatus] =
  useState<(typeof taskStatusValues)[number]>("Backlog")

  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<DBMilestone[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  /*
   * ------------------------------------------------------------
   * FETCH TASKS
   * ------------------------------------------------------------
   */

  const getTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Task fetch error:", error)
        toast.error(`Failed to load tasks: ${error.message}`)
        return
      }

      setTasks(data ?? [])
    } catch (error) {
      console.error("Unexpected task fetch error:", error)
      toast.error("An unexpected error occurred while loading tasks.")
    }
  }, [projectId])

  /*
   * ------------------------------------------------------------
   * FETCH MILESTONES
   * ------------------------------------------------------------
   */

  const getMilestones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("id, name")
        .eq("project_id", projectId)

      if (error) {
        console.error("Milestone fetch error:", error)
        toast.error(`Failed to load milestones: ${error.message}`)
        return
      }

      setMilestones(data ?? [])
    } catch (error) {
      console.error("Unexpected milestone fetch error:", error)
      toast.error("An unexpected error occurred while loading milestones.")
    }
  }, [projectId])

  /*
   * ------------------------------------------------------------
   * INITIAL LOAD
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) return

    async function loadBoard() {
      setIsLoading(true)

      await Promise.all([
        getTasks(),
        getMilestones(),
      ])

      setIsLoading(false)
    }

    loadBoard()
  }, [projectId, getTasks, getMilestones])

  /*
   * ------------------------------------------------------------
   * CREATE TASK FORM
   * ------------------------------------------------------------
   */

  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(tasksSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Backlog",
      due_date: undefined,
      milestone_id: null,
    },
  })

  /*
   * ------------------------------------------------------------
   * EDIT TASK FORM
   * ------------------------------------------------------------
   */

  const editTaskForm = useForm<TaskFormValues>({
    resolver: zodResolver(tasksSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Backlog",
      due_date: undefined,
      milestone_id: null,
    },
  })

  const selectedStatus = taskForm.watch("status")
  const selectedEditStatus = editTaskForm.watch("status")

  /*
   * ------------------------------------------------------------
   * CREATE TASK
   * ------------------------------------------------------------
   */

  async function onSubmit(values: TaskFormValues) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("You must be logged in to create a task.")
        return
      }

      const { error } = await supabase.from("tasks").insert({
        project_id: projectId,
        name: values.name,
        description: values.description,
        status: values.status,
        due_date: values.due_date
          ? format(new Date(values.due_date), "yyyy-MM-dd")
          : null,
        milestone_id:
          values.milestone_id === "null" || !values.milestone_id
            ? null
            : values.milestone_id,
      })

      if (error) {
        console.error("Insert error:", error)
        toast.error(`Failed to create task: ${error.message}`)
        return
      }

      taskForm.reset({
        name: "",
        description: "",
        status: "Backlog",
        due_date: undefined,
        milestone_id: null,
      })

      setIsCreateDialogOpen(false)

      await getTasks()

      toast.success("Task created successfully")
    } catch (error) {
      console.error("Unexpected error creating task:", error)
      toast.error("An unexpected error occurred while creating the task.")
    }
  }

  /*
   * ------------------------------------------------------------
   * OPEN EDIT DIALOG
   * ------------------------------------------------------------
   */

  function handleEditTask(task: Task) {
    setEditingTask(task)

    editTaskForm.reset({
      name: task.name,
      description: task.description,
      status: task.status as TaskStatus,
      due_date: task.due_date ?? undefined,
      milestone_id: task.milestone_id ?? null,
    })

    setIsEditDialogOpen(true)
  }

  /*
   * ------------------------------------------------------------
   * UPDATE TASK
   * ------------------------------------------------------------
   */

  async function onEditSubmit(values: TaskFormValues) {
    if (!editingTask) return

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("You must be logged in to update a task.")
        return
      }

      const { error } = await supabase
        .from("tasks")
        .update({
          name: values.name,
          description: values.description,
          status: values.status,
          due_date:
            values.status === "Done"
              ? null
              : values.due_date
                ? format(new Date(values.due_date), "yyyy-MM-dd")
                : null,
          milestone_id:
            values.milestone_id === "null" || !values.milestone_id
              ? null
              : values.milestone_id,
        })
        .eq("id", editingTask.id)
        .eq("project_id", projectId)

      if (error) {
        console.error("Update error:", error)
        toast.error(`Failed to update task: ${error.message}`)
        return
      }

      setIsEditDialogOpen(false)
      setEditingTask(null)

      await getTasks()

      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Unexpected error updating task:", error)
      toast.error("An unexpected error occurred while updating the task.")
    }
  }

  /*
   * ------------------------------------------------------------
   * OPEN DELETE CONFIRMATION
   * ------------------------------------------------------------
   */

  function openDeleteDialog(task: Task) {
    setDeletingTask(task)
    setIsDeleteDialogOpen(true)
  }

  /*
   * ------------------------------------------------------------
   * DELETE TASK
   * ------------------------------------------------------------
   */

  async function handleDeleteTask(task: Task) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("You must be logged in to delete a task.")
        return
      }

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id)
        .eq("project_id", projectId)

      if (error) {
        console.error("Delete error:", error)
        toast.error(`Failed to delete task: ${error.message}`)
        return
      }

      setIsDeleteDialogOpen(false)
      setDeletingTask(null)

      await getTasks()

      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Unexpected error deleting task:", error)
      toast.error("An unexpected error occurred while deleting the task.")
    }
  }

  /*
   * ------------------------------------------------------------
   * DRAGGABLE TASK
   * ------------------------------------------------------------
   */

  function DraggableItem({
    task,
    children,
  }: {
    task: Task
    children: React.ReactNode
  }) {
    const draggable = useDraggable({
      id: task.id,
    })

    return (
      <Card
        ref={draggable.ref}
        className={`
          group relative overflow-hidden rounded-xl
          border border-border/50
          bg-card
          shadow-sm
          transition-all
          hover:border-primary/40
          hover:shadow-md
          cursor-grab
          active:cursor-grabbing
          ${
            draggable.isDragging
              ? "z-50 scale-[1.02] opacity-60 shadow-xl ring-2 ring-primary/40"
              : ""
          }
        `}
      >
        <div
          className="
            absolute left-0 top-0 bottom-0
            w-1
            bg-gradient-to-b
            from-primary/10
            to-transparent
            transition-colors
            group-hover:from-primary/40
          "
        />

        {children}
      </Card>
    )
  }

  /*
   * ------------------------------------------------------------
   * DROPZONE
   * ------------------------------------------------------------
   */

  function Dropzone({
    column,
    children,
  }: {
    column: TaskStatus
    children: React.ReactNode
  }) {
    const droppable = useDroppable({
      id: column,
    })

    return (
      <Card
        ref={droppable.ref}
        className="
          flex h-full min-h-[500px]
          flex-col
          rounded-2xl
          border-border/50
          bg-muted/30
          shadow-sm
        "
      >
        {children}
      </Card>
    )
  }


  function renderTaskContent(task: Task) {
  const milestone = task.milestone_id
    ? milestones.find(
        (m) => m.id === task.milestone_id
      )
    : null

  return (
    <>
      {/* TASK HEADER */}
      <div
        className="
          flex
          flex-row
          items-start
          justify-between
          p-4
          pb-2
          pl-5
        "
      >
        <p
          className="
            min-w-0
            flex-1
            pr-4
            break-words
            text-sm
            font-semibold
            leading-snug
            text-foreground
          "
        >
          {task.name}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                -mr-2
                h-7
                w-7
                shrink-0
                text-muted-foreground
                opacity-100
                transition-opacity
                md:opacity-0
                md:group-hover:opacity-100
                hover:text-foreground
              "
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-40 rounded-xl"
          >
            <DropdownMenuItem
              onSelect={() => handleEditTask(task)}
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => openDeleteDialog(task)}
              className="
                text-destructive
                focus:bg-destructive/10
                focus:text-destructive
              "
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TASK BODY */}
      <div className="min-w-0 space-y-3 px-4 pb-4 pl-5">
        {task.description && (
          <p
            className="
              break-words
              line-clamp-2
              text-xs
              leading-relaxed
              text-muted-foreground
            "
          >
            {task.description}
          </p>
        )}

        {/* TASK META */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">

          {/* DUE DATE */}
          <div
            className={`
              flex
              w-fit
              shrink-0
              items-center
              gap-1.5
              rounded-md
              border
              px-2
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              ${
                task.due_date
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/50 bg-muted text-muted-foreground"
              }
            `}
          >
            <CalendarDays className="h-3 w-3" />

            {task.due_date
              ? format(
                  parseISO(task.due_date),
                  "MMM d"
                )
              : "No Date"}
          </div>

          {/* MILESTONE */}
          {milestone && (
            <div
              className="
                flex
                w-fit
                max-w-[150px]
                min-w-0
                items-center
                gap-1.5
                rounded-md
                border
                border-primary/20
                bg-primary/10
                px-2
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-primary
              "
              title={milestone.name}
            >
              <Flag className="h-3 w-3 shrink-0" />

              <span className="truncate">
                {milestone.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

  /*
   * ------------------------------------------------------------
   * DRAG END
   * ------------------------------------------------------------
   */

async function handleDragEnd(event: {
  operation: {
    source: {
      id: string | number
    } | null
    target: {
      id: string | number
    } | null
  }
}) {
  const { source, target } = event.operation

  if (!source || !target) return

  const taskId = String(source.id)
  const newStatus = String(target.id)

  if (
    !taskStatusValues.includes(
      newStatus as TaskStatus
    )
  ) {
    return
  }

  const movedTask = tasks.find(
    (task) => task.id === taskId
  )

  if (!movedTask) return

  if (movedTask.status === newStatus) return

  setTasks((currentTasks) =>
    currentTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            due_date:
              newStatus === "Done"
                ? null
                : task.due_date,
          }
        : task
    )
  )

  try {
    const updateData: {
      status: TaskStatus
      due_date?: string | null
    } = {
      status: newStatus as TaskStatus,
    }

    if (newStatus === "Done") {
      updateData.due_date = null
    }

    const { error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("project_id", projectId)

    if (error) {
      console.error(
        "Task status update error:",
        error
      )

      toast.error("Failed to update task status.")

      await getTasks()

      return
    }

    toast.success(`Task moved to ${newStatus}`)
  } catch (error) {
    console.error(
      "Unexpected drag update error:",
      error
    )

    toast.error("Failed to update task status.")

    await getTasks()
  }
}

  /*
   * ------------------------------------------------------------
   * LOADING STATE
   * ------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl border-border/40 shadow-sm">
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
            </div>

            <div className="h-11 w-32 animate-pulse rounded-xl bg-muted" />
          </div>
        </Card>

        <div className="flex gap-4 overflow-hidden">
          {taskStatusValues.map((column) => (
            <Card
              key={column}
              className="min-w-[280px] flex-1 rounded-2xl border-border/50"
            >
              <CardHeader>
                <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              </CardHeader>

              <CardContent className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-xl bg-muted/70"
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * FILTER PROJECT TASKS
   * ------------------------------------------------------------
   */

  const projectTasks = tasks.filter(
    (task) => task.project_id === projectId
  )

  /*
   * ------------------------------------------------------------
   * BOARD
   * ------------------------------------------------------------
   */

  return (
    <>
      {/* =========================================================
          BOARD HEADER
      ========================================================= */}

      <Card
        className="
          mb-8
          overflow-hidden
          rounded-2xl
          border-border/40
          bg-gradient-to-r
          from-primary/10
          via-transparent
          to-transparent
          shadow-sm
          transition-all
          duration-300
          hover:shadow-md
        "
      >
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="mb-2 text-xl font-bold">
              Kanban Board
            </CardTitle>

            <CardDescription className="text-base font-medium text-muted-foreground">
              Track and manage your project tasks efficiently.
            </CardDescription>
          </div>

          {/* =====================================================
              CREATE TASK DIALOG
          ===================================================== */}

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="
                  rounded-xl
                  px-6
                  py-5
                  shadow-lg
                  shadow-primary/20
                  transition-all
                  hover:scale-[1.02]
                  hover:bg-primary/90
                "
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Task
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Create Task</DialogTitle>

                <DialogDescription>
                  Add a new task to this project.
                </DialogDescription>
              </DialogHeader>

              <Form {...taskForm}>
                <form
                  onSubmit={taskForm.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* TASK NAME */}

                  <FormField
                    control={taskForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Name</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="e.g. Polish the Kanban UI"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="hidden" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DESCRIPTION */}

                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>

                        <FormControl>
                          <Input
                            placeholder="Describe what needs to be done..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="hidden" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* STATUS */}

                  <FormField
                    control={taskForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>

                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Status</SelectLabel>

                                <SelectItem value="Backlog">
                                  Backlog
                                </SelectItem>

                                <SelectItem value="To Do">
                                  To Do
                                </SelectItem>

                                <SelectItem value="In Progress">
                                  In Progress
                                </SelectItem>

                                <SelectItem value="In Review">
                                  In Review
                                </SelectItem>

                                <SelectItem value="Done">
                                  Done
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="hidden" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DUE DATE */}

                  {selectedStatus !== "Done" && (
                    <FormField
                      control={taskForm.control}
                      name="due_date"
                      render={({ field }) => {
                        const selectedDate = field.value
                          ? parseISO(field.value)
                          : undefined

                        return (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>

                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarDays className="mr-2 h-4 w-4" />

                                    {selectedDate
                                      ? format(
                                          selectedDate,
                                          "PPP"
                                        )
                                      : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) =>
                                      field.onChange(
                                        date
                                          ? format(
                                              date,
                                              "yyyy-MM-dd"
                                            )
                                          : undefined
                                      )
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormDescription className="hidden" />
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  )}

                  {/* MILESTONE */}

                  <FormField
                    control={taskForm.control}
                    name="milestone_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Milestone</FormLabel>

                        <FormControl>
                          <Select
                            value={field.value || "null"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a milestone" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>
                                  Milestones
                                </SelectLabel>

                                {milestones.map((milestone) => (
                                  <SelectItem
                                    key={milestone.id}
                                    value={milestone.id}
                                  >
                                    {milestone.name}
                                  </SelectItem>
                                ))}

                                <SelectItem value="null">
                                  Other / No Milestone
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription className="hidden" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setIsCreateDialogOpen(false)
                      }
                    >
                      Cancel
                    </Button>

                    <Button type="submit">
                      Add Task
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* =========================================================
          EDIT TASK DIALOG
      ========================================================= */}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)

          if (!open) {
            setEditingTask(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>

            <DialogDescription>
              Update this task&apos;s details.
            </DialogDescription>
          </DialogHeader>

          <Form {...editTaskForm}>
            <form
              onSubmit={editTaskForm.handleSubmit(
                onEditSubmit
              )}
              className="space-y-6"
            >
              {/* TASK NAME */}

              <FormField
                control={editTaskForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="e.g. Polish the Kanban UI"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="hidden" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION */}

              <FormField
                control={editTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="Describe what needs to be done..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="hidden" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* STATUS */}

              <FormField
                control={editTaskForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>

                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status</SelectLabel>

                            <SelectItem value="Backlog">
                              Backlog
                            </SelectItem>

                            <SelectItem value="To Do">
                              To Do
                            </SelectItem>

                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>

                            <SelectItem value="In Review">
                              In Review
                            </SelectItem>

                            <SelectItem value="Done">
                              Done
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="hidden" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DUE DATE */}

              {selectedEditStatus !== "Done" && (
                <FormField
                  control={editTaskForm.control}
                  name="due_date"
                  render={({ field }) => {
                    const selectedDate = field.value
                      ? parseISO(field.value)
                      : undefined

                    return (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>

                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />

                                {selectedDate
                                  ? format(
                                      selectedDate,
                                      "PPP"
                                    )
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) =>
                                  field.onChange(
                                    date
                                      ? format(
                                          date,
                                          "yyyy-MM-dd"
                                        )
                                      : undefined
                                  )
                                }
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormDescription className="hidden" />
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              )}

              {/* MILESTONE */}

              <FormField
                control={editTaskForm.control}
                name="milestone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone</FormLabel>

                    <FormControl>
                      <Select
                        value={field.value || "null"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a milestone" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Milestones
                            </SelectLabel>

                            {milestones.map((milestone) => (
                              <SelectItem
                                key={milestone.id}
                                value={milestone.id}
                              >
                                {milestone.name}
                              </SelectItem>
                            ))}

                            <SelectItem value="null">
                              Other / No Milestone
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="hidden" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setIsEditDialogOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          DELETE CONFIRMATION DIALOG
      ========================================================= */}

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)

          if (!open) {
            setDeletingTask(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Task?</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deletingTask?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingTask(null)
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={!deletingTask}
              onClick={() => {
                if (deletingTask) {
                  handleDeleteTask(deletingTask)
                }
              }}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          KANBAN BOARD
      ========================================================= */}

      {projectTasks.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-muted/20">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <PlusIcon className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mb-2 text-lg font-semibold">
              No tasks yet
            </h3>

            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              Start organizing your project by adding your
              first task to the Kanban board.
            </p>

            <Button
              onClick={() =>
                setIsCreateDialogOpen(true)
              }
              className="rounded-xl"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
      <DragDropProvider
  onDragEnd={handleDragEnd}
>
  <div className="w-full min-w-0">

    {/* =========================================================
        MOBILE BOARD
    ========================================================= */}

    <div className="block space-y-4 md:hidden">

      {/* STATUS SELECTOR */}
      <div className="space-y-2">
        <label
          htmlFor="mobile-task-status"
          className="text-sm font-medium"
        >
          Task Status
        </label>

        <Select
          value={mobileStatus}
          onValueChange={(value) =>
            setMobileStatus(
              value as TaskStatus
            )
          }
        >
          <SelectTrigger
            id="mobile-task-status"
            className="w-full rounded-xl"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                Task Status
              </SelectLabel>

              {taskStatusValues.map((status) => {
                const count =
                  projectTasks.filter(
                    (task) =>
                      task.status === status
                  ).length

                return (
                  <SelectItem
                    key={status}
                    value={status}
                  >
                    <div className="flex items-center gap-2">
                      <span>{status}</span>

                      <span className="text-xs text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* SELECTED MOBILE COLUMN */}
      <Card
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-2xl
          border-border/50
          bg-muted/30
          shadow-sm
        "
      >
        {/* HEADER */}
        <CardHeader
          className="
            flex
            flex-row
            items-center
            justify-between
            border-b
            border-border/30
            bg-muted/20
            px-4
            py-4
          "
        >
          <div className="flex items-center gap-2">
            <CardTitle
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
              "
            >
              {mobileStatus}
            </CardTitle>

            <span
              className="
                rounded-full
                border
                border-border/50
                bg-background
                px-2
                py-0.5
                text-xs
                font-bold
                text-muted-foreground
              "
            >
              {
                projectTasks.filter(
                  (task) =>
                    task.status === mobileStatus
                ).length
              }
            </span>
          </div>
        </CardHeader>

        {/* TASKS */}
        <CardContent className="min-w-0 space-y-3 p-3">

          {projectTasks.filter(
            (task) =>
              task.status === mobileStatus
          ).length > 0 ? (
            projectTasks
              .filter(
                (task) =>
                  task.status === mobileStatus
              )
              .map((task) => (
                <Card
                  key={task.id}
                  className="
                    group
                    relative
                    w-full
                    min-w-0
                    overflow-hidden
                    rounded-xl
                    border
                    border-border/50
                    bg-card
                    shadow-sm
                  "
                >
                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      top-0
                      w-1
                      bg-gradient-to-b
                      from-primary/10
                      to-transparent
                    "
                  />

                  {renderTaskContent(task)}
                </Card>
              ))
          ) : (
            <div
              className="
                flex
                min-h-[180px]
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-border/40
                bg-background/50
                px-4
                text-center
              "
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                No tasks
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground/70">
                No tasks in{" "}
                {mobileStatus.toLowerCase()}.
              </p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>


    {/* =========================================================
        TABLET + DESKTOP BOARD
    ========================================================= */}

    <div
      className="
        hidden
        min-w-0
        gap-4
        md:grid
        md:grid-cols-2
        xl:grid-cols-5
      "
    >
      {taskStatusValues.map((column) => {
        const columnTasks =
          projectTasks.filter(
            (task) =>
              task.status === column
          )

        return (
          <div
            key={column}
            className="
              min-w-0
              w-full
            "
          >
            <Dropzone column={column}>

              {/* COLUMN HEADER */}
              <CardHeader
                className="
                  mb-3
                  flex
                  flex-row
                  items-center
                  justify-between
                  rounded-t-2xl
                  border-b
                  border-border/30
                  bg-muted/20
                  px-4
                  pb-3
                  pt-4
                "
              >
                <div className="flex items-center gap-2">
                  <CardTitle
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-foreground/80
                    "
                  >
                    {column}
                  </CardTitle>

                  <span
                    className="
                      rounded-full
                      border
                      border-border/50
                      bg-background
                      px-2
                      py-0.5
                      text-xs
                      font-bold
                      text-muted-foreground
                      shadow-sm
                    "
                  >
                    {columnTasks.length}
                  </span>
                </div>
              </CardHeader>

              {/* TASKS */}
              <CardContent
                className="
                  min-w-0
                  flex-1
                  space-y-3
                  px-3
                  pb-4
                "
              >
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <DraggableItem
                      key={task.id}
                      task={task}
                    >
                      {renderTaskContent(task)}
                    </DraggableItem>
                  ))
                ) : (
                  <div
                    className="
                      m-1
                      flex
                      min-h-[150px]
                      flex-col
                      items-center
                      justify-center
                      rounded-xl
                      border-2
                      border-dashed
                      border-border/40
                      bg-background/50
                      px-4
                      text-center
                    "
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      No tasks
                    </p>

                    <p className="mt-1 text-[11px] text-muted-foreground/70">
                      Drop a task here
                    </p>
                  </div>
                )}
              </CardContent>

            </Dropzone>
          </div>
        )
      })}
    </div>

  </div>
</DragDropProvider>
      )}
    </>
  )
}