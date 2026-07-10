// interfaces/IPayment.ts (Complete - clientSecret added)
import { Document, Types } from 'mongoose';

export type PaymentProvider = 'stripe' | 'bkash';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface IPayment extends Document {
  id: string;
  orderId: Types.ObjectId | string;
  provider: PaymentProvider;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  rawResponse: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentInput {
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  redirectUrl?: string;
  clientSecret?: string;
  provider: PaymentProvider;
  error?: string;
  amount?: number;
  currency?: string;
}

export interface IPaymentFilter {
  orderId?: string;
  provider?: PaymentProvider;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}