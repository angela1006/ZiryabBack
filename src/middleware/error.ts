import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`${req.method} ${req.path} - ${err.message}`);
  logger.error(err.stack);
  
  if (err.name === 'MulterError') {
    let message = 'Error al subir el archivo';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es demasiado grande. El límite es de 50MB.';
    }
    return res.status(400).json({ success: false, message });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Error interno' });
}
