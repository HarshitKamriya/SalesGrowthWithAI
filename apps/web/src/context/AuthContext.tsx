import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface User {
  userId: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'CUSTOMER' | 'MERCHANT') => void;
  onRoleSwitch: (callback: (role: 'CUSTOMER' | 'MERCHANT') => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    userId: 'cust_demo_101',
    email: 'demo.customer@example.com',
    name: 'Rahul Sharma',
    role: 'CUSTOMER'
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [roleSwitchCallback, setRoleSwitchCallback] = useState<((role: 'CUSTOMER' | 'MERCHANT') => void) | null>(null);

  const login = async (email: string, password = 'password123') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('token', token);
      }
    } catch {
      // Fallback local switch
      const role = email.includes('merchant') ? 'MERCHANT' : 'CUSTOMER';
      setUser({
        userId: role === 'MERCHANT' ? 'merch_demo_1' : 'cust_demo_101',
        email,
        name: role === 'MERCHANT' ? 'TechStore Electronics' : 'Rahul Sharma',
        role
      });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const switchRole = useCallback((role: 'CUSTOMER' | 'MERCHANT') => {
    if (role === 'MERCHANT') {
      setUser({
        userId: 'merch_demo_1',
        email: 'merchant@razorpay.com',
        name: 'TechStore Electronics',
        role: 'MERCHANT'
      });
    } else {
      setUser({
        userId: 'cust_demo_101',
        email: 'demo.customer@example.com',
        name: 'Rahul Sharma',
        role: 'CUSTOMER'
      });
    }
    // Trigger navigation callback
    if (roleSwitchCallback) {
      roleSwitchCallback(role);
    }
  }, [roleSwitchCallback]);

  const onRoleSwitch = useCallback((callback: (role: 'CUSTOMER' | 'MERCHANT') => void) => {
    setRoleSwitchCallback(() => callback);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, onRoleSwitch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
