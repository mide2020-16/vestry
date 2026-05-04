"use client";

import React from "react";
import { Check } from "lucide-react";
import { AnimatedCheck } from "@/components/ui/Boop";

type StepState = "done" | "active" | "upcoming";

function getStepState(step: number, current: number): StepState {
  if (step < current) return "done";
  if (step === current) return "active";
  return "upcoming";
}

interface StepIndicatorProps {
  current: number;
  ticketType: string;
}

export default function StepIndicator({ current, ticketType }: StepIndicatorProps) {
  const isNone = ticketType === "none";
  
  const steps = isNone
    ? [
        { label: "Details", index: 1 },
        { label: "Merch", index: 2 },
        { label: "Review", index: 4 },
      ]
    : [
        { label: "Details", index: 1 },
        { label: "Merch", index: 2 },
        { label: "Food", index: 3 },
        { label: "Review", index: 4 },
      ];

  return (
    <nav
      aria-label="Registration steps"
      className="flex items-center justify-center gap-2 mb-12"
    >
      {steps.map((s, i) => {
        const stepNumber = i + 1;
        const state = getStepState(s.index, current);
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={s.index}>
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
                {state === "done" ? (
                  <AnimatedCheck>
                    <Check size={18} strokeWidth={3} />
                  </AnimatedCheck>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-[10px] uppercase font-black tracking-widest transition-colors duration-300 ${
                  state === "active"
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-muted-foreground/50"
                }`}
              >
                {s.label}
              </span>
            </div>

            {!isLast && (
              <div className="flex items-center px-2 pb-6">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    state === "done" ? "w-10 bg-emerald-500" : "w-6 bg-border/50"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
