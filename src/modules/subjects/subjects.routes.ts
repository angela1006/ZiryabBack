import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as subjectsController from './subjects.controller.js';

const router = Router();

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Listar asignaturas
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaturas
 *   post:
 *     summary: Crear asignatura
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Asignatura creada
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), subjectsController.getAllSubjects);
router.post('/', auth, authorize(['ADMIN']), subjectsController.createSubject);

/**
 * @swagger
 * /api/subjects/{id}/teachers:
 *   get:
 *     summary: Profesores de una asignatura
 *     tags: [Subjects]
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
 *         description: Profesores asignados
 */
router.get('/:id/teachers', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), subjectsController.getSubjectTeachers);

/**
 * @swagger
 * /api/subjects/{id}/students:
 *   get:
 *     summary: Estudiantes de una asignatura
 *     tags: [Subjects]
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
 *         description: Alumnos matriculados
 */
router.get('/:id/students', auth, authorize(['ADMIN', 'TEACHER']), subjectsController.getSubjectStudents);

/**
 * @swagger
 * /api/subjects/{id}/course:
 *   get:
 *     summary: Ciclo formativo de una asignatura
 *     tags: [Subjects]
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
 *         description: Datos del ciclo
 */
router.get('/:id/course', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), subjectsController.getSubjectCourse);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Obtener asignatura por ID
 *     tags: [Subjects]
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
 *         description: Asignatura encontrada
 *   put:
 *     summary: Actualizar asignatura (completo)
 *     tags: [Subjects]
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
 *         description: Asignatura actualizada
 *   patch:
 *     summary: Actualizar asignatura (parcial)
 *     tags: [Subjects]
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
 *         description: Asignatura actualizada
 *   delete:
 *     summary: Eliminar asignatura
 *     tags: [Subjects]
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
 *         description: Asignatura eliminada
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), subjectsController.getSubjectById);
router.put('/:id', auth, authorize(['ADMIN']), subjectsController.updateSubject);
router.patch('/:id', auth, authorize(['ADMIN']), subjectsController.patchSubject);
router.delete('/:id', auth, authorize(['ADMIN']), subjectsController.deleteSubject);

export default router;
