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

  const currentStep = TOUR_STEPS[currentStepIndex] || null;

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
