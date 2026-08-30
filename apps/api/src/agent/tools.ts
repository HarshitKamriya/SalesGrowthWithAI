import { z } from 'zod';
import { searchProductsService, getProductByIdService } from '../services/productService.js';
import { getCartService, addToCartService } from '../services/cartService.js';
import { calculateUpsellOpportunitiesService } from '../services/upsellEngine.js';
import { createOrderService } from '../services/orderService.js';
import { createRazorpayOrderService } from '../services/razorpayService.js';
import { getMerchantAnalyticsService, createCampaignService } from '../services/merchantService.js';
import { hybridProductSearchService } from '../rag/retrieval/hybridRetriever.ts';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any, context?: any) => Promise<any>;
}

export const agentTools: Record<string, ToolDefinition> = {
  search_products: {
    name: 'search_products',
    description: 'Searches catalog products matching intent, budget limits, category, or tags.',
    parameters: z.object({
      query: z.string().optional().describe('Free text query or specification, e.g. "machine learning laptop"'),
      category: z.string().optional().describe('Category name, e.g. "Laptops"'),
      maxPrice: z.number().optional().describe('Maximum budget constraint in INR'),
      useCase: z.string().optional().describe('Intended use case, e.g. "machine learning", "gaming"')
    }),
    execute: async (args) => {
      const res = await hybridProductSearchService(args);
      return {
        count: res.products.length,
        products: res.products.map(p => ({
          productId: p.productId,
          name: p.name,
          price: p.price,
          category: p.category,
          rating: p.rating,
          specifications: p.specifications,
          evidence: p.evidenceSources
        })),
        metadata: res.retrievalMetadata
      };
    }
  },

  get_product: {
    name: 'get_product',
    description: 'Retrieves complete details, specs, and inventory status for a specific product ID.',
    parameters: z.object({
      productId: z.string().describe('Target Product ID, e.g. "prod_laptop_8"')
    }),
    execute: async (args) => {
      const product = await getProductByIdService(args.productId);
      if (!product) return { error: `Product ${args.productId} not found` };
      return { product };
    }
  },

  compare_products: {
    name: 'compare_products',
    description: 'Compares specifications, pricing, and ratings of 2 or more products.',
    parameters: z.object({
      productIds: z.array(z.string()).describe('List of product IDs to compare')
    }),
    execute: async (args) => {
      const items = [];
      for (const id of args.productIds) {
        const p = await getProductByIdService(id);
        if (p) items.push(p);
      }
      return { comparison: items };
    }
  },

  get_cart: {
    name: 'get_cart',
    description: 'Retrieves current shopping cart items and subtotal for the customer.',
    parameters: z.object({}),
    execute: async (args, context) => {
      const customerId = context?.userId || 'cust_demo_101';
      const cart = await getCartService(customerId);
      return { cart };
    }
  },

  add_to_cart: {
    name: 'add_to_cart',
    description: 'Adds a specific product ID to the customer shopping cart.',
    parameters: z.object({
      productId: z.string().describe('Target Product ID to add'),
      quantity: z.number().int().positive().default(1).describe('Quantity')
    }),
    execute: async (args, context) => {
      const customerId = context?.userId || 'cust_demo_101';
      const cart = await addToCartService(customerId, args.productId, args.quantity);
      return { success: true, message: `Added product ${args.productId} to cart`, cart };
    }
  },

  calculate_upsell_opportunities: {
    name: 'calculate_upsell_opportunities',
    description: 'Evaluates cart products and identifies high-converting compatible upsell accessories.',
    parameters: z.object({
      cartProductIds: z.array(z.string()).describe('List of product IDs currently in cart')
    }),
    execute: async (args) => {
      const upsells = await calculateUpsellOpportunitiesService(args.cartProductIds);
      return { count: upsells.length, upsellOpportunities: upsells };
    }
  },

  create_order: {
    name: 'create_order',
    description: 'Creates a pending order from current cart items. REQUIRES explicit user confirmation.',
    parameters: z.object({
      isAiAssisted: z.boolean().default(true)
    }),
    execute: async (args, context) => {
      const customerId = context?.userId || 'cust_demo_101';
      const order = await createOrderService(customerId, args.isAiAssisted);
      return {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        discount: order.discount,
        items: order.items,
        status: order.paymentStatus,
        requiresConfirmation: true,
        confirmationPrompt: `Please confirm your payment of ₹${order.totalAmount.toLocaleString('en-IN')} for ${order.items.length} items.`
      };
    }
  },

  create_razorpay_order: {
    name: 'create_razorpay_order',
    description: 'Generates Razorpay Test Mode Order ID for checkout modal initialization.',
    parameters: z.object({
      orderId: z.string().describe('Local Order ID')
    }),
    execute: async (args) => {
      const rzpOrder = await createRazorpayOrderService(args.orderId);
      return { razorpayOrder: rzpOrder };
    }
  },

  get_merchant_analytics: {
    name: 'get_merchant_analytics',
    description: 'Retrieves sales metrics, AOV, AI-assisted revenue, and revenue opportunities for merchant.',
    parameters: z.object({}),
    execute: async () => {
      const analytics = await getMerchantAnalyticsService();
      return { analytics };
    }
  },

  generate_campaign: {
    name: 'generate_campaign',
    description: 'Proposes an AI-generated growth campaign for merchant. REQUIRES merchant approval.',
    parameters: z.object({
      title: z.string(),
      description: z.string(),
      targetSegment: z.string(),
      targetProductId: z.string(),
      offerDiscountPercentage: z.number(),
      budget: z.number(),
      estimatedRevenue: z.number()
    }),
    execute: async (args) => {
      const campaign = await createCampaignService({
        title: args.title,
        description: args.description,
        targetSegment: args.targetSegment,
        targetProductId: args.targetProductId,
        offerDiscountPercentage: args.offerDiscountPercentage,
        budget: args.budget,
        expectedConversionRate: 0.084,
        estimatedRevenue: args.estimatedRevenue,
        actualRevenue: 0
      });
      return {
        campaign,
        status: campaign.status,
        requiresMerchantApproval: true,
        message: `Campaign proposal created. Merchant must review and click "Approve" before execution.`
      };
    }
  }
};
