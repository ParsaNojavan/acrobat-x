"use client"

import React, { useState } from "react"
import { 
  Settings, 
  Monitor, 
  Keyboard, 
  FileText, 
  Shield, 
  Check, 
  RotateCcw,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general")
  
  const [theme, setTheme] = useState("dark")
  const [autoSave, setAutoSave] = useState(true)
  const [defaultZoom, setDefaultZoom] = useState("Fit Page")
  const [gpuAcceleration, setGpuAcceleration] = useState(true)

  const sections = [
    { id: "general", name: "General", icon: Monitor },
    { id: "editor", name: "PDF Editor", icon: FileText },
    { id: "shortcuts", name: "Shortcuts", icon: Keyboard },
    { id: "about", name: "About", icon: Settings },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-400 stroke-[1.5]" />
          Settings
        </h1>
        <p className="text-xs text-zinc-500">
          Customize your application environment, keyboard bindings, and view configurations.
        </p>
      </div>

      {/* Settings Container */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar inside Page */}
        <div className="col-span-3 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-zinc-900 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                {section.name}
              </button>
            )
          })}
        </div>

        {/* Settings Form/Content */}
        <div className="col-span-9 rounded-lg border border-zinc-900 bg-zinc-950 p-6 space-y-6">
          
          {/* GENERAL SECTION */}
          {activeSection === "general" && (
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-900">
                General Preferences
              </h2>
              
              {/* Theme Selection */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-200">App Theme</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Select the visual theme for the user interface.</p>
                </div>
                <div className="flex gap-1.5 bg-zinc-900/50 p-1 rounded-md">
                  {["Dark", "Light", "System"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t.toLowerCase())}
                      className={`px-3 py-1 rounded text-[10px] font-medium transition-all ${
                        theme === t.toLowerCase()
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hardware Acceleration */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-200">Hardware Acceleration</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Use GPU to render heavy PDF documents smoothly.</p>
                </div>
                <button
                  onClick={() => setGpuAcceleration(!gpuAcceleration)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    gpuAcceleration ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform duration-200 ${
                      gpuAcceleration ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* PDF EDITOR SECTION */}
          {activeSection === "editor" && (
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-900">
                PDF Rendering & Editor Settings
              </h2>

              {/* Auto Save */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-200">Auto Save Changes</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Periodically save edits to the file in background.</p>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    autoSave ? "bg-zinc-200" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`bg-zinc-950 w-4 h-4 rounded-full shadow-md transform duration-200 ${
                      autoSave ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Default Zoom */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-200">Default Zoom Level</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Starting scale when opening a new document.</p>
                </div>
                <select
                  value={defaultZoom}
                  onChange={(e) => setDefaultZoom(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1.5 text-[11px] focus:outline-none"
                >
                  <option>Fit Page</option>
                  <option>Fit Width</option>
                  <option>100%</option>
                  <option>150%</option>
                </select>
              </div>
            </div>
          )}

          {/* KEYBOARD SHORTCUTS SECTION */}
          {activeSection === "shortcuts" && (
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-900">
                Keyboard Shortcuts
              </h2>
              
              <div className="divide-y divide-zinc-900">
                {[
                  { action: "Open File", keys: ["Ctrl", "O"] },
                  { action: "Save Document", keys: ["Ctrl", "S"] },
                  { action: "Zoom In", keys: ["Ctrl", "+"] },
                  { action: "Zoom Out", keys: ["Ctrl", "-"] },
                  { action: "Toggle Sidebar", keys: ["Ctrl", "B"] },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <span className="text-xs text-zinc-400">{item.action}</span>
                    <div className="flex gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT SECTION */}
          {activeSection === "about" && (
            <div className="space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-900">
                About Application
              </h2>

              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="p-3 bg-zinc-900 rounded-xl">
                  <Sparkles className="h-10 w-10 text-zinc-200 stroke-[1.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Minimal PDF</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Version 1.0.0 (Stable Release)</p>
                </div>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  A high-performance, clutter-free PDF Reader and Editor built on Electron, Next.js, and Tailwind CSS.
                </p>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="h-8 text-[10px] border-zinc-900 text-zinc-400 hover:text-zinc-200">
                    Release Notes
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[10px] border-zinc-900 text-zinc-400 hover:text-zinc-200">
                    Check Updates
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions inside Panel */}
          {activeSection !== "about" && (
            <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-[11px] border-zinc-900 text-zinc-500 hover:text-zinc-300"
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Reset Defaults
              </Button>
              <Button 
                size="sm" 
                className="h-8 text-[11px] bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
              >
                Save Settings
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
