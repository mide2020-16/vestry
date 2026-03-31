export interface Registration {
  _id: string;
  name: string;
  email: string;
  ticketType: "single" | "couple";
  partnerName?: string;
  paystackReference: string;
  totalAmount: number;
  meshSelection?: { name: string; price: number } | null;
  meshSize: string | null;
  meshColor: string | null;
  meshInscriptions?: string;
  foodSelections?: { name: string }[];
  drinkSelection?: { name: string } | null;
  paymentMethod?: "paystack" | "transfer";
  paymentStatus?: string | boolean;
  createdAt: string;
}
