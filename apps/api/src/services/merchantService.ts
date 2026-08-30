import { MerchantAnalytics, Campaign } from '@ai-commerce/shared';
import { getMongoDb, getInMemoryStore, getNeo4jDriver } from '../config/db.js';

export async function getMerchantAnalyticsService(): Promise<MerchantAnalytics> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  let orders = Array.from(memoryStore.orders.values());
  if (db) {
    try {
      const dbOrders = await db.collection('orders').find({ merchantId: 'merch_demo_1' }).toArray();
      if (dbOrders.length > 0) orders = dbOrders as any;
    } catch (err) {}
  }

  const completedOrders = orders.filter(o => o.paymentStatus === 'CAPTURED' || o.orderStatus === 'COMPLETED');
  const aiOrders = completedOrders.filter(o => o.isAiAssisted);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const aiAssistedRevenue = aiOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = completedOrders.length || 1;
  const aiOrdersCount = aiOrders.length || 1;

  const averageOrderValue = Math.round(totalRevenue / totalOrdersCount);
  const aiAssistedAOV = Math.round(aiAssistedRevenue / aiOrdersCount);

  // Top Products
  const productSalesMap = new Map<string, { name: string; salesCount: number; revenue: number }>();
  completedOrders.forEach(o => {
    o.items.forEach((i: { productId: string; name: string; quantity: number; price: number }) => {
      const existing = productSalesMap.get(i.productId) || { name: i.name, salesCount: 0, revenue: 0 };
      existing.salesCount += i.quantity;
      existing.revenue += i.price * i.quantity;
      productSalesMap.set(i.productId, existing);
    });
  });

  const topProducts = Array.from(productSalesMap.entries())
    .map(([productId, val]) => ({ productId, ...val }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    aiAssistedRevenue,
    averageOrderValue,
    aiAssistedAOV,
    totalOrders: completedOrders.length,
    conversionRate: 0.142, // 14.2%
    upsellConversionRate: 0.34, // 34%
    crossSellRevenue: Math.round(aiAssistedRevenue * 0.42),
    topProducts,
    revenueOpportunities: [
      {
        id: 'opp_1',
        title: 'Laptop Purchaser Accessory Bundle',
        description: '2,341 customers purchased laptops but did not purchase compatible USB-C hubs or protection bags.',
        estimatedRevenue: 1280000, // ₹12.8L
        targetSegment: 'Laptop Buyers Without Accessories',
        recommendedProduct: 'Anker 7-in-1 USB-C Hub'
      },
      {
        id: 'opp_2',
        title: 'Ergonomic Desk Accessories Cross-Sell',
        description: '890 gaming laptop buyers have high engagement with mechanical keyboard pages but abandoned cart.',
        estimatedRevenue: 445000, // ₹4.45L
        targetSegment: 'Gaming Laptop Buyers',
        recommendedProduct: 'Keychron K2 Mechanical Keyboard'
      }
    ]
  };
}

export async function getCampaignsService(): Promise<Campaign[]> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  let campaigns = Array.from(memoryStore.campaigns.values());
  if (db) {
    try {
      const dbCampaigns = await db.collection('campaigns').find({ merchantId: 'merch_demo_1' }).toArray();
      if (dbCampaigns.length > 0) campaigns = dbCampaigns as any;
    } catch (err) {}
  }
  return campaigns;
}

export async function createCampaignService(payload: Omit<Campaign, 'campaignId' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Campaign> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  const campaignId = `camp_${Date.now()}`;
  const newCampaign: Campaign = {
    ...payload,
    campaignId,
    merchantId: 'merch_demo_1',
    status: 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  memoryStore.campaigns.set(campaignId, newCampaign);
  if (db) {
    try {
      await db.collection('campaigns').insertOne(newCampaign as any);
    } catch (err) {}
  }
  return newCampaign;
}

export async function approveCampaignService(campaignId: string): Promise<Campaign> {
  const memoryStore = getInMemoryStore();
  const db = getMongoDb();

  let campaign = memoryStore.campaigns.get(campaignId);
  if (!campaign && db) {
    try {
      campaign = (await db.collection('campaigns').findOne({ campaignId })) as unknown as Campaign;
    } catch (err) {}
  }

  if (!campaign) {
    throw { statusCode: 404, code: 'CAMPAIGN_NOT_FOUND', message: `Campaign ${campaignId} not found` };
  }

  campaign.status = 'APPROVED';
  campaign.approvedAt = new Date().toISOString();
  campaign.updatedAt = new Date().toISOString();

  // Simulate launching campaign in demo mode
  setTimeout(() => {
    campaign!.status = 'RUNNING';
    campaign!.actualRevenue = Math.round(campaign!.estimatedRevenue * 0.85);
    memoryStore.campaigns.set(campaignId, campaign!);
  }, 1000);

  memoryStore.campaigns.set(campaignId, campaign);
  if (db) {
    try {
      await db.collection('campaigns').updateOne({ campaignId }, { $set: campaign });
    } catch (err) {}
  }

  return campaign;
}

export async function getKnowledgeGraphService(): Promise<any> {
  const driver = getNeo4jDriver();
  
  if (driver) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (n)-[r]->(m)
        RETURN labels(n)[0] AS sourceType, n.name AS sourceName, n.productId AS sourceId,
               type(r) AS relationship,
               labels(m)[0] AS targetType, m.name AS targetName, m.productId AS targetId
        LIMIT 40
      `);
      const nodesMap = new Map();
      const links: any[] = [];

      result.records.forEach(rec => {
        const sourceId = rec.get('sourceId') || rec.get('sourceName');
        const targetId = rec.get('targetId') || rec.get('targetName');

        if (!nodesMap.has(sourceId)) {
          nodesMap.set(sourceId, { id: sourceId, label: rec.get('sourceName') || sourceId, type: rec.get('sourceType') });
        }
        if (!nodesMap.has(targetId)) {
          nodesMap.set(targetId, { id: targetId, label: rec.get('targetName') || targetId, type: rec.get('targetType') });
        }
        links.push({
          source: sourceId,
          target: targetId,
          relation: rec.get('relationship')
        });
      });

      return { nodes: Array.from(nodesMap.values()), links };
    } catch (err) {
      console.warn('Neo4j Cypher graph lookup fallback:', err);
    } finally {
      await session.close();
    }
  }

  // Grounded Demo Knowledge Graph Structure
  return {
    nodes: [
      { id: 'cat_ml', label: 'Machine Learning', type: 'UseCase' },
      { id: 'prod_laptop_8', label: 'ASUS TUF Gaming A15 (ML Notebook)', type: 'Product' },
      { id: 'prod_hub_1', label: 'Anker 7-in-1 USB-C Hub', type: 'Product' },
      { id: 'prod_bag_1', label: 'Peak Design Laptop Backpack', type: 'Product' },
      { id: 'prod_mouse_1', label: 'Logitech MX Master 3S', type: 'Product' },
      { id: 'cust_rahul', label: 'Rahul Sharma (Customer)', type: 'Customer' }
    ],
    links: [
      { source: 'prod_laptop_8', target: 'cat_ml', relation: 'SUITABLE_FOR' },
      { source: 'prod_laptop_8', target: 'prod_hub_1', relation: 'COMPATIBLE_WITH' },
      { source: 'prod_laptop_8', target: 'prod_bag_1', relation: 'FREQUENTLY_BOUGHT_WITH' },
      { source: 'prod_laptop_8', target: 'prod_mouse_1', relation: 'FREQUENTLY_BOUGHT_WITH' },
      { source: 'cust_rahul', target: 'prod_laptop_8', relation: 'PURCHASED' }
    ]
  };
}
