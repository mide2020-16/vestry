"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationModal from "./NotificationModal";

export default function NotificationBell() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.data.filter((n: any) => !n.read).length);
        }
      } catch (err) {
        console.error("Failed to fetch unread notifications");
      }
    };

    fetchUnread();
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsNotifOpen(true)}
        className="relative p-2.5 bg-muted/30 hover:bg-muted rounded-2xl border border-border transition-all active:scale-90 group"
      >
        <Bell size={20} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-black text-[9px] font-black flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in duration-300">
            {unreadCount}
          </span>
        )}
      </button>
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
