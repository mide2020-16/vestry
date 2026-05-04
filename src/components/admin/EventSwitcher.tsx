/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Calendar } from "lucide-react";
import { AnimatedChevron } from "../ui/Boop";
import { Button } from "@/components/ui/Button";

export default function EventSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentEventId = searchParams.get("eventId");

  const [events, setEvents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setEvents(data.data);
          const found = data.data.find((e: any) => e._id === currentEventId);
          setCurrentEvent(found || data.data[0]);
        }
      });
  }, [currentEventId]);

  const handleSwitch = (event: any) => {
    setIsOpen(false);
    setCurrentEvent(event);
    
    const params = new URLSearchParams(searchParams);
    params.set("eventId", event._id);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (events.length <= 1) return null;

  return (
    <div className="relative" data-tour="event-switcher">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="px-4 py-2.5 flex items-center gap-3 lowercase rounded-2xl"
        leftIcon={
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
            <Calendar size={16} />
          </div>
        }
        rightIcon={
          <AnimatedChevron direction={isOpen ? "up" : "down"}>
            <ChevronDown size={16} className="text-muted-foreground" />
          </AnimatedChevron>
        }
      >
        <div className="text-left hidden sm:block normal-case">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Active Event</p>
          <p className="text-sm font-bold text-foreground leading-none">{currentEvent?.name || "Select Event"}</p>
        </div>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 bg-muted/30 border-b border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Switch Event</p>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {events.map((event) => (
                <button
                  key={event._id}
                  onClick={() => handleSwitch(event)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left cursor-pointer ${currentEvent?._id === event._id ? 'bg-amber-500/5' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${event.status === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <p className={`text-sm font-bold ${currentEvent?._id === event._id ? 'text-amber-500' : 'text-foreground'}`}>{event.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{event.slug}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
