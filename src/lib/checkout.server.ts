/* eslint-disable @typescript-eslint/no-explicit-any */
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import dbConnect from "@/lib/dbConnect";

/**
 * Calculates the total registration price on the server.
 * This function uses direct database access via Mongoose and can ONLY
 * be called in server environments (API Routes, Server Actions, Server Components).
 */
export async function calculateRegistrationTotal(
  ticketType: "single" | "couple",
  merch: { productId: string; quantity: number }[] = []
): Promise<number> {
  await dbConnect();

  const settings = (await Settings.findOne().lean()) as any || {
    couplePrice: 50000,
    singlePrice: 30000,
  };

  const basePrice = ticketType === "couple" ? settings.couplePrice : settings.singlePrice;

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
