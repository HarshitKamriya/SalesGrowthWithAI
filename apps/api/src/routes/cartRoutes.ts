import { Router } from 'express';
import { AddToCartSchema, UpdateCartItemSchema } from '@ai-commerce/shared';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { getCartService, addToCartService, removeFromCartService, clearCartService } from '../services/cartService.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    const cart = await getCartService(customerId);
    return res.json({ success: true, data: { cart } });
  } catch (err) {
    next(err);
  }
});

router.post('/items', async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    const data = AddToCartSchema.parse(req.body);
    const cart = await addToCartService(customerId, data.productId, data.quantity);
    return res.status(201).json({ success: true, data: { cart } });
  } catch (err) {
    next(err);
  }
});

router.delete('/items/:id', async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    const cart = await removeFromCartService(customerId, req.params.id);
    return res.json({ success: true, data: { cart } });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    await clearCartService(customerId);
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

export default router;
