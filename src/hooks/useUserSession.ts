/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserSessionData {
  name: string;
  email: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "vestry_user_session";

function parseSession(raw: string): UserSessionData | null {
  try {
    const parsed = JSON.parse(raw);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string"
    ) {
      return parsed as UserSessionData;
    }

    console.warn("Invalid session shape in localStorage, discarding.");
    return null;
  } catch {
    console.error("Failed to parse user session from localStorage.");
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserSession() {
  const [session, setSession] = useState<UserSessionData | null>(null);

  useEffect(() => {
    // Guard against SSR environments
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = parseSession(raw);
      if (parsed) setSession(parsed);
    }
  }, []);

  const saveSession = useCallback((data: UserSessionData) => {
    setSession(data);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return { session, saveSession, clearSession };
}
