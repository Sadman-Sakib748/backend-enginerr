// middleware/validation.ts (Complete Updated)
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/helpers';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    
    next();
  };
};

// ============================================
// USER VALIDATION
// ============================================
export const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must be less than 50 characters',
      'any.required': 'Name is required',
    }),
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
  }),
};

// ============================================
// PRODUCT VALIDATION
// ============================================
export const productValidation = {
  create: Joi.object({
    name: Joi.string().max(100).required(),
    sku: Joi.string().required(),
    description: Joi.string().max(1000).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().min(0).required(),
    categoryId: Joi.string().required(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
  }),
  
  update: Joi.object({
    name: Joi.string().max(100).optional(),
    sku: Joi.string().optional(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().min(0).optional(),
    categoryId: Joi.string().optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
  }),
};

// ============================================
// ORDER VALIDATION
// ============================================
export const orderValidation = {
  create: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required(),
    }).required(),
    notes: Joi.string().max(500).optional(),
  }),
};

// ============================================
// PAYMENT VALIDATION
// ============================================
export const paymentValidation = {
  initiate: Joi.object({
    orderId: Joi.string().required(),
    provider: Joi.string().valid('stripe', 'bkash').required(),
  }),
};

// ============================================
// CATEGORY VALIDATION
// ============================================
export const categoryValidation = {
  create: Joi.object({
    name: Joi.string().max(50).required(),
    slug: Joi.string().lowercase().optional(),
    description: Joi.string().max(200).optional(),
    parentId: Joi.string().allow(null).optional(),
    isActive: Joi.boolean().optional().default(true),
  }),
  
  update: Joi.object({
    name: Joi.string().max(50).optional(),
    slug: Joi.string().lowercase().optional(),
    description: Joi.string().max(200).optional(),
    parentId: Joi.string().allow(null).optional(),
    isActive: Joi.boolean().optional(),
  }),
};