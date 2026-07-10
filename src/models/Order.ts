// models/Order.ts (Fixed - Type annotations added)
import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem } from '../interfaces/IOrder';

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'canceled'],
      default: 'pending',
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Fixed: Added proper type annotations for parameters
OrderSchema.methods.calculateTotal = function(this: IOrder): number {
  return this.items?.reduce((total: number, item: IOrderItem) => total + item.subtotal, 0) || 0;
};

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);