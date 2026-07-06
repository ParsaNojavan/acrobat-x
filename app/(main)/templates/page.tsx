"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  FileText, 
  Layout, 
  Plus, 
  Eye, 
  FileSpreadsheet,
  FileSignature,
  Layers
} from "lucide-react"

// نمونه داده‌های قالب‌های آماده
const categories = ["All", "Business", "Education", "Design", "Personal"]

const initialTemplates = [
  { 
    id: "1", 
    name: "Minimalist Invoice", 
    category: "Business", 
    pages: "1 Page", 
    description: "Clean invoice template with tables, total summary, and signature block.",
    icon: FileSpreadsheet
  },
  { 
    id: "2", 
    name: "Professional Resume", 
    category: "Personal", 
    pages: "2 Pages", 
    description: "Elegant layout with sidebar for profile information, work history, and skills.",
    icon: FileText
  },
  { 
    id: "3", 
    name: "Meeting Minutes", 
    category: "Business", 
    pages: "1 Page", 
    description: "Structured document to record agenda items, discussion notes, and action steps.",
    icon: Layers
  },
  { 
    id: "4", 
    name: "Feedback Form", 
    category: "Design", 
    pages: "1 Page", 
    description: "Interactive layout with fields for customer details, ratings, and text comments.",
    icon: FileSignature
  },
  { 
    id: "5", 
    name: "Weekly Academic Planner", 
    category: "Education", 
    pages: "3 Pages", 
    description: "Clean grid schedule with spaces for lecture notes, deadlines, and weekly priorities.",
    icon: Layout
  },
  { 
    id: "6", 
    name: "Non-Disclosure Agreement", 
    category: "Business", 
    pages: "4 Pages", 
    description: "Standard legal NDA template with clear sections and signature pages.",
    icon: FileText
  }
]

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = initialTemplates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
            <Layout className="h-5 w-5 text-zinc-400 stroke-[1.5]" />
            Templates
          </h1>
          <p className="text-xs text-zinc-500">
            Start quickly with our professionally designed document templates.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 border-zinc-900 bg-zinc-900/30 pl-9 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
              selectedCategory === category
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid Templates list */}
      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
          <Layout className="h-10 w-10 text-zinc-800 stroke-[1.2]" />
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400">No templates found</p>
            <p className="text-[11px] text-zinc-600">Try adjusting your search filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const TemplateIcon = template.icon
            return (
              <div 
                key={template.id}
                className="group relative flex flex-col justify-between rounded-lg border border-zinc-900 bg-zinc-950 p-5 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-200"
              >
                <div>
                  {/* Top line (Icon & Pages badge) */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-md bg-zinc-900 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      <TemplateIcon className="h-4 w-4 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] text-zinc-600 bg-zinc-900/40 px-2 py-0.5 rounded-full">
                      {template.pages}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-2 line-clamp-3 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Interactive buttons on hover */}
                <div className="mt-5 pt-4 border-t border-zinc-900/50 flex gap-2 items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-8 text-[11px] border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 h-8 text-[11px] bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-medium"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Use Template
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
