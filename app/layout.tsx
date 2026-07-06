import TopBar from "@/components/TopBar";
import SideBar from "@/components/SideBar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import TitleBar from "@/components/TitleBar";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="bg-zinc-950 text-white flex flex-col h-screen w-screen overflow-hidden select-none">

        <TitleBar/>

        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          
          <SideBar />

          <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
            {children}
          </main>
          
        </div>
      </body>
    </html>
  );
}
