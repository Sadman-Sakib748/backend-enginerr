// routes/authRoutes.ts
import express from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { userValidation } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

router.post(
  '/register',
  validate(userValidation.register),
  authController.register
);

router.post(
  '/login',
  validate(userValidation.login),
  authController.login
);

router.get('/profile', auth, authController.getProfile);

router.put('/profile', auth, validate(userValidation.updateProfile), authController.updateProfile);

export default router;