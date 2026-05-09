import mongoose, { Schema, Document } from "mongoose";

export interface ITicketType {
  name: string;
  price: number;
  description?: string;
  capacity?: number;
}

export interface ISettings extends Document {
  tenureName: string;
  ticketTypes: ITicketType[];
  paystackPublicKey: string;
  paystackSecretKey: string;
  logoUrl: string;
  registrationEndDate?: Date;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paystackEnabled: boolean;
  bankTransferEnabled: boolean;
}

const SettingsSchema: Schema = new Schema(
  {
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
    registrationEndDate: { type: Date },
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    paystackEnabled: { type: Boolean, default: true },
    bankTransferEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
