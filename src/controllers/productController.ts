// controllers/productController.ts
import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { IProductInput } from '../interfaces/IProduct';
import { AppError, catchAsync } from '../utils/helpers';
import { CategoryRecommendation } from '../services/recommendation/CategoryRecommendation';

export class ProductController {
  private recommendationService: CategoryRecommendation;

  constructor() {
    this.recommendationService = new CategoryRecommendation();
  }

  createProduct = catchAsync(async (req: Request, res: Response) => {
    const productData: IProductInput = req.body;
    
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      throw new AppError(`Product with SKU ${productData.sku} already exists`, 400);
    }

    const category = await Category.findById(productData.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  });

  getProducts = catchAsync(async (req: Request, res: Response) => {
    const {
      categoryId,
      status,
      minPrice,
      maxPrice,
      search,
      tags,
      limit = 20,
      page = 1,
    } = req.query;

    const filter: any = {};

    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    if (search) {
      filter.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('categoryId', 'name slug')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  });

  getProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await Product.findById(id).populate('categoryId', 'name slug');
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const recommendations = await this.recommendationService.getRecommendedProducts(
      product.categoryId.toString(),
      5
    );

    res.status(200).json({
      success: true,
      data: {
        product,
        recommendations,
      },
    });
  });

  updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Product ID is required', 400);
    }

    const updates = req.body;

    if (updates.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updates.sku, 
        _id: { $ne: id } 
      });
      if (existingProduct) {
        throw new AppError(`Product with SKU ${updates.sku} already exists`, 400);
      }
    }

    if (updates.categoryId) {
      const category = await Category.findById(updates.categoryId);
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  });

  deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Product ID is required', 400);
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  });

  getProductRecommendations = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { limit = 10 } = req.query;

    if (!categoryId) {
      throw new AppError('Category ID is required', 400);
    }

    const products = await this.recommendationService.getRecommendedProducts(
      categoryId,
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: products,
    });
  });
}