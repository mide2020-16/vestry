import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  tenureName: string;
  singlePrice: number;
  couplePrice: number;
  meshSinglePrice: number;
  meshCouplePrice: number;
  paystackPublicKey: string;
  paystackSecretKey: string;
  logoUrl: string;
  registrationEndDate?: Date;
  meshColors: { label: string; value: string }[];
  meshSizes: string[];
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const SettingsSchema: Schema = new Schema(
  {
    tenureName: { type: String, default: "Vestry Event" },
    singlePrice: { type: Number, default: 0 },
    couplePrice: { type: Number, default: 0 },
    meshSinglePrice: { type: Number, default: 0 },
    meshCouplePrice: { type: Number, default: 0 },
    paystackPublicKey: { type: String, default: "" },
    paystackSecretKey: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    registrationEndDate: { type: Date },
    meshColors: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    meshSizes: [{ type: String }],
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
