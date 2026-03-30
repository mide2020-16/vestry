import { ProductCategory } from "@/constants/ProductCategory";

export interface Product {
  _id: string;
  name: string;
  image_url: string;
  modelUrl?: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  inscriptions: string[];
}

export interface ProductForm {
  name: string;
  image_url: string;
  modelUrl: string;
  price: number;
  available: boolean;
  inscriptions: string[];
}
