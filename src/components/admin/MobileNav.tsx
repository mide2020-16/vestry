"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Boxes, Settings, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Interactive } from "../ui/Boop";

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const NAV = [
    { href: eventId ? `/admin?eventId=${eventId}` : "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: eventId ? `/admin/products?eventId=${eventId}` : "/admin/products", label: "Products", icon: Package },
    { href: eventId ? `/admin/inventory?eventId=${eventId}` : "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: eventId ? `/admin/settings?eventId=${eventId}` : "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed z-[100] bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border flex justify-around items-center px-2 py-3 pb-safe-bottom transition-colors">
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link 
            key={href} 
            href={href} 
            className={`flex flex-col items-center gap-1.5 min-w-[60px] transition-all duration-300 cursor-pointer ${
              isActive ? "text-amber-500 scale-110" : "text-muted-foreground hover:text-foreground opacity-70"
            }`}
          >
            <Interactive>
              <Icon size={20} className={isActive ? "fill-amber-500/10" : ""} />
            </Interactive>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-60"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
