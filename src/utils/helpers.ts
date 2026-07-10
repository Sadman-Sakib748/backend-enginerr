// utils/helpers.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const generateRandomString = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const sanitizeHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const omit = <T extends Record<string, any>>(
  obj: T,
  keys: string[]
): Partial<T> => {
  const result = { ...obj } as Partial<T>;
  keys.forEach(key => {
    delete result[key as keyof typeof result];
  });
  return result;
};

export const pick = <T extends Record<string, any>>(
  obj: T,
  keys: string[]
): Partial<T> => {
  const result: Partial<T> = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key as keyof T] = obj[key];
    }
  });
  return result;
};