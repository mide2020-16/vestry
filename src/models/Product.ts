import mongoose, { Schema, Document } from "mongoose";
import { ProductCategory } from "@/constants/ProductCategory";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  name: string;
  image_url: string;
  modelUrl?: string;
  price: number;
  inscriptions: string[];
  category: ProductCategory;
  available: boolean;
  eventId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
      trim: true,
    },
    modelUrl: {
      type: String,
      trim: true,
    },
    inscriptions: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ─── Model ────────────────────────────────────────────────────────────────────

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
