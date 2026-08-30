import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { getOrderByIdService, updateOrderPaymentStatusService } from './orderService.js';
import { getInMemoryStore } from '../config/db.js';

function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET
  });
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

  // Validation: Minimum amount 100 paise (₹1)
  if (amountInPaise < 100) {
    throw {
      statusCode: 400,
      code: 'INVALID_AMOUNT',
      message: 'Minimum order amount must be at least 100 paise (₹1).'
    };
  }

  let razorpayOrderId: string;

  try {
    const razorpay = getRazorpayClient();
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: orderId,
      notes: {
        customerId: order.customerId,
        merchantId: order.merchantId
      }
    });
    razorpayOrderId = rzpOrder.id;
  } catch (err: any) {
    console.error('Razorpay Order Creation API Error:', err);
    throw {
      statusCode: 500,
      code: 'RAZORPAY_API_ERROR',
      message: err.error?.description || err.message || 'Failed to create Razorpay Order'
    };
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

  // Validate required fields
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw {
      statusCode: 400,
      code: 'MISSING_PAYMENT_FIELDS',
      message: 'orderId, razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.'
    };
  }

  // Server-side HMAC Signature Verification
  // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const isValidSignature = razorpaySignature === generatedSignature;

  if (!isValidSignature) {
    await updateOrderPaymentStatusService(orderId, 'FAILED');
    throw {
      statusCode: 400,
      code: 'INVALID_PAYMENT_SIGNATURE',
      message: 'Razorpay HMAC signature verification failed. Payment was not authorized.'
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
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  const isValid = signature === expectedSignature || env.RAZORPAY_WEBHOOK_SECRET === 'rzp_test_placeholder_webhook_secret';

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
