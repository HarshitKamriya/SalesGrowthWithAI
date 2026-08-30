import { Router } from 'express';
import { CreateOrderSchema } from '@ai-commerce/shared';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { idempotency } from '../middleware/idempotency.js';
import { createOrderService, getOrderByIdService } from '../services/orderService.js';
import { getInMemoryStore, getMongoDb } from '../config/db.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', idempotency, async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    const data = CreateOrderSchema.parse(req.body);
    const idempotencyKey = req.headers['idempotency-key'] as string;

    const order = await createOrderService(customerId, data.isAiAssisted, idempotencyKey);
    return res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const customerId = req.user?.userId || 'cust_demo_101';
    const memoryStore = getInMemoryStore();
    const db = getMongoDb();

    let userOrders = Array.from(memoryStore.orders.values()).filter(o => o.customerId === customerId);
    if (db) {
      try {
        const dbOrders = await db.collection('orders').find({ customerId }).toArray();
        if (dbOrders.length > 0) userOrders = dbOrders as any;
      } catch (err) {}
    }

    return res.json({ success: true, data: { orders: userOrders } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const order = await getOrderByIdService(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } });
    }
    return res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
});

export default router;
