import FoodCarousel from "@/components/FoodCarousel";
import { Product } from "../useRegister";
import { ProductCategory } from "@/constants/ProductCategory";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Props {
  foods: Product[];
  drinks: Product[];
  selectedFoodIds: string[];
  onFoodToggle: (id: string) => void;
  selectedDrinkId: string | null;
  onDrinkToggle: (id: string) => void;
}

/* ── Constants ──────────────────────────────────────────────────────────── */

const MAX_FOOD_SELECTIONS = 2;
const MAX_DRINK_SELECTIONS = 1;

/* ── Step 3 ─────────────────────────────────────────────────────────────── */

export default function Step3Food({
  foods,
  drinks,
  selectedFoodIds,
  onFoodToggle,
  selectedDrinkId,
  onDrinkToggle,
}: Props) {
  const selectedDrinkIds = selectedDrinkId ? [selectedDrinkId] : [];

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto items-center">
      {/* Section label */}
      <div className="flex items-center gap-4 w-full">
        <span className="text-amber-400/80 text-[13px] font-semibold uppercase tracking-[0.25em]">
          Food &amp; Drinks
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Food */}
      <div className="w-full">
        <FoodCarousel
          items={foods}
          category={ProductCategory.FOOD}
          selectedIds={selectedFoodIds}
          onToggle={onFoodToggle}
          maxSelections={MAX_FOOD_SELECTIONS}
        />
      </div>

      <div className="border-t border-white/5 w-full" />

      {/* Drinks */}
      <div className="w-full">
        <FoodCarousel
          items={drinks}
          category={ProductCategory.DRINK}
          selectedIds={selectedDrinkIds}
          onToggle={onDrinkToggle}
          maxSelections={MAX_DRINK_SELECTIONS}
        />
      </div>
    </div>
  );
}
