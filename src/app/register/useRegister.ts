/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

export type TicketType = "single" | "couple";

/* ── Constants ──────────────────────────────────────────────────────────── */

export const TOTAL_STEPS = 4;
const MAX_FOOD_SELECTIONS = 2;

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function fetchInitialData(): Promise<{
  products: Product[];
  settings: Settings | null;
}> {
  try {
    const [productsRes, settingsRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/settings"),
    ]);

    const productsJson = await productsRes.json();
    const settingsJson = await settingsRes.json();

    // SUPER BULLETPROOF PARSING:
    // Check for .data OR .settings wrappers (very common in Next.js APIs)
    let finalSettings =
      settingsJson.data || settingsJson.settings || settingsJson;
    if (Array.isArray(finalSettings)) {
      finalSettings = finalSettings[0];
    }

    let finalProducts =
      productsJson.data || productsJson.products || productsJson;
    if (!Array.isArray(finalProducts)) {
      finalProducts = []; // Ensure products is always an array
    }

    return {
      products: finalProducts,
      settings: finalSettings || null,
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
  selectedDrinkId: string | null;
  selectedFoodIds: string[];
}): URLSearchParams {
  const params = new URLSearchParams({
    ticketType: data.ticketType,
    ticketPrice: data.ticketPrice.toString(),
    name: data.name,
    email: data.email,
  });

  if (data.partnerName) params.append("partnerName", data.partnerName);

  // Serialize multiple merch items
  data.selectedMerch.forEach((item) => {
    params.append("meshId", item.productId);
    params.append("meshQty", item.quantity.toString());
    params.append("meshColor", item.color || "");
    params.append("meshSize", item.size || "");
    params.append("meshInscription", item.inscriptions || "");
  });

  if (data.selectedDrinkId) params.append("drinkId", data.selectedDrinkId);
  data.selectedFoodIds.forEach((id) => params.append("foodId", id));

  return params;
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

export function useRegister() {
  const router = useRouter();
  const { session, saveSession } = useUserSession();

  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Form States
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [ticketType, setTicketType] = useState<TicketType>("single");
  const [partnerName, setPartnerName] = useState("");

  // New multi-merch state
  const [selectedMerch, setSelectedMerch] = useState<
    {
      productId: string;
      quantity: number;
      color?: string;
      size?: string;
      inscriptions?: string;
    }[]
  >([]);

  // Explicit states for colors and sizes
  const [meshColors, setMeshColors] = useState<
    { label: string; value: string }[]
  >([]);
  const [meshSizes, setMeshSizes] = useState<string[]>([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);

  /* Initialization */
  useEffect(() => {
    let isMounted = true;
    fetchInitialData().then((data) => {
      if (!isMounted) return;

      setProducts(data.products);
      setSettings(data.settings);

      // FIXED: Safely extract colors and sizes, defaulting to empty arrays
      const fetchedColors = data.settings?.meshColors || [];
      const fetchedSizes = data.settings?.meshSizes || [];

      // Always set the state, even if they are empty
      setMeshColors(fetchedColors);
      setMeshSizes(fetchedSizes);

      setLoadingData(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  /* Set default color when settings load */
  useEffect(() => {
    if (meshColors.length > 0 && selectedMerch.length > 0) {
      setSelectedMerch((prev) =>
        prev.map((item) =>
          item.color ? item : { ...item, color: meshColors[0].value },
        ),
      );
    }
  }, [meshColors]);

  const meshes = useMemo(
    () => products.filter((p) => p.category === ProductCategory.mesh),
    [products],
  );
  const foods = useMemo(
    () => products.filter((p) => p.category === ProductCategory.FOOD),
    [products],
  );
  const drinks = useMemo(
    () => products.filter((p) => p.category === ProductCategory.DRINK),
    [products],
  );

  const selectedMesh = useMemo(
    () => {
      if (selectedMerch.length === 0) return null;
      return meshes.find((m) => m._id === selectedMerch[0].productId) ?? null;
    },
    [meshes, selectedMerch],
  );

  const isCouple = ticketType === "couple";
  const ticketPrice = settings
    ? isCouple
      ? settings.couplePrice
      : settings.singlePrice
    : 0;

  const meshPrice = useMemo(() => {
    return selectedMerch.reduce((acc, item) => {
      const product = meshes.find((m) => m._id === item.productId);
      return acc + (product?.price ?? 0) * item.quantity;
    }, 0);
  }, [selectedMerch, meshes]);

  const grandTotal = ticketPrice + meshPrice;

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return (
          !!name.trim() &&
          !!email.trim() &&
          (ticketType === "single" || !!partnerName.trim())
        );
      case 2:
        if (selectedMerch.length === 0) return true;
        // Validate each selected merch item has a size
        return selectedMerch.every((item) => {
          const product = meshes.find((m) => m._id === item.productId);
          const needsInscription = (product?.inscriptions?.length ?? 0) > 0;
          return !!item.size && (!needsInscription || !!item.inscriptions);
        });
      default:
        return true;
    }
  }, [
    step,
    name,
    email,
    ticketType,
    partnerName,
    selectedMerch,
    meshes,
  ]);

  const handleFoodToggle = (id: string) => {
    setSelectedFoodIds((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= MAX_FOOD_SELECTIONS) return prev;
      return [...prev, id];
    });
  };

  const handleDrinkToggle = (id: string) => {
    setSelectedDrinkId((prev) => (prev === id ? null : id));
  };

  const handleMerchToggle = (id: string) => {
    setSelectedMerch((prev) => {
      const exists = prev.find((m) => m.productId === id);
      if (exists) return prev.filter((m) => m.productId !== id);
      return [...prev, { 
        productId: id, 
        quantity: 1, 
        color: meshColors.length > 0 ? meshColors[0].value : undefined 
      }];
    });
  };

  const updateMerch = (productId: string, updates: Partial<typeof selectedMerch[0]>) => {
    setSelectedMerch((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, ...updates } : item,
      ),
    );
  };

  const handleNext = () => {
    if (step === 1) saveSession({ name, email });
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    const params = buildCheckoutParams({
      ticketType,
      ticketPrice,
      name,
      email,
      partnerName,
      selectedMerch,
      selectedDrinkId,
      selectedFoodIds,
    });
    router.push(`/checkout?${params.toString()}`);
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
    meshes,
    selectedMerch,
    setSelectedMerch,
    handleMerchToggle,
    updateMerch,
    meshColors,
    meshSizes,
    foods,
    drinks,
    selectedFoodIds,
    selectedDrinkId,
    handleFoodToggle,
    handleDrinkToggle,
    ticketPrice,
    meshPrice,
    grandTotal,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
