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
      <span className="text-white/50 text-sm">{label}</span>
      <span className={`text-sm font-medium ${amber ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

/* ── SectionLabel ───────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/30 text-[10px] uppercase tracking-widest px-1">{children}</p>
  );
}

/* ── FoodRow ────────────────────────────────────────────────────────────── */

function FoodRow({ item }: { item: Product }) {
  return (
    <div className="flex items-center gap-3">
      {item.image_url && (
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10">
          <Image src={item.image_url} alt={item.name} fill sizes="36px" className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm truncate">{item.name}</p>
        <p className="text-amber-400/60 text-xs">₦{item.price.toLocaleString()}</p>
      </div>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden />
    </div>
  );
}

/* ── Step 4 ─────────────────────────────────────────────────────────────── */

export default function Step4Review({
  name, email, ticketType, ticketPrice,
  partnerName, selectedmesh, meshPrice,
  foods, selectedFoodIds, drinks, selectedDrinkId,
  grandTotal,
}: Props) {
  const selectedFoods = selectedFoodIds
    .map((id) => foods.find((f) => f._id === id))
    .filter((f): f is Product => f !== undefined);

  const selectedDrink = drinks.find((d) => d._id === selectedDrinkId) ?? null;
  const hasFoodDrink  = selectedFoods.length > 0 || selectedDrink !== null;

  const ticketLabel = ticketType === 'couple' ? 'Couple Ticket' : 'Single Ticket';

  return (
    <div className="flex flex-col gap-4">

      {/* Section label */}
      <div className="flex items-center gap-4">
        <span className="text-amber-400/80 text-[13px] font-semibold uppercase tracking-[0.25em]">
          Review Your Order
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Personal details */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Details</SectionLabel>
        <ReviewRow label="Name"  value={name} />
        <ReviewRow label="Email" value={email} />
        {partnerName && <ReviewRow label="Partner" value={partnerName} />}
      </div>

      {/* Ticket */}
      <div className="flex flex-col gap-2">
        <SectionLabel>Ticket</SectionLabel>
        <ReviewRow label={ticketLabel} value={`₦${ticketPrice.toLocaleString()}`} amber />
      </div>

      {/* mesh */}
      {selectedmesh && (
        <div className="flex flex-col gap-2">
          <SectionLabel>mesh / Outfit</SectionLabel>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
            {selectedmesh.image_url && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <Image
                  src={selectedmesh.image_url}
                  alt={selectedmesh.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="flex-1 min-w-0 text-white text-sm font-medium truncate">
              {selectedmesh.name}
            </p>
            <span className="text-amber-400 text-sm font-semibold shrink-0">
              ₦{meshPrice.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Food & Drinks */}
      {hasFoodDrink && (
        <div className="flex flex-col gap-2">
          <SectionLabel>Food &amp; Drinks</SectionLabel>
          <div className="bg-white/5 px-4 py-3 rounded-xl border border-white/10 flex flex-col gap-3">
            {selectedFoods.map((food) => <FoodRow key={food._id} item={food} />)}
            {selectedDrink && <FoodRow item={selectedDrink} />}
          </div>
        </div>
      )}

      {/* Grand total */}
      <div className="flex justify-between items-center bg-amber-400/10 border border-amber-400/30 px-4 py-4 rounded-2xl mt-2">
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Grand Total</p>
          <p className="text-white/60 text-xs mt-0.5">All items included</p>
        </div>
        <span className="text-amber-400 text-2xl font-black tracking-tight">
          ₦{grandTotal.toLocaleString()}
        </span>
      </div>

    </div>
  );
}