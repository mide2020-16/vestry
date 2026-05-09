import { TicketType } from "@/app/event/[slug]/register/useRegister";

export interface CheckoutProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  image_url?: string;
}

export interface OrderData {
  name: string;
  email: string;
  ticketType: TicketType;
  partnerName?: string;

  // F&B Selections
  foods: string[];
  drinks: string[];

  // Financials
  ticketPrice: number;
  grandTotal: number;
  paystackFee: number;

  existingRef?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  paystackEnabled?: boolean;
  bankTransferEnabled?: boolean;
}
