"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function SideBar() {
  const pathname = usePathname()

  const linkClass = (href: string) => {
    const isActive = pathname === href

    return `block w-full rounded-md px-3 py-2 text-left text-xs transition-all cursor-pointer ${
      isActive
        ? "bg-zinc-900/60 font-medium text-zinc-200"
        : "text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-200"
    }`
  }

  return (
    <aside className="hidden w-56 border-r border-zinc-900 bg-zinc-950/50 p-6 md:block">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
            Workspace
          </p>

          <div className="mt-3 space-y-1">
            <Link href="/" className={linkClass("/")}>
              Home
            </Link>

            <Link href="/recent" className={linkClass("/recent")}>
              Recent
            </Link>

            <Link href="/starred" className={linkClass("/starred")}>
              Starred
            </Link>

            <Link href="/templates" className={linkClass("/templates")}>
              Templates
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
