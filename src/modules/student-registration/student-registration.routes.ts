import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as studentOnSubjectController from './student-registration.controller.js';

const router = Router();

/**
 * @swagger
 * /api/studentregistration:
 *   post:
 *     summary: Matricular alumno en grupo y asignatura
 *     tags: [StudentRegistration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Matrícula creada
 *       400:
 *         description: Datos inválidos
 */
router.post('/', auth, authorize(['ADMIN']), studentOnSubjectController.createStudentOnSubjectOnGroup);

export default router;
