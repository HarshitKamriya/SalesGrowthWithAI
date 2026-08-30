import { Order, PaymentStatus, OrderStatus } from '@ai-commerce/shared';
import { getMongoDb, getInMemoryStore } from '../config/db.js';
import { getCartService, clearCartService } from './cartService.js';
import { getProductByIdService } from './productService.js';

export async function createOrderService(
  customerId: string,
  isAiAssisted: boolean = false,
  idempotencyKey?: string
): Promise<Order> {
  const cart = await getCartService(customerId);
  if (!cart.items || cart.items.length === 0) {
    throw { statusCode: 400, code: 'CART_EMPTY', message: 'Cannot create order for an empty cart' };
  }

  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  // Validate idempotency
  if (idempotencyKey) {
    const existingOrder = Array.from(memoryStore.orders.values()).find(
      o => o.idempotencyKey === idempotencyKey
    );
    if (existingOrder) return existingOrder;
  }

  // Validate inventory
  const orderItems = [];
  for (const item of cart.items) {
    const product = await getProductByIdService(item.productId);
    if (!product) {
      throw { statusCode: 400, code: 'INVALID_PRODUCT', message: `Product ${item.productId} invalid` };
    }
    if (product.inventory < item.quantity) {
      throw { statusCode: 400, code: 'OUT_OF_STOCK', message: `Product ${product.name} out of stock` };
    }
    orderItems.push({
      productId: item.productId,
      name: product.name,
      price: item.selectedPrice,
      quantity: item.quantity
    });
  }

  const subtotal = cart.subtotal;
  const discount = isAiAssisted ? Math.min(500, Math.floor(subtotal * 0.05)) : 0;
  const totalAmount = Math.max(0, subtotal - discount);

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newOrder: Order = {
    orderId,
    customerId,
    merchantId: 'merch_demo_1',
    items: orderItems,
    subtotal,
    discount,
    totalAmount,
    paymentStatus: 'CREATED',
    orderStatus: 'PENDING',
    idempotencyKey,
    isAiAssisted,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryStore.orders.set(orderId, newOrder);

  if (db) {
    try {
      await db.collection('orders').insertOne(newOrder as any);
    } catch (err) {}
  }

  return newOrder;
}

export async function updateOrderPaymentStatusService(
  orderId: string,
  paymentStatus: PaymentStatus,
  razorpayDetails?: { razorpayOrderId?: string; razorpayPaymentId?: string }
): Promise<Order> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  let order: Order | undefined = memoryStore.orders.get(orderId);

  if (!order && db) {
    try {
      order = (await db.collection('orders').findOne({ orderId })) as unknown as Order;
    } catch (err) {}
  }

  if (!order) {
    throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: `Order ${orderId} not found` };
  }

  // Enforce state machine rules
  order.paymentStatus = paymentStatus;
  if (paymentStatus === 'CAPTURED' || paymentStatus === 'AUTHORIZED') {
    order.orderStatus = 'COMPLETED';
    // Deduct stock inventory
    for (const item of order.items) {
      const p = memoryStore.products.get(item.productId);
      if (p) {
        p.inventory = Math.max(0, p.inventory - item.quantity);
      }
    }
  } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
    order.orderStatus = 'CANCELLED';
  }

  if (razorpayDetails?.razorpayOrderId) order.razorpayOrderId = razorpayDetails.razorpayOrderId;
  if (razorpayDetails?.razorpayPaymentId) order.razorpayPaymentId = razorpayDetails.razorpayPaymentId;
  order.updatedAt = new Date().toISOString();

  memoryStore.orders.set(orderId, order);

  if (db) {
    try {
      await db.collection('orders').updateOne(
        { orderId },
        { $set: order }
      );
    } catch (err) {}
  }

  return order;
}

export async function getOrderByIdService(orderId: string): Promise<Order | null> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  let order = memoryStore.orders.get(orderId);
  if (!order && db) {
    try {
      order = (await db.collection('orders').findOne({ orderId })) as unknown as Order;
    } catch (err) {}
  }

  return order || null;
}
