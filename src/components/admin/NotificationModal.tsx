"use client";

import { useEffect, useState } from "react";
import { Bell, X, Check, ExternalLink, Calendar, CreditCard, Info, ShieldAlert, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/admin/notifications")
        .then(r => r.json())
        .then(data => {
          if (data.success) setNotifications(data.data);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  const markAllAsRead = async () => {
    await fetch("/api/admin/notifications/read-all", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "REGISTRATION": return <Calendar className="text-amber-500" size={16} />;
      case "PAYMENT": return <CreditCard className="text-emerald-500" size={16} />;
      case "SECURITY_ALERT": return <ShieldAlert className="text-red-500" size={16} />;
      case "SYSTEM_UPDATE": return <Zap className="text-blue-500" size={16} />;
      default: return <Info className="text-muted-foreground" size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-amber-500" />
                <h2 className="text-xl font-black uppercase tracking-tight">Intelligence Feed</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
                  title="Mark all as read"
                >
                  <Check size={18} />
                </button>
                <button 
                title="close"
                type="button"
                onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="py-20 text-center"><Spinner /></div>
              ) : notifications.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="text-muted-foreground/30" size={32} />
                  </div>
                  <p className="text-sm text-muted-foreground italic">No new activity detected.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n._id}
                    className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-muted/10 border-border/50' : 'bg-amber-500/[0.03] border-amber-500/20 shadow-sm shadow-amber-500/5'}`}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-bold text-sm ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                          <span className="text-[9px] font-mono text-muted-foreground/60 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                        {n.link && (
                          <a 
                            href={n.link}
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 mt-2 hover:gap-2 transition-all"
                          >
                            Explore <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/10">
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest opacity-60">
                End of Transmission
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
