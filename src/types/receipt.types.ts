export interface Registration {
  _id: string;
  name: string;
  email: string;
  ticketType: "single" | "couple";
  partnerName?: string;
  paystackReference: string;
  totalAmount: number;
  meshSelection?: { name: string }; 
  meshColor?: string;
  meshSize?: string; 
  meshInscriptions?: string;
  merch?: {
    productId: { name: string; price: number };
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  foodSelections?: { name: string }[];
  drinkSelection?: { name: string } | null;
  paymentMethod?: "paystack" | "transfer";
  paymentStatus?: string | boolean;
  createdAt: string;
}
