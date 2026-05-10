/* eslint-disable react-hooks/set-state-in-effect */
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
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const seen = localStorage.getItem("has-seen-vestry-tour");
    if (!seen) {
      setHasSeenTour(false);
      // Auto-start on register or admin landing
      if (pathname.endsWith("/register") || pathname === "/admin") {
        setIsActive(true);
      }
    }
  }, [pathname]);

  // Filter steps relevant to the current page to avoid showing wrong steps
  const isCorrectPage = useCallback((step: TourStep) => {
    if (!step.page) return true;
    if (step.page === "register" && pathname.endsWith("/register")) return true;
    if (step.page === "checkout" && pathname.endsWith("/checkout")) return true;
    if (step.page === "admin-dashboard" && pathname === "/admin") return true;
    if (step.page === "admin-events" && pathname === "/admin/events") return true;
    if (step.page === "admin-users" && pathname === "/admin/users") return true;
    if (step.page === "admin-settings" && pathname === "/admin/settings") return true;
    return false;
  }, [pathname]);

  const startTour = useCallback(() => {
    // Find the first step relevant to the current page
    const firstRelevantIndex = TOUR_STEPS.findIndex(step => isCorrectPage(step));
    
    setIsActive(true);
    setCurrentStepIndex(firstRelevantIndex !== -1 ? firstRelevantIndex : 0);
  }, [isCorrectPage]);

  const stopTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem("has-seen-vestry-tour", "true");
    setHasSeenTour(true);
  }, []);

  const nextStep = useCallback(() => {
    // Find the next step index that is relevant to the current page
    const nextRelevantIndex = TOUR_STEPS.findIndex((step, index) => index > currentStepIndex && isCorrectPage(step));
    
    if (nextRelevantIndex !== -1) {
      setCurrentStepIndex(nextRelevantIndex);
    } else {
      stopTour();
    }
  }, [currentStepIndex, isCorrectPage, stopTour]);

  const prevStep = useCallback(() => {
    // Find the previous step index that is relevant to the current page
    const prevIndices = TOUR_STEPS
      .map((step, index) => ({ step, index }))
      .filter(({ index, step }) => index < currentStepIndex && isCorrectPage(step));
    
    if (prevIndices.length > 0) {
      setCurrentStepIndex(prevIndices[prevIndices.length - 1].index);
    }
  }, [currentStepIndex, isCorrectPage]);

  const currentStep = TOUR_STEPS[currentStepIndex] || null;

  // If active step is not on this page, maybe we should auto-advance or just hide?
  // For now, let's just ensure the current step is valid for the current page
  const visibleStep = isActive && currentStep && isCorrectPage(currentStep) ? currentStep : null;

  return (
    <TourContext.Provider
      value={{
        isActive: isActive && !!visibleStep,
        currentStepIndex,
        currentStep: visibleStep,
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
