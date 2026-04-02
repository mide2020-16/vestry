"use client";

import React from "react";
import { Check } from "lucide-react";

const LABELS = ["Details", "Merch", "Food & Drink", "Review"];

type StepState = "done" | "active" | "upcoming";

function getStepState(step: number, current: number): StepState {
  if (step < current) return "done";
  if (step === current) return "active";
  return "upcoming";
}

interface StepIndicatorProps {
  current: number;
}

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <nav
      aria-label="Registration steps"
      className="flex items-center justify-center gap-2 mb-12"
    >
      {LABELS.map((label, i) => {
        const step = i + 1;
        const state = getStepState(step, current);
        const isLast = i === LABELS.length - 1;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2 relative group">
              <div
                aria-current={state === "active" ? "step" : undefined}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ring-4 ${
                  state === "done"
                    ? "bg-emerald-500 text-white ring-emerald-500/20"
                    : state === "active"
                    ? "bg-amber-500 text-white ring-amber-500/30 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    : "bg-muted text-muted-foreground ring-transparent border border-border"
                }`}
              >
                {state === "done" ? <Check size={18} strokeWidth={3} /> : step}
              </div>
              <span className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-300 ${
                state === "active" ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground/50"
              }`}>
                {label}
              </span>
            </div>

            {!isLast && (
              <div className="flex items-center px-2 pb-6">
                <div className={`h-1 rounded-full transition-all duration-1000 ${
                  state === "done" ? "w-10 bg-emerald-500" : "w-6 bg-border/50"
                }`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
