"use client"

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Highlighter,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Printer,
  Redo2,
  Save,
  Search,
  Shapes,
  Sidebar,
  Type,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const thumbnails = Array.from({ length: 8 }, (_, i) => i + 1)

export default function PdfEditorPage() {
  return (
    <div className="flex h-full min-h-0 bg-zinc-950 text-zinc-100">
      {/* Left Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-zinc-900 bg-zinc-950/80 md:flex md:flex-col">
        <div className="border-b border-zinc-900 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Pages
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {thumbnails.map((page) => (
            <button
              key={page}
              className={`group w-full rounded-lg border p-2 text-left transition ${
                page === 1
                  ? "border-zinc-700 bg-zinc-900"
                  : "border-zinc-900 bg-zinc-950 hover:border-zinc-800 hover:bg-zinc-900/50"
              }`}
            >
              <div className="aspect-[3/4] w-full rounded-md border border-zinc-800 bg-white/95" />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Page {page}</span>
                <FileText className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Toolbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              <p className="text-[11px] text-zinc-300">contract-final.pdf</p>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Type className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Highlighter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Shapes className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 p-1 md:flex">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-[11px] text-zinc-400">100%</span>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-xs">
              <Save className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
            <Button size="sm" className="h-8 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs">
              <Download className="mr-1 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex min-h-0 flex-1">
          {/* PDF Canvas */}
          <main className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto bg-[#0a0a0a] px-6 py-8">
            <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-[11px] text-zinc-400">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Page 1 of 8</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>

            <div className="w-full max-w-4xl space-y-8">
              {[1, 2].map((page) => (
                <section
                  key={page}
                  className="mx-auto flex aspect-[1/1.414] w-full max-w-3xl items-start justify-start rounded-md border border-zinc-800 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
                >
                  <div className="p-10 text-black">
                    <div className="space-y-4">
                      <div className="h-6 w-48 rounded bg-zinc-200" />
                      <div className="h-4 w-full rounded bg-zinc-100" />
                      <div className="h-4 w-11/12 rounded bg-zinc-100" />
                      <div className="h-4 w-10/12 rounded bg-zinc-100" />
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </main>

          {/* Right Panel */}
          <aside className="hidden w-72 shrink-0 border-l border-zinc-900 bg-zinc-950/80 xl:flex xl:flex-col">
            <div className="border-b border-zinc-900 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Properties
              </p>
            </div>

            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Selected Tool</p>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                  <p className="text-[11px] text-zinc-400">Text Annotation</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Color</p>
                <div className="flex gap-2">
                  {["bg-yellow-400", "bg-blue-400", "bg-red-400", "bg-green-400"].map((color) => (
                    <button
                      key={color}
                      className={`h-6 w-6 rounded-full ${color} ring-1 ring-white/10`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Opacity</p>
                <div className="rounded-lg border border-zinc-900 bg-zinc-900/50 p-3">
                  <div className="h-1.5 rounded-full bg-zinc-800">
                    <div className="h-1.5 w-2/3 rounded-full bg-zinc-200" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-200">Actions</p>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start border-zinc-900 text-xs text-zinc-300">
                    <Search className="mr-2 h-3.5 w-3.5" />
                    Find in document
                  </Button>
                  <Button variant="outline" className="justify-start border-zinc-900 text-xs text-zinc-300">
                    <Printer className="mr-2 h-3.5 w-3.5" />
                    Print document
                  </Button>
                  <Button variant="outline" className="justify-start border-zinc-900 text-xs text-zinc-300">
                    <Sidebar className="mr-2 h-3.5 w-3.5" />
                    Toggle thumbnails
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
