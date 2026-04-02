"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 dark:border-white/5 p-1 rounded-full shadow-2xl">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-all ${
          theme === "light" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="Light mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-all ${
          theme === "dark" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="Dark mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-all ${
          theme === "system" 
            ? "bg-amber-500 text-white shadow-lg scale-110" 
            : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
        }`}
        aria-label="System mode"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
}
