"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { TOUR_STEPS, TourStep } from "@/lib/tourConfig";

interface TourContextType {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  startTour: () => void;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  hasSeenTour: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true until checked
  const pathname = usePathname();

  useEffect(() => {
    const seen = localStorage.getItem("has-seen-vestry-tour");
    if (!seen) {
      setHasSeenTour(false);
      // Auto-start tour on landing if never seen
      if (pathname === "/register") {
        setIsActive(true);
      }
    }
  }, [pathname]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
  }, []);

  const stopTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem("has-seen-vestry-tour", "true");
    setHasSeenTour(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      stopTour();
    }
  }, [currentStepIndex, stopTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // Filter steps by current pathname
  const visibleSteps = TOUR_STEPS.filter(
    (step) => !step.path || step.path === pathname
  );
  
  // Note: For multi-page tours, we might need more complex logic, 
  // but for now we'll handle steps available on the current path.
  const currentStep = TOUR_STEPS[currentStepIndex] || null;

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        hasSeenTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
