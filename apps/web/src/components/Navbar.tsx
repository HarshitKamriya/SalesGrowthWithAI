import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, switchRole, onRoleSwitch } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMerchantView = user?.role === 'MERCHANT' || location.pathname.startsWith('/merchant');

  // Register navigation callback for role switch
  useEffect(() => {
    onRoleSwitch((role) => {
      if (role === 'MERCHANT') {
        navigate('/merchant/dashboard');
      } else {
        navigate('/shop');
      }
    });
  }, [onRoleSwitch, navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  interface NavLink {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeColor: string;
    iconPulse?: boolean;
    badge?: number;
    iconClass?: string;
  }

  const customerLinks: NavLink[] = [
    { to: '/shop', label: 'Shop', icon: ShoppingBag, activeColor: 'blue' },
    { to: '/assistant', label: 'AI Assistant', icon: Sparkles, activeColor: 'purple', iconPulse: true },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, activeColor: 'blue', badge: itemCount },
  ];

  const merchantLinks: NavLink[] = [
    { to: '/merchant/dashboard', label: 'Growth Dashboard', icon: BarChart3, activeColor: 'blue' },
    { to: '/merchant/campaigns', label: 'AI Campaigns', icon: TrendingUp, activeColor: 'indigo' },
    { to: '/merchant/graph', label: 'Knowledge Graph', icon: GitFork, activeColor: 'emerald', iconClass: 'text-emerald-400' },
    { to: '/merchant/audit', label: 'Audit Trail', icon: ShieldCheck, activeColor: 'amber' },
  ];

  const links = isMerchantView ? merchantLinks : customerLinks;

  const getActiveCls = (to: string, color: string) => {
    const isActive = to === '/shop'
      ? location.pathname === '/shop'
      : location.pathname.includes(to.split('/').pop()!);
    return isActive
      ? `bg-${color}-600/20 text-${color}-400 border border-${color}-500/30`
      : 'text-slate-300 hover:text-white hover:bg-slate-800';
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg text-white tracking-tight">AI Commerce</span>
              <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Growth Agent
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getActiveCls(link.to, link.activeColor)}`}
              >
                <link.icon className={`h-4 w-4 ${link.iconPulse ? 'animate-pulse text-purple-400' : ''} ${link.iconClass || ''}`} />
                <span>{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-fade-in-up">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Side: User Greeting + Mode Switch + Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {/* User Greeting (desktop) */}
            <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-400 mr-1">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="font-medium text-slate-300">{user?.name || 'Guest'}</span>
            </div>

            {/* Role Switch */}
            <button
              onClick={() => switchRole(isMerchantView ? 'CUSTOMER' : 'MERCHANT')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm hover:shadow-md"
            >
              <UserCheck className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">Switch to {isMerchantView ? 'Customer' : 'Merchant'}</span>
              <span className="sm:hidden">{isMerchantView ? '🛒' : '📊'}</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-slide-in-right border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
                <p className="text-[11px] text-slate-400">{user?.email}</p>
              </div>
              <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                isMerchantView
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {user?.role}
              </span>
            </div>

            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${getActiveCls(link.to, link.activeColor)}`}
              >
                <link.icon className={`h-5 w-5 ${link.iconClass || ''}`} />
                <span>{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
