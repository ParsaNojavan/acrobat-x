import { Search, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";

export default function TopBar(){
    return (
        <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="text-sm font-semibold tracking-wider text-zinc-200">ACROBAT.X</div>
            <nav className="hidden md:flex items-center gap-6 text-xs tracking-wide text-zinc-500">
              <button className="hover:text-zinc-200 transition-colors">File</button>
              <button className="hover:text-zinc-200 transition-colors">Edit</button>
              <button className="hover:text-zinc-200 transition-colors">View</button>
              <button className="hover:text-zinc-200 transition-colors">Tools</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <Input
                placeholder="Search..."
                className="h-8 w-56 border-zinc-900 bg-zinc-900/30 pl-8 text-xs text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-zinc-800"
              />
            </div>
            <Link href={'/settings'}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-900">
                    <Settings className="h-4 w-4 text-zinc-400" />
                </Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-900">
              <User className="h-4 w-4 text-zinc-400" />
            </Button>
          </div>
        </div>
      </header>
    )
}