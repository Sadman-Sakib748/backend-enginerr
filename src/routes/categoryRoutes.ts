import express from 'express';
import { CategoryController } from '../controllers/categoryController';
import { auth, admin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { categoryValidation } from '../middleware/validation';

const router = express.Router();
const categoryController = new CategoryController();

router.post(
  '/',
  auth,
  admin,
  validate(categoryValidation.create),
  categoryController.createCategory
);

router.get('/', categoryController.getCategories);

router.get('/tree', categoryController.getCategoryTree);

router.get('/:id', categoryController.getCategory);

router.get('/:id/recommendations', categoryController.getCategoryRecommendations);

router.put(
  '/:id',
  auth,
  admin,
  validate(categoryValidation.update),
  categoryController.updateCategory
);

router.delete('/:id', auth, admin, categoryController.deleteCategory);

export default router;