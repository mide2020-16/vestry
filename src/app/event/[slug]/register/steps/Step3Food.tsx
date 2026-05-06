import FoodCarousel from "@/components/FoodCarousel";
import { Product } from "../useRegister";
import { ProductCategory } from "@/constants/ProductCategory";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Props {
  foods: Product[];
  drinks: Product[];
  selectedFoodIds: string[];
  onFoodToggle: (id: string) => void;
  selectedDrinkIds: string[];
  onDrinkToggle: (id: string) => void;
  maxFood: number;
  maxDrink: number;
}

/* ── Step 3 ─────────────────────────────────────────────────────────────── */

export default function Step3Food({
  foods,
  drinks,
  selectedFoodIds,
  onFoodToggle,
  selectedDrinkIds,
  onDrinkToggle,
  maxFood,
  maxDrink,
}: Props) {

  const hasFood = foods && foods.length > 0;
  const hasDrink = drinks && drinks.length > 0;

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
        {hasFood && (
          <FoodCarousel
            items={foods}
            category={ProductCategory.FOOD}
            selectedIds={selectedFoodIds}
            onToggle={onFoodToggle}
            maxSelections={maxFood}
          />
        )}
      </div>

      {hasFood && hasDrink && <div className="border-t border-white/5 w-full" />}

      {/* Drinks */}
      <div className="w-full">
        {hasDrink && (
          <FoodCarousel
            items={drinks}
            category={ProductCategory.DRINK}
            selectedIds={selectedDrinkIds}
            onToggle={onDrinkToggle}
            maxSelections={maxDrink}
          />
        )}
      </div>
    </div>
  );
}
