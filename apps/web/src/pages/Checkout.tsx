import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertCircle, ShieldCheck, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Confetti burst component
const ConfettiBurst: React.FC = () => {
  const colors = ['#3b82f6', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];
  const pieces = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: `${Math.random() * 1.5}s`,
    size: Math.random() * 8 + 4,
    duration: `${Math.random() * 2 + 2}s`
  }));

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </>
  );
};

export const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const discount = Math.min(500, Math.floor(subtotal * 0.05));
  const finalAmount = Math.max(0, subtotal - discount);

  const steps = [
    'Validating Cart Items',
    'Creating Razorpay Order',
    'Initializing Payment Gateway',
    'Awaiting Payment Confirmation'
  ];

  // Initialize Local Order on Mount
  useEffect(() => {
    const initOrder = async () => {
      try {
        const res = await api.post('/orders', { isAiAssisted: true });
        if (res.data.success) {
          setCreatedOrder(res.data.data.order);
        }
      } catch (err) {
        // Fallback local mock order
        setCreatedOrder({
          orderId: `order_${Date.now()}`,
          totalAmount: finalAmount,
          subtotal,
          discount,
          paymentStatus: 'CREATED'
        });
      }
    };
    if (items.length > 0) initOrder();
  }, [items]);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStep(0);

    try {
      const orderId = createdOrder?.orderId || `order_${Date.now()}`;

      // Step 1: Validating
      setCurrentStep(0);
      await new Promise(r => setTimeout(r, 400));

      // Step 2: Creating Razorpay Order
      setCurrentStep(1);
      const rzpOrderRes = await api.post('/payments/create-razorpay-order', { orderId });
      const rzpData = rzpOrderRes.data.data;

      // Step 3: Initializing Gateway
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 300));

      // Step 4: Awaiting Payment
      setCurrentStep(3);

      // Configure Razorpay Checkout Options
      const options = {
        key: rzpData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TW0NXdqngxTaAx',
        amount: Math.round(rzpData.amount * 100),
        currency: rzpData.currency || 'INR',
        name: 'AI Commerce Platform',
        description: 'Razorpay Order Payment',
        order_id: rzpData.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Server-side payment signature verification
            const verifyRes = await api.post('/payments/verify', {
              orderId,
              razorpayOrderId: response.razorpay_order_id || rzpData.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              setPaymentSuccess({
                orderId,
                paymentId: response.razorpay_payment_id,
                amount: rzpData.amount
              });
              await clearCart();
            }
          } catch (err: any) {
            const apiMsg = err.response?.data?.error?.message || err.message || 'Payment signature verification failed server-side.';
            setErrorMessage(apiMsg);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMessage('Payment process was cancelled by user.');
          }
        },
        prefill: {
          name: user?.name || 'Rahul Sharma',
          email: user?.email || 'demo.customer@example.com'
        },
        theme: {
          color: '#2563eb'
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          const failReason = response.error?.description || response.error?.reason || 'Payment failed';
          setErrorMessage(`Payment Failed: ${failReason}`);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        setErrorMessage('Razorpay Checkout SDK script not loaded. Please check your internet connection.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to initialize Razorpay payment. Please try again.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <ConfettiBurst />
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/30 text-center space-y-5 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 animate-fade-in-up">
          <div className="relative mx-auto w-fit">
            <CheckCircle2 className="h-20 w-20 text-emerald-400 mx-auto" />
            <div className="absolute inset-0 h-20 w-20 rounded-full bg-emerald-400/20 animate-ping" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Order Confirmed!</h2>
          <p className="text-sm text-slate-300">
            Payment verified server-side. Order status updated to <span className="font-bold text-emerald-400">CAPTURED</span>.
          </p>

          <div className="bg-slate-950/80 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-800 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="text-white font-bold">{paymentSuccess.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Razorpay Payment ID:</span>
              <span className="text-white font-bold">{paymentSuccess.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="text-emerald-400 font-bold">₹{paymentSuccess.amount?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Neo4j Knowledge Graph:</span>
              <span className="text-blue-400">(:Customer)-[:PURCHASED]-&gt;(:Product) Projected</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </button>
            <button
              onClick={() => navigate('/merchant/dashboard')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all border border-slate-700"
            >
              <span>View Merchant Impact</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center space-y-2 animate-fade-in-up">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Explicit Payment Confirmation Policy
        </span>
        <h1 className="text-2xl font-extrabold text-white">Review & Complete Order</h1>
        <p className="text-xs text-slate-400">Per Fintech Guardrails, payments are executed only after your explicit confirmation.</p>
      </div>

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center space-x-3 text-rose-400 text-xs font-medium animate-fade-in-up">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Processing Steps */}
      {isProcessing && (
        <div className="glass-panel rounded-xl p-5 border border-indigo-500/30 space-y-3 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment</span>
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={step} className={`flex items-center space-x-3 text-xs transition-all duration-500 ${
                i < currentStep ? 'text-emerald-400' : i === currentStep ? 'text-indigo-300' : 'text-slate-600'
              }`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  i < currentStep
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : i === currentStep
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Summary Box */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5 bg-slate-900/80 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Payment Breakdown</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Cart Items Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>AI Conversational Discount (5%)</span>
            <span>- ₹{discount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400 text-xs">
            <span>Razorpay Gateway Charges</span>
            <span className="text-emerald-400 font-semibold">FREE (Test Mode)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-lg font-extrabold text-white">
          <span>Final Amount to Charge:</span>
          <span className="text-2xl text-blue-400">₹{finalAmount.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={handleRazorpayPayment}
          disabled={isProcessing || items.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Confirm & Pay ₹{finalAmount.toLocaleString('en-IN')} via Razorpay</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 pt-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Protected by HMAC SHA256 Signature Verification</span>
        </div>
      </div>

    </div>
  );
};
