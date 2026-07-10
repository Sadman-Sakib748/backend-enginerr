// utils/validators.ts (Complete)
import Joi from 'joi';

export const validators = {
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  name: Joi.string().min(2).max(50).required(),

  phone: Joi.string().pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),

  url: Joi.string().uri(),

  date: Joi.date().iso(),

  boolean: Joi.boolean(),

  number: Joi.number().positive(),

  integer: Joi.number().integer().positive(),

  array: Joi.array(),

  object: Joi.object(),

  string: Joi.string(),

  sku: Joi.string().pattern(/^[A-Z0-9]{3,20}$/),
};

export const validateWithSchema = <T>(
  data: T,
  schema: Joi.ObjectSchema
): { error: string | null; value: T } => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(d => d.message).join(', ');
    return { error: errorMessage, value: data };
  }

  return { error: null, value };
};

// ============================================
// AUTH VALIDATION
// ============================================
export const authValidation = {
  register: Joi.object({
    email: validators.email,
    password: validators.password,
    name: validators.name,
  }),

  login: Joi.object({
    email: validators.email,
    password: validators.password,
  }),
};

// ============================================
// CATEGORY VALIDATION
// ============================================
export const categoryValidation = {
  create: Joi.object({
    name: validators.name,
    slug: Joi.string().optional(),
    description: Joi.string().max(200).optional(),
    parentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(null),
    isActive: Joi.boolean().optional().default(true),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    slug: Joi.string().optional(),
    description: Joi.string().max(200).optional(),
    parentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().allow(null),
    isActive: Joi.boolean().optional(),
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
    name: Joi.string().min(2).max(100).optional(),
    sku: validators.sku.optional(),
    description: Joi.string().max(1000).optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().min(0).optional(),
    categoryId: validators.id.optional(),
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
    items: Joi.array().items(
      Joi.object({
        productId: validators.id.required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    ).min(1).required(),
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
    orderId: validators.id.required(),
    provider: Joi.string().valid('stripe', 'bkash').required(),
  }),
};