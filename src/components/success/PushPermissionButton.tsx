"use client";

import { useState, useEffect } from "react";
import { subscribeUser } from "@/app/actions";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { AnimatedSpinner } from "../ui/Boop";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushPermissionButton() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const reg = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
            console.warn("VAPID Key not found in environment.");
            return;
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        
        // This hits your server action which saves it
        await subscribeUser(JSON.parse(JSON.stringify(sub)));
        setIsSubscribed(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={handleSubscribe}
      disabled={isSubscribed || isLoading}
      className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 mt-4 rounded-xl transition-all border ${
        isSubscribed 
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed" 
          : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white"
      }`}
    >
      {isLoading ? (
        <AnimatedSpinner size={14} />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4 text-amber-400" />
      )}
      {isSubscribed ? "Notifications Enabled" : "Enable Push Notifications"}
    </button>
  );
}
