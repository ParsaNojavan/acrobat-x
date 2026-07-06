import TopBar from "@/components/TopBar";
import TitleBar from "@/components/TitleBar";
import "@/app/globals.css"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-white">
      <TitleBar />
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
