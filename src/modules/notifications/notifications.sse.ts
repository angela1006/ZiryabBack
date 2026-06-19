import type { Response } from 'express';
import { logger } from '../../utils/logger.js';

const clientsByUid = new Map<string, Set<Response>>();

/**
 * Registra una respuesta HTTP abierta como cliente SSE para un usuario (Firebase UID).
 */
export function registerClient(uid: string, res: Response): void {
  let set = clientsByUid.get(uid);
  if (!set) {
    set = new Set();
    clientsByUid.set(uid, set);
  }
  set.add(res);
}

/**
 * Elimina un cliente SSE del mapa cuando la conexión se cierra.
 */
export function removeClient(uid: string, res: Response): void {
  const set = clientsByUid.get(uid);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) {
    clientsByUid.delete(uid);
  }
}

/**
 * Envía el payload como evento SSE `data:` a todas las pestañas conectadas del usuario.
 */
export function emitToUser(uid: string, data: unknown): void {
  const set = clientsByUid.get(uid);
  if (!set || set.size === 0) return;

  let payload: string;
  try {
    payload = typeof data === 'string' ? data : JSON.stringify(data);
  } catch (err) {
    logger.warn('SSE emitToUser: no se pudo serializar payload', err);
    return;
  }

  const chunk = `data: ${payload}\n\n`;
  const stale: Response[] = [];

  for (const res of set) {
    try {
      if (res.writableEnded || !res.writable) {
        stale.push(res);
        continue;
      }
      res.write(chunk);
    } catch {
      stale.push(res);
    }
  }

  for (const res of stale) {
    removeClient(uid, res);
    try {
      if (!res.writableEnded) {
        res.end();
      }
    } catch {
      // ignorar cierre repetido
    }
  }
}
