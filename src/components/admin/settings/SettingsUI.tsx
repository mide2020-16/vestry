"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Eye, EyeOff, Upload, X } from "lucide-react";

/* ── Field wrapper ───────────────────────────────────────────────────────── */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold text-foreground/80 lowercase tracking-tight">
        {label}
      </label>
      {hint && <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60 leading-tight">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Input class helper ──────────────────────────────────────────────────── */

export const inputCls = (accent: "amber" | "emerald" = "amber") =>
  `w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-foreground font-mono text-sm
   focus:outline-none focus:ring-4 transition-all duration-300
   ${
     accent === "amber"
       ? "focus:ring-amber-500/10 focus:border-amber-500"
       : "focus:ring-emerald-500/10 focus:border-emerald-500"
   }`;

/* ── Spinner ─────────────────────────────────────────────────────────────── */

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ── Logo upload / preview ───────────────────────────────────────────────── */

export function LogoField({
  logoUrl,
  onChange,
}: {
  logoUrl: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-2xl border border-border bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center shadow-inner group/logo">
        {logoUrl ? (
          <>
            <Image
              src={logoUrl}
              alt="Logo preview"
              fill
              sizes="80px"
              className="object-contain p-2"
            />
            <button
              type="button"
              aria-label="Remove logo"
              onClick={() => onChange("")}
              className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity"
            >
              <X size={20} className="text-white" />
            </button>
          </>
        ) : (
          <Upload size={24} className="text-muted-foreground/30" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          aria-label="Upload logo file"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-border rounded-xl text-foreground hover:bg-muted transition-all"
        >
          {logoUrl ? "Update Branding" : "Upload Logo"}
        </button>
        <input
          type="url"
          value={logoUrl.startsWith("data:") ? "" : logoUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste image URL"
          className="w-full bg-muted/20 border border-border rounded-xl px-3 py-2 text-foreground text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
      </div>
    </div>
  );
}

/* ── Secret key input with show / hide toggle ────────────────────────────── */

export function SecretInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${inputCls("emerald")} pr-10`}
      />
      <button
        type="button"
        aria-label={show ? "Hide secret key" : "Show secret key"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

/* ── Toggle Switch ────────────────────────────────────────────────────────── */

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group bg-card p-4 rounded-xl border border-border/50 hover:border-amber-500/30 transition-all">
      <span className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">
        {label}
      </span>
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-muted-foreground/40 after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-white" />
      </div>
    </label>
  );
}
