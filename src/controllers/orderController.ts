// controllers/orderController.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Product } from '../models/Product';
import { Payment } from '../models/Payment';
import { IOrderInput } from '../interfaces/IOrder';
import { AppError, catchAsync } from '../utils/helpers';
import { logger } from '../utils/logger';

export class OrderController {
  createOrder = catchAsync(async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const orderData: IOrderInput = req.body;
      
      if (!orderData.items || orderData.items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
      }

      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of orderData.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product) {
          throw new AppError(`Product ${item.productId} not found`, 404);
        }

        if (product.status !== 'active') {
          throw new AppError(`Product ${product.name} is not available`, 400);
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
            400
          );
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
          subtotal,
          productName: product.name,
          productSku: product.sku,
        });
      }

      const order = new Order({
        userId,
        totalAmount,
        status: 'pending',
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes || '',
      });

      await order.save({ session });

      const orderItems = await OrderItem.create(
        orderItemsData.map(item => ({
          ...item,
          orderId: order._id,
        })),
        { session }
      );

      for (const item of orderData.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }

      await session.commitTransaction();

      logger.info(`Order created successfully: ${order._id} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: {
          order,
          items: orderItems,
        },
        message: 'Order created successfully',
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  });

  getOrders = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { status, limit = 10, page = 1 } = req.query;

    const query: any = {};
    
    if (userRole !== 'admin') {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email'),
      Order.countDocuments(query),
    ]);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'name sku images price');
        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });

  getOrderDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', 400);
    }

    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const order = await Order.findById(id).populate('userId', 'name email');
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (userRole !== 'admin' && order.userId.toString() !== userId) {
      throw new AppError('You are not authorized to view this order', 403);
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate('productId', 'name sku images description price');

    const payment = await Payment.findOne({ orderId: order._id });

    res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        items,
        payment,
      },
    });
  });

  updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', 400);
    }

    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const allowedStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'canceled'];
    if (!allowedStatuses.includes(status)) {
      throw new AppError(`Invalid order status. Allowed: ${allowedStatuses.join(', ')}`, 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (status === 'canceled' && order.status !== 'canceled' && order.status !== 'paid') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const items = await OrderItem.find({ orderId: order._id }).session(session);
        
        for (const item of items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    order.status = status;
    await order.save();

    logger.info(`Order ${order._id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status} successfully`,
    });
  });

  cancelOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!id) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (userRole !== 'admin' && order.userId.toString() !== userId) {
      throw new AppError('You are not authorized to cancel this order', 403);
    }

    if (order.status === 'delivered') {
      throw new AppError('Delivered orders cannot be canceled', 400);
    }

    if (order.status === 'canceled') {
      throw new AppError('Order is already canceled', 400);
    }

    if (order.status === 'paid') {
      throw new AppError('Paid orders cannot be canceled. Please request a refund.', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const items = await OrderItem.find({ orderId: order._id }).session(session);
      
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      order.status = 'canceled';
      await order.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order canceled successfully',
    });
  });

  deleteOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === 'paid') {
      throw new AppError('Cannot delete a paid order. Please refund first.', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const items = await OrderItem.find({ orderId: order._id }).session(session);
      
      if (order.status === 'pending' || order.status === 'processing') {
        for (const item of items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }

      await OrderItem.deleteMany({ orderId: order._id }).session(session);
      await Order.findByIdAndDelete(id).session(session);
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    logger.info(`Order ${order._id} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  });

  getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const { 
      status, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      limit = 20, 
      page = 1 
    } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) {
        query.totalAmount.$gte = Number(minAmount);
      }
      if (maxAmount) {
        query.totalAmount.$lte = Number(maxAmount);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .populate('paymentId', 'status provider transactionId'),
      Order.countDocuments(query),
    ]);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'name sku images');
        return {
          ...order.toObject(),
          items,
        };
      })
    );

    const summary = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders: ordersWithItems,
        summary,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });

  getOrderStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgAmount: { $avg: '$totalAmount' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          avgAmount: { $round: ['$avgAmount', 2] },
          _id: 0,
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        breakdown: stats,
      },
    });
  });

  getRecentOrders = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('userId', 'name email');

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'name sku');
        return {
          ...order.toObject(),
          items,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: ordersWithItems,
    });
  });

  getOrderSummary = catchAsync(async (req: Request, res: Response) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      monthOrders,
      monthRevenue,
      statusBreakdown,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: {
          orders: totalOrders,
          revenue: totalRevenue[0]?.total || 0,
        },
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
        },
        week: {
          orders: weekOrders,
          revenue: weekRevenue[0]?.total || 0,
        },
        month: {
          orders: monthOrders,
          revenue: monthRevenue[0]?.total || 0,
        },
        statusBreakdown: statusBreakdown.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  });

  trackOrder = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await Order.findById(id)
      .select('status totalAmount createdAt updatedAt shippingAddress')
      .populate('userId', 'name');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const items = await OrderItem.find({ orderId: order._id })
      .populate('productId', 'name images');

    const timeline = [
      { status: 'Order Placed', timestamp: order.createdAt, completed: true },
      { status: 'Processing', timestamp: order.updatedAt, completed: order.status !== 'pending' },
      { status: 'Paid', timestamp: order.updatedAt, completed: order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered' },
      { status: 'Shipped', timestamp: order.updatedAt, completed: order.status === 'shipped' || order.status === 'delivered' },
      { status: 'Delivered', timestamp: order.updatedAt, completed: order.status === 'delivered' },
    ];

    res.status(200).json({
      success: true,
      data: {
        order,
        items,
        timeline,
      },
    });
  });
}