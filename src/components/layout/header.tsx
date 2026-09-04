"use client"

import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  let title =
  pathname.split("/").pop()?.replace("-", " ") || "Dashboard"

  if (pathname.startsWith("/build/projects/")) {
     title = "Project Workspace"
  }
  return (
    <header>
      <h1 className="capitalize">{title}</h1>

    </header>
  )
}

