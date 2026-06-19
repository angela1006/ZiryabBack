import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware para restringir el acceso: permite a roles superiores paso libre, 
 * pero si es STUDENT asegura que el ID que intenta consultar coincide con su ID autenticado.
 * 
 * @param roles Roles con acceso global (ej: ['ADMIN', 'TEACHER'])
 * @param idParamName El nombre de la variable en la URL (ej: 'idStudent' o 'id')
 */
export const restrictToSelfOrRoles = (roles: string[], idParamName: string = 'idStudent') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    // Asegurar que el usuario pasó por el middleware 'auth' primero
    if (!user) {
      res.status(401).json({ success: false, message: 'No autenticado. Falta token.' });
      return;
    }

    // Permitir paso libre a los roles globales definidos
    if (roles.includes(user.role)) {
      next();
      return;
    }

    // Si el usuario es estudiante...
    if (user.role === 'STUDENT') {
      const paramIdValue = req.params[idParamName];
      
      // Si el endpoint no tiene como tal un parámetro (como un getAll), denegamos, ya que
      // no es una consulta concreta de su "Self", es un listado global.
      if (!paramIdValue) {
        res.status(403).json({ success: false, message: 'Acceso denegado: No tienes permisos para ver listados globales.' });
        return;
      }
      
      const requestedId = parseInt(paramIdValue, 10);
      
      // Validamos que el ID de la URL pertenezca al alumno que está logueado
      if (requestedId === user.sub) {
        next();
        return;
      } else {
        res.status(403).json({ success: false, message: 'Acceso denegado: No puedes ver los datos de otros alumnos.' });
        return;
      }
    }

    // Bloqueo por defecto para roles no contemplados
    res.status(403).json({ success: false, message: 'Acceso denegado: Rol no autorizado.' });
    return;
  };
};
