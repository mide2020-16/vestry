import { ProductCategory } from '@/constants/ProductCategory';

export interface Product {
  _id: string;
  name: string;
  image_url: string;
  model_url?: string;
  price: number;
  category: ProductCategory;
  available: boolean;
}

export interface ProductForm {
  name: string;
  image_url: string;
  model_url: string;
  price: number;
  available: boolean;
}