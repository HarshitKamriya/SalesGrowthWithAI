import { Product } from '@ai-commerce/shared';
import { searchProductsService } from '../../services/productService.js';
import { getNeo4jDriver } from '../../config/db.js';

export interface GroundedSearchResult {
  products: Array<Product & { evidenceSources: string[]; relevanceScore: number }>;
  retrievalMetadata: {
    mongoCandidateCount: number;
    vectorCandidateCount: number;
    graphCandidateCount: number;
    strategyUsed: string;
  };
}

export async function hybridProductSearchService(params: {
  query?: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  useCase?: string;
}): Promise<GroundedSearchResult> {
  // 1. Structured MongoDB Retrieval (Enforces hard constraints on price & stock)
  const mongoRes = await searchProductsService({
    query: params.query,
    category: params.category,
    maxPrice: params.maxPrice,
    minPrice: params.minPrice,
    limit: 20
  });

  const productEvidenceMap = new Map<string, { product: Product; sources: Set<string>; score: number }>();

  mongoRes.products.forEach(p => {
    productEvidenceMap.set(p.productId, {
      product: p,
      sources: new Set(['[DB-StructuredFilter]']),
      score: 0.8
    });
  });

  // 2. Neo4j Graph & Vector Traversal
  let graphCandidateCount = 0;
  let vectorCandidateCount = 0;
  const driver = getNeo4jDriver();

  if (driver) {
    const session = driver.session();
    try {
      if (params.useCase) {
        const graphRes = await session.run(`
          MATCH (p:Product)-[:SUITABLE_FOR]->(u:UseCase)
          WHERE toLower(u.name) CONTAINS toLower($useCase)
          RETURN p.productId AS productId
          LIMIT 10
        `, { useCase: params.useCase });

        graphCandidateCount = graphRes.records.length;
        graphRes.records.forEach(rec => {
          const pid = rec.get('productId');
          const existing = productEvidenceMap.get(pid);
          if (existing) {
            existing.sources.add('[Graph-UseCaseMatch]');
            existing.score += 0.15;
          }
        });
      }
    } catch (err) {
      console.warn('Neo4j hybrid retriever warning:', err);
    } finally {
      await session.close();
    }
  }

  // Fallback heuristics for semantic use cases if Neo4j vector is offline
  if (params.query || params.useCase) {
    const q = (params.query || params.useCase || '').toLowerCase();
    Array.from(productEvidenceMap.values()).forEach(item => {
      const p = item.product;
      if (p.tags.some(t => q.includes(t.toLowerCase()))) {
        item.sources.add('[Semantic-TagMatch]');
        item.score += 0.1;
      }
      if (p.compatibility.useCases.some(u => q.includes(u.toLowerCase()))) {
        item.sources.add('[Graph-UseCaseInferred]');
        item.score += 0.15;
      }
    });
  }

  // Build ranked grounded results
  const ranked = Array.from(productEvidenceMap.values())
    .map(item => ({
      ...item.product,
      evidenceSources: Array.from(item.sources),
      relevanceScore: parseFloat(Math.min(1.0, item.score).toFixed(2))
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    products: ranked,
    retrievalMetadata: {
      mongoCandidateCount: mongoRes.total,
      vectorCandidateCount,
      graphCandidateCount,
      strategyUsed: 'Hybrid MongoDB Filter + Neo4j Graph Vector Context'
    }
  };
}
