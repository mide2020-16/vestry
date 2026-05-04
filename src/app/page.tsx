/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import type { Metadata, Viewport } from "next";
// import { PushNotificationManager } from "@/components/PushNotificationManager";
import { InstallPrompt } from "@/components/InstallPrompt";
// import { Toggle } from "@/components/toggleButton";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";
import { auth } from "@/auth";
import FlipEventCard from "@/components/FlipEventCard";

export const metadata: Metadata = {
  title: "Vestry Hub | Event Discovery",
  description: "Discover and register for upcoming Vestry events.",
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

async function getEvents() {
  await dbConnect();
  const rawEvents = await Event.find({ status: "OPEN" })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  
  // Serialize for Client Components
  return JSON.parse(JSON.stringify(rawEvents)).map((event: any) => ({
    ...event,
    _id: event._id.toString(),
    createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : null,
    updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : null,
    endDate: event.endDate ? new Date(event.endDate).toISOString() : null,
  }));
}

export default async function HubPage() {
  const events = await getEvents();
  const session = await auth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      {/* Layered ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-amber-500/5 dark:bg-amber-500/8 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto space-y-12 relative z-10 py-12">
        {/* Header section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Vestry Event Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground leading-tight tracking-tighter max-w-4xl mx-auto">
            The Ultimate <span className="text-amber-500">Event OS</span> <br className="hidden md:block"/> for Planners & Attendees
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Launch stunning registration portals, manage tickets, and sell merchandise effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/admin" 
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black uppercase tracking-widest rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/20 hover:scale-105"
            >
              🚀 Launch Your Event
            </Link>
            <a 
              href="#events" 
              className="w-full sm:w-auto px-8 py-4 bg-card hover:bg-accent border border-border text-foreground font-black uppercase tracking-widest rounded-2xl text-sm transition-all hover:scale-105"
            >
              🎟️ Find an Event
            </a>
          </div>
        </div>

        {/* Discovery Grid */}
        <div id="events" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-12 mt-12 border-t border-border/50">
          {events.map((event: any, index: number) => (
            <FlipEventCard key={event._id.toString()} event={event} index={index} />
          ))}
          
          {events.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
              <p className="text-muted-foreground">No active events found. Check back later!</p>
            </div>
          )}
        </div>


      </div>

      {/* <Toggle label="Send Message">
        <PushNotificationManager />
      </Toggle> */}
      <InstallPrompt />
    </div>
  );
}
