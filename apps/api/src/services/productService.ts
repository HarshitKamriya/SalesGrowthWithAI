import { Product } from '@ai-commerce/shared';
import { getMongoDb, getInMemoryStore } from '../config/db.js';
import { generate100Products } from '../database/seedMongo.js';

export async function searchProductsService(params: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  tags?: string[];
  limit?: number;
  page?: number;
}): Promise<{ products: Product[]; total: number }> {
  const db = getMongoDb();
  const memoryStore = getInMemoryStore();
  const limit = params.limit || 20;

  // Auto-seed in-memory store if empty
  if (memoryStore.products.size === 0) {
    const defaultProds = generate100Products();
    defaultProds.forEach(p => memoryStore.products.set(p.productId, p));
  }

  if (db) {
    try {
      const queryFilter: any = {};
      if (params.category) queryFilter.category = { $regex: params.category, $options: 'i' };
      if (params.brand) queryFilter.brand = { $regex: params.brand, $options: 'i' };
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        queryFilter.price = {};
        if (params.minPrice !== undefined) queryFilter.price.$gte = params.minPrice;
        if (params.maxPrice !== undefined) queryFilter.price.$lte = params.maxPrice;
      }
      if (params.tags && params.tags.length > 0) {
        queryFilter.tags = { $in: params.tags };
      }
      if (params.query) {
        queryFilter.$or = [
          { name: { $regex: params.query, $options: 'i' } },
          { description: { $regex: params.query, $options: 'i' } },
          { category: { $regex: params.query, $options: 'i' } }
        ];
      }

      const total = await db.collection('products').countDocuments(queryFilter);
      const products = await db.collection('products')
        .find(queryFilter)
        .limit(limit)
        .toArray() as unknown as Product[];

      if (total > 0 && products.length > 0) {
        return { products, total };
      }
    } catch (err) {
      console.warn('MongoDB query warning, using in-memory filter fallback:', err);
    }
  }

  // In-Memory Fallback Filter (Guaranteed 100 products)
  let filtered = Array.from(memoryStore.products.values());

  if (params.category) {
    filtered = filtered.filter(p => p.category.toLowerCase().includes(params.category!.toLowerCase()));
  }
  if (params.brand) {
    filtered = filtered.filter(p => p.brand.toLowerCase().includes(params.brand!.toLowerCase()));
  }
  if (params.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= params.minPrice!);
  }
  if (params.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= params.maxPrice!);
  }
  if (params.tags && params.tags.length > 0) {
    filtered = filtered.filter(p => params.tags!.some(t => p.tags.includes(t.toLowerCase())));
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const products = filtered.slice(0, limit);
  return { products, total };
}

export async function getProductByIdService(productId: string): Promise<Product | null> {
  const db = getMongoDb();
  const memoryStore = getInMemoryStore();

  if (memoryStore.products.size === 0) {
    const defaultProds = generate100Products();
    defaultProds.forEach(p => memoryStore.products.set(p.productId, p));
  }

  if (db) {
    try {
      const product = await db.collection('products').findOne({ productId }) as unknown as Product;
      if (product) return product;
    } catch (err) {}
  }

  return memoryStore.products.get(productId) || null;
}
