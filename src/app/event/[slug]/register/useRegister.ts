/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserSession } from "@/hooks/useUserSession";
import { ProductCategory } from "@/constants/ProductCategory";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface Product {
  _id: string;
  name: string;
  image_url: string;
  modelUrl?: string;
  price: number;
  inscriptions: string[];
  category?: string;
  available: boolean;
}

export interface TicketTypeInfo {
  name: string;
  price: number;
  description?: string;
  capacity?: number;
}

export interface Settings {
  ticketTypes: TicketTypeInfo[];
  tenureName: string;
  logoUrl: string;
  maxFood: number;
  maxDrink: number;
  status: "OPEN" | "CLOSED";
  slug: string;
}

export type TicketType = string;

/* ── Constants ──────────────────────────────────────────────────────────── */

export const TOTAL_STEPS = 4;

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function fetchInitialData(slug: string): Promise<{
  products: Product[];
  settings: Settings | null;
}> {
  try {
    const [productsRes, settingsRes] = await Promise.all([
      fetch(`/api/products?slug=${slug}`),
      fetch(`/api/settings?slug=${slug}`),
    ]);

    const productsJson = await productsRes.json();
    const settingsJson = await settingsRes.json();

    return {
      products: productsJson.data || [],
      settings: settingsJson.data || null,
    };
  } catch (error) {
    console.error("Fetch error:", error);
    return { products: [], settings: null };
  }
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

export function useRegister() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const { session, saveSession } = useUserSession();

  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [ticketType, setTicketType] = useState<TicketType>("");
  const [partnerName, setPartnerName] = useState("");

  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState<string[]>([]);

  // Fetch data on slug change
  useEffect(() => {
    if (!slug) return;
    fetchInitialData(slug).then((data) => {
      setProducts(data.products);
      setSettings(data.settings);
      setLoadingData(false);
    });
  }, [slug]);

  // Set default ticket type when settings load
  useEffect(() => {
    if (settings?.ticketTypes?.length && !ticketType) {
      setTicketType(settings.ticketTypes[0].name);
    }
  }, [settings, ticketType]);

  const foods = useMemo(() => products.filter((p) => p.category === ProductCategory.FOOD), [products]);
  const drinks = useMemo(() => products.filter((p) => p.category === ProductCategory.DRINK), [products]);

  const hasFood = foods.length > 0;
  const hasDrink = drinks.length > 0;
  const hasFoodOrDrink = hasFood || hasDrink;

  const ticketPrice = useMemo(() => {
    if (!settings || !ticketType) return 0;
    const type = settings.ticketTypes.find(t => t.name === ticketType);
    return type?.price ?? 0;
  }, [settings, ticketType]);

  const grandTotal = ticketPrice;

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!name.trim() && !!email.trim() && !!ticketType;
      default: return true;
    }
  }, [step, name, email, ticketType]);

  const handleFoodToggle = (id: string) => {
    setSelectedFoodIds((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      const limit = settings?.maxFood ?? 2;
      if (prev.length >= limit) return prev;
      return [...prev, id];
    });
  };

  const handleDrinkToggle = (id: string) => {
    setSelectedDrinkIds((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id);
      const limit = settings?.maxDrink ?? 1;
      if (prev.length >= limit) return prev;
      return [...prev, id];
    });
  };

  const handleNext = () => {
    if (step === 1) {
      saveSession({ name, email });
      // Log Start Registration
      fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START_REGISTRATION",
          resource: "Registration",
          details: `Consumer ${name} started registration for ${settings?.tenureName}`,
          userName: name,
          userEmail: email,
          metadata: { slug, ticketType },
        })
      }).catch(console.error);
      
      if (hasFoodOrDrink) {
        setStep(3);
      } else {
        setStep(4);
      }
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 4) {
      if (hasFoodOrDrink) {
        setStep(3);
      } else {
        setStep(1);
      }
      return;
    }

    if (step === 3) {
      setStep(1);
      return;
    }

    setStep((s) => Math.max(1, s - 1));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/registrations?slug=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          ticketType,
          partnerName,
          foodSelections: selectedFoodIds,
          drinkSelection: selectedDrinkIds,
        }),
      });

      const data = await res.json();
      if (data.success && data.paystackReference) {
        // Redirect with ONLY the reference for security/privacy
        router.push(`/event/${slug}/checkout?ref=${data.paystackReference}`);
      } else {
        alert(data.error || "Failed to initiate registration.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step, 
    loadingData, 
    settings, 
    canProceed, 
    name, 
    setName, 
    email, 
    setEmail, 
    ticketType, 
    setTicketType, 
    partnerName, 
    setPartnerName, 
    foods, 
    drinks, 
    selectedFoodIds, 
    selectedDrinkIds, 
    handleFoodToggle, 
    handleDrinkToggle, 
    ticketPrice, 
    grandTotal, 
    handleNext, 
    handleBack, 
    handleSubmit, 
    hasFood, 
    hasDrink,
    isSubmitting
  };
}
