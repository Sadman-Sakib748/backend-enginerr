import express from 'express';
import { ProductController } from '../controllers/productController';
import { auth, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { productValidation } from '../middleware/validation';

const router = express.Router();
const productController = new ProductController();

router.post(
  '/',
  auth,
  admin,
  validate(productValidation.create),
  productController.createProduct
);

router.get('/', productController.getProducts);

router.get('/:id', productController.getProduct);

router.put(
  '/:id',
  auth,
  admin,
  validate(productValidation.update),
  productController.updateProduct
);

router.delete('/:id', auth, admin, productController.deleteProduct);

router.get(
  '/recommendations/:categoryId',
  productController.getProductRecommendations
);

export default router;