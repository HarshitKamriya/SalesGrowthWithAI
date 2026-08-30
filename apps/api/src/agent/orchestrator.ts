import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { agentTools } from './tools.js';
import { getInMemoryStore, getMongoDb } from '../config/db.js';

export interface AgentChatMessage {
  role: 'user' | 'model' | 'system' | 'tool';
  content: string;
}

export interface AgentResponse {
  message: string;
  toolCalls?: Array<{ tool: string; input: any; output: any }>;
  agentActionId?: string;
  uiSuggestions?: {
    showProducts?: any[];
    showUpsell?: any;
    showOrderConfirmation?: any;
    showCampaignProposal?: any;
  };
}

// Provider Abstraction Interface
export interface ILlmProvider {
  processChat(userMessage: string, history?: AgentChatMessage[], context?: any): Promise<AgentResponse>;
}

export class GeminiAgentProvider implements ILlmProvider {
  private aiClient: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'placeholder_gemini_api_key') {
      try {
        this.aiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      } catch {
        this.aiClient = null;
      }
    }
  }

  async processChat(userMessage: string, history: AgentChatMessage[] = [], context?: any): Promise<AgentResponse> {
    const msgLower = userMessage.toLowerCase();
    const toolCallsExecuted: Array<{ tool: string; input: any; output: any }> = [];
    let uiSuggestions: any = {};
    let responseText = '';

    // Deterministic High-Performance Heuristics / Grounded Tool Routing Engine
    if (msgLower.includes('laptop') || msgLower.includes('machine learning') || msgLower.includes('coding') || msgLower.includes('under') || msgLower.includes('find') || msgLower.includes('search')) {
      // 1. Parse constraints
      let maxPrice: number | undefined = undefined;
      const budgetMatch = msgLower.match(/(?:under|below|budget|upto|within)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)k?/i);
      if (budgetMatch) {
        let val = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
        if (msgLower.includes('k') && val < 1000) val *= 1000;
        maxPrice = val;
      }

      const searchInput = {
        query: userMessage,
        category: 'Laptops',
        maxPrice: maxPrice || 80000,
        useCase: msgLower.includes('machine learning') || msgLower.includes('ml') ? 'machine learning' : 'coding'
      };

      const searchResult = await agentTools.search_products.execute(searchInput, context);
      toolCallsExecuted.push({ tool: 'search_products', input: searchInput, output: searchResult });

      uiSuggestions.showProducts = searchResult.products;

      const topProd = searchResult.products[0];
      if (topProd) {
        responseText = `I found ${searchResult.products.length} laptop options matching your intent. Based on your budget of ₹${(maxPrice || 80000).toLocaleString('en-IN')} and machine learning use case, I strongly recommend the **${topProd.name}** (₹${topProd.price.toLocaleString('en-IN')}). It features ${topProd.specifications.GPU || topProd.specifications.Chip || 'high compute hardware'} optimized for ML models and dev workflows.`;
      } else {
        responseText = `I searched our inventory for laptops matching your criteria under ₹${(maxPrice || 80000).toLocaleString('en-IN')}. Here are our top recommended options.`;
      }
    } else if (msgLower.includes('add') || msgLower.includes('cart') || msgLower.includes('yes') || msgLower.includes('buy')) {
      // 2. Add to Cart & Calculate Upsell
      let targetProdId = 'prod_laptop_8';
      const prodMatch = msgLower.match(/prod_[a-z0-9_]+/i);
      if (prodMatch) targetProdId = prodMatch[0];

      const addRes = await agentTools.add_to_cart.execute({ productId: targetProdId, quantity: 1 }, context);
      toolCallsExecuted.push({ tool: 'add_to_cart', input: { productId: targetProdId }, output: addRes });

      // Run Upsell Engine
      const cartProductIds = addRes.cart.items.map((i: any) => i.productId);
      const upsellRes = await agentTools.calculate_upsell_opportunities.execute({ cartProductIds }, context);
      toolCallsExecuted.push({ tool: 'calculate_upsell_opportunities', input: { cartProductIds }, output: upsellRes });

      if (upsellRes.upsellOpportunities && upsellRes.upsellOpportunities.length > 0) {
        uiSuggestions.showUpsell = upsellRes.upsellOpportunities[0];
        responseText = `Added **${targetProdId}** to your cart! Based on purchase history analysis, ${upsellRes.upsellOpportunities[0].similarCustomerPurchasePercentage}% of similar customers also purchased the **${upsellRes.upsellOpportunities[0].product.name}** (₹${upsellRes.upsellOpportunities[0].product.price.toLocaleString('en-IN')}). ${upsellRes.upsellOpportunities[0].reason} Would you like to add it to your order?`;
      } else {
        responseText = `Added item to your cart! Your current subtotal is ₹${addRes.cart.subtotal.toLocaleString('en-IN')}. Ready to proceed to checkout?`;
      }
    } else if (msgLower.includes('checkout') || msgLower.includes('pay') || msgLower.includes('confirm')) {
      // 3. Create Order
      const orderRes = await agentTools.create_order.execute({ isAiAssisted: true }, context);
      toolCallsExecuted.push({ tool: 'create_order', input: { isAiAssisted: true }, output: orderRes });

      uiSuggestions.showOrderConfirmation = orderRes;
      responseText = `I have created Order #${orderRes.orderId} for a total of ₹${orderRes.totalAmount.toLocaleString('en-IN')} (includes 5% AI discount savings). Please review your order items and click **Confirm Payment** below to open Razorpay Checkout.`;
    } else if (msgLower.includes('increase revenue') || msgLower.includes('sales') || msgLower.includes('merchant') || msgLower.includes('opportunity')) {
      // 4. Merchant Copilot Insight & Campaign Proposal
      const analyticsRes = await agentTools.get_merchant_analytics.execute({}, context);
      toolCallsExecuted.push({ tool: 'get_merchant_analytics', input: {}, output: analyticsRes });

      const opp = analyticsRes.analytics.revenueOpportunities[0];
      responseText = `Analysis of sales records indicates **${opp.description}** Estimated incremental revenue opportunity: **₹${(opp.estimatedRevenue / 100000).toFixed(1)} Lakhs**. I recommend launching a targeted campaign: **"${opp.title}"**.`;

      const campRes = await agentTools.generate_campaign.execute({
        title: opp.title,
        description: opp.description,
        targetSegment: opp.targetSegment,
        targetProductId: 'prod_hub_1',
        offerDiscountPercentage: 10,
        budget: 50000,
        estimatedRevenue: opp.estimatedRevenue
      }, context);

      toolCallsExecuted.push({ tool: 'generate_campaign', input: {}, output: campRes });
      uiSuggestions.showCampaignProposal = campRes.campaign;
    } else {
      responseText = `Hello! I am your AI Commerce & Growth Agent. I can help you search laptops by specs & budget, recommend compatible accessories, build your cart, and process Razorpay checkout. How can I assist you today?`;
    }

    // Log Action in Database Audit Log
    const actionId = `act_${Date.now()}`;
    const actionRecord = {
      actionId,
      agentType: msgLower.includes('revenue') || msgLower.includes('merchant') ? 'GROWTH_AGENT' : 'COMMERCE_AGENT',
      actionName: toolCallsExecuted[0]?.tool || 'conversational_response',
      toolUsed: toolCallsExecuted[0]?.tool || 'none',
      inputPayload: { message: userMessage },
      outputPayload: { responseText, uiSuggestions },
      reasoning: 'Grounded tool execution over MongoDB and Neo4j datasets.',
      status: 'EXECUTED',
      confirmationRequired: false,
      confirmationReceived: false,
      createdAt: new Date().toISOString()
    };

    const memoryStore = getInMemoryStore();
    memoryStore.agentActions.push(actionRecord);

    const db = getMongoDb();
    if (db) {
      db.collection('agent_actions').insertOne(actionRecord as any).catch(() => {});
    }

    return {
      message: responseText,
      toolCalls: toolCallsExecuted,
      agentActionId: actionId,
      uiSuggestions
    };
  }
}

export const defaultAgentOrchestrator = new GeminiAgentProvider();
