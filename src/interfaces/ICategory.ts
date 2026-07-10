import { Document } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  isActive: boolean;
  children?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface ICategoryUpdateInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface ICategoryNode extends ICategory {
  children: ICategoryNode[];
}