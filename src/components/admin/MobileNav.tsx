"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Boxes, Settings } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed z-[100] bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-800 flex justify-around items-center px-2 py-3 pb-safe-bottom">
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link 
            key={href} 
            href={href} 
            className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
              isActive ? "text-amber-500" : "text-neutral-500 hover:text-neutral-400"
            }`}
          >
            <Icon size={22} className={isActive ? "fill-amber-500/10" : ""} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "opacity-100" : "opacity-80"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
