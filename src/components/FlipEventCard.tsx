/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, X, Calendar, Clock, ArrowRight } from "lucide-react";

interface Props {
  event: any;
  index?: number;
}

export default function FlipEventCard({ event, index }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Use index for the number, or fallback to slug suffix if no index provided
  const eventNumber = typeof index === 'number' 
    ? (index + 1).toString().padStart(2, '0') 
    : (event.slug || "").slice(-3).toUpperCase();

  const deadline = new Date(event.endDate || "");
  const formattedDeadline = deadline.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="relative group w-full h-[400px] perspective-1000">
      <div 
        className={`w-full h-full transition-all duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 backface-hidden w-full h-full"
          style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        >
          <div className="w-full h-full bg-card border border-border group-hover:border-amber-500/50 rounded-3xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-amber-500/10 flex flex-col relative">
            
            {/* Info Flip Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFlipped(true);
              }}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black hover:scale-110 transition-all shadow-lg"
            >
              <Info size={20} />
            </button>

            {event.bannerImageUrl ? (
              <div className="h-48 w-full relative overflow-hidden shrink-0">
                 <Image
                  width={500}
                  height={500}
                  src={event.bannerImageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
              </div>
            ) : (
              <div className="h-48 w-full relative overflow-hidden shrink-0 bg-gradient-to-br from-amber-500/20 to-card">
                 <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
              </div>
            )}
            
            <Link href={`/event/${event.slug}/register`} className="p-6 space-y-4 relative z-10 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-300">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-4xl font-black italic">#{eventNumber}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
                  {event.name}
                </h3>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">
                  Register Now
                </span>
                <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full"
          style={{ transform: "rotateY(180deg) translateZ(0)", WebkitTransform: "rotateY(180deg) translateZ(0)" }}
        >
          <div className="w-full h-full bg-card border border-amber-500/50 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col relative p-8">
            
            {/* Close Flip Button */}
            <button
              onClick={() => setIsFlipped(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background hover:scale-110 transition-all"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-black text-amber-500 mb-6">Event Details</h3>
            
            <div className="flex-grow space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Description</p>
                <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                  {event.description || `Join us for the highly anticipated ${event.name}. Secure your spot early as tickets are limited!`}
                </p>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-amber-500" size={18} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Deadline</p>
                    <p className="font-bold text-sm">{formattedDeadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-amber-500" size={18} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Status</p>
                    <p className="font-bold text-sm text-amber-500">
                      {daysLeft > 0 ? `${daysLeft} Days Remaining` : 'Registration Ending Soon'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              href={`/event/${event.slug}/register`}
              className="mt-4 w-full py-3 bg-amber-500 text-amber-950 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
