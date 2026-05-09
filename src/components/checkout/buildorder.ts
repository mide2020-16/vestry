/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculatePaystackFee } from "@/lib/checkout";
import { OrderData } from "@/types/checkout.types";

export async function buildOrder(
  slug: string,
  searchParams: URLSearchParams,
): Promise<OrderData> {
  const ref = searchParams.get("ref");

  if (!ref) {
    throw new Error("No registration reference provided.");
  }

  try {
    const [regRes, settingsRes] = await Promise.all([
      fetch(`/api/registrations/by-ref/${ref}?slug=${slug}`),
      fetch(`/api/settings?slug=${slug}`).then((r) => r.json()).catch(() => null),
    ]);

    if (!regRes.ok) {
      throw new Error("Registration not found or expired.");
    }

    const { data: reg } = await regRes.json();
    
    // Calculate totals correctly from the registration data
    const baseTotal = reg.totalAmount;
    const paystackFee = calculatePaystackFee(baseTotal);

    return {
      name: reg.name,
      email: reg.email,
      ticketType: reg.ticketType,
      partnerName: reg.partnerName,
      foods: reg.foodSelections || [],
      drinks: reg.drinkSelection || [],
      ticketPrice: baseTotal,
      grandTotal: baseTotal + paystackFee,
      paystackFee: paystackFee,
      existingRef: ref,
      bankDetails: settingsRes?.data ? {
        bankName: settingsRes.data.bankName,
        accountName: settingsRes.data.accountName,
        accountNumber: settingsRes.data.accountNumber,
      } : undefined,
      paystackEnabled: settingsRes?.data?.paystackEnabled ?? true,
      bankTransferEnabled: settingsRes?.data?.bankTransferEnabled ?? true,
    };
  } catch (err: any) {
    console.error("Failed to build order:", err);
    throw err;
  }
}
