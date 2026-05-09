"use client";

import { TicketType, TicketTypeInfo } from "../useRegister";
import { FloatingInput } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Props {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  ticketType: TicketType;
  setTicketType: (v: TicketType) => void;
  partnerName: string;
  setPartnerName: (v: string) => void;
  ticketPrice: number;
  ticketTypes: TicketTypeInfo[];
}

/* ── Ticket type card ───────────────────────────────────────────────────── */

interface TicketCardProps {
  ticket: TicketTypeInfo;
  isSelected: boolean;
  onSelect: () => void;
}

function TicketCard({
  ticket,
  isSelected,
  onSelect,
}: TicketCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-500 overflow-hidden
        ${
          isSelected
            ? "border-amber-500 bg-amber-500/5 shadow-2xl shadow-amber-500/10"
            : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:border-black/10 dark:hover:border-white/10 hover:bg-black/[0.04] dark:hover:bg-white/5"
        }`}
    >
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className={`font-black uppercase tracking-widest text-[10px] ${isSelected ? "text-amber-500" : "text-muted-foreground"}`}>
              {ticket.name}
            </p>
            {isSelected && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black"
              >
                <Check size={12} strokeWidth={4} />
              </motion.div>
            )}
          </div>
          <h4 className="text-xl font-bold tracking-tight">₦{ticket.price.toLocaleString()}</h4>
        </div>
        
        {ticket.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ticket.description}
          </p>
        )}
      </div>

      {/* Decorative background accent */}
      <div className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl transition-all duration-700 ${isSelected ? "bg-amber-500/20 scale-150" : "bg-transparent"}`} />
    </button>
  );
}

/* ── Step 1 ─────────────────────────────────────────────────────────────── */

export default function Step1Details({
  name,
  setName,
  email,
  setEmail,
  ticketType,
  setTicketType,
  partnerName,
  setPartnerName,
  ticketPrice,
  ticketTypes,
}: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-8"
    >
      {/* Attendee fields */}
      <div className="grid grid-cols-1 gap-4">
        <FloatingInput
          label="Full Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <FloatingInput
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {/* Ticket type */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Select Your Ticket
          </p>
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
            Required
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-tour="ticket-type">
          {ticketTypes.map((ticket) => (
            <TicketCard
              key={ticket.name}
              ticket={ticket}
              isSelected={ticketType === ticket.name}
              onSelect={() => setTicketType(ticket.name)}
            />
          ))}
          
          {ticketTypes.length === 0 && (
             <div className="col-span-full py-10 text-center border-2 border-dashed border-border rounded-[2rem]">
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">No tickets available</p>
             </div>
          )}
        </div>
      </div>

      {/* Partner name — if "couple" is in name (heuristic for backwards compatibility or specific logic) */}
      {ticketType.toLowerCase().includes("couple") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <FloatingInput
            label="Partner's Full Name"
            name="partner-name"
            autoComplete="off"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
          />
        </motion.div>
      )}

      {/* Subtotal */}
      <div className="relative group overflow-hidden bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-8 border border-black/5 dark:border-white/5 shadow-xl shadow-black/[0.02]">
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              Investment
            </span>
            <p className="text-muted-foreground/60 text-xs font-medium">
              {ticketType || "Select a ticket"}
            </p>
          </div>
          <div className="text-right">
             <span className="text-4xl font-black tracking-tighter">
              ₦{ticketPrice.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-amber-500/10 transition-colors" />
      </div>
    </motion.div>
  );
}
