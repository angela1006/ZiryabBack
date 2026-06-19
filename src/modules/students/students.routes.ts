import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { restrictToSelfOrRoles } from '../../middleware/restrictSelf.js';
import * as studentsController from './students.controller.js';

const router = Router();

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Listar estudiantes
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *   post:
 *     summary: Crear estudiante
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Estudiante creado
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), studentsController.getAllStudents);
router.post('/', auth, authorize(['ADMIN']), studentsController.createStudent);

/**
 * @swagger
 * /api/students/{id}/subjects:
 *   get:
 *     summary: Asignaturas de un estudiante
 *     tags: [Students]
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
 *         description: Asignaturas del alumno
 */
router.get('/:id/subjects', auth, restrictToSelfOrRoles(['ADMIN', 'TEACHER'], 'id'), studentsController.getStudentSubjects);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 *     tags: [Students]
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
 *         description: Estudiante encontrado
 *       404:
 *         description: No encontrado
 *   put:
 *     summary: Actualizar estudiante (completo)
 *     tags: [Students]
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
 *         description: Estudiante actualizado
 *   patch:
 *     summary: Actualizar estudiante (parcial)
 *     tags: [Students]
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
 *         description: Estudiante actualizado
 *   delete:
 *     summary: Eliminar estudiante
 *     tags: [Students]
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
 *         description: Estudiante eliminado
 */
router.get('/:id', auth, restrictToSelfOrRoles(['ADMIN', 'TEACHER'], 'id'), studentsController.getStudentById);
router.put('/:id', auth, authorize(['ADMIN']), studentsController.updateStudent);
router.patch('/:id', auth, authorize(['ADMIN']), studentsController.patchStudent);
router.delete('/:id', auth, authorize(['ADMIN']), studentsController.deleteStudent);

export default router;
