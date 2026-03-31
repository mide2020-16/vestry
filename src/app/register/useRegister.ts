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
  selectedMeshId: string | null;
  selectedDrinkId: string | null;
  selectedFoodIds: string[];
  meshColor: string | null;
  meshSize: string | null;
  meshQuantity: number;
  meshInscriptions: string | null;
}): URLSearchParams {
  const params = new URLSearchParams({
    ticketType: data.ticketType,
    ticketPrice: data.ticketPrice.toString(),
    name: data.name,
    email: data.email,
  });

  if (data.partnerName) params.append("partnerName", data.partnerName);

  // Mesh related params - only appended if a mesh is selected
  if (data.selectedMeshId) {
    params.append("meshId", data.selectedMeshId);
    if (data.meshColor) params.append("meshColor", data.meshColor);
    if (data.meshSize) params.append("meshSize", data.meshSize);
    params.append("meshQuantity", data.meshQuantity.toString());
    if (data.meshInscriptions)
      params.append("meshInscriptions", data.meshInscriptions);
  }

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
  const [selectedMeshId, setSelectedMeshId] = useState<string | null>(null);
  const [meshColor, setMeshColor] = useState("");
  const [meshSize, setMeshSize] = useState<string | null>(null);
  const [meshQuantity, setMeshQuantity] = useState<number>(1);

  // Explicit states for colors and sizes
  const [meshColors, setMeshColors] = useState<
    { label: string; value: string }[]
  >([]);
  const [meshSizes, setMeshSizes] = useState<string[]>([]);

  const [meshInscriptions, setmeshInscriptions] = useState<string | null>(null);
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

      // Set default color if available
      if (fetchedColors.length > 0) {
        setMeshColor(fetchedColors[0].value);
      }

      setLoadingData(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  /* Reset dependent fields when mesh changes */
  useEffect(() => {
    setMeshSize(null);
    setMeshQuantity(1);
    setmeshInscriptions(null);
  }, [selectedMeshId]);

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
    () => meshes.find((m) => m._id === selectedMeshId) ?? null,
    [meshes, selectedMeshId],
  );

  const isCouple = ticketType === "couple";
  const ticketPrice = settings
    ? isCouple
      ? settings.couplePrice
      : settings.singlePrice
    : 0;
  const meshPrice = selectedMesh ? selectedMesh.price * meshQuantity : 0;
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
        if (!selectedMeshId) return true;
        const needsInscription = (selectedMesh?.inscriptions?.length ?? 0) > 0;
        return !!meshSize && (!needsInscription || !!meshInscriptions);
      default:
        return true;
    }
  }, [
    step,
    name,
    email,
    ticketType,
    partnerName,
    selectedMeshId,
    meshSize,
    meshInscriptions,
    selectedMesh,
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
      selectedMeshId,
      selectedDrinkId,
      selectedFoodIds,
      meshColor: selectedMeshId ? meshColor : null,
      meshSize: selectedMeshId ? meshSize : null,
      meshQuantity: selectedMeshId ? meshQuantity : 1,
      meshInscriptions: selectedMeshId ? meshInscriptions : null,
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
    selectedMeshId,
    setSelectedMeshId,
    selectedMesh,
    meshColor,
    setMeshColor,
    meshSize,
    setMeshSize,
    meshQuantity,
    setMeshQuantity,
    meshColors, // Now guaranteed to be populated correctly!
    meshSizes, // Now guaranteed to be populated correctly!
    meshInscriptions,
    setmeshInscriptions,
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
