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
