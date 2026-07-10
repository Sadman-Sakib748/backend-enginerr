import { Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}

export interface IUserUpdateInput {
  name?: string;
  email?: string;
  isActive?: boolean;
}