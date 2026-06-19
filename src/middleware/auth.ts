import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// ============================================
// INTERFACES Y TIPOS
// ============================================

/**
 * Payload del JWT con nuestros campos personalizados
 * Con exactOptionalPropertyTypes: true, no podemos usar undefined
 */
interface CustomJwtPayload {
  sub: number;
  email: string;
  firebaseUID: string;
  role: string;
  iat?: number; // Esto significa que puede ser omitido, pero si existe debe ser number
  exp?: number;
}

// Extender la interfaz de Express.Request para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Middleware que valida el JWT en cada petición protegida
 */
export function auth(req: Request, res: Response, next: NextFunction): void {
  // Prioriza cookie, pero mantiene compatibilidad con clientes que envían Bearer token
  const cookieToken = req.cookies.auth_token;
  const authorizationHeader = req.headers.authorization;
  const bearerToken =
    authorizationHeader && authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.substring('Bearer '.length).trim()
      : undefined;
  /** EventSource no puede enviar cabeceras; aceptar token en query (p. ej. SSE). */
  const queryToken =
    typeof req.query.token === 'string' && req.query.token.length > 0
      ? req.query.token
      : undefined;
  const token = cookieToken || bearerToken || queryToken;

  if (!token) {
    res.status(401).json({
      message: 'No autorizado',
    });
    return;
  }

  try {
    // 3. Verificar el token - cast a any porque jwt.verify tiene tipos complejos
    const payload: any = jwt.verify(token, env.JWT_SECRET);

    // 4. Validar estructura
    if (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.sub === 'number' &&
      typeof payload.email === 'string' &&
      typeof payload.firebaseUID === 'string' &&
      typeof payload.role === 'string'
    ) {
      // 5. Construir usuario con tipos correctos
      const user: CustomJwtPayload = {
        sub: payload.sub,
        email: payload.email,
        firebaseUID: payload.firebaseUID,
        role: payload.role,
      };

      // Agregar iat solo si es un número válido
      if (typeof payload.iat === 'number' && !isNaN(payload.iat)) {
        user.iat = payload.iat;
      }

      // Agregar exp solo si es un número válido
      if (typeof payload.exp === 'number' && !isNaN(payload.exp)) {
        user.exp = payload.exp;
      }

      req.user = user;
      next();
      return;
    }

    res.status(401).json({
      message: 'Token inválido. Estructura incorrecta.',
    });
    return;
  } catch (error) {
    // Token expirado, firma incorrecta, etc.
    res.status(401).json({
      message: 'Token inválido',
      error: (error as Error).message,
    });
    return;
  }
}
