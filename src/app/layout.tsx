import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

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
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-slate-900 dark:bg-[#020617] dark:text-slate-100`}>
        <AuthProvider>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <Header />
            <main>{children}</main>
            <footer className="py-8 text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Travel AI Planner</footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
