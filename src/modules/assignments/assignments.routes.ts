import { Router } from 'express';
import * as assignmentsController from './assignments.controller.js';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

/**
 * @swagger
 * /api/assignments/bulk:
 *   post:
 *     summary: Alta masiva de asignaciones docente-asignatura-grupo
 *     description: Solo ADMIN. Respuesta con creadas, duplicadas y errores por fila.
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignments]
 *             properties:
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [idTeacher, idSubject, idGroup, schoolYear]
 *                   properties:
 *                     idTeacher: { type: integer }
 *                     idSubject: { type: integer }
 *                     idGroup: { type: integer }
 *                     schoolYear: { type: string }
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, SUSPENDED, ILLNESS, EXCEDENCE, WITHDRAWN, STANDBY]
 *     responses:
 *       200:
 *         description: Resultado parcial (creadas, duplicadas, errores)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     created: { type: array, items: { type: object } }
 *                     duplicates: { type: array, items: { type: object } }
 *                     errors: { type: array, items: { type: object } }
 *       400:
 *         description: Cuerpo inválido (Zod)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string }
 *                 errors: { type: object }
 */
router.post(
  '/bulk',
  auth,
  authorize(['ADMIN']),
  assignmentsController.postAssignmentsBulk,
);

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Crear una asignación docente-asignatura-grupo
 *     description: Solo ADMIN. Conflicto 409 si ya existe misma asignatura+grupo+año.
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idTeacher, idSubject, idGroup, schoolYear]
 *             properties:
 *               idTeacher: { type: integer }
 *               idSubject: { type: integer }
 *               idGroup: { type: integer }
 *               schoolYear: { type: string }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED, ILLNESS, EXCEDENCE, WITHDRAWN, STANDBY]
 *     responses:
 *       201:
 *         description: Asignación creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Asignación creada }
 *                 data: { type: object }
 *       409:
 *         description: Duplicado (misma asignatura+grupo+año)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     existingId: { type: integer }
 *       400:
 *         description: Validación Zod o FK inexistente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string }
 *                 errors: { type: object }
 */
router.post('/', auth, authorize(['ADMIN']), assignmentsController.postAssignment);

/**
 * @swagger
 * /api/assignments/by-course/{idCourse}:
 *   get:
 *     summary: Asignaciones por ciclo, grade y año escolar
 *     description: TeacherOnSubjectOnGroup filtradas por idCourse (vía subject), grade y schoolYear.
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCourse
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: grade
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *       - in: query
 *         name: schoolYear
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-2025"
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object } }
 *                 count: { type: integer }
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Ciclo no encontrado
 */
router.get(
  '/by-course/:idCourse',
  auth,
  authorize(['ADMIN', 'TEACHER']),
  assignmentsController.getAssignmentsByCourse,
);

/**
 * @route   GET /api/assignments/teacher/:idTeacher?schoolYear=2024-2025
 * @desc    Asignaciones de un profesor en un año académico (TeacherOnSubjectOnGroup)
 * @access  Admin, Teacher
 */
router.get(
  '/teacher/:idTeacher',
  auth,
  authorize(['ADMIN', 'TEACHER']),
  assignmentsController.getAssignmentsByTeacher,
);

/**
 * @route   GET /api/assignments
 * @desc    Listar todas las asignaciones (TeacherOnSubjectOnGroup), sin filtrar
 * @access  Admin, Teacher
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), assignmentsController.getAllAssignments);

/**
 * @swagger
 * /api/assignments/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una asignación
 *     description: |
 *       Permite cambiar `status` e `isTutor`. Si `isTutor=true` y ya existe tutor
 *       para la misma clase (subject + group + schoolYear), devuelve 409.
 *     tags: [Assignments]
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
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED, ILLNESS, EXCEDENCE, WITHDRAWN, STANDBY]
 *               isTutor:
 *                 type: boolean
 *                 description: Si true, valida que no exista ya tutor para esta clase en este año
 *     responses:
 *       200:
 *         description: Asignación actualizada
 *       404:
 *         description: Asignación no encontrada
 *       409:
 *         description: Ya existe un tutor para esta clase en este año escolar
 */
router.patch('/:id', auth, authorize(['ADMIN']), assignmentsController.patchAssignment);

export default router;
