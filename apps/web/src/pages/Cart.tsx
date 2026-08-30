import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, subtotal, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-500" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review selected items before explicit Razorpay payment confirmation.</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
          <ShoppingCart className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Your cart is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use our AI Assistant to find laptops or browse our catalog to add items.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                    <img
                      src={item.productDetails?.imageUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}
                      alt={item.productId}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">
                      {item.productDetails?.name || item.productId}
                    </h4>
                    <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-extrabold text-white">
                    ₹{(item.selectedPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Box */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 h-fit">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Order Summary</h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>AI Discount Savings</span>
                <span>- ₹500</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-semibold">FREE</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base font-extrabold text-white">
              <span>Total Amount:</span>
              <span className="text-blue-400 text-lg">₹{Math.max(0, subtotal - 500).toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Razorpay Test Mode Verified</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
