/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  Boxes,
  PanelLeftIcon,
  PanelRightIcon,
  Users,
  Calendar,
  ShieldCheck,
  BarChart3,
  Clock
} from "lucide-react";
import { NavItem } from "../../components/admin/NavItem";
import { Interactive, AnimatedChevron } from "@/components/ui/Boop";

interface Props {
  email?: string | null;
  role?: string;
}

export default function AdminSidebar({ email, role }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setCollapsed(mq.matches);
    setIsMounted(true);

    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const navItems = [
    { href: eventId ? `/admin?eventId=${eventId}` : "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: eventId ? `/admin/products?eventId=${eventId}` : "/admin/products", label: "Products", icon: Package },
    { href: eventId ? `/admin/inventory?eventId=${eventId}` : "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: eventId ? `/admin/settings?eventId=${eventId}` : "/admin/settings", label: "Settings", icon: Settings },
  ];

  if (role === "SUPER_ADMIN") {
    navItems.splice(0, 0, 
      { href: "/admin/super", label: "Super Hub", icon: ShieldCheck },
      { href: "/admin/super/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/super/logs", label: "Audit Logs", icon: Clock }
    );
    navItems.splice(5, 0, 
      { href: "/admin/users", label: "Users", icon: Users }
    );
  }

  if (!isMounted) {
    return (
      <div className="w-18 h-screen bg-card border-r border-border shrink-0" />
    );
  }

  return (
    <aside
      className={`hidden md:flex flex-col bg-card border-r border-border sticky top-0 h-screen shrink-0 transition-all duration-500 ease-in-out
        ${collapsed ? "w-18" : "w-72"}`}
    >
      <div className="flex flex-col h-full py-8 gap-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Header */}
        <header
          className={`flex items-center transition-all duration-500
          ${collapsed ? "flex-row gap-2" : "justify-between px-6"}`}
        >
          {!collapsed && (
            <div>
              <h1 className="text-lg font-black text-foreground tracking-[0.2em] uppercase leading-none">
                Vestry
              </h1>
              <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-black">
                Admin Panel
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={`transition-all duration-500 active:scale-95 shrink-0 border border-transparent hover:border-border flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer
              ${collapsed ? "w-11 h-11 mx-auto" : "p-2 mr-2"}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <AnimatedChevron direction="right">
                <PanelRightIcon size={20} />
              </AnimatedChevron>
            ) : (
              <AnimatedChevron direction="left">
                <PanelLeftIcon size={20} />
              </AnimatedChevron>
            )}
          </button>
        </header>

        {/* Divider */}
        <div
          className={`h-px bg-border/50 transition-all duration-500 ${collapsed ? "mx-4" : "mx-6"}`}
        />

        {/* Nav */}
        <nav
          className={`flex flex-col transition-all duration-500
          ${collapsed ? "gap-3 px-0 items-center" : "gap-1.5 px-4"}`}
        >
          {navItems.map(({ href, label, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              icon={icon}
              isActive={pathname === href}
              collapsed={collapsed}
              data-tour={`nav-${label.toLowerCase()}`}
            />
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`mt-auto transition-all duration-500 ${collapsed ? "flex flex-col items-center px-0" : "px-4"}`}
        >
          {!collapsed && email && (
            <div className="mb-4 px-4 py-3 bg-muted/50 rounded-2xl border border-border shadow-sm cursor-default">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-black mb-0.5">
                Signed in as
              </p>
              <p className="text-foreground text-xs truncate font-bold">
                {email}
              </p>
              <p className="text-[9px] text-amber-500 font-black uppercase mt-1">
                {role?.replace("_", " ")}
              </p>
            </div>
          )}

          <Link
            href="/admin/signout"
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-4 rounded-2xl bg-red-600/5 text-red-600 dark:bg-red-500/5 dark:text-red-400 cursor-pointer
              hover:bg-red-600/10 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300 transition-all duration-500 font-bold border border-red-500/10 hover:border-red-500/30
              ${collapsed ? "justify-center w-11 h-11" : "px-4 py-3.5 w-full"}`}
          >
            <Interactive>
              <LogOut size={20} className="shrink-0" />
            </Interactive>
            {!collapsed && (
              <span className="overflow-hidden w-auto opacity-100 transition-all duration-500 whitespace-nowrap uppercase text-[11px] tracking-widest">
                Sign Out
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
