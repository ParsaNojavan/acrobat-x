import QuickActions from "@/components/QuickActions"
import RecentFiles from "@/components/RecentFiles"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PdfHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-4">
      
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-100">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 max-w-md">
            Select a document to edit or drop files anywhere to start processing them.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href='/editor'>
            <Button className="h-9 rounded-md bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-zinc-200 transition-colors">
              Open PDF
            </Button>
          </Link>
          <Button variant="outline" className="h-9 rounded-md border-zinc-800 bg-transparent text-zinc-400 text-xs hover:bg-zinc-900 hover:text-zinc-200">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Blank Document
          </Button>
        </div>
      </section>

      <QuickActions />

      <RecentFiles />

    </div>
  )
}
