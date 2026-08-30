import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameter schema',
        details: err.errors
      },
      requestId
    });
  }

  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    },
    requestId
  });
}
