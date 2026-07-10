// controllers/categoryController.ts
import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ICategoryInput } from '../interfaces/ICategory';
import { AppError, catchAsync } from '../utils/helpers';
import { CategoryRecommendation } from '../services/recommendation/CategoryRecommendation';

export class CategoryController {
  private recommendationService: CategoryRecommendation;

  constructor() {
    this.recommendationService = new CategoryRecommendation();
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryData: ICategoryInput = req.body;

    if (!categoryData.slug) {
      categoryData.slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    const existingCategory = await Category.findOne({ slug: categoryData.slug });
    if (existingCategory) {
      throw new AppError(`Category with slug ${categoryData.slug} already exists`, 400);
    }

    if (categoryData.parentId) {
      const parent = await Category.findById(categoryData.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = await Category.create(categoryData);
    await this.recommendationService.updateCache();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  });

  getCategories = catchAsync(async (req: Request, res: Response) => {
    const { parentId, isActive, limit = 100, page = 1 } = req.query;

    const query: any = {};
    if (parentId !== undefined) {
      query.parentId = parentId === 'null' ? null : parentId;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [categories, total] = await Promise.all([
      Category.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ level: 1, name: 1 }),
      Category.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });

  getCategoryTree = catchAsync(async (req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true }).lean();
    
    const categoryMap = new Map();
    const roots: any[] = [];

    categories.forEach((cat) => {
      categoryMap.set(cat._id.toString(), { ...cat, children: [] });
    });

    categories.forEach((cat) => {
      const node = categoryMap.get(cat._id.toString());
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    res.status(200).json({
      success: true,
      data: roots,
    });
  });

  getCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Category ID is required', 400);
    }

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Category ID is required', 400);
    }

    const updates = req.body;

    if (updates.slug) {
      const existingCategory = await Category.findOne({ 
        slug: updates.slug, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        throw new AppError(`Category with slug ${updates.slug} already exists`, 400);
      }
    }

    if (updates.parentId) {
      const parent = await Category.findById(updates.parentId);
      if (!parent) {
        throw new AppError('Parent category not found', 404);
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await this.recommendationService.updateCache();

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Category ID is required', 400);
    }

    const children = await Category.find({ parentId: id });
    if (children.length > 0) {
      throw new AppError('Cannot delete category with subcategories', 400);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await this.recommendationService.updateCache();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  });

  getCategoryRecommendations = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    if (!id) {
      throw new AppError('Category ID is required', 400);
    }

    const category = await Category.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const products = await this.recommendationService.getRecommendedProducts(
      id,
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: products,
    });
  });
}