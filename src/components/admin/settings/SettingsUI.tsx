'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Upload, X } from 'lucide-react';

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
      <label className="block text-sm font-medium text-neutral-300">{label}</label>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Input class helper ──────────────────────────────────────────────────── */

export const inputCls = (accent: 'amber' | 'emerald' = 'amber') =>
  `w-full bg-black/40 border border-neutral-700 rounded-lg px-4 py-3 text-white font-mono text-sm
   focus:outline-none focus:ring-2 transition-colors
   ${accent === 'amber'
     ? 'focus:ring-amber-500/50 focus:border-amber-500'
     : 'focus:ring-emerald-500/50 focus:border-emerald-500'}`;

/* ── Spinner ─────────────────────────────────────────────────────────────── */

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── Logo upload / preview ───────────────────────────────────────────────── */

export function LogoField({ logoUrl, onChange }: { logoUrl: string; onChange: (url: string) => void }) {
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
      <div className="relative w-16 h-16 rounded-full border border-neutral-700 bg-black/40 overflow-hidden shrink-0 flex items-center justify-center">
        {logoUrl ? (
          <>
            <Image src={logoUrl} alt="Logo preview" fill sizes='80px' className="object-cover" />
            <button
              type="button"
              aria-label="Remove logo"
              onClick={() => onChange('')}
              className="absolute top-0 right-0 bg-red-500/80 rounded-full p-0.5 hover:bg-red-500 transition-colors"
            >
              <X size={10} />
            </button>
          </>
        ) : (
          <Upload size={20} className="text-neutral-600" />
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
          className="px-4 py-2 text-sm border border-neutral-700 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors"
        >
          {logoUrl ? 'Change image' : 'Upload image'}
        </button>
        <input
          type="url"
          value={logoUrl.startsWith('data:') ? '' : logoUrl}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full bg-black/40 border border-neutral-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
        />
      </div>
    </div>
  );
}

/* ── Secret key input with show / hide toggle ────────────────────────────── */

export function SecretInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`${inputCls('emerald')} pr-10`} />
      <button
        type="button"
        aria-label={show ? 'Hide secret key' : 'Show secret key'}
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}