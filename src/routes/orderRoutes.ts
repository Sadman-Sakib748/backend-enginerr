import express from 'express';
import { OrderController } from '../controllers/orderController';
import { auth, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { orderValidation } from '../middleware/validation';

const router = express.Router();
const orderController = new OrderController();

router.post(
  '/',
  auth,
  validate(orderValidation.create),
  orderController.createOrder
);

router.get('/', auth, orderController.getOrders);

router.get('/:id', auth, orderController.getOrderDetails);

router.put(
  '/:id/status',
  auth,
  admin,
  orderController.updateOrderStatus
);

export default router;