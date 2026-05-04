"use client";

import { TicketType } from "../useRegister";
import { FloatingInput } from "@/components/ui/Input";

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
  singlePrice?: number;
  couplePrice?: number;
}

/* ── Ticket type card ───────────────────────────────────────────────────── */

interface TicketCardProps {
  type: TicketType;
  price?: number;
  savings: number | null;
  isSelected: boolean;
  onSelect: () => void;
}

function TicketCard({
  type,
  price,
  savings,
  isSelected,
  onSelect,
}: TicketCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 overflow-hidden
        ${
          isSelected
            ? "border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.12)]"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
        }`}
    >
      {isSelected && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
      )}
      <p
        className={`font-bold capitalize text-base ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-foreground/80"}`}
      >
        {type === "none" ? "No Ticket" : type}
      </p>
      <p
        className={`text-sm mt-0.5 ${isSelected ? "text-amber-500/60 dark:text-amber-400/60" : "text-muted-foreground/60"}`}
      >
        {type === "none" ? "Excluded" : `₦${price?.toLocaleString() ?? "—"}`}
      </p>
      {type === "couple" && savings && savings > 0 && (
        <span className="mt-2 inline-block text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
          Save ₦{savings.toLocaleString()}
        </span>
      )}
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
  singlePrice,
  couplePrice,
}: Props) {
  const savings =
    ticketType === "couple" && singlePrice && couplePrice
      ? singlePrice * 2 - couplePrice
      : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Section label */}
      <div className="flex items-center gap-6">
        <span className="text-amber-600 dark:text-amber-400/80 text-[15px] font-semibold uppercase tracking-[0.3em]">
          Your Details
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* Attendee fields */}
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

      {/* Ticket type */}
      <div>
        <p className="text-amber-600 dark:text-amber-400/80 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
          Ticket Type
        </p>
        <div className="grid grid-cols-2 gap-3" data-tour="ticket-type">
          {(["single", "couple"] as const).map((type) => (
            <TicketCard
              key={type}
              type={type}
              price={type === "couple" ? couplePrice : singlePrice}
              savings={savings}
              isSelected={ticketType === type}
              onSelect={() => setTicketType(ticketType === type ? "none" : type)}
            />
          ))}
        </div>
      </div>

      {/* Partner name — couple only */}
      {ticketType === "couple" && (
        <FloatingInput
          label="Partner's Full Name"
          name="partner-name"
          autoComplete="off"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
        />
      )}

      {/* Subtotal */}
      <div className="flex justify-between items-center bg-card rounded-xl px-4 py-3.5 border border-border">
        <div>
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Subtotal
          </span>
          <p className="text-muted-foreground/60 text-[10px] mt-0.5 capitalize">
            {ticketType} ticket
          </p>
        </div>
        <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">
          ₦{ticketPrice.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
