"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface StickyLogoProps {
  logoUrl?: string;
}

export default function StickyLogo({ logoUrl }: StickyLogoProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!logoUrl) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed top-4 left-4 z-50 transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3 pointer-events-none"
      }`}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-lg bg-neutral-900">
        <Image
          src={logoUrl}
          alt="Church logo"
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
