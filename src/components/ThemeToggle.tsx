"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSun, AnimatedMoon, AnimatedMonitor } from "@/components/ui/Boop";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { id: "light", icon: Sun, animation: AnimatedSun, label: "Light" },
    { id: "dark", icon: Moon, animation: AnimatedMoon, label: "Dark" },
    { id: "system", icon: Monitor, animation: AnimatedMonitor, label: "System" },
  ];

  // The "active" theme is what we show when collapsed.
  // We default to 'system' icon if theme is not set.
  const activeTheme = themes.find((t) => t.id === theme) || themes[2];

  const handleSelect = (id: string) => {
    setTheme(id);
    setIsExpanded(false);
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex justify-end">
      <motion.div
        layout
        initial={false}
        className="flex items-center bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-full shadow-2xl overflow-hidden"
        style={{
          borderRadius: "9999px",
        }}
        animate={{
          width: isExpanded ? "auto" : "46px",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="collapsed"
              layoutId="toggle-button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-amber-500"
              aria-label="Toggle theme menu"
            >
              <activeTheme.animation>
                <activeTheme.icon size={18} />
              </activeTheme.animation>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              layoutId="toggle-button"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-1"
            >
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`p-2 rounded-full transition-all flex items-center justify-center ${
                      isActive
                        ? "bg-amber-500 text-white shadow-lg"
                        : "text-neutral-500 hover:text-neutral-200 hover:bg-white/10"
                    }`}
                    aria-label={t.label}
                  >
                    <t.animation>
                      <t.icon size={18} />
                    </t.animation>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
