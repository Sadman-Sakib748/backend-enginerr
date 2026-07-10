// interfaces/IOrderItem.ts (Complete with proper types)
import { Document, Types } from 'mongoose';

export interface IOrderItem extends Document {
  id: string;
  orderId: Types.ObjectId | string;
  productId: Types.ObjectId | string;
  quantity: number;
  price: number;
  subtotal: number;
  productName: string;
  productSku: string;
  createdAt: Date;
  updatedAt: Date;
  calculateSubtotal(): number;
}

export interface IOrderItemInput {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  productName: string;
  productSku: string;
}