import mongoose, { Schema, Document } from "mongoose";
import "./Product";
export enum TicketType {
  SINGLE = "single",
  COUPLE = "couple",
}

export interface IRegistration extends Document {
  name: string;
  partnerName?: string;
  email: string;
  ticketType: TicketType;
  meshSelection?: mongoose.Types.ObjectId;
  meshQuantity?: number;
  meshColor?: string;
  meshSize?: string;
  meshInscriptions?: string;
  foodSelections: mongoose.Types.ObjectId[];
  drinkSelection?: mongoose.Types.ObjectId;
  merch: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    color?: string;
    size?: string;
    inscriptions?: string;
  }[];
  paymentStatus: boolean;
  paymentMethod: "paystack" | "transfer";
  paymentReceiptUrl?: string;
  paystackReference?: string;
  totalAmount: number;
}

const RegistrationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    partnerName: { type: String },
    email: { type: String, required: true, index: true },
    ticketType: {
      type: String,
      enum: Object.values(TicketType),
      required: true,
      default: TicketType.SINGLE,
    },
    meshSelection: { type: Schema.Types.ObjectId, ref: "Product" },
    meshQuantity: { type: Number, default: 1 },
    meshColor: { type: String },
    meshSize: { type: String },
    meshInscriptions: { type: String },
    foodSelections: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    drinkSelection: { type: Schema.Types.ObjectId, ref: "Product" },
    merch: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        color: { type: String },
        size: { type: String },
        inscriptions: { type: String },
      },
    ],
    paymentStatus: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      enum: ["paystack", "transfer"],
      default: "paystack",
    },
    paymentReceiptUrl: { type: String },
    paystackReference: { type: String, unique: true, sparse: true },
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, index: { createdAt: -1 } },
);

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
