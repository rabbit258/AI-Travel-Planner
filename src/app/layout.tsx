import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel AI Planner",
  description: "AI-powered trip planning, budgeting, and real-time travel assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-slate-100`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <header className="sticky top-2 z-40 mb-4 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">Travel AI Planner</div>
              <nav className="flex items-center gap-3 text-xs md:text-sm">
                <span className="badge">Plan</span>
                <span className="badge">Map</span>
                <span className="badge">Budget</span>
                <span className="badge">Sync</span>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="py-8 text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Travel AI Planner</footer>
        </div>
      </body>
    </html>
  );
}
