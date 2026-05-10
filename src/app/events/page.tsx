"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, ArrowRight } from "lucide-react";
import FlipEventCard from "@/components/FlipEventCard";

interface Event {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImageUrl?: string;
  status: string;
  endDate?: string;
}

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "ALL" || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Discovery
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-[#1d1d1f] dark:text-white">
              Discover <br />
              <span className="text-amber-500">Extraordinary</span> <br />
              Experiences.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground font-medium leading-relaxed">
              Browse through a curated collection of premium events hosted on the Vestry platform. From exclusive galas to tech summits.
            </p>
          </motion.div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-0 z-40 px-6 py-4 bg-[#fafafa]/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-y border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search events, organizers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {["ALL", "OPEN", "CLOSED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/5 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-muted-foreground">
              <Loader2 className="animate-spin" size={32} />
              <p className="font-black uppercase tracking-widest text-[10px]">Synchronizing Event Hub</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    <FlipEventCard event={event} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {!loading && filteredEvents.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                    <Search size={32} />
                  </div>
                  <h3 className="text-2xl font-black">No Events Found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Try adjusting your search or filters to find what you&apos;re looking for.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-32 border-t border-black/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Ready to host your own <br />
            <span className="text-amber-500">Unforgettable Event?</span>
          </h2>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-4 px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-xs rounded-full hover:scale-105 transition-all shadow-2xl"
          >
            Create Your Event <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

