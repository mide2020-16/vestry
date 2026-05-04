"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Interactive } from "./Boop";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  interactive?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  interactive = true,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 border-transparent",
    secondary: "bg-foreground text-background hover:opacity-90 border-transparent",
    outline: "bg-card border-border hover:bg-muted text-foreground hover:border-amber-500/50 hover:text-amber-500",
    ghost: "bg-transparent border-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
    danger: "bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/20 border-transparent",
    success: "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 border-transparent",
  };

  const sizes = {
    xs: "px-3 py-1.5 text-[9px]",
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm",
    xl: "px-10 py-5 text-base",
  };

  const baseStyles = "relative inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-2xl border transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </>
  );

  const button = (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
    >
      {content}
    </button>
  );

  if (interactive && !disabled && !isLoading) {
    return <Interactive>{button}</Interactive>;
  }

  return button;
}
