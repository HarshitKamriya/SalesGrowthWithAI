import { MongoClient, Db } from 'mongodb';
import neo4j, { Driver } from 'neo4j-driver';
import { Redis } from 'ioredis';
import { env } from './env.js';

let mongoClient: MongoClient | null = null;
let mongoDbInstance: Db | null = null;
let neo4jDriverInstance: Driver | null = null;
let redisClientInstance: Redis | null = null;

// In-Memory Fallback Store for seamless offline execution if DB is offline
const inMemoryStore = {
  users: new Map<string, any>(),
  products: new Map<string, any>(),
  categories: new Map<string, any>(),
  carts: new Map<string, any>(),
  orders: new Map<string, any>(),
  payments: new Map<string, any>(),
  events: new Array<any>(),
  campaigns: new Map<string, any>(),
  agentActions: new Array<any>(),
  auditLogs: new Array<any>()
};

export async function connectMongo(): Promise<Db | null> {
  try {
    mongoClient = new MongoClient(env.MONGODB_URI, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000
    });
    await mongoClient.connect();
    mongoDbInstance = mongoClient.db(env.MONGODB_DB_NAME);
    console.log('✅ Connected successfully to MongoDB');
    return mongoDbInstance;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed or timed out. Falling back to structured in-memory engine.');
    return null;
  }
}

export function getMongoDb(): Db | null {
  return mongoDbInstance;
}

export function getInMemoryStore() {
  return inMemoryStore;
}

export async function connectNeo4j(): Promise<Driver | null> {
  try {
    const driver = neo4j.driver(
      env.NEO4J_URI,
      neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD),
      { maxConnectionLifetime: 3000, connectionTimeout: 2000 }
    );
    await driver.verifyConnectivity();
    neo4jDriverInstance = driver;
    console.log('✅ Connected successfully to Neo4j Graph DB');
    return neo4jDriverInstance;
  } catch (error) {
    console.warn('⚠️ Neo4j connection failed or timed out. Graph RAG fallback mode enabled.');
    return null;
  }
}

export function getNeo4jDriver(): Driver | null {
  return neo4jDriverInstance;
}

export function getRedisClient(): Redis | null {
  if (!redisClientInstance) {
    try {
      redisClientInstance = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000
      });
      redisClientInstance.on('error', (err) => {
        // Silently handle redis errors in fallback mode
      });
    } catch {
      redisClientInstance = null;
    }
  }
  return redisClientInstance;
}

export async function closeDatabaseConnections(): Promise<void> {
  if (mongoClient) await mongoClient.close();
  if (neo4jDriverInstance) await neo4jDriverInstance.close();
  if (redisClientInstance) redisClientInstance.disconnect();
}
