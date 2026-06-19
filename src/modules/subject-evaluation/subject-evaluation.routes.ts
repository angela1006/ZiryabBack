import { Router } from 'express';
import * as subjectEvaluationController from './subject-evaluation.controller.js';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  CreateSubjectEvaluationSchema,
  BulkCreateSubjectEvaluationsSchema,
} from './subject-evaluation.schema.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subject Evaluations
 *   description: Gestión de evaluaciones por tutores
 */

/**
 * @swagger
 * /api/subject-evaluations/my:
 *   get:
 *     summary: Obtener mis evaluaciones (como alumno)
 *     tags: [Subject Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de evaluaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Evaluaciones recuperadas }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       enrollmentId: { type: integer, example: 8 }
 *                       subjectId: { type: integer, example: 3 }
 *                       subjectName: { type: string, example: Programación }
 *                       evaluations:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/SubjectEvaluation'
 */
router.get('/my', auth, authorize(['STUDENT']), subjectEvaluationController.getMySubjectEvaluations);

/**
 * @swagger
 * /api/subject-evaluations/tutored-groups:
 *   get:
 *     summary: Obtener las clases de las que soy tutor
 *     tags: [Subject Evaluations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clases tutoradas
 */
router.get('/tutored-groups', auth, authorize(['TEACHER']), subjectEvaluationController.getTutoredGroups);

/**
 * @swagger
 * /api/subject-evaluations/tutor-assignment/{idTutorAssignment}/period/{period}:
 *   get:
 *     summary: Obtener evaluaciones de una clase tutorada para un periodo
 *     tags: [Subject Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTutorAssignment
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [INITIAL, FIRST_TRIMESTER, SECOND_TRIMESTER, THIRD_TRIMESTER, FINAL]
 *     responses:
 *       200:
 *         description: Lista de evaluaciones
 */
router.get(
  '/tutor-assignment/:idTutorAssignment/period/:period',
  auth,
  authorize(['TEACHER']),
  subjectEvaluationController.getSubjectEvaluationsByTutorAssignmentAndPeriod,
);

/**
 * @swagger
 * /api/subject-evaluations:
 *   post:
 *     summary: Crear o actualizar una evaluación
 *     tags: [Subject Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectEvaluationInput'
 *     responses:
 *       200:
 *         description: Evaluación guardada
 */
router.post(
  '/',
  auth,
  authorize(['TEACHER']),
  validate(CreateSubjectEvaluationSchema),
  subjectEvaluationController.upsertSubjectEvaluation,
);

/**
 * @swagger
 * /api/subject-evaluations/bulk:
 *   post:
 *     summary: Crear o actualizar varias evaluaciones
 *     tags: [Subject Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [evaluations]
 *             properties:
 *               evaluations:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   $ref: '#/components/schemas/CreateSubjectEvaluationInput'
 *     responses:
 *       200:
 *         description: Evaluaciones guardadas
 */
router.post(
  '/bulk',
  auth,
  authorize(['TEACHER']),
  validate(BulkCreateSubjectEvaluationsSchema),
  subjectEvaluationController.bulkUpsertSubjectEvaluations,
);

export default router;
