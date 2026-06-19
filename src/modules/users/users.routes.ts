import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import * as usersController from './users.controller.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Devuelve alumnos, profesores y administradores (campos básicos).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BasicUser'
 *       401:
 *         description: No autorizado
 */
router.get('/', auth, usersController.getUsers);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicUser'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *   patch:
 *     summary: Actualizar perfil propio
 *     description: Si cambia el email, se actualiza Firebase y puede devolverse un nuevo JWT.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/BasicUser' }
 *                 token: { type: string, description: 'Presente si cambió el email' }
 *       400:
 *         description: Email inválido
 *       409:
 *         description: Email ya en uso
 */
router.get('/me', auth, usersController.getMe);
router.patch('/me', auth, usersController.updateMe);

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Cambiar contraseña (Firebase)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Contraseña actual incorrecta o datos inválidos
 */
router.patch('/me/password', auth, usersController.updateMyPassword);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
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
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicUser'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', auth, usersController.getUserById);

export default router;
