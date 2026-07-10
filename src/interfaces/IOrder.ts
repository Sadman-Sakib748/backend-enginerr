// interfaces/IOrder.ts (Complete with proper types)
import { Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId | string;
  quantity: number;
  price: number;
  subtotal: number;
  productName: string;
  productSku: string;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId | string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'canceled';
  shippingAddress: IShippingAddress;
  paymentId?: Types.ObjectId | string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  calculateTotal(): number;
}

export interface IOrderItemInput {
  productId: string;
  quantity: number;
}

export interface IOrderInput {
  userId?: string;
  items: IOrderItemInput[];
  shippingAddress: IShippingAddress;
  notes?: string;
}

export interface IOrderFilter {
  userId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}