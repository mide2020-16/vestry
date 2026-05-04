/* eslint-disable @typescript-eslint/no-explicit-any */
import Product from "@/models/Product";
import Event from "@/models/Event";
import dbConnect from "@/lib/dbConnect";

/**
 * Calculates the total registration price on the server.
 * This function uses direct database access via Mongoose and can ONLY
 * be called in server environments (API Routes, Server Actions, Server Components).
 */
export async function calculateRegistrationTotal(
  eventId: string,
  ticketType: "single" | "couple" | "none",
  merch: { productId: string; quantity: number }[] = []
): Promise<number> {
  await dbConnect();

  const event = (await Event.findById(eventId).lean()) as any;
  const config = event?.config || {
    couplePrice: 2500,
    singlePrice: 1500,
  };

  const basePrice = ticketType === "none"
    ? 0
    : (ticketType === "couple" ? config.couplePrice : config.singlePrice);

  let merchTotal = 0;
  if (Array.isArray(merch)) {
    for (const item of merch) {
      if (!item.productId) continue;
      const product = await Product.findById(item.productId).lean() as any;
      merchTotal += (product?.price ?? 0) * (Number(item.quantity) || 1);
    }
  }

  return basePrice + merchTotal;
}
