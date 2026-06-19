import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as classSessionController from './classSession.controller.js';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (GET - sin autenticación)
// ============================================

/**
 * @route   GET /api/sessions
 * @desc    Obtener todas las sesiones de clase
 * @access  Admin, Teacher
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.getAllSessions);

/**
 * @route   GET /api/sessions/active
 * @desc    Obtener o crear la sesión activa para un assignment en este momento
 * @access  Admin, Teacher
 */
router.get('/active', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.getActiveSession);

/**
 * @swagger
 * /api/sessions/suspend-preview:
 *   post:
 *     summary: Vista previa de sesiones a suspender (CURSO-110)
 *     description: Solo ADMIN. Cuenta sesiones SCHEDULED/COMPLETED en el rango y filtros opcionales.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dateFrom, dateTo]
 *             properties:
 *               dateFrom: { type: string, format: date, example: '2025-01-01' }
 *               dateTo: { type: string, format: date, example: '2025-01-31' }
 *               idCourse: { type: integer }
 *               idSubject: { type: integer }
 *               idGroup: { type: integer }
 *               idTeacher: { type: integer }
 *     responses:
 *       200:
 *         description: Número de sesiones que se suspenderían
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 12 }
 *       400:
 *         description: Cuerpo inválido
 *       401:
 *         description: No autorizado
 */
router.post(
  '/suspend-preview',
  auth,
  authorize(['ADMIN']),
  classSessionController.suspendPreview,
);

/**
 * @swagger
 * /api/sessions/bulk-suspend:
 *   post:
 *     summary: Suspensión masiva de sesiones (CURSO-110)
 *     description: Solo ADMIN. Pasa a CANCELLED las sesiones SCHEDULED/COMPLETED del filtro. Idempotente con ya canceladas.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dateFrom, dateTo]
 *             properties:
 *               dateFrom: { type: string, format: date }
 *               dateTo: { type: string, format: date }
 *               idCourse: { type: integer }
 *               idSubject: { type: integer }
 *               idGroup: { type: integer }
 *               idTeacher: { type: integer }
 *     responses:
 *       200:
 *         description: Sesiones actualizadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 12 }
 *       400:
 *         description: Cuerpo inválido
 *       401:
 *         description: No autorizado
 */
router.post('/bulk-suspend', auth, authorize(['ADMIN']), classSessionController.bulkSuspend);

/**
 * @swagger
 * /api/sessions/bulk-generate:
 *   post:
 *     summary: Generar sesiones en lote para una clase
 *     description: ADMIN/TEACHER. Genera SessionClass para cada WeekSchedule de una clase en el rango del año escolar (sept-junio).
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, schoolYear]
 *             properties:
 *               label: { type: string, example: "1º DAM - Mañana" }
 *               schoolYear: { type: string, example: "2024-2025" }
 *     responses:
 *       200:
 *         description: Sesiones generadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 created: { type: integer, example: 120 }
 *                 skipped: { type: integer, example: 0 }
 *                 message: { type: string }
 *       400:
 *         description: Error en la generación
 *       401:
 *         description: No autorizado
 */
router.post('/bulk-generate', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.bulkGenerate);

/**
 * @route   GET /api/sessions/:id
 * @desc    Obtener una sesión por ID
 * @access  Admin, Teacher
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.getSessionById);

/**
 * @route   GET /api/sessions/schedule/:idSchedule
 * @desc    Obtener sesiones de un horario específico
 * @access  Admin, Teacher
 */
router.get('/schedule/:idSchedule', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.getSessionsBySchedule);

// ============================================
// RUTAS PROTEGIDAS (POST, PUT, DELETE - solo ADMIN y TEACHER)
// ============================================

/**
 * @route   POST /api/sessions/start
 * @desc    Obtener o crear la sesión de hoy para una asignatura y profesor concretos
 * @access  Admin and Teacher
 */
router.post('/start', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.startSessionForSubject);

/**
 * @route   POST /api/sessions
 * @desc    Crear una nueva sesión de clase
 * @access  Admin and Teacher
 */
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.createSession);

/**
 * @route   PATCH /api/sessions/:id
 * @desc    Actualizar una sesión de clase
 * @access  Admin and Teacher
 */
router.patch('/:id', auth, authorize(['ADMIN', 'TEACHER']), classSessionController.updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Eliminar una sesión de clase
 * @access  Admin only
 */
router.delete('/:id', auth, authorize(['ADMIN']), classSessionController.deleteSession);

export default router;