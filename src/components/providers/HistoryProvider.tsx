/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface HistoryContextType {
  history: string[];
  back: () => void;
  canGoBack: boolean;
  clearEventHistory: (eventId: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

function HistoryTracker({ onPathChange }: { onPathChange: (path: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    onPathChange(currentPath);
  }, [pathname, searchParams, onPathChange]);

  return null;
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem("nav_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handlePathChange = React.useCallback((currentPath: string) => {
    setHistory((prev) => {
      if (prev[prev.length - 1] === currentPath) return prev;
      
      if (prev.length > 1 && prev[prev.length - 2] === currentPath) {
        const newHistory = prev.slice(0, -1);
        sessionStorage.setItem("nav_history", JSON.stringify(newHistory));
        return newHistory;
      }

      const newHistory = [...prev, currentPath].slice(-20);
      sessionStorage.setItem("nav_history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const back = () => {
    if (history.length > 1) {
      router.back(); 
    } else {
      router.push("/");
    }
  };

  const canGoBack = history.length > 1 || (pathname !== "/" && pathname !== "/admin");
  
  const clearEventHistory = React.useCallback((eventId: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((path) => !path.includes(`eventId=${eventId}`));
      sessionStorage.setItem("nav_history", JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  return (
    <HistoryContext.Provider value={{ history, back, canGoBack, clearEventHistory }}>
      <React.Suspense fallback={null}>
        <HistoryTracker onPathChange={handlePathChange} />
      </React.Suspense>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory must be used within HistoryProvider");
  return context;
};
