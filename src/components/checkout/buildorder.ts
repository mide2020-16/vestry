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
  const meshId = searchParams.get("meshId");
  const meshSize = searchParams.get("meshSize");
  const meshColor = searchParams.get("meshColor");
  const foodIds = searchParams.getAll("foodId");
  const drinkId = searchParams.get("drinkId");
  const ticketPrice = Number(searchParams.get("ticketPrice") ?? 0);
  const meshQuantity = Number(searchParams.get("meshQuantity") ?? 1);
  const meshInscription = searchParams.get('meshInscription')

  const [mesh, foods, drink] = await Promise.all([
    meshId ? fetchProduct(meshId) : Promise.resolve(null),
    Promise.all(foodIds.map(fetchProduct)),
    drinkId ? fetchProduct(drinkId) : Promise.resolve(null),
  ]);

  const validFoods = foods.filter((f): f is CheckoutProduct => f !== null);
  const meshTotal = mesh ? mesh.price * meshQuantity : 0;

  return {
    name: session?.name ?? searchParams.get("name") ?? "Guest",
    email: session?.email ?? searchParams.get("email") ?? "",
    ticketType,
    partnerName,
    mesh,
    meshSize: mesh ? meshSize : null,
    meshColor: mesh ? meshColor : null,
    foods: validFoods,
    drink,
    ticketPrice,
    meshTotal,
    grandTotal: ticketPrice + meshTotal,
    meshQuantity,
    meshInscription,
  };
}
