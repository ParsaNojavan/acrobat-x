"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  FileText, 
  Star, 
  ExternalLink, 
  ArrowUpDown,
  FolderOpen
} from "lucide-react"

// نمونه داده‌های اولیه برای فایل‌های ستاره‌دار
const initialStarredFiles = [
  { id: "1", name: "contract-final.pdf", size: "1.8 MB", dateAdded: "2 hours ago", path: "/documents/contract-final.pdf" },
  { id: "4", name: "tax-report-2025.pdf", size: "4.2 MB", dateAdded: "3 days ago", path: "/reports/tax-report-2025.pdf" },
]

export default function StarredPage() {
  const [files, setFiles] = useState(initialStarredFiles)
  const [searchQuery, setSearchQuery] = useState("")

  const removeStar = (id: string) => {
    // حذف فایل از لیست ستاره‌دارها
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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <Star className="h-5 w-5 fill-zinc-200 text-zinc-200 stroke-[1.5]" />
            Starred Files
          </h1>
          <p className="text-xs text-zinc-500">
            Your bookmarked and important documents for quick access.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Search in starred..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 border-zinc-900 bg-zinc-900/30 pl-9 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* Main Files Table */}
      <div className="rounded-lg border border-zinc-900 bg-zinc-950">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-zinc-900 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          <div className="col-span-6 flex items-center gap-2">Name</div>
          <div className="col-span-2 flex items-center gap-2">
            Date Added <ArrowUpDown className="h-3 w-3" />
          </div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <Star className="h-10 w-10 text-zinc-800 stroke-[1.2]" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-400">No starred files yet</p>
              <p className="text-[11px] text-zinc-600">Star important files to keep them organized here.</p>
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
                {file.dateAdded}
              </div>

              {/* Size */}
              <div className="col-span-2 text-xs text-zinc-500">
                {file.size}
              </div>

              {/* Actions Area */}
              <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                {/* Open File */}
                <button
                  className="p-1.5 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-200 transition-all"
                  title="Open file"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                {/* Remove Star */}
                <button
                  onClick={() => removeStar(file.id)}
                  className="p-1.5 hover:bg-zinc-900 rounded text-zinc-300 hover:text-red-400 transition-all"
                  title="Remove star"
                >
                  <Star className="h-3.5 w-3.5 fill-zinc-300 text-zinc-300 hover:fill-none hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
