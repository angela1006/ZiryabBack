import { Router } from 'express';
import * as enrollmentController from './enrollments.controller.js';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: Matrículas sin filtrar
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado raw de enrollments
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), enrollmentController.getAllEnrollmentsRaw);

/**
 * @swagger
 * /api/enrollments/by-filters:
 *   get:
 *     summary: Matrículas por asignatura, grupo y curso escolar
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idSubject
 *         schema:
 *           type: integer
 *       - in: query
 *         name: idGroup
 *         schema:
 *           type: integer
 *       - in: query
 *         name: schoolYear
 *         schema:
 *           type: string
 *           example: '2024-2025'
 *     responses:
 *       200:
 *         description: Alumnos del grupo/asignatura
 */
router.get('/by-filters', auth, authorize(['ADMIN', 'TEACHER']), enrollmentController.getAllEnrollments);

/**
 * @swagger
 * /api/enrollments/teacher/{idTeacher}:
 *   get:
 *     summary: Asignaciones de un profesor
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeacher
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: schoolYear
 *         schema:
 *           type: string
 *           example: '2024-2025'
 *     responses:
 *       200:
 *         description: Assignments del profesor
 */
router.get('/teacher/:idTeacher', auth, authorize(['ADMIN', 'TEACHER']), enrollmentController.getAssignmentsByTeacher);

export default router;
