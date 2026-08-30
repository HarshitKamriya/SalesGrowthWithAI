import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/db.js';

const localIdempotencyCache = new Map<string, { status: number; body: any }>();

export function idempotency(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    return next();
  }

  const redis = getRedisClient();
  const cacheKey = `idempotency:${idempotencyKey}`;

  // Check Redis or local cache
  if (localIdempotencyCache.has(idempotencyKey)) {
    const cached = localIdempotencyCache.get(idempotencyKey)!;
    return res.status(cached.status).json(cached.body);
  }

  // Intercept json response method to record output
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      localIdempotencyCache.set(idempotencyKey, {
        status: res.statusCode,
        body
      });
      if (redis) {
        redis.setex(cacheKey, 86400, JSON.stringify({ status: res.statusCode, body })).catch(() => {});
      }
    }
    return originalJson(body);
  };

  next();
}
