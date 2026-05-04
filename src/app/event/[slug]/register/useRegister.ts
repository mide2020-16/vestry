/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface Settings {
  singlePrice: number;
  couplePrice: number;
  tenureName: string;
  logoUrl: string;
  meshColors: { label: string; value: string }[];
  meshSizes: string[];
  maxFood: number;
  maxDrink: number;
  status: "OPEN" | "CLOSED";
  slug: string;
}

export type TicketType = "single" | "couple" | "none";

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

function buildCheckoutParams(data: {
  ticketType: TicketType;
  ticketPrice: number;
  name: string;
  email: string;
  partnerName: string;
  selectedMerch: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  selectedDrinkIds: string[];
  selectedFoodIds: string[];
}): URLSearchParams {
  const params = new URLSearchParams({
    ticketType: data.ticketType,
    ticketPrice: data.ticketPrice.toString(),
    name: data.name,
    email: data.email,
  });

  if (data.partnerName) params.append("partnerName", data.partnerName);

  data.selectedMerch.forEach((item) => {
    params.append("meshId", item.productId);
    params.append("meshQty", item.quantity.toString());
    params.append("meshColor", item.color || "");
    params.append("meshSize", item.size || "");
    params.append("meshInscription", item.inscriptions || "");
  });

  data.selectedDrinkIds.forEach((id) => params.append("drinkId", id));
  data.selectedFoodIds.forEach((id) => params.append("foodId", id));

  return params;
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
  const [ticketType, setTicketType] = useState<TicketType>("single");
  const [partnerName, setPartnerName] = useState("");

  const [selectedMerch, setSelectedMerch] = useState<any[]>([]);
  const [meshColors, setMeshColors] = useState<any[]>([]);
  const [meshSizes, setMeshSizes] = useState<string[]>([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetchInitialData(slug).then((data) => {
      setProducts(data.products);
      setSettings(data.settings);
      setMeshColors(data.settings?.meshColors || []);
      setMeshSizes(data.settings?.meshSizes || []);
      setLoadingData(false);
    });
  }, [slug]);

  useEffect(() => {
    if (meshColors.length > 0 && selectedMerch.length > 0) {
      setSelectedMerch((prev) =>
        prev.map((item) => (item.color ? item : { ...item, color: meshColors[0].value }))
      );
    }
  }, [meshColors]);

  const meshes = useMemo(() => products.filter((p) => p.category === ProductCategory.mesh), [products]);
  const foods = useMemo(() => products.filter((p) => p.category === ProductCategory.FOOD), [products]);
  const drinks = useMemo(() => products.filter((p) => p.category === ProductCategory.DRINK), [products]);

  const hasMerch = meshes.length > 0;
  const hasFood = foods.length > 0;
  const hasDrink = drinks.length > 0;
  const hasFoodOrDrink = hasFood || hasDrink;

  const isCouple = ticketType === "couple";
  const isNone = ticketType === "none";
  const ticketPrice = settings ? (isNone ? 0 : isCouple ? settings.couplePrice : settings.singlePrice) : 0;

  const meshPrice = useMemo(() => {
    return selectedMerch.reduce((acc, item) => {
      const product = meshes.find((m) => m._id === item.productId);
      return acc + (product?.price ?? 0) * item.quantity;
    }, 0);
  }, [selectedMerch, meshes]);

  const grandTotal = ticketPrice + meshPrice;

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!name.trim() && !!email.trim() && (ticketType !== "couple" || !!partnerName.trim());
      case 2:
        if (!hasMerch || selectedMerch.length === 0) return true;
        return selectedMerch.every((item) => {
          const product = meshes.find((m) => m._id === item.productId);
          const needsInscription = (product?.inscriptions?.length ?? 0) > 0;
          return !!item.size && (!needsInscription || !!item.inscriptions);
        });
      default: return true;
    }
  }, [step, name, email, ticketType, partnerName, selectedMerch, meshes, hasMerch]);

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

  const handleMerchToggle = (id: string) => {
    setSelectedMerch((prev) => {
      const exists = prev.find((m) => m.productId === id);
      if (exists) return prev.filter((m) => m.productId !== id);
      return [...prev, { productId: id, quantity: 1, color: meshColors[0]?.value }];
    });
  };

  const updateMerch = (productId: string, updates: any) => {
    setSelectedMerch((prev) => prev.map((item) => (item.productId === productId ? { ...item, ...updates } : item)));
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
          sessionId: localStorage.getItem("vestry_session_id") || undefined
        })
      }).catch(console.error);
      
      // If no merch, skip to Step 3 (Food/Drink) or Step 4 (Review)
      if (!hasMerch) {
        if (hasFoodOrDrink) {
          if (isNone) setStep(4); // "None" ticket skips food/drink too as per current logic? Wait, user didn't specify.
          else setStep(3);
        } else {
          setStep(4);
        }
        return;
      }
    }

    if (step === 2) {
      if (hasFoodOrDrink && !isNone) {
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
      if (hasFoodOrDrink && !isNone) {
        setStep(3);
      } else if (hasMerch) {
        setStep(2);
      } else {
        setStep(1);
      }
      return;
    }

    if (step === 3) {
      if (hasMerch) {
        setStep(2);
      } else {
        setStep(1);
      }
      return;
    }

    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = () => {
    const params = buildCheckoutParams({
      ticketType, ticketPrice, name, email, partnerName, selectedMerch, selectedDrinkIds, selectedFoodIds,
    });
    router.push(`/event/${slug}/checkout?${params.toString()}`);
  };

  return {
    step, loadingData, settings, canProceed, name, setName, email, setEmail, ticketType, setTicketType, partnerName, setPartnerName, meshes, selectedMerch, setSelectedMerch, handleMerchToggle, updateMerch, meshColors, meshSizes, foods, drinks, selectedFoodIds, selectedDrinkIds, handleFoodToggle, handleDrinkToggle, ticketPrice, meshPrice, grandTotal, handleNext, handleBack, handleSubmit, hasMerch, hasFood, hasDrink,
  };
}
