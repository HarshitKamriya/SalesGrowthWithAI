import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

const EnvSchema = z.object({
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  MONGODB_URI: z.string().default('mongodb://localhost:27017/ai_commerce_db'),
  MONGODB_DB_NAME: z.string().default('ai_commerce_db'),
  
  NEO4J_URI: z.string().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('password123'),
  
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  JWT_SECRET: z.string().default('super-secret-jwt-key-change-in-production-2026!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key_id'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_placeholder_key_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_test_placeholder_webhook_secret'),
  
  GEMINI_API_KEY: z.string().default('placeholder_gemini_api_key'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  
  DEMO_MODE: z.string().default('true').transform(val => val === 'true'),
  ENABLE_VECTOR_SEARCH: z.string().default('true').transform(val => val === 'true')
});

export const env = EnvSchema.parse(process.env);
