import type { Request, Response } from 'express';
import * as notificationsService from './notifications.service.js';
import { registerClient, removeClient } from './notifications.sse.js';
import { updateNotificationBodySchema } from './notifications.schema.js';
import { logger } from '../../utils/logger.js';

const parsePositiveInt = (value: unknown, defaultValue: number): number | null => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const parseOptionalBoolean = (value: unknown): boolean | undefined | null => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return null;
};

const getRequesterFirebaseUID = (req: Request): string | null => {
  return req.user?.firebaseUID ?? null;
};

/**
 * SSE: mantiene abierta una conexión `text/event-stream` y envía ping periódico.
 */
export const subscribe = (req: Request, res: Response): void => {
  const firebaseUID = getRequesterFirebaseUID(req);
  if (!firebaseUID) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  if (typeof (res as unknown as { flushHeaders?: () => void }).flushHeaders === 'function') {
    (res as unknown as { flushHeaders: () => void }).flushHeaders();
  }

  registerClient(firebaseUID, res);

  res.write('event: connected\ndata: {}\n\n');

  const heartbeat = setInterval(() => {
    if (res.writableEnded || !res.writable) return;
    res.write(': ping\n\n');
  }, 30_000);

  const cleanup = (): void => {
    clearInterval(heartbeat);
    removeClient(firebaseUID, res);
    if (!res.writableEnded && res.writable) {
      try {
        res.end();
      } catch {
        // ignore
      }
    }
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
};

export const getAllNotifications = async (req: Request, res: Response) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 20);

  if (page === null || limit === null) {
    return res.status(400).json({
      message: 'Parámetros de paginación inválidos. page y limit deben ser enteros positivos',
    });
  }

  const isRead = parseOptionalBoolean(req.query.isRead);
  if (isRead === null) {
    return res.status(400).json({
      message: 'Parámetro isRead inválido. Use true o false',
    });
  }

  const recipientFirebaseUID =
    typeof req.query.recipientFirebaseUID === 'string'
      ? req.query.recipientFirebaseUID.trim() || undefined
      : undefined;

  const type =
    typeof req.query.type === 'string' ? req.query.type.trim() || undefined : undefined;

  try {
    const result = await notificationsService.findAll(page, limit, {
      recipientFirebaseUID,
      type,
      isRead,
    });
    return res.status(200).json({
      message: 'Notificaciones del sistema obtenidas correctamente',
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error al obtener todas las notificaciones', {
      message: err.message,
      stack: err.stack,
    });
    return res.status(500).json({ message: 'Error al obtener notificaciones del sistema' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const requesterFirebaseUID = getRequesterFirebaseUID(req);
  if (!requesterFirebaseUID) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 10);

  if (page === null || limit === null) {
    return res.status(400).json({
      message: 'Parámetros de paginación inválidos. page y limit deben ser enteros positivos',
    });
  }

  const recipientParam =
    typeof req.query.recipientFirebaseUID === 'string'
      ? req.query.recipientFirebaseUID.trim()
      : '';
  const recipientFirebaseUID = recipientParam || requesterFirebaseUID;

  if (recipientFirebaseUID !== requesterFirebaseUID && req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Solo un ADMIN puede consultar notificaciones de otros usuarios',
    });
  }

  try {
    const result = await notificationsService.findForRecipient(recipientFirebaseUID, page, limit);
    return res.status(200).json({
      message: 'Notificaciones obtenidas correctamente',
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error al obtener notificaciones', { message: err.message, stack: err.stack });
    return res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const requesterFirebaseUID = getRequesterFirebaseUID(req);
  if (!requesterFirebaseUID) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const id = parsePositiveInt(req.params.id, 0);
  if (!id) {
    return res.status(400).json({ message: 'ID de notificación inválido' });
  }

  try {
    const updated = await notificationsService.markAsRead(id, requesterFirebaseUID);
    return res.status(200).json({
      message: 'Notificación marcada como leída',
      data: updated,
    });
  } catch (error) {
    if ((error as Error).message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    return res.status(500).json({ message: 'Error al marcar notificación como leída' });
  }
};

export const updateNotification = async (req: Request, res: Response) => {
  const requesterFirebaseUID = getRequesterFirebaseUID(req);
  if (!requesterFirebaseUID) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const id = parsePositiveInt(req.params.id, 0);
  if (!id) {
    return res.status(400).json({ message: 'ID de notificación inválido' });
  }

  const parsed = updateNotificationBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? 'Cuerpo inválido',
    });
  }

  try {
    const updated = await notificationsService.update(
      id,
      parsed.data,
      requesterFirebaseUID,
      req.user?.role === 'ADMIN',
    );
    return res.status(200).json({
      message: 'Notificación actualizada correctamente',
      data: updated,
    });
  } catch (error) {
    if ((error as Error).message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    return res.status(500).json({ message: 'Error al actualizar notificación' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  const requesterFirebaseUID = getRequesterFirebaseUID(req);
  if (!requesterFirebaseUID) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const id = parsePositiveInt(req.params.id, 0);
  if (!id) {
    return res.status(400).json({ message: 'ID de notificación inválido' });
  }

  try {
    const deleted = await notificationsService.remove(
      id,
      requesterFirebaseUID,
      req.user?.role === 'ADMIN',
    );
    return res.status(200).json({
      message: 'Notificación eliminada correctamente',
      data: deleted,
    });
  } catch (error) {
    if ((error as Error).message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    return res.status(500).json({ message: 'Error al eliminar notificación' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  const requesterFirebaseUID = getRequesterFirebaseUID(req);
  if (!requesterFirebaseUID) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const { recipientFirebaseUID, title, message, type } = req.body as {
    recipientFirebaseUID?: string;
    title?: string;
    message?: string;
    type?: string;
  };

  const finalRecipient = recipientFirebaseUID?.trim() || requesterFirebaseUID;

  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({
      message: 'Los campos title y message son obligatorios',
    });
  }

  if (finalRecipient !== requesterFirebaseUID && req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      message: 'Solo un ADMIN puede crear notificaciones para otros usuarios',
    });
  }

  try {
    const created = await notificationsService.create({
      recipientFirebaseUID: finalRecipient,
      title: title.trim(),
      message: message.trim(),
      type,
    });
    return res.status(201).json({
      message: 'Notificación creada correctamente',
      data: created,
    });
  } catch {
    return res.status(500).json({ message: 'Error al crear notificación' });
  }
};
