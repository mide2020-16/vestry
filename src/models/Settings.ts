import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  tenureName: string;
  singlePrice: number;
  couplePrice: number;
  meshSinglePrice: number;
  meshCouplePrice: number;
  paystackPublicKey: string;
  paystackSecretKey: string;
  logoUrl: string;
}

const SettingsSchema: Schema = new Schema(
  {
    tenureName:        { type: String, default: 'Vestry Event' },
    singlePrice:       { type: Number, default: 0 },
    couplePrice:       { type: Number, default: 0 },
    meshSinglePrice:   { type: Number, default: 0 },
    meshCouplePrice:   { type: Number, default: 0 },
    paystackPublicKey: { type: String, default: '' },
    paystackSecretKey: { type: String, default: '' },
    logoUrl:           { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);