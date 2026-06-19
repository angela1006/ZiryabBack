import { Router } from 'express';
import { authorize } from '../../middleware/authorize.js';
import { auth } from '../../middleware/auth.js';
import * as teachersController from './teachers.controller.js';

const router = Router();

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Listar profesores
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesores
 *   post:
 *     summary: Crear profesor
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Profesor creado
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), teachersController.getAllTeachers);
router.post('/', auth, authorize(['ADMIN']), teachersController.createTeacher);

/**
 * @swagger
 * /api/teachers/my-students-absences:
 *   get:
 *     summary: Alumnos y faltas del profesor autenticado
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de ausencias de mis alumnos
 */
router.get('/my-students-absences', auth, authorize(['ADMIN', 'TEACHER']), teachersController.getMyStudentsAbsences);

/**
 * @swagger
 * /api/teachers/{id}/subjects:
 *   get:
 *     summary: Asignaturas de un profesor
 *     tags: [Teachers]
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
 *         description: Asignaturas impartidas
 */
router.get('/:id/subjects', auth, authorize(['ADMIN', 'TEACHER']), teachersController.getTeacherSubjects);

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     tags: [Teachers]
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
 *         description: Profesor encontrado
 *   patch:
 *     summary: Actualizar profesor (parcial)
 *     tags: [Teachers]
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
 *         description: Profesor actualizado
 *   delete:
 *     summary: Eliminar profesor
 *     tags: [Teachers]
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
 *         description: Profesor eliminado
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER']), teachersController.getTeacherById);
router.patch('/:id', auth, authorize(['ADMIN']), teachersController.patchTeacher);
router.delete('/:id', auth, authorize(['ADMIN']), teachersController.deleteTeacher);

export default router;
