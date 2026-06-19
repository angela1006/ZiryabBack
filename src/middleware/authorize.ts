import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware que restringe el acceso según los roles permitidos
 * @param allowedRoles Lista de roles que pueden acceder
 * @returns Middleware function
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Verificar que el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ 
        message: 'No autenticado.' 
      });
    }

    // 2. Verificar que el rol está permitido
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `No tienes permiso. Necesitas ser uno de: ${allowedRoles.join(', ')}`,
      });
    }

    // 3. Si todo OK, continuar
    next();
  };
}
