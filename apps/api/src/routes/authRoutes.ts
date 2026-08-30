import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RegisterUserSchema, LoginUserSchema } from '@ai-commerce/shared';
import { env } from '../config/env.js';
import { getInMemoryStore, getMongoDb } from '../config/db.js';
import { authenticateJWT, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const data = RegisterUserSchema.parse(req.body);
    const memoryStore = getInMemoryStore();
    const db = getMongoDb();

    // Check if user exists
    const existing = Array.from(memoryStore.users.values()).find(u => u.email === data.email);
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } });
    }

    const userId = `usr_${Date.now()}`;
    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = {
      userId,
      email: data.email,
      name: data.name,
      role: data.role,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryStore.users.set(userId, newUser);
    if (db) await db.collection('users').insertOne(newUser as any);

    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email, name: newUser.name, role: newUser.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { userId: newUser.userId, email: newUser.email, name: newUser.name, role: newUser.role }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = LoginUserSchema.parse(req.body);
    const memoryStore = getInMemoryStore();
    
    let user = Array.from(memoryStore.users.values()).find(u => u.email === data.email);
    
    if (!user) {
      // Demo Fallback for instant hackathon testing
      user = {
        userId: data.email.includes('merchant') ? 'merch_demo_1' : 'cust_demo_101',
        email: data.email,
        name: data.email.includes('merchant') ? 'TechStore Electronics' : 'Demo Customer',
        role: data.email.includes('merchant') ? 'MERCHANT' : 'CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryStore.users.set(user.userId, user);
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, name: user.name, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        token,
        user: { userId: user.userId, email: user.email, name: user.name, role: user.role }
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticateJWT, (req: AuthRequest, res) => {
  return res.json({ success: true, data: { user: req.user } });
});

export default router;
