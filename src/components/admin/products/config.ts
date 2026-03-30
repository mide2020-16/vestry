import { Package, Utensils, Wine } from "lucide-react";
import { ProductCategory } from "@/constants/ProductCategory";
import { ProductForm } from "@/types/product.types";

export const EMPTY_FORM: ProductForm = {
  name: "",
  image_url: "",
  modelUrl: "",
  price: 0,
  available: true,
  inscriptions: [],
};

export const CATEGORY_CONFIG = {
  [ProductCategory.mesh]: {
    label: "Merch / Outfit",
    icon: Package,
    color: "amber",
    description: "Clothing items attendees can select and preview in 3D",
  },
  [ProductCategory.FOOD]: {
    label: "Food",
    icon: Utensils,
    color: "emerald",
    description: "Food options included with registration",
  },
  [ProductCategory.DRINK]: {
    label: "Drinks",
    icon: Wine,
    color: "sky",
    description: "Drink options included with registration",
  },
};

export const COLOR_MAP: Record<string, string> = {
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  sky: "text-sky-400 bg-sky-400/10 border-sky-400/20",
};

export const ACCENT_MAP: Record<string, string> = {
  amber: "focus:ring-amber-500/50 focus:border-amber-500",
  emerald: "focus:ring-emerald-500/50 focus:border-emerald-500",
  sky: "focus:ring-sky-500/50 focus:border-sky-500",
};
