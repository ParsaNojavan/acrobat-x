"use client";

import React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

export default function TitleBar() {
  return (
    <div
      className="relative h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 pl-20 select-none text-xs text-zinc-400"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <span className="text-zinc-200 font-medium mr-4">PDF Editor</span>

        <Menubar className="h-auto border-0 bg-transparent p-0 shadow-none">
          <MenubarMenu>
            <MenubarTrigger className="text-zinc-400 data-[state=open]:bg-zinc-800 data-[state=open]:text-white hover:text-white">
              File
            </MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem>
                  New <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Open <MenubarShortcut>⌘O</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Save <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Save As</MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarSub>
                  <MenubarSubTrigger>Export</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Export as PDF</MenubarItem>
                    <MenubarItem>Export as Image</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem>Close</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-zinc-400 data-[state=open]:bg-zinc-800 data-[state=open]:text-white hover:text-white">
              Edit
            </MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem>
                  Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem>
                  Cut <MenubarShortcut>⌘X</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Copy <MenubarShortcut>⌘C</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Paste <MenubarShortcut>⌘V</MenubarShortcut>
                </MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-zinc-400 data-[state=open]:bg-zinc-800 data-[state=open]:text-white hover:text-white">
              View
            </MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem>
                  Zoom In <MenubarShortcut>⌘+</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Zoom Out <MenubarShortcut>⌘-</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>Reset Zoom</MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarGroup>
                <MenubarItem>Toggle Sidebar</MenubarItem>
                <MenubarItem>Fullscreen</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-zinc-400 data-[state=open]:bg-zinc-800 data-[state=open]:text-white hover:text-white">
              Help
            </MenubarTrigger>
            <MenubarContent>
              <MenubarGroup>
                <MenubarItem>Documentation</MenubarItem>
                <MenubarItem>Keyboard Shortcuts</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>About PDF Editor</MenubarItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 text-zinc-500 pointer-events-none">
        Untitled.pdf
      </div>
    </div>
  );
}
