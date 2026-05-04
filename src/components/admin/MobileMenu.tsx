"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  Boxes, 
  Settings, 
  ShieldCheck, 
  BarChart3, 
  Clock, 
  Users 
} from "lucide-react";

interface Props {
  role?: string;
  email?: string;
}

export default function MobileMenu({ role, email }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const navItems = [
    { href: eventId ? `/admin?eventId=${eventId}` : "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: eventId ? `/admin/products?eventId=${eventId}` : "/admin/products", label: "Products", icon: Package },
    { href: eventId ? `/admin/inventory?eventId=${eventId}` : "/admin/inventory", label: "Inventory", icon: Boxes },
    { href: "/admin/profile", label: "Profile", icon: Users },
    { href: eventId ? `/admin/settings?eventId=${eventId}` : "/admin/settings", label: "Settings", icon: Settings },
  ];

  if (role === "SUPER_ADMIN") {
    navItems.splice(0, 0, 
      { href: "/admin/super", label: "Super Hub", icon: ShieldCheck },
      { href: "/admin/super/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/super/logs", label: "Audit Logs", icon: Clock }
    );
  }

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-muted/30 hover:bg-muted rounded-2xl border border-border transition-all active:scale-90"
      >
        <Menu size={20} className="text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-[80%] max-w-sm bg-card border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Navigation</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{role?.replace('_', ' ')}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all border ${
                        active 
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-lg shadow-amber-500/5" 
                          : "border-transparent text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-border space-y-4">
                <div className="px-4 py-3 bg-muted/50 rounded-2xl border border-border">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black opacity-60">Identity</p>
                  <p className="text-xs font-bold truncate">{email}</p>
                </div>
                <Link
                  href="/admin/signout"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/10 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <LogOut size={16} />
                  Terminate Session
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
