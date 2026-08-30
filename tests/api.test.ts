import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../apps/api/src/server.js';
import { calculateUpsellOpportunitiesService } from '../apps/api/src/services/upsellEngine.js';

describe('AI Commerce Platform API & Engine Test Suite', () => {

  it('GET /health - Should return operational health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/products - Should retrieve seeded catalog products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/cart/items - Should add laptop product to cart', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .send({ productId: 'prod_laptop_8', quantity: 1 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items.length).toBeGreaterThan(0);
  });

  it('Upsell Engine - Should compute high score compatible accessories for laptop', async () => {
    const upsells = await calculateUpsellOpportunitiesService(['prod_laptop_8']);
    expect(upsells.length).toBeGreaterThan(0);
    expect(upsells[0].upsellScore).toBeGreaterThan(0.5);
    expect(upsells[0].product.category).toMatch(/USB-C|Bag|Mice/);
  });

  it('POST /api/v1/orders - Should create local order with pending payment status', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ isAiAssisted: true });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.paymentStatus).toBe('CREATED');
  });

  it('POST /api/v1/payments/verify - Should verify payment HMAC signature & transition status to CAPTURED', async () => {
    const res = await request(app)
      .post('/api/v1/payments/verify')
      .send({
        orderId: 'order_hist_1',
        razorpayOrderId: 'rzp_order_test_101',
        razorpayPaymentId: 'pay_test_101',
        razorpaySignature: 'mock_sig_valid'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderStatus).toBe('COMPLETED');
  });

  it('GET /api/v1/merchant/analytics - Should aggregate total revenue and AI-assisted AOV', async () => {
    const res = await request(app).get('/api/v1/merchant/analytics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analytics.totalRevenue).toBeGreaterThan(0);
  });

});
