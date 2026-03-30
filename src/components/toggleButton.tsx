"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ToggleProps {
  label?: string;
  children: React.ReactNode;
}

export function Toggle({ label = "Show details", children }: ToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        {open ? `Hide ${label.replace("Show ", "")}` : label}
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-screen opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
