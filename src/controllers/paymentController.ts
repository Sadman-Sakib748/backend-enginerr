// controllers/paymentController.ts (Fixed - clientSecret error resolved)
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PaymentStrategyFactory } from '../services/payment/PaymentStrategy';
import { StripeStrategy } from '../services/payment/StripeStrategy';
import { BkashStrategy } from '../services/payment/BkashStrategy';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { IPaymentInput, PaymentProvider, PaymentStatus } from '../interfaces/IPayment';
import { AppError, catchAsync } from '../utils/helpers';
import { logger } from '../utils/logger';

PaymentStrategyFactory.registerStrategy('stripe', new StripeStrategy());
PaymentStrategyFactory.registerStrategy('bkash', new BkashStrategy());

export class PaymentController {
  initiatePayment = catchAsync(async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { orderId, provider } = req.body;
      const userId = (req as any).user?.id;

      if (!this.isValidProvider(provider)) {
        throw new AppError('Invalid payment provider. Must be "stripe" or "bkash"', 400);
      }

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!orderId) {
        throw new AppError('Order ID is required', 400);
      }

      const order = await Order.findById(orderId).session(session);
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.userId.toString() !== userId) {
        throw new AppError('You are not authorized to make payment for this order', 403);
      }

      if (order.status === 'paid') {
        throw new AppError('Order already paid', 400);
      }

      const existingPayment = await Payment.findOne({
        orderId,
        status: 'pending',
      }).session(session);

      if (existingPayment) {
        throw new AppError('A pending payment already exists for this order', 400);
      }

      const strategy = PaymentStrategyFactory.getStrategy(provider as PaymentProvider);

      const paymentInput: IPaymentInput = {
        orderId,
        provider: provider as PaymentProvider,
        amount: order.totalAmount,
        currency: 'USD',
        metadata: {
          userId,
          orderNumber: order._id.toString(),
        },
      };

      const paymentResponse = await strategy.initializePayment(paymentInput);

      const payment = new Payment({
        orderId,
        provider: provider as PaymentProvider,
        transactionId: paymentResponse.transactionId,
        status: paymentResponse.status,
        amount: order.totalAmount,
        currency: 'USD',
        rawResponse: paymentResponse,
        metadata: {
          userId,
          initiatedAt: new Date(),
        },
      });

      await payment.save({ session });

      order.paymentId = payment._id;
      await order.save({ session });

      await session.commitTransaction();

      res.status(200).json({
        success: true,
        data: {
          payment,
          redirectUrl: paymentResponse.redirectUrl,
          transactionId: paymentResponse.transactionId,
          clientSecret: paymentResponse.clientSecret || null,
        },
        message: 'Payment initiated successfully',
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });

  verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { transactionId, provider } = req.params;

    if (!transactionId || !provider) {
      throw new AppError('Transaction ID and provider are required', 400);
    }

    if (!this.isValidProvider(provider)) {
      throw new AppError('Invalid payment provider', 400);
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.provider !== provider) {
      throw new AppError('Provider mismatch', 400);
    }

    const strategy = PaymentStrategyFactory.getStrategy(provider as PaymentProvider);

    const verification = await strategy.verifyPayment(transactionId);

    payment.status = verification.status;
    payment.rawResponse = { ...payment.rawResponse, verification };
    await payment.save();

    if (verification.status === 'success') {
      const order = await Order.findById(payment.orderId);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        await order.save();

        logger.info(`Order ${order._id} marked as paid`);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
        verification,
      },
      message: `Payment ${verification.status}`,
    });
  });

  handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = req.body;

    if (!provider) {
      throw new AppError('Provider is required', 400);
    }

    if (!this.isValidProvider(provider)) {
      throw new AppError('Invalid payment provider', 400);
    }

    const strategy = PaymentStrategyFactory.getStrategy(provider as PaymentProvider);

    const webhookData = await strategy.processWebhook(rawBody, signature);

    if (webhookData.transactionId) {
      const payment = await Payment.findOne({ transactionId: webhookData.transactionId });
      if (payment) {
        payment.status = webhookData.status || payment.status;
        payment.rawResponse = { ...payment.rawResponse, webhook: webhookData };
        await payment.save();

        if (webhookData.status === 'success') {
          const order = await Order.findById(payment.orderId);
          if (order && order.status !== 'paid') {
            order.status = 'paid';
            await order.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: webhookData,
    });
  });

  getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { limit = 10, page = 1, status } = req.query;

    const orders = await Order.find({ userId }).select('_id');
    const orderIds = orders.map((o) => o._id);

    const query: any = { orderId: { $in: orderIds } };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('orderId', 'totalAmount status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });

  refundPayment = catchAsync(async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { amount } = req.body;

    if (!transactionId) {
      throw new AppError('Transaction ID is required', 400);
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== 'success') {
      throw new AppError('Only successful payments can be refunded', 400);
    }

    const strategy = PaymentStrategyFactory.getStrategy(payment.provider);

    const refundResponse = await strategy.refundPayment(
      transactionId,
      amount ? Number(amount) : undefined
    );

    if (refundResponse.status === 'refunded') {
      payment.status = 'refunded';
      payment.rawResponse = { ...payment.rawResponse, refund: refundResponse };
      await payment.save();

      const order = await Order.findById(payment.orderId);
      if (order) {
        order.status = 'canceled';
        await order.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment,
        refund: refundResponse,
      },
      message: `Refund ${refundResponse.status}`,
    });
  });

  getPaymentSummary = catchAsync(async (req: Request, res: Response) => {
    const summary = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          _id: 0,
        },
      },
    ]);

    const providerSummary = await Payment.aggregate([
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          provider: '$_id',
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          _id: 0,
        },
      },
    ]);

    const total = await Payment.countDocuments();
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments: total,
        totalAmount: totalAmount[0]?.total || 0,
        byStatus: summary,
        byProvider: providerSummary,
      },
    });
  });

  private isValidProvider(provider: string): provider is PaymentProvider {
    return provider === 'stripe' || provider === 'bkash';
  }
}

export default PaymentController;