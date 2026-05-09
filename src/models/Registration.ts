import mongoose, { Schema, Document } from "mongoose";
import "./Product";
export interface IRegistration extends Document {
  name: string;
  partnerName?: string;
  email: string;
  ticketType: string;
  foodSelections: mongoose.Types.ObjectId[];
  drinkSelection: mongoose.Types.ObjectId[];
  paymentStatus: boolean;
  status: "pending" | "success" | "declined";
  declineReason?: string;
  paymentMethod: "paystack" | "transfer";
  paymentReceiptUrl?: string;
  paystackReference?: string;
  totalAmount: number;aiVerificationResult?: {
    verified: boolean;
    confidence: "high" | "medium" | "low";
    extractedAmount?: number;
    extractedBank?: string;
    extractedAccountName?: string;
    reason?: string;
    verifiedAt?: Date;
  };
  eventId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    partnerName: { type: String },
    email: { type: String, required: true, index: true },
    ticketType: {
      type: String,
      required: true,
    },
    foodSelections: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    drinkSelection: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    paymentStatus: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "success", "declined"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "transfer"],
      default: "paystack",
    },
    paymentReceiptUrl: { type: String },
    declineReason: { type: String },
    paystackReference: { type: String, unique: true, sparse: true },
    totalAmount: { type: Number, required: true, default: 0 },
    aiVerificationResult: {
      verified: { type: Boolean },
      confidence: { type: String, enum: ["high", "medium", "low"] },
      extractedAmount: { type: Number },
      extractedBank: { type: String },
      extractedAccountName: { type: String },
      reason: { type: String },
      verifiedAt: { type: Date },
    },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

RegistrationSchema.index({ eventId: 1, createdAt: -1 });
RegistrationSchema.index({ eventId: 1, status: 1, createdAt: -1 });
RegistrationSchema.index({ eventId: 1, paymentStatus: 1, createdAt: -1 });
RegistrationSchema.index({ eventId: 1, ticketType: 1, createdAt: -1 });

export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
