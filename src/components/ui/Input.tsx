"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  onChangeValue?: (v: string) => void;
}

export function FloatingInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  onChangeValue,
  className,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onChangeValue) onChangeValue(e.target.value);
  };

  return (
    <div className="relative group">
      <label
        htmlFor={name}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none z-10",
          lifted
            ? "top-2 text-[10px] text-amber-500 dark:text-amber-400 font-black uppercase tracking-widest"
            : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60"
        )}
      >
        {label}
      </label>
      <input
        {...props}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "w-full bg-muted/20 border rounded-2xl px-4 pt-6 pb-2 text-foreground text-sm font-medium focus:outline-none transition-all duration-300",
          focused
            ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_0_4px_rgba(251,191,36,0.06)]"
            : "border-border hover:border-border/60",
          className
        )}
      />
    </div>
  );
}

export function SimpleInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-muted/20 border border-border rounded-2xl px-4 py-3 text-foreground text-sm font-medium focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all duration-300",
        className
      )}
    />
  );
}
