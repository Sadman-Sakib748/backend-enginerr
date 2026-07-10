// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/helpers';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
    name: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('You are not authenticated. Please provide a valid token.', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token. Please login again.', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired. Please login again.', 401));
    } else {
      next(error);
    }
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const user = req.user;
  
  if (!user || user.role !== 'admin') {
    throw new AppError('You are not authorized to access this resource. Admin access required.', 403);
  }
  
  next();
};