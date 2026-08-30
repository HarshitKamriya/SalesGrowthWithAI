import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '@ai-commerce/shared';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or expired authentication token' }
      });
    }
  }

  // Fallback for guest/demo mode if authorization header is absent
  req.user = {
    userId: 'cust_demo_101',
    email: 'demo.customer@example.com',
    name: 'Demo Customer',
    role: 'CUSTOMER'
  };
  return next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permission to perform this action' }
      });
    }

    next();
  };
}
