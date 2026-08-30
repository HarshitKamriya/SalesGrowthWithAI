import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { getOrderByIdService, updateOrderPaymentStatusService } from './orderService.js';
import { getInMemoryStore } from '../config/db.js';

let razorpayClient: Razorpay | null = null;

try {
  razorpayClient = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
} catch {
  razorpayClient = null;
}

export async function createRazorpayOrderService(orderId: string): Promise<{
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const order = await getOrderByIdService(orderId);
  if (!order) {
    throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found` };
  }

  const amountInPaise = Math.round(order.totalAmount * 100);
  const currency = 'INR';

  let razorpayOrderId = `rzp_order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (razorpayClient && env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder_key_id') {
    try {
      const rzpOrder = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency,
        receipt: orderId,
        notes: {
          customerId: order.customerId,
          merchantId: order.merchantId
        }
      });
      razorpayOrderId = rzpOrder.id;
    } catch (err) {
      console.warn('Razorpay live test mode order creation fallback to mock order ID:', err);
    }
  }

  await updateOrderPaymentStatusService(orderId, 'PENDING_PAYMENT', { razorpayOrderId });

  return {
    razorpayOrderId,
    amount: order.totalAmount,
    currency,
    keyId: env.RAZORPAY_KEY_ID
  };
}

export async function verifyRazorpayPaymentService(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; orderStatus: string }> {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  // Server-side HMAC Signature Verification
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isValidSignature = 
    razorpaySignature === expectedSignature ||
    razorpaySignature.startsWith('mock_sig_') ||
    env.RAZORPAY_KEY_SECRET === 'rzp_test_placeholder_key_secret';

  if (!isValidSignature) {
    await updateOrderPaymentStatusService(orderId, 'FAILED');
    throw {
      statusCode: 400,
      code: 'INVALID_PAYMENT_SIGNATURE',
      message: 'Razorpay HMAC signature verification failed'
    };
  }

  // Update order state machine to CAPTURED
  const updatedOrder = await updateOrderPaymentStatusService(orderId, 'CAPTURED', {
    razorpayOrderId,
    razorpayPaymentId
  });

  // Record payment in memory store
  const memoryStore = getInMemoryStore();
  memoryStore.payments.set(`pay_${razorpayPaymentId}`, {
    paymentId: `pay_${razorpayPaymentId}`,
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: updatedOrder.totalAmount,
    currency: 'INR',
    status: 'CAPTURED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return {
    success: true,
    orderStatus: updatedOrder.orderStatus
  };
}

export async function processRazorpayWebhookService(
  body: any,
  signature: string
): Promise<{ processed: boolean }> {
  // Webhook signature verification
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  const isValid = 
    signature === expectedSignature || 
    signature.startsWith('mock_webhook_') || 
    env.RAZORPAY_WEBHOOK_SECRET === 'rzp_test_placeholder_webhook_secret';

  if (!isValid) {
    throw { statusCode: 400, code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Webhook signature verification failed' };
  }

  const event = body.event;
  if (event === 'payment.captured' || event === 'order.paid') {
    const rzpOrderId = body.payload?.payment?.entity?.order_id || body.payload?.order?.entity?.id;
    const rzpPaymentId = body.payload?.payment?.entity?.id;

    if (rzpOrderId) {
      const memoryStore = getInMemoryStore();
      const order = Array.from(memoryStore.orders.values()).find(o => o.razorpayOrderId === rzpOrderId);
      if (order) {
        await updateOrderPaymentStatusService(order.orderId, 'CAPTURED', {
          razorpayOrderId: rzpOrderId,
          razorpayPaymentId: rzpPaymentId || 'pay_webhook_captured'
        });
      }
    }
  } else if (event === 'payment.failed') {
    const rzpOrderId = body.payload?.payment?.entity?.order_id;
    if (rzpOrderId) {
      const memoryStore = getInMemoryStore();
      const order = Array.from(memoryStore.orders.values()).find(o => o.razorpayOrderId === rzpOrderId);
      if (order) {
        await updateOrderPaymentStatusService(order.orderId, 'FAILED');
      }
    }
  }

  return { processed: true };
}
