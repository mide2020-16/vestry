/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Interactive } from "./Boop";
import { useEffect, useState } from "react";
import { useHistory } from "../providers/HistoryProvider";

export function BackButton({ minimal = false }: { minimal?: boolean }) {
  const history = useHistory();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Show on every page except Home
    const isHome = pathname === "/";
    setCanGoBack(!isHome);
  }, [pathname]);

  if (!canGoBack) return null;

  if (minimal) {
    return (
      <button
        onClick={() => history.back()}
        className="w-10 h-10 rounded-2xl bg-card/80 backdrop-blur-md border border-border flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:border-amber-500/50 transition-all active:scale-90 shadow-xl"
        aria-label="Go back"
      >
        <Interactive>
          <ChevronLeft size={20} />
        </Interactive>
      </button>
    );
  }

  return (
    <button
      onClick={() => history.back()}
      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border hover:border-amber-500/50 hover:bg-amber-500/5 text-muted-foreground hover:text-amber-500 transition-all active:scale-95 shadow-sm"
      aria-label="Go back"
    >
      <Interactive>
        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </Interactive>
      <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Back</span>
    </button>
  );
}
