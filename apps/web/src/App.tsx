import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Shop } from './pages/Shop';
import { Assistant } from './pages/Assistant';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MerchantDashboard } from './pages/merchant/Dashboard';
import { Campaigns } from './pages/merchant/Campaigns';
import { KnowledgeGraph } from './pages/merchant/KnowledgeGraph';
import { AuditTrail } from './pages/merchant/Audit';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<Navigate to="/shop" replace />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                
                {/* Merchant Routes */}
                <Route path="/merchant" element={<Navigate to="/merchant/dashboard" replace />} />
                <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
                <Route path="/merchant/campaigns" element={<Campaigns />} />
                <Route path="/merchant/graph" element={<KnowledgeGraph />} />
                <Route path="/merchant/audit" element={<AuditTrail />} />
                
                <Route path="*" element={<Navigate to="/shop" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
