import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as notificationsController from './notifications.controller.js';

const router = Router();

/**
 * @swagger
 * /api/notifications/events:
 *   get:
 *     summary: Conexión SSE — notificaciones en tiempo real del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - text/event-stream
 *     responses:
 *       200:
 *         description: Flujo SSE (event connected, luego cada notificación nueva como event message con JSON)
 *       401:
 *         description: No autorizado
 */
router.get('/events', auth, notificationsController.subscribe);

/**
 * @swagger
 * /api/notifications/all:
 *   get:
 *     summary: Lista todas las notificaciones del sistema (solo ADMIN)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recipientFirebaseUID
 *         schema:
 *           type: string
 *         description: Filtrar por Firebase UID del destinatario
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo (INFO, TASK, ASSISTANCE, etc.)
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filtrar por leídas o no leídas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lista paginada de todas las notificaciones
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo ADMIN
 */
router.get('/all', auth, authorize(['ADMIN']), notificationsController.getAllNotifications);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Lista notificaciones filtradas por destinatario (Firebase UID)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recipientFirebaseUID
 *         schema:
 *           type: string
 *         description: Firebase UID del destinatario. Por defecto, el del usuario autenticado. Solo ADMIN puede consultar otro UID.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Lista paginada de notificaciones
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido consultar notificaciones de otro usuario
 */
router.get('/', auth, notificationsController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marca una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación actualizada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 */
router.patch('/:id/read', auth, notificationsController.markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Actualiza una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *               isRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notificación actualizada
 *       400:
 *         description: ID o cuerpo inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 *   delete:
 *     summary: Elimina una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación eliminada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Notificación no encontrada
 */
router.patch('/:id', auth, notificationsController.updateNotification);
router.delete('/:id', auth, notificationsController.deleteNotification);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crea una notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message]
 *             properties:
 *               recipientFirebaseUID:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notificación creada
 *       400:
 *         description: Payload inválido
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.post('/', auth, notificationsController.createNotification);

export default router;
