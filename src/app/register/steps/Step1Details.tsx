"use client";

import { useState } from "react";
import { TicketType } from "../useRegister";

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

/* ── Floating-label input ───────────────────────────────────────────────── */

interface FloatingInputProps {
  label: string;
  type?: string;
  name: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
}

function FloatingInput({
  label,
  type = "text",
  name,
  autoComplete,
  value,
  onChange,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
          lifted
            ? "top-2 text-[10px] text-amber-500 dark:text-amber-400/70 font-medium tracking-wide"
            : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60"
        }`}
      >
        {label}
      </label>
      <input
        title={name}
        id={name}
        type={type}
        name={name}
        autoComplete={autoComplete || "off"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-card border rounded-xl px-4 pt-6 pb-2 text-foreground text-sm
          focus:outline-none transition-all duration-200
          ${
            focused
              ? "border-amber-500/50 bg-amber-500/5 shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
              : "border-border hover:border-border/60"
          }`}
      />
    </div>
  );
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
        onChange={setName}
      />
      <FloatingInput
        label="Email Address"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />

      {/* Ticket type */}
      <div>
        <p className="text-amber-600 dark:text-amber-400/80 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3">
          Ticket Type
        </p>
        <div className="grid grid-cols-2 gap-3">
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
          onChange={setPartnerName}
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
