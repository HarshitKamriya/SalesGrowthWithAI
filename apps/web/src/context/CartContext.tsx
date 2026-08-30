import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedPrice: number;
  productDetails?: {
    name: string;
    category?: string;
    imageUrl?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);

  const recalcSubtotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((sum, i) => sum + i.selectedPrice * i.quantity, 0);
  };

  const refreshCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success && res.data.data.cart) {
        setItems(res.data.data.cart.items || []);
        setSubtotal(res.data.data.cart.subtotal || 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.data.success && res.data.data.cart) {
        setItems(res.data.data.cart.items || []);
        setSubtotal(res.data.data.cart.subtotal || 0);
      }
    } catch (err) {
      // Local fallback item addition
      setItems(prev => {
        const existing = prev.find(i => i.productId === productId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          updated = [...prev, { productId, quantity, selectedPrice: 1299, productDetails: { name: productId } }];
        }
        setSubtotal(recalcSubtotal(updated));
        return updated;
      });
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }
    try {
      // Remove and re-add with correct quantity (API doesn't have PATCH)
      await api.delete(`/cart/items/${productId}`);
      const res = await api.post('/cart/items', { productId, quantity: newQuantity });
      if (res.data.success && res.data.data.cart) {
        setItems(res.data.data.cart.items || []);
        setSubtotal(res.data.data.cart.subtotal || 0);
      }
    } catch {
      // Local fallback
      setItems(prev => {
        const updated = prev.map(i =>
          i.productId === productId ? { ...i, quantity: newQuantity } : i
        );
        setSubtotal(recalcSubtotal(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      if (res.data.success && res.data.data.cart) {
        setItems(res.data.data.cart.items || []);
        setSubtotal(res.data.data.cart.subtotal || 0);
      }
    } catch {
      setItems(prev => {
        const updated = prev.filter(i => i.productId !== productId);
        setSubtotal(recalcSubtotal(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
    } catch {}
    setItems([]);
    setSubtotal(0);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, subtotal, itemCount, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
