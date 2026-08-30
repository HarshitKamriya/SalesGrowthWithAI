import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Sparkles,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  GitFork,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const isMerchantView = user?.role === 'MERCHANT' || location.pathname.startsWith('/merchant');

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">AI Commerce</span>
              <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Growth Agent
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {!isMerchantView ? (
              <>
                <Link
                  to="/shop"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/shop' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop</span>
                </Link>

                <Link
                  to="/assistant"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/assistant' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <span>AI Assistant</span>
                </Link>

                <Link
                  to="/cart"
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/cart' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/merchant/dashboard"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.includes('/dashboard') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Growth Dashboard</span>
                </Link>

                <Link
                  to="/merchant/campaigns"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.includes('/campaigns') ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>AI Campaigns</span>
                </Link>

                <Link
                  to="/merchant/graph"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.includes('/graph') ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <GitFork className="h-4 w-4 text-emerald-400" />
                  <span>Knowledge Graph</span>
                </Link>

                <Link
                  to="/merchant/audit"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.includes('/audit') ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Audit Trail</span>
                </Link>
              </>
            )}
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => switchRole(isMerchantView ? 'CUSTOMER' : 'MERCHANT')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Switch to {isMerchantView ? 'Customer Mode' : 'Merchant Mode'}</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
