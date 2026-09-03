"use client"

import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const title =
  pathname.split("/").pop()?.replace("-", " ") || "Dashboard"


  return (
    <header>
      <h1 className="capitalize">{title}</h1>

    </header>
  )
}

