/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculatePaystackFee } from "@/lib/checkout";

import { TicketType } from "@/app/register/useRegister";
import { CheckoutProduct, OrderData } from "@/types/checkout.types";

async function fetchProduct(id: string): Promise<CheckoutProduct | null> {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function buildOrder(
  searchParams: URLSearchParams,
  session: { name?: string; email?: string } | null,
): Promise<OrderData> {
  const ref = searchParams.get("ref");

  if (ref) {
    try {
      const regRes = await fetch(`/api/registrations/by-ref/${ref}`);
      if (regRes.ok) {
        const { data: reg } = await regRes.json();
        const settingsRes = await fetch("/api/settings").then((r) => r.json()).catch(() => null);

        return {
          name: reg.name,
          email: reg.email,
          ticketType: reg.ticketType,
          partnerName: reg.partnerName,
          merch: reg.merch.map((m: any) => ({
            product: { 
              _id: m.productId?._id || m.productId, 
              name: m.productId?.name || "Merch", 
              price: m.productId?.price || 0,
              category: "mesh"
            },
            quantity: m.quantity,
            color: m.color,
            size: m.size,
            inscriptions: m.inscriptions
          })),
          foods: reg.foodSelections || [],
          drink: reg.drinkSelection || null,
          ticketPrice: reg.totalAmount - (reg.merch.reduce((sum: number, m: any) => sum + (m.productId?.price || 0) * m.quantity, 0)), // Best guess
          meshTotal: reg.merch.reduce((sum: number, m: any) => sum + (m.productId?.price || 0) * m.quantity, 0),
          baseTotal: reg.totalAmount, // This is already calculated in DB
          paystackFee: calculatePaystackFee(reg.totalAmount),
          grandTotal: reg.totalAmount + calculatePaystackFee(reg.totalAmount),
          existingRef: ref,
          bankDetails: settingsRes?.data ? {
            bankName: settingsRes.data.bankName,
            accountName: settingsRes.data.accountName,
            accountNumber: settingsRes.data.accountNumber,
          } : undefined,
          paystackEnabled: settingsRes?.data?.paystackEnabled ?? true,
          bankTransferEnabled: settingsRes?.data?.bankTransferEnabled ?? true,
        };
      }
    } catch (err) {
      console.warn("Failed to restore registration from reference:", err);
      // Fall back to params if ref fetch fails
    }
  }

  const ticketType = (searchParams.get("ticketType") ?? "single") as TicketType;
  const partnerName = searchParams.get("partnerName") ?? undefined;
  const foodIds = searchParams.getAll("foodId");
  const drinkId = searchParams.get("drinkId");
  const ticketPrice = Number(searchParams.get("ticketPrice") ?? 0);

  // Multi-merch parsing
  const meshIds = searchParams.getAll("meshId");
  const meshQtys = searchParams.getAll("meshQty");
  const meshColors = searchParams.getAll("meshColor");
  const meshSizes = searchParams.getAll("meshSize");
  const meshInscriptions = searchParams.getAll("meshInscription");

  const [merchProducts, foods, drink, settingsRes] = await Promise.all([
    Promise.all(meshIds.map(fetchProduct)),
    Promise.all(foodIds.map(fetchProduct)),
    drinkId ? fetchProduct(drinkId) : Promise.resolve(null),
    fetch("/api/settings").then((r) => r.json()).catch(() => null),
  ]);

  const merch: OrderData["merch"] = [];
  let meshTotal = 0;

  merchProducts.forEach((product, i) => {
    if (product) {
      const quantity = Number(meshQtys[i]) || 1;
      merch.push({
        product,
        quantity,
        color: meshColors[i] || undefined,
        size: meshSizes[i] || undefined,
        inscriptions: meshInscriptions[i] || undefined,
      });
      meshTotal += product.price * quantity;
    }
  });

  const validFoods = foods.filter((f): f is CheckoutProduct => f !== null);

  return {
    name: session?.name ?? searchParams.get("name") ?? "Guest",
    email: session?.email ?? searchParams.get("email") ?? "",
    ticketType,
    partnerName,
    merch,
    foods: validFoods,
    drink,
    ticketPrice,
    meshTotal,
    baseTotal: ticketPrice + meshTotal,
    paystackFee: calculatePaystackFee(ticketPrice + meshTotal),
    grandTotal: ticketPrice + meshTotal + calculatePaystackFee(ticketPrice + meshTotal),
    bankDetails: settingsRes?.data ? {
      bankName: settingsRes.data.bankName,
      accountName: settingsRes.data.accountName,
      accountNumber: settingsRes.data.accountNumber,
    } : undefined,
    paystackEnabled: settingsRes?.data?.paystackEnabled ?? true,
    bankTransferEnabled: settingsRes?.data?.bankTransferEnabled ?? true,
  };
}
