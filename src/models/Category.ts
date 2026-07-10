// models/Category.ts
import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/ICategory';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    path: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.pre('save', async function (next) {
  if (this.isModified('parentId')) {
    if (this.parentId) {
      const parent = await mongoose.model('Category').findById(this.parentId);
      if (parent) {
        this.level = parent.level + 1;
        this.path = parent.path ? `${parent.path},${this._id}` : `${this._id}`;
      }
    } else {
      this.level = 0;
      this.path = `${this._id}`;
    }
  }
  next();
});

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);