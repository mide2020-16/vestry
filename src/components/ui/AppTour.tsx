/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTour } from "@/components/providers/TourProvider";
import { ChevronRight, ChevronLeft, X, Sparkles, HelpCircle } from "lucide-react";

export function AppTour() {
  const { isActive, currentStep, nextStep, prevStep, stopTour, currentStepIndex } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const findTarget = () => {
      const element = document.querySelector(currentStep.target);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    findTarget();
    window.addEventListener("resize", findTarget);
    window.addEventListener("scroll", findTarget);

    const interval = setInterval(findTarget, 300); // Polling for dynamic elements

    return () => {
      window.removeEventListener("resize", findTarget);
      window.removeEventListener("scroll", findTarget);
      clearInterval(interval);
    };
  }, [isActive, currentStep, currentStepIndex]);

  if (!mounted || !isActive || !currentStep) return null;

  // Calculate tooltip position to avoid overflow
  const getTooltipPosition = () => {
    if (!targetRect) return { top: 0, left: 0, placement: "bottom" as const };
    
    const margin = 20;
    const tooltipWidth = 320;
    const tooltipHeight = 220; // Estimated
    
    let left = targetRect.left;
    let top = targetRect.bottom + margin;
    let placement: "top" | "bottom" = "bottom";
    
    // Horizontal boundary check
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (left < 20) left = 20;
    
    // Vertical boundary check (flip to top if no space at bottom)
    if (top + tooltipHeight > window.innerHeight - 20) {
      top = targetRect.top - tooltipHeight - margin;
      placement = "top";
    }
    
    return { top, left, placement };
  };

  const { top: tooltipTop, left: tooltipLeft, placement } = getTooltipPosition();

  return (
    <div className="fixed inset-0 z-100 pointer-events-none overflow-hidden">
      {/* Dimmed Overlay with Rounded Hole (SVG Mask) */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <motion.rect
                    layoutId="spotlight-hole"
                    animate={{
                      x: targetRect.left - 8,
                      y: targetRect.top - 8,
                      width: targetRect.width + 16,
                      height: targetRect.height + 16,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    rx="12"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.7)"
                mask="url(#spotlight-mask)"
                className="backdrop-blur-[3px]"
              />
              
              {/* Pulsing Beacon Border */}
              <motion.rect
                layoutId="spotlight-beacon"
                animate={{
                  x: targetRect.left - 8,
                  y: targetRect.top - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  opacity: [0.1, 0.4, 0.1],
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 2, repeat: Infinity },
                  scale: { duration: 2, repeat: Infinity },
                }}
                rx="12"
                fill="none"
                stroke="rgb(245, 158, 11)"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div
            key={currentStep.id}
            ref={tooltipRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              top: tooltipTop,
              left: tooltipLeft 
            }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute w-[320px] pointer-events-auto bg-card/90 border border-border/50 shadow-2xl rounded-3xl p-6 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Sparkles size={14} className="text-amber-500" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Step {currentStepIndex + 1} of 6
                </span>
              </div>
              <button 
                onClick={stopTour}
                className="p-1.5 hover:bg-muted rounded-full transition-all hover:rotate-90"
                title="Dismiss Story"
              >
                <X size={14} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
              {currentStep.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {currentStep.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ 
                      width: i === currentStepIndex ? 20 : 6,
                      backgroundColor: i === currentStepIndex ? "rgb(245, 158, 11)" : "rgba(255,255,255,0.1)"
                    }}
                    className="h-1.5 rounded-full" 
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    type='button'
                    title='left'
                    onClick={prevStep}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-[11px]"
                >
                  {currentStepIndex === 5 ? "Finish" : "Next"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Smart Arrow */}
            <div 
              className={`absolute left-8 w-4 h-4 bg-card/90 border-border/50 rotate-45 rounded-sm ${
                placement === "bottom" ? "-top-2 border-l border-t" : "-bottom-2 border-r border-b"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TourHelpButton() {
  const { startTour, isActive } = useTour();

  if (isActive) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 p-4 bg-card border border-border/50 shadow-2xl rounded-full text-amber-500 backdrop-blur-xl group overflow-hidden"
    >
      <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
      <div className="relative flex items-center gap-2">
        <HelpCircle size={20} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-25 transition-all duration-500 whitespace-nowrap text-xs font-black uppercase tracking-widest text-foreground pr-2">
          Help Guide
        </span>
      </div>
    </motion.button>
  );
}
