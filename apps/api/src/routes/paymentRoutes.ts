import { Router } from 'express';
import { VerifyPaymentSchema } from '@ai-commerce/shared';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';
import { idempotency } from '../middleware/idempotency.js';
import {
  createRazorpayOrderService,
  verifyRazorpayPaymentService,
  processRazorpayWebhookService
} from '../services/razorpayService.js';

const router = Router();

// Create Razorpay Order
router.post('/create-razorpay-order', authenticateJWT, idempotency, async (req: AuthRequest, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_ORDER_ID', message: 'Order ID is required' } });
    }

    const rzpOrder = await createRazorpayOrderService(orderId);
    return res.json({ success: true, data: rzpOrder });
  } catch (err) {
    next(err);
  }
});

// Verify Payment Signature
router.post('/verify', authenticateJWT, idempotency, async (req: AuthRequest, res, next) => {
  try {
    const data = VerifyPaymentSchema.parse(req.body);
    const result = await verifyRazorpayPaymentService(data);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Razorpay Webhook Endpoint
router.post('/webhooks/razorpay', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string || 'mock_webhook_sig';
    const result = await processRazorpayWebhookService(req.body, signature);
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
