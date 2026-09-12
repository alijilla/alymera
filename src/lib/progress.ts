type Task = {
  id: string | number
  project_id: string
  name: string
  description: string
  status: string
  due_date: string | null
}

export function calculateProgress(
  completed: number,
  total: number
) {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function calculateTaskComplete(
  tasks: Task[],
  projectId: string
) {
  return tasks.filter(
    (task) =>
      task.project_id === projectId &&
      task.status === "Complete"
  ).length
}

export function calculateTotalTask(
  tasks: Task[],
  projectId: string
) {
  return tasks.filter(
    (task) => task.project_id === projectId
  ).length
}


export function makeArray(stack: string){
  return stack
    .split(",")
    .map((tech) => tech.trim())
    .filter(Boolean)

}