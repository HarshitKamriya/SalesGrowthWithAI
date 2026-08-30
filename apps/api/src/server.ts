import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectMongo, connectNeo4j, getRedisClient } from './config/db.js';
import { seedMongoDatabase } from './database/seedMongo.js';
import { seedNeo4jDatabase } from './database/seedNeo4j.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Commerce + Growth Agent API',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/agent', agentRoutes);
app.use('/api/v1/merchant', merchantRoutes);

// Standardized Error Handler
app.use(errorHandler);

export async function startServer() {
  console.log('🚀 Starting AI Commerce + Growth Agent API Server...');

  // Initialize Databases & Seeding
  await connectMongo();
  await connectNeo4j();
  getRedisClient();

  await seedMongoDatabase();
  await seedNeo4jDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`✨ Server running on http://localhost:${env.PORT}`);
    console.log(`👉 Health check: http://localhost:${env.PORT}/health`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
