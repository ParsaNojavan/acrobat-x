"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  FileText, 
  Trash2, 
  Star, 
  MoreHorizontal, 
  ArrowUpDown, 
  Share2, 
  Download,
  ExternalLink 
} from "lucide-react"

// نمونه داده‌های فایل‌های اخیر
const initialFiles = [
  { id: "1", name: "contract-final.pdf", size: "1.8 MB", date: "12 mins ago", path: "/documents/contract-final.pdf", starred: true },
  { id: "2", name: "invoice-june.pdf", size: "842 KB", date: "Yesterday, 4:15 PM", path: "/invoices/invoice-june.pdf", starred: false },
  { id: "3", name: "presentation-export.pdf", size: "3.1 MB", date: "3 days ago", path: "/presentations/presentation-export.pdf", starred: false },
  { id: "4", name: "tax-report-2025.pdf", size: "4.2 MB", date: "Last week", path: "/reports/tax-report-2025.pdf", starred: true },
  { id: "5", name: "product-roadmap.pdf", size: "2.1 MB", date: "2 weeks ago", path: "/roadmap/product-roadmap.pdf", starred: false },
]

export default function RecentPage() {
  const [files, setFiles] = useState(initialFiles)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleStar = (id: string) => {
    setFiles(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f))
  }

  const deleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Recent Files</h1>
          <p className="text-xs text-zinc-500">
            Access and manage your recently opened PDF documents.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Search in recents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 border-zinc-900 bg-zinc-900/30 pl-9 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-800"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-zinc-900 bg-zinc-900/10 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            onClick={() => setFiles([])}
          >
            Clear Recents
          </Button>
        </div>
      </div>

      {/* Main Files Table */}
      <div className="rounded-lg border border-zinc-900 bg-zinc-950">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-900 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          <div className="col-span-6 flex items-center gap-2">Name</div>
          <div className="col-span-2 flex items-center gap-2">
            Last Opened <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <FileText className="h-10 w-10 text-zinc-700 stroke-[1.5]" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">No recent files found</p>
              <p className="text-[11px] text-zinc-600">Files you open will appear here for quick access.</p>
            </div>
          </div>
        )}

        {/* Table Body */}
        <div className="divide-y divide-zinc-900/60">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-zinc-900/20 transition-all group"
            >
              {/* File Name & Path */}
              <div className="col-span-6 flex items-center gap-3">
                <FileText className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                <div className="truncate pr-4">
                  <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5 font-mono">
                    {file.path}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="col-span-2 text-xs text-zinc-400">
                {file.date}
              </div>

              {/* Size */}
              <div className="col-span-2 text-xs text-zinc-500">
                {file.size}
              </div>

              {/* Actions Area */}
              <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                {/* Star Toggle */}
                <button
                  onClick={() => toggleStar(file.id)}
                  className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-all"
                  title="Star/Unstar"
                >
                  <Star 
                    className={`h-3.5 w-3.5 ${file.starred ? 'fill-zinc-300 text-zinc-300' : 'text-zinc-500'}`} 
                  />
                </button>

                {/* Open/Launch */}
                <button
                  className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-all"
                  title="Open file"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                {/* Remove from Recents */}
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-red-400 transition-all"
                  title="Remove from recents"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
