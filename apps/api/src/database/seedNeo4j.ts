import { getNeo4jDriver, connectNeo4j } from '../config/db.js';
import { generate100Products } from './seedMongo.js';

export async function seedNeo4jDatabase() {
  const driver = getNeo4jDriver();
  if (!driver) {
    console.log('⚠️ Neo4j offline. Graph RAG operating in fallback mode.');
    return;
  }

  const session = driver.session();
  try {
    console.log('🌱 Initializing Neo4j Knowledge Graph schemas and constraints...');
    
    // Create Constraints
    await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:Product) REQUIRE p.productId IS UNIQUE');
    await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (c:Customer) REQUIRE c.customerId IS UNIQUE');
    await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (cat:Category) REQUIRE cat.name IS UNIQUE');
    await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (m:Merchant) REQUIRE m.merchantId IS UNIQUE');

    // Create Vector Index for Product semantic discovery
    try {
      await session.run(`
        CREATE VECTOR INDEX productEmbeddingIndex IF NOT EXISTS
        FOR (p:Product) ON (p.embedding)
        OPTIONS { indexConfig: {
          \`vector.dimensions\`: 768,
          \`vector.similarity_function\`: 'cosine'
        }}
      `);
    } catch (err) {
      console.warn('Neo4j vector index creation note:', err);
    }

    const products = generate100Products();
    console.log(`Ingesting ${products.length} products into Neo4j Graph...`);

    for (const p of products) {
      await session.run(`
        MERGE (p:Product { productId: $productId })
        SET p.name = $name,
            p.category = $category,
            p.brand = $brand,
            p.price = $price,
            p.rating = $rating,
            p.tags = $tags,
            p.description = $description
        MERGE (c:Category { name: $category })
        MERGE (p)-[:BELONGS_TO]->(c)
      `, {
        productId: p.productId,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        rating: p.rating,
        tags: p.tags,
        description: p.description
      });

      // Add COMPATIBLE_WITH & FREQUENTLY_BOUGHT_WITH edges
      for (const compId of p.compatibility.compatibleProductIds) {
        await session.run(`
          MATCH (p1:Product { productId: $p1Id }), (p2:Product { productId: $p2Id })
          MERGE (p1)-[:COMPATIBLE_WITH { score: 0.95 }]->(p2)
        `, { p1Id: p.productId, p2Id: compId });
      }

      for (const fbId of p.frequentlyBoughtWith) {
        await session.run(`
          MATCH (p1:Product { productId: $p1Id }), (p2:Product { productId: $p2Id })
          MERGE (p1)-[:FREQUENTLY_BOUGHT_WITH { coCount: 34 }]->(p2)
        `, { p1Id: p.productId, p2Id: fbId });
      }
    }

    console.log('✅ Neo4j Knowledge Graph successfully seeded');
  } catch (error) {
    console.error('Error seeding Neo4j:', error);
  } finally {
    await session.close();
  }
}

if (process.argv[1] && process.argv[1].includes('seedNeo4j')) {
  connectNeo4j().then(async () => {
    await seedNeo4jDatabase();
    process.exit(0);
  });
}

