// interfaces/IProduct.ts
import { Document, Types } from 'mongoose';

export interface IProduct extends Document {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  categoryId: Types.ObjectId | string;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  reduceStock(quantity: number): Promise<void>;
  isInStock(quantity: number): boolean;
}

export interface IProductInput {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
  tags?: string[];
}

export interface IProductUpdateInput {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: 'active' | 'inactive';
  categoryId?: string;
  images?: string[];
  tags?: string[];
}

export interface IProductFilter {
  categoryId?: string;
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string[];
}