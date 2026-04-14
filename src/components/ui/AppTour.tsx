"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTour } from "@/components/providers/TourProvider";
import { ChevronRight, ChevronLeft, X, Sparkles, HelpCircle } from "lucide-react";
import { Interactive } from "./Boop";

export function AppTour() {
  const { isActive, currentStep, nextStep, prevStep, stopTour, currentStepIndex } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

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

    const interval = setInterval(findTarget, 500); // Re-check if element appears (e.g. after step change)

    return () => {
      window.removeEventListener("resize", findTarget);
      window.removeEventListener("scroll", findTarget);
      clearInterval(interval);
    };
  }, [isActive, currentStep, currentStepIndex]);

  if (!mounted || !isActive || !currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Overlay with Hole */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            style={{
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${targetRect.left}px 100%, 
                ${targetRect.left}px ${targetRect.top}px, 
                ${targetRect.right}px ${targetRect.top}px, 
                ${targetRect.right}px ${targetRect.bottom}px, 
                ${targetRect.left}px ${targetRect.bottom}px, 
                ${targetRect.left}px 100%, 
                100% 100%, 
                100% 0%
              )`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              top: targetRect.bottom + 20,
              left: Math.max(20, Math.min(window.innerWidth - 340, targetRect.left))
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute w-[320px] pointer-events-auto bg-card/95 border border-border/50 shadow-2xl rounded-3xl p-6 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                  <Sparkles size={14} className="text-amber-500" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Step {currentStepIndex + 1}
                </span>
              </div>
              <button 
                onClick={stopTour}
                className="p-1.5 hover:bg-muted rounded-full transition-colors"
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
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStepIndex ? "w-4 bg-amber-500" : "w-1 bg-border"}`} 
                  />
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={prevStep}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95 text-sm"
                >
                  {currentStepIndex === 5 ? "Finish" : "Next"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Pointer arrow */}
            <div 
              className="absolute -top-2 left-8 w-4 h-4 bg-card border-l border-t border-border/50 rotate-45 rounded-sm"
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
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-500 whitespace-nowrap text-xs font-black uppercase tracking-widest text-foreground pr-2">
          Help Guide
        </span>
      </div>
    </motion.button>
  );
}
