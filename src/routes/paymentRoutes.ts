import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { paymentValidation } from '../middleware/validation';

const router = express.Router();
const paymentController = new PaymentController();

router.post(
  '/initiate',
  auth,
  validate(paymentValidation.initiate),
  paymentController.initiatePayment
);

router.post(
  '/webhook/:provider',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

router.get(
  '/verify/:provider/:transactionId',
  auth,
  paymentController.verifyPayment
);

router.get('/history', auth, paymentController.getPaymentHistory);

export default router;