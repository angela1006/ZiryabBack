import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { auth } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar usuario en la BD local
 *     description: |
 *       Tras crear la cuenta en Firebase en el cliente, envía el ID token (`token`) junto con los datos del perfil.
 *       Devuelve JWT en cuerpo y cookie httpOnly `auth_token`.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuario registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', authLimiter, AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Valida el ID token de Firebase, emite JWT y cookie `auth_token`.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales o token inválidos
 *       400:
 *         description: Petición inválida
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Usuario autenticado actual
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/AuthUser' }
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', auth, AuthController.me);

/**
 * @swagger
 * /api/auth/verify-firebase:
 *   post:
 *     summary: Verificar token de Firebase
 *     description: Comprueba que un ID token de Firebase sea válido y devuelve el UID.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyFirebaseInput'
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 firebaseUID: { type: string }
 *       401:
 *         description: Token inválido
 */
router.post('/verify-firebase', authLimiter, AuthController.verifyFirebaseToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Elimina la cookie `auth_token`.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessage'
 */
router.post('/logout', auth, AuthController.logout);

export default router;
