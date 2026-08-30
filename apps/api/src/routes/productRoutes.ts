import { Router } from 'express';
import { SearchProductsSchema } from '@ai-commerce/shared';
import { searchProductsService, getProductByIdService } from '../services/productService.js';
import { hybridProductSearchService } from '../rag/retrieval/hybridRetriever.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const params = SearchProductsSchema.parse({
      query: req.query.query as string,
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1
    });

    const result = await searchProductsService(params);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/search/hybrid', async (req, res, next) => {
  try {
    const { query, category, maxPrice, minPrice, useCase } = req.body;
    const result = await hybridProductSearchService({ query, category, maxPrice, minPrice, useCase });
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await getProductByIdService(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found' } });
    }
    return res.json({ success: true, data: { product } });
  } catch (err) {
    next(err);
  }
});

export default router;
