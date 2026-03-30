import { TicketType } from "@/app/register/useRegister";

export interface CheckoutProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string; // Added this so your OrderSummary can show the product image
}

export interface OrderData {
  name: string;
  email: string;
  ticketType: TicketType;
  partnerName?: string;

  // Merch Customization
  mesh: CheckoutProduct | null;
  meshSize: string | null;
  meshColor: string | null;
  /** * Changed to plural 'meshInscriptions' to match Schema.
   * If a couple ticket is selected, this can hold both names.
   */
  meshInscriptions: string[];

  // F&B Selections
  foods: CheckoutProduct[];
  drink: CheckoutProduct | null;

  // Financials
  ticketPrice: number;
  meshTotal: number;
  grandTotal: number;
}
