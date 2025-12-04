import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mimeeq AI Image POC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-2 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                AI
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Mimeeq AI POC</span>
                <span className="text-[11px] text-slate-400">
                  Internal CMS for AI-generated scenes
                </span>
              </div>
            </Link>
            <form
              action="/api/auth/logout"
              method="post"
              className="flex items-center gap-2"
            >
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="border-slate-700 text-xs"
              >
                Logout
              </Button>
            </form>
          </header>
          <main className="flex-1 flex">
            <aside className="hidden md:flex w-56 border-r border-slate-800 bg-slate-950/80 px-4 py-4 flex-col gap-2 text-sm">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                Navigation
              </span>
              <Link href="/dashboard" className="hover:text-emerald-300">
                Dashboard
              </Link>
              <Link href="/history" className="hover:text-emerald-300">
                Results history
              </Link>
            </aside>
            <section className="flex-1 px-4 py-4 md:px-8 md:py-6">
              {children}
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
