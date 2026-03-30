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
  foodSelections?: { name: string }[];
  drinkSelection?: { name: string } | null;
  createdAt: string;
}
