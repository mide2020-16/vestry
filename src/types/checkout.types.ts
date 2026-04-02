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
  merch: {
    product: CheckoutProduct;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];

  // F&B Selections
  foods: CheckoutProduct[];
  drink: CheckoutProduct | null;

  // Financials
  ticketPrice: number;
  meshTotal: number;
  baseTotal: number;
  paystackFee: number;
  grandTotal: number;

  existingRef?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  paystackEnabled?: boolean;
  bankTransferEnabled?: boolean;
}
