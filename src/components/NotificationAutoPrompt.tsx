"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeUser } from "@/app/actions";
import { X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

const DISMISS_KEY = "vestry_notif_dismissed_at";
const DISMISS_DAYS = 7;

/**
 * Auto-prompts for push notification permission after a short delay.
 * If dismissed, waits 7 days before asking again.
 * Mounts in the root layout so it works on every page.
 */
export function NotificationAutoPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't show on server, or if browser doesn't support
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!("Notification" in window)) return;

    // Already granted or denied at browser level — don't show banner
    if (Notification.permission === "granted" || Notification.permission === "denied") return;

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const handleEnable = useCallback(async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn("[NotificationAutoPrompt] VAPID key not found");
          setVisible(false);
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        await subscribeUser(JSON.parse(JSON.stringify(sub)));
      }
      setVisible(false);
    } catch (err) {
      console.error("[NotificationAutoPrompt] Error:", err);
      setVisible(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Stay Updated</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Get notified about your registration status, event reminders, and announcements.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Enabling…" : "Enable"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
