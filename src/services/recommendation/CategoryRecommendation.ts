// services/recommendation/CategoryRecommendation.ts
import { Category } from '../../models/Category';
import { Product } from '../../models/Product';
import { ICategory } from '../../interfaces/ICategory';
import { CacheService } from '../cache/CacheService';
import { logger } from '../../utils/logger';

interface ICategoryNode extends ICategory {
  children: ICategoryNode[];
}

export class CategoryRecommendation {
  private cacheService: CacheService;
  private cacheKey = 'category_tree';

  constructor() {
    this.cacheService = new CacheService();
  }

  private async buildCategoryTree(): Promise<ICategoryNode[]> {
    try {
      const categories = await Category.find({ isActive: true }).lean();
      const categoryMap = new Map<string, ICategoryNode>();
      const roots: ICategoryNode[] = [];

      categories.forEach((cat) => {
        const node = {
          ...cat,
          children: [],
        } as ICategoryNode;
        categoryMap.set(cat._id.toString(), node);
      });

      categories.forEach((cat) => {
        const node = categoryMap.get(cat._id.toString());
        if (!node) return;

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

      return roots;
    } catch (error) {
      logger.error('Error building category tree:', error);
      return [];
    }
  }

  private async dfsCategorySearch(
    node: ICategoryNode,
    targetId: string,
    depth: number = 0,
    maxDepth: number = 3
  ): Promise<{ found: boolean; relatedIds: string[]; path: string[] }> {
    if (node._id.toString() === targetId) {
      const relatedIds: string[] = [];
      
      relatedIds.push(node._id.toString());
      
      const childIds = await this.collectChildIds(node, maxDepth - depth);
      relatedIds.push(...childIds);

      return {
        found: true,
        relatedIds,
        path: [node.name],
      };
    }

    for (const child of node.children) {
      const result = await this.dfsCategorySearch(
        child,
        targetId,
        depth + 1,
        maxDepth
      );
      
      if (result.found) {
        result.path.unshift(node.name);
        return result;
      }
    }

    return {
      found: false,
      relatedIds: [],
      path: [],
    };
  }

  private async collectChildIds(
    node: ICategoryNode,
    remainingDepth: number
  ): Promise<string[]> {
    const ids: string[] = [];

    if (remainingDepth <= 0) {
      return ids;
    }

    for (const child of node.children) {
      ids.push(child._id.toString());
      const childIds = await this.collectChildIds(child, remainingDepth - 1);
      ids.push(...childIds);
    }

    return ids;
  }

  async getRecommendedProducts(
    categoryId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      let categoryTree: ICategoryNode[] | null = await this.cacheService.get(this.cacheKey);

      if (!categoryTree) {
        categoryTree = await this.buildCategoryTree();
        await this.cacheService.set(this.cacheKey, categoryTree, 3600);
        logger.info('Category tree cached');
      }

      let relatedCategoryIds: string[] = [];

      for (const root of categoryTree) {
        const result = await this.dfsCategorySearch(root, categoryId);
        if (result.found) {
          relatedCategoryIds = result.relatedIds;
          break;
        }
      }

      if (relatedCategoryIds.length === 0) {
        logger.warn(`Category ${categoryId} not found in tree`);
        return [];
      }

      const products = await Product.find({
        categoryId: { $in: relatedCategoryIds },
        status: 'active',
        stock: { $gt: 0 },
      })
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      return products;
    } catch (error) {
      logger.error('Error getting recommended products:', error);
      return [];
    }
  }

  async clearCache(): Promise<void> {
    await this.cacheService.del(this.cacheKey);
    logger.info('Category tree cache cleared');
  }

  async updateCache(): Promise<void> {
    await this.clearCache();
    const categoryTree = await this.buildCategoryTree();
    await this.cacheService.set(this.cacheKey, categoryTree, 3600);
    logger.info('Category tree cache updated');
  }
}