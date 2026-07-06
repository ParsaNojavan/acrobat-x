import { ArrowUpRight } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function QuickActions(){
    return (
        <section className="space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Quick Tools</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                
                <Card className="group relative border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all cursor-pointer">
                  <CardHeader className="p-5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-zinc-200">Merge Files</CardTitle>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <CardDescription className="text-xs text-zinc-500 mt-1">
                      Combine multiple PDFs into a single document.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all cursor-pointer">
                  <CardHeader className="p-5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-zinc-200">Sign & Fill</CardTitle>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <CardDescription className="text-xs text-zinc-500 mt-1">
                      Place signatures and fill fields on the fly.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group relative border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all cursor-pointer">
                  <CardHeader className="p-5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-sm font-medium text-zinc-200">Compress PDF</CardTitle>
                      <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <CardDescription className="text-xs text-zinc-500 mt-1">
                      Reduce size without compromising quality.
                    </CardDescription>
                  </CardHeader>
                </Card>

              </div>
            </section>
    )
}