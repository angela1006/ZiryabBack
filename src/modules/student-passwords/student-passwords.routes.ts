import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as studentPasswordsController from './student-passwords.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Student Passwords
 *   description: Consulta y actualización de credenciales de alumnos
 */

/**
 * @swagger
 * /api/student-passwords:
 *   post:
 *     summary: Guardar credencial de alumno
 *     tags: [Student Passwords]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, authorize(['ADMIN']), studentPasswordsController.savePassword);

/**
 * @swagger
 * /api/student-passwords/tutor/{idTutor}:
 *   get:
 *     summary: Credenciales de alumnos por tutor
 *     tags: [Student Passwords]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/tutor/:idTutor',
  auth,
  authorize(['ADMIN', 'TEACHER']),
  studentPasswordsController.getByTutor,
);

/**
 * @swagger
 * /api/student-passwords/student/{idStudent}:
 *   get:
 *     summary: Credencial de un alumno concreto
 *     tags: [Student Passwords]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/student/:idStudent',
  auth,
  authorize(['ADMIN', 'TEACHER']),
  studentPasswordsController.getByStudent,
);

/**
 * @swagger
 * /api/student-passwords/{idStudent}:
 *   patch:
 *     summary: Asignar tutor a credencial de alumno
 *     tags: [Student Passwords]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:idStudent', auth, authorize(['ADMIN']), studentPasswordsController.patchTutor);

/**
 * @swagger
 * /api/student-passwords/{idStudent}:
 *   put:
 *     summary: Actualizar password de un alumno
 *     tags: [Student Passwords]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:idStudent', auth, authorize(['ADMIN']), studentPasswordsController.updatePassword);

export default router;
