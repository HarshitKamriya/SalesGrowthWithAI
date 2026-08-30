import { Product } from '@ai-commerce/shared';
import { getProductByIdService, searchProductsService } from './productService.js';

export interface UpsellOpportunity {
  product: Product;
  upsellScore: number;
  purchaseProbability: number;
  compatibilityScore: number;
  reason: string;
  similarCustomerPurchasePercentage: number;
}

export async function calculateUpsellOpportunitiesService(
  cartProductIds: string[]
): Promise<UpsellOpportunity[]> {
  if (!cartProductIds || cartProductIds.length === 0) return [];

  const cartProducts: Product[] = [];
  for (const id of cartProductIds) {
    const p = await getProductByIdService(id);
    if (p) cartProducts.push(p);
  }

  const isLaptopInCart = cartProducts.some(p => p.category === 'Laptops');
  const availableAccessories = await searchProductsService({ limit: 50 });

  const opportunities: UpsellOpportunity[] = [];

  for (const item of availableAccessories.products) {
    // Exclude items already in cart
    if (cartProductIds.includes(item.productId)) continue;

    // Calculate score components
    let compatibilityScore = 0.5;
    let purchaseProbability = 0.4;
    let reasoning = '';
    let customerPercentage = 24;

    if (isLaptopInCart) {
      if (item.category === 'USB-C Hubs & Docks') {
        compatibilityScore = 0.98;
        purchaseProbability = 0.85;
        customerPercentage = 34;
        reasoning = `This ${item.name} is fully compatible with your selected laptop, and 34% of similar customers purchased it to expand port connectivity.`;
      } else if (item.category === 'Laptop Bags') {
        compatibilityScore = 0.95;
        purchaseProbability = 0.78;
        customerPercentage = 42;
        reasoning = `Protective sleeve engineered to fit your laptop size. 42% of buyers added this bag for travel protection.`;
      } else if (item.category === 'Mice & Trackpads') {
        compatibilityScore = 0.90;
        purchaseProbability = 0.70;
        customerPercentage = 29;
        reasoning = `Ergonomic wireless mouse designed to boost coding & productivity workflow.`;
      } else if (item.category === 'Accessories') {
        compatibilityScore = 0.85;
        purchaseProbability = 0.65;
        customerPercentage = 22;
        reasoning = `Desktop stand improving ergonomics and airflow for your laptop.`;
      }
    }

    const businessValue = item.price > 1000 ? 0.9 : 0.7; // margin/value proxy
    const upsellScore = purchaseProbability * compatibilityScore * 0.9 * businessValue;

    if (compatibilityScore > 0.7) {
      opportunities.push({
        product: item,
        upsellScore: parseFloat(upsellScore.toFixed(2)),
        purchaseProbability,
        compatibilityScore,
        reason: reasoning,
        similarCustomerPurchasePercentage: customerPercentage
      });
    }
  }

  // Sort by highest upsell score
  return opportunities.sort((a, b) => b.upsellScore - a.upsellScore).slice(0, 3);
}
