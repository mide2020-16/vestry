/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Link from "next/link";
import { BackButton } from "../ui/BackButton";
import { UserAvatar } from "./UserAvatar";
import NotificationBell from "./NotificationBell";
import MobileMenu from "./MobileMenu";

export default async function AdminTopbar() {
  const session = await auth();
  if (!session?.user?.email) return null;

  await dbConnect();
  const dbUser = await User.findOne({ email: session.user.email.toLowerCase() }).lean() as any;

  if (!dbUser) return null;
  const eventCount = dbUser.managedEvents?.length || 0;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Toggle */}
        <MobileMenu role={dbUser.role} email={dbUser.email} />
        
        <BackButton />
        
        {/* Mobile branding */}
        <div className="hidden xs:block md:hidden">
          <span className="text-foreground font-black tracking-[0.2em] uppercase text-[10px] sm:text-xs">
            Vestry
          </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Event Counter */}
        <div className="flex flex-col items-end cursor-default hidden lg:flex">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Events</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{eventCount}</span>
            <div className="w-4 h-px bg-border" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-border/50" />

        {/* Profile */}
        <Link 
          href="/admin/profile"
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover:bg-muted/50 p-1 rounded-2xl transition-all active:scale-95"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors leading-none mb-1">{dbUser.name}</p>
            <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-tighter">{dbUser.role?.replace('_', ' ')}</p>
          </div>
          <div className="relative">
            <UserAvatar 
              name={dbUser.name} 
              image={dbUser.image} 
              size="sm" 
              className="group-hover:border-amber-500/50 transition-all shadow-sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
        </Link>
      </div>
    </header>
  );
}
