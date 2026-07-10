// controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { IUserInput, ILoginInput, IAuthResponse } from '../interfaces/IUser';
import { logger } from '../utils/logger';
import { AppError, catchAsync } from '../utils/helpers';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const userData: IUserInput = req.body;
    
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    const user = await User.create(userData);
    
    const token = this.generateToken(user._id.toString(), user.role);

    const response: IAuthResponse = {
      user,
      token,
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully',
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password }: ILoginInput = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is deactivated', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user._id.toString(), user.role);

    const response: IAuthResponse = {
      user,
      token,
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful',
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const updates = req.body;
    
    delete updates.role;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  });

  private generateToken(userId: string, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    const payload = { id: userId, role };
    
    return jwt.sign(
      payload,
      secret,
      {
        expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
      }
    );
  }
}