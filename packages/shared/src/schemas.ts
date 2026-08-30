import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['CUSTOMER', 'MERCHANT', 'ADMIN']).default('CUSTOMER'),
  storeName: z.string().optional()
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const SearchProductsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().default(20),
  page: z.number().default(1)
});

export const AddToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1)
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0)
});

export const CreateOrderSchema = z.object({
  customerId: z.string().optional(),
  isAiAssisted: z.boolean().default(false)
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

export const CreateCampaignSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  targetSegment: z.string(),
  targetProductId: z.string(),
  offerDiscountPercentage: z.number().min(0).max(100),
  budget: z.number().positive(),
  expectedConversionRate: z.number().min(0).max(1),
  estimatedRevenue: z.number().positive()
});

export const AgentChatSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model', 'system', 'tool']),
      content: z.string()
    })
  ).optional(),
  context: z.object({
    currentProductId: z.string().optional(),
    userRole: z.string().optional()
  }).optional()
});
