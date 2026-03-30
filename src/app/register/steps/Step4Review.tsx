'use client';

import Image from 'next/image';
import { Product, TicketType } from '../useRegister';

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Props {
  name: string;
  email: string;
  ticketType: TicketType;
  ticketPrice: number;
  partnerName: string;
  selectedmesh: Product | null;
  meshPrice: number;
  meshColor: string | null;
  meshSize: string | null;
  meshInscriptions: string | null; // 👈 Added
  foods: Product[];
  selectedFoodIds: string[];
  drinks: Product[];
  selectedDrinkId: string | null;
  grandTotal: number;
}

/* ── ReviewRow ──────────────────────────────────────────────────────────── */

interface ReviewRowProps {
  label: string;
  value: string;
  amber?: boolean;
}

function ReviewRow({ label, value, amber = false }: ReviewRowProps) {
  return (
    <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-white/10 bg-white/5">
      <span className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${amber ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

/* ── SectionLabel ───────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em] px-1 mb-1">{children}</p>
  );
}

/* ── FoodRow ────────────────────────────────────────────────────────────── */

function FoodRow({ item }: { item: Product }) {
  return (
    <div className="flex items-center gap-3 py-1">
      {item.image_url && (
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
          <Image src={item.image_url} alt={item.name} fill sizes="36px" className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold truncate">{item.name}</p>
        <p className="text-white/30 text-[10px] uppercase font-bold">Complimentary</p>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
    </div>
  );
}

/* ── Step 4 Review ──────────────────────────────────────────────────────── */

export default function Step4Review({
  name, email, ticketType, ticketPrice,
  partnerName, selectedmesh, meshPrice, meshColor, meshSize,
  meshInscriptions, // 👈 Destructured
  foods, selectedFoodIds, drinks, selectedDrinkId,
  grandTotal,
}: Props) {
  const selectedFoods = selectedFoodIds
    .map((id) => foods.find((f) => f._id === id))
    .filter((f): f is Product => f !== undefined);

  const selectedDrink = drinks.find((d) => d._id === selectedDrinkId) ?? null;
  const hasFoodDrink   = selectedFoods.length > 0 || selectedDrink !== null;

  const ticketLabel = ticketType === 'couple' ? 'Couple Pass' : 'Single Pass';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-amber-400/90 text-[11px] font-black uppercase tracking-[0.3em]">
          Final Review
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Guest Details */}
      <div className="space-y-2">
        <SectionLabel>Guest Information</SectionLabel>
        <div className="grid grid-cols-1 gap-2">
          <ReviewRow label="Primary Guest" value={name} />
          <ReviewRow label="Contact Email" value={email} />
          {partnerName && <ReviewRow label="Plus One" value={partnerName} />}
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="space-y-2">
        <SectionLabel>Attendance</SectionLabel>
        <ReviewRow label={ticketLabel} value={`₦${ticketPrice.toLocaleString()}`} amber />
      </div>

      {/* Merchandise Selection */}
      {selectedmesh && (
        <div className="space-y-2">
          <SectionLabel>Custom Merchandise</SectionLabel>
          <div className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-white/10 bg-white/3">
            {selectedmesh.image_url && (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
                <Image
                  src={selectedmesh.image_url}
                  alt={selectedmesh.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {selectedmesh.name}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {meshColor && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: meshColor }} 
                    />
                    <span className="text-[9px] uppercase font-bold text-white/40">Color</span>
                  </div>
                )}

                {meshSize && (
                  <span className="text-[9px] font-black bg-white/10 text-white/70 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                    Size {meshSize}
                  </span>
                )}

                {/* 👈 Custom Inscription Display */}
                {meshInscriptions && (
                   <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20 italic tracking-tight">
                    &quot;{meshInscriptions}&quot;
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
               <span className="text-amber-400 text-sm font-black tabular-nums">
                ₦{meshPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dining Selection */}
      {hasFoodDrink && (
        <div className="space-y-2">
          <SectionLabel>Complimentary Dining</SectionLabel>
          <div className="bg-white/2 px-4 py-3 rounded-2xl border border-white/5 flex flex-col gap-2">
            {selectedFoods.map((food) => <FoodRow key={food._id} item={food} />)}
            {selectedDrink && <FoodRow item={selectedDrink} />}
          </div>
        </div>
      )}

      {/* Totals Section */}
      <div className="relative group mt-2">
        <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-amber-700 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative flex justify-between items-center bg-neutral-900 border border-amber-500/30 px-6 py-5 rounded-2xl">
          <div className="space-y-0.5">
            <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Total Payable</p>
            <p className="text-neutral-500 text-[10px] italic">VAT and processing included</p>
          </div>
          <div className="text-right">
            <span className="text-amber-400 text-3xl font-black tracking-tighter tabular-nums">
              ₦{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}