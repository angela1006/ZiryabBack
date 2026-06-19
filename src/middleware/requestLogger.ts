import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    // req.path es relativo al subrouter que respondió (p. ej. GET /api/notifications → se logueaba "GET /").
    const raw = req.originalUrl ?? req.url ?? '';
    const pathForLog = raw.includes('?') ? raw.slice(0, raw.indexOf('?')) : raw;
    const message = `${req.method} ${pathForLog} ${res.statusCode} ${duration}ms`;
    
    if (res.statusCode >= 500) {
      logger.error(message);
    } else if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
}

