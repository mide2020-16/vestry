"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  collapsed: boolean;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: NavItemProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`relative flex items-center gap-4 p-4 rounded-xl font-medium transition-all duration-500 ease-in-out group
        ${collapsed ? "justify-center w-11 h-11 mx-auto" : "px-4 py-3.5 w-full"}
        ${isActive ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
    >
      <Icon
        size={20}
        className={`shrink-0 transition-all duration-500
          ${isActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground/60 group-hover:text-foreground"}`}
      />

      {!collapsed && (
        <span className="overflow-hidden w-auto opacity-100 transition-all duration-500 ease-in-out whitespace-nowrap">
          {label}
        </span>
      )}

      {/* Active dot — expanded */}
      {isActive && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
      )}

      {/* Active bar — collapsed */}
      {isActive && collapsed && (
        <span className="absolute -left-2 w-0.5 h-5 bg-amber-500 rounded-r-full" />
      )}
    </Link>
  );
}
