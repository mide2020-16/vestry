'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/hooks/useUserSession';
import { ProductCategory } from '@/constants/ProductCategory';

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface Product {
  _id: string;
  name: string;
  image_url: string;
  model_url?: string;
  price: number;
  category?: string;
  available: boolean;
}

export interface Settings {
  singlePrice: number;
  couplePrice: number;
  tenureName: string;
  logoUrl: string;
}

export type TicketType = 'single' | 'couple';

/* ── Constants ──────────────────────────────────────────────────────────── */

export const TOTAL_STEPS = 4;

export const mesh_COLORS: { label: string; value: string }[] = [
  { label: 'Pearl White',    value: '#f5f5f0' },
  { label: 'Midnight Black', value: '#1a1a1a' },
  { label: 'Royal Gold',     value: '#c9a84c' },
  { label: 'Deep Navy',      value: '#1b2a4a' },
  { label: 'Burgundy',       value: '#6e1c2e' },
  { label: 'Forest Green',   value: '#2d4a3e' },
];

const DEFAULT_mesh_COLOR = mesh_COLORS[0].value;
const MAX_FOOD_SELECTIONS = 2;

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function fetchInitialData(): Promise<{ products: Product[]; settings: Settings | null }> {
  const [productsRes, settingsRes] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/settings'),
  ]);

  const [productsJson, settingsJson] = await Promise.all([
    productsRes.json(),
    settingsRes.json(),
  ]);

  return {
    products: productsJson.success ? productsJson.data : [],
    settings: settingsJson.success ? settingsJson.data : null,
  };
}

function buildCheckoutParams(data: {
  ticketType: TicketType;
  ticketPrice: number;
  name: string;
  email: string;
  partnerName: string;
  selectedmeshId: string | null;
  selectedDrinkId: string | null;
  selectedFoodIds: string[];
}): URLSearchParams {
  const params = new URLSearchParams({
    ticketType:  data.ticketType,
    ticketPrice: data.ticketPrice.toString(),
    name:        data.name,
    email:       data.email,
    ...(data.partnerName    && { partnerName: data.partnerName }),
    ...(data.selectedmeshId  && { meshId: data.selectedmeshId }),
    ...(data.selectedDrinkId && { drinkId: data.selectedDrinkId }),
  });
  data.selectedFoodIds.forEach((id) => params.append('foodId', id));
  return params;
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

export function useRegister() {
  const router = useRouter();
  const { session, saveSession } = useUserSession();

  // Navigation
  const [step, setStep] = useState(1);

  // Remote data
  const [products,    setProducts]    = useState<Product[]>([]);
  const [settings,    setSettings]    = useState<Settings | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1 — attendee details
  const [name,        setName]        = useState(session?.name  ?? '');
  const [email,       setEmail]       = useState(session?.email ?? '');
  const [ticketType,  setTicketType]  = useState<TicketType>('single');
  const [partnerName, setPartnerName] = useState('');

  // Step 2 — mesh selection
  const [selectedmeshId, setSelectedmeshId] = useState<string | null>(null);
  const [meshColor,      setmeshColor]      = useState(DEFAULT_mesh_COLOR);

  // Step 3 — food & drink
  const [selectedFoodIds,  setSelectedFoodIds]  = useState<string[]>([]);
  const [selectedDrinkId,  setSelectedDrinkId]  = useState<string | null>(null);

  /* Fetch on mount */
  useEffect(() => {
    fetchInitialData()
      .then(({ products, settings }) => {
        setProducts(products);
        setSettings(settings);
      })
      .catch((err) => console.error('Failed to load registration data:', err))
      .finally(() => setLoadingData(false));
  }, []);

  /* Derived product lists */
  const meshes = useMemo(() => products.filter((p) => p.category === ProductCategory.mesh),  [products]);
  const foods  = useMemo(() => products.filter((p) => p.category === ProductCategory.FOOD),  [products]);
  const drinks = useMemo(() => products.filter((p) => p.category === ProductCategory.DRINK), [products]);
  const selectedmesh = useMemo(
    () => meshes.find((m) => m._id === selectedmeshId) ?? null,
    [meshes, selectedmeshId],
  );

  /* Pricing */
  const isCouple    = ticketType === 'couple';
  const ticketPrice = settings ? (isCouple ? settings.couplePrice : settings.singlePrice) : 0;
  const meshPrice   = selectedmesh ? selectedmesh.price * (isCouple ? 2 : 1) : 0;
  const grandTotal  = ticketPrice + meshPrice;

  /* Step validation */
  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return !!name && !!email && (ticketType === 'single' || !!partnerName);
      case 2: return !!selectedmeshId;
      default: return true;
    }
  }, [step, name, email, ticketType, partnerName, selectedmeshId]);

  /* Handlers */
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
      ticketType, ticketPrice, name, email,
      partnerName, selectedmeshId, selectedDrinkId, selectedFoodIds,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return {
    // Navigation
    step, loadingData, settings, canProceed,
    // Step 1
    name, setName, email, setEmail,
    ticketType, setTicketType, partnerName, setPartnerName,
    // Step 2
    meshes, selectedmeshId, setSelectedmeshId,
    meshColor, setmeshColor, selectedmesh,
    // Step 3
    foods, drinks, selectedFoodIds, selectedDrinkId,
    handleFoodToggle, handleDrinkToggle,
    // Pricing
    ticketPrice, meshPrice, grandTotal,
    // Actions
    handleNext, handleBack, handleSubmit,
  };
}