import { FileText } from "lucide-react";

export default function RecentFiles(){
    return (
        <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Recent</h2>
                <button className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">Clear all</button>
              </div>

              <div className="rounded-lg border border-zinc-900 bg-zinc-900/10 divide-y divide-zinc-900/80">
                {[
                  { name: "contract-final.pdf", date: "12m ago", size: "1.8 MB" },
                  { name: "invoice-june.pdf", date: "Yesterday", size: "842 KB" },
                  { name: "presentation-export.pdf", date: "3 days ago", size: "3.1 MB" },
                ].map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between px-5 py-3 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-zinc-600">
                      <span>{file.date}</span>
                      <span className="w-14 text-right">{file.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
    )
}