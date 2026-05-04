"use client";

import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface Props {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLORS = [
  { bg: "from-amber-500 to-orange-600", border: "border-amber-400/20" },
  { bg: "from-emerald-500 to-teal-600", border: "border-emerald-400/20" },
  { bg: "from-blue-500 to-indigo-600", border: "border-blue-400/20" },
  { bg: "from-violet-500 to-purple-600", border: "border-violet-400/20" },
  { bg: "from-rose-500 to-pink-600", border: "border-rose-400/20" },
  { bg: "from-cyan-500 to-sky-600", border: "border-cyan-400/20" },
];

export function UserAvatar({ name, image, size = "md", className = "" }: Props) {
  const initials = getInitials(name);

  const colorIndex = name ? (name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % COLORS.length : 0;
  const theme = COLORS[colorIndex];

  const sizeCls = {
    sm: "w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl",
    md: "w-20 h-20 text-3xl rounded-2xl",
    lg: "w-32 h-32 text-5xl rounded-3xl",
  }[size];

  if (image) {
    return (
      <div className={`relative overflow-hidden border border-border group-hover:border-amber-500/50 transition-all shadow-sm ${sizeCls} ${className}`}>
        <Image 
          src={image} 
          alt={name} 
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
    );
  }

  return (
    <div className={`
      relative flex items-center justify-center font-black text-white tracking-tighter 
      bg-gradient-to-br ${theme.bg} ${theme.border} border
      shadow-2xl overflow-hidden
      ${sizeCls} ${className}
    `}>
      {/* Texture/Glow overlay for "realistic" feel */}
      <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      <span className="relative z-10 drop-shadow-lg">{initials}</span>
    </div>
  );
}
