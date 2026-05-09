import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  slug: string;
  status: "OPEN" | "CLOSED";
  endDate?: Date;
  config: {
    tenureName: string;
    ticketTypes: {
      name: string;
      price: number;
      description?: string;
      capacity?: number;
    }[];
    paystackPublicKey: string;
    paystackSecretKey: string;
    logoUrl: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    maxFood: number;
    maxDrink: number;
    paystackEnabled: boolean;
    bankTransferEnabled: boolean;
    smtp?: {
      host: string;
      port: number;
      user: string;
      pass: string;
      fromName: string;
      fromEmail: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    description: { type: String },
    bannerImageUrl: { type: String },
    endDate: { type: Date },
    config: {
      tenureName: { type: String, default: "Vestry Event" },
      ticketTypes: [
        {
          name: { type: String, required: true },
          price: { type: Number, default: 0 },
          description: { type: String },
          capacity: { type: Number },
        },
      ],
      paystackPublicKey: { type: String, default: "" },
      paystackSecretKey: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      maxFood: { type: Number, default: 2 },
      maxDrink: { type: Number, default: 1 },
      paystackEnabled: { type: Boolean, default: true },
      bankTransferEnabled: { type: Boolean, default: true },
      smtp: {
        host: { type: String },
        port: { type: Number },
        user: { type: String },
        pass: { type: String },
        fromName: { type: String },
        fromEmail: { type: String },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);
