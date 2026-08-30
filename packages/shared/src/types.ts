export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN';

export interface User {
  _id?: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  _id?: string;
  customerId: string;
  userId: string;
  preferences: {
    favoriteCategories: string[];
    preferredBrands: string[];
    budgetRange: { min: number; max: number };
  };
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface Merchant {
  _id?: string;
  merchantId: string;
  userId: string;
  storeName: string;
  description: string;
  razorpayKeyId?: string;
  createdAt: string;
}

export interface Product {
  _id?: string;
  productId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  inventory: number;
  rating: number;
  tags: string[];
  specifications: Record<string, string>;
  compatibility: {
    compatibleProductIds: string[];
    useCases: string[];
  };
  frequentlyBoughtWith: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  _id?: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedPrice: number;
  addedAt: string;
  productDetails?: Partial<Product>;
}

export interface Cart {
  _id?: string;
  cartId: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}

export type PaymentStatus = 
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id?: string;
  orderId: string;
  customerId: string;
  merchantId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  idempotencyKey?: string;
  isAiAssisted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id?: string;
  paymentId: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerEventType =
  | 'PRODUCT_VIEWED'
  | 'SEARCHED'
  | 'ADDED_TO_CART'
  | 'REMOVED_FROM_CART'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_STARTED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'ORDER_COMPLETED'
  | 'RECOMMENDATION_SHOWN'
  | 'RECOMMENDATION_ACCEPTED'
  | 'RECOMMENDATION_REJECTED'
  | 'UPSELL_SHOWN'
  | 'UPSELL_ACCEPTED'
  | 'UPSELL_REJECTED';

export interface CustomerEvent {
  _id?: string;
  eventId: string;
  customerId: string;
  type: CustomerEventType;
  metadata: Record<string, any>;
  createdAt: string;
}

export type CampaignStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'RUNNING'
  | 'COMPLETED';

export interface Campaign {
  _id?: string;
  campaignId: string;
  merchantId: string;
  title: string;
  description: string;
  targetSegment: string;
  targetProductId: string;
  offerDiscountPercentage: number;
  budget: number;
  expectedConversionRate: number;
  estimatedRevenue: number;
  actualRevenue: number;
  status: CampaignStatus;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAction {
  _id?: string;
  actionId: string;
  agentType: 'COMMERCE_AGENT' | 'GROWTH_AGENT';
  actionName: string;
  toolUsed: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  reasoning: string;
  targetUserId?: string;
  merchantId?: string;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED';
  confirmationRequired: boolean;
  confirmationReceived: boolean;
  createdAt: string;
}

export interface MerchantAnalytics {
  totalRevenue: number;
  aiAssistedRevenue: number;
  averageOrderValue: number;
  aiAssistedAOV: number;
  totalOrders: number;
  conversionRate: number;
  upsellConversionRate: number;
  crossSellRevenue: number;
  topProducts: Array<{ productId: string; name: string; salesCount: number; revenue: number }>;
  revenueOpportunities: Array<{
    id: string;
    title: string;
    description: string;
    estimatedRevenue: number;
    targetSegment: string;
    recommendedProduct: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId?: string;
}
