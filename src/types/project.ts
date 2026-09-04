

export type ProjectStatus = "In Progress" | "Complete" | "Planning"

export type Projects = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  techStack:string[]
  dueDate: string
  imageSrc: string
}