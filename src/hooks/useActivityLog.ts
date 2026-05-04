import { useEffect, useRef } from "react";

export function useActivityLog(action: string, resource: string, details: string, metadata: any = {}) {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;

    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        resource,
        details,
        metadata,
        sessionId: localStorage.getItem("vestry_session_id") || undefined
      })
    }).catch(console.error);
  }, []);
}

// Global session helper
export function initSession() {
  if (typeof window !== "undefined" && !localStorage.getItem("vestry_session_id")) {
    localStorage.setItem("vestry_session_id", "sess_" + Math.random().toString(36).substring(2, 15));
  }
}
