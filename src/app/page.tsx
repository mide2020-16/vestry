import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { InstallPrompt } from "@/components/InstallPrompt";
import { auth } from "@/auth";
import { ArrowRight, Sparkles, UserCircle, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "Vestry | Premium Event Discovery & Ticketing",
  description: "Experience the next generation of event discovery and registration.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vestry Hub",
  },
  icons: {
    icon: "/logo/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function HubPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground transition-colors duration-700 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient background design */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251,191,36,0.3) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Animated badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">The Future of Events is Here</span>
        </div>

        {/* Hero Content */}
        <div className="space-y-8 mb-16 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-[#1d1d1f] dark:text-white animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Vestry. <br />
            <span className="text-amber-500">Discover</span> Your <br />
            Next Adventure.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/80 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            A premium ticketing platform built for elite experiences. Discover exclusive events, manage your bookings, and attend with style.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link 
            href="/events" 
            className="group w-full sm:w-auto px-10 py-6 bg-amber-500 text-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:scale-105 transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-4"
          >
            <Compass size={18} />
            Browse Events
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href={session ? "/admin" : "/login"} 
            className="w-full sm:w-auto px-10 py-6 bg-white dark:bg-[#1c1c1e] text-black dark:text-white font-black uppercase tracking-[0.2em] text-xs rounded-full hover:scale-105 transition-all border border-black/5 dark:border-white/5 shadow-xl flex items-center justify-center gap-4"
          >
            <UserCircle size={18} />
            {session ? "Dashboard" : "Sign Up / Login"}
          </Link>
        </div>

        {/* Dynamic decorative elements */}
        <div className="mt-32 w-full max-w-lg aspect-square relative opacity-20 pointer-events-none select-none animate-pulse">
           <div className="absolute inset-0 border-[40px] border-amber-500/10 rounded-full scale-110" />
           <div className="absolute inset-0 border-[20px] border-amber-500/5 rounded-full scale-125" />
        </div>
      </div>

      <InstallPrompt />
      
      {/* Absolute footer */}
      <footer className="absolute bottom-8 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 opacity-50">
        Vestry © 2026 — Precision Whimsy Engine
      </footer>
    </div>
  );
}
