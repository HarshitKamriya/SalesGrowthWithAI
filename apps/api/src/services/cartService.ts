import { Cart, CartItem } from '@ai-commerce/shared';
import { getMongoDb, getInMemoryStore } from '../config/db.js';
import { getProductByIdService } from './productService.js';

export async function getCartService(customerId: string): Promise<Cart> {
  const db = getMongoDb();
  const memoryStore = getInMemoryStore();

  if (db) {
    try {
      const cart = await db.collection('carts').findOne({ customerId }) as unknown as Cart;
      if (cart) return cart;
    } catch (err) {}
  }

  let cart = memoryStore.carts.get(customerId);
  if (!cart) {
    cart = {
      cartId: `cart_${customerId}`,
      customerId,
      items: [],
      subtotal: 0,
      updatedAt: new Date().toISOString()
    };
    memoryStore.carts.set(customerId, cart);
  }
  return cart;
}

export async function addToCartService(customerId: string, productId: string, quantity: number = 1): Promise<Cart> {
  const product = await getProductByIdService(productId);
  if (!product) {
    throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: `Product ${productId} not found` };
  }
  if (product.inventory < quantity) {
    throw { statusCode: 400, code: 'OUT_OF_STOCK', message: `Requested quantity exceeds available stock (${product.inventory})` };
  }

  const cart = await getCartService(customerId);
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    const newItem: CartItem = {
      productId,
      quantity,
      selectedPrice: product.price,
      addedAt: new Date().toISOString(),
      productDetails: {
        name: product.name,
        price: product.price,
        category: product.category,
        brand: product.brand,
        imageUrl: product.imageUrl
      }
    };
    cart.items.push(newItem);
  }

  cart.subtotal = cart.items.reduce((sum, i) => sum + i.selectedPrice * i.quantity, 0);
  cart.updatedAt = new Date().toISOString();

  const db = getMongoDb();
  const memoryStore = getInMemoryStore();
  memoryStore.carts.set(customerId, cart);

  if (db) {
    try {
      await db.collection('carts').updateOne(
        { customerId },
        { $set: cart },
        { upsert: true }
      );
    } catch (err) {}
  }

  return cart;
}

export async function removeFromCartService(customerId: string, productId: string): Promise<Cart> {
  const cart = await getCartService(customerId);
  cart.items = cart.items.filter(i => i.productId !== productId);
  cart.subtotal = cart.items.reduce((sum, i) => sum + i.selectedPrice * i.quantity, 0);
  cart.updatedAt = new Date().toISOString();

  const db = getMongoDb();
  const memoryStore = getInMemoryStore();
  memoryStore.carts.set(customerId, cart);

  if (db) {
    try {
      await db.collection('carts').updateOne({ customerId }, { $set: cart });
    } catch (err) {}
  }

  return cart;
}

export async function clearCartService(customerId: string): Promise<void> {
  const cart = await getCartService(customerId);
  cart.items = [];
  cart.subtotal = 0;
  cart.updatedAt = new Date().toISOString();

  const db = getMongoDb();
  const memoryStore = getInMemoryStore();
  memoryStore.carts.set(customerId, cart);

  if (db) {
    try {
      await db.collection('carts').updateOne({ customerId }, { $set: cart });
    } catch (err) {}
  }
}
