// models/OrderItem.ts
import mongoose, { Schema } from 'mongoose';
import { IOrderItem } from '../interfaces/IOrderItem';

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    productName: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderItemSchema.methods.calculateSubtotal = function(): number {
  return this.price * this.quantity;
};

OrderItemSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('quantity')) {
    this.subtotal = this.calculateSubtotal();
  }
  next();
});

OrderItemSchema.index({ orderId: 1, productId: 1 });

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);