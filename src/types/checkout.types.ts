import { TicketType } from "@/app/register/useRegister";

export interface CheckoutProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
}

export interface OrderData {
  name: string;
  email: string;
  ticketType: TicketType;
  partnerName?: string;
  mesh: CheckoutProduct | null;
  foods: CheckoutProduct[];
  drink: CheckoutProduct | null;
  ticketPrice: number;
  meshTotal: number;
  grandTotal: number;
}