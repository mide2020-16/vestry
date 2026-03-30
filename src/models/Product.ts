import mongoose, { Schema, Document } from "mongoose";
import { ProductCategory } from "@/constants/ProductCategory";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  name: string;
  image_url: string;
  modelUrl?: string;
  price: number;
  inscriptions: string[]; // Fixed: changed from [string] to string[] and made plural
  category: ProductCategory;
  available: boolean;
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
      type: [String], // Cleaner syntax for an array of strings
      default: [],
      trim: true,
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
  },
  {
    timestamps: true,
  },
);

// ─── Model ────────────────────────────────────────────────────────────────────

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
