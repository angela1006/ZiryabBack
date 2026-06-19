import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as courseController from './course.controller.js';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (GET - sin autenticación)
// ============================================

/**
 * @route   GET /api/courses
 * @desc    Obtener todos los cursos
 * @access  Admin, Teacher, Student
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), courseController.getAllCourses);

/**
 * @swagger
 * /api/courses/{id}/grades:
 *   get:
 *     summary: Grades distintos de un ciclo
 *     description: DISTINCT Subject.grade para el idCourse (wizard Course).
 *     tags: [Courses]
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
 *         description: Lista de grades (ej. "1", "2")
 *       404:
 *         description: Ciclo no encontrado
 */
router.get(
  '/:id/grades',
  auth,
  authorize(['ADMIN', 'TEACHER', 'STUDENT']),
  courseController.getCourseGrades,
);

/**
 * @swagger
 * /api/courses/{id}/subjects:
 *   get:
 *     summary: Asignaturas de un ciclo filtradas por grade
 *     description: Asignaturas con idCourse + grade (query obligatorio).
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: grade
 *         required: true
 *         schema:
 *           type: string
 *           example: "1"
 *     responses:
 *       200:
 *         description: Asignaturas del ciclo y curso
 *       400:
 *         description: grade ausente o ID inválido
 *       404:
 *         description: Ciclo no encontrado
 */
router.get(
  '/:id/subjects',
  auth,
  authorize(['ADMIN', 'TEACHER', 'STUDENT']),
  courseController.getCourseSubjectsByGrade,
);

/**
 * @route   GET /api/courses/:id
 * @desc    Obtener un curso por ID
 * @access  Admin, Teacher, Student
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), courseController.getCourseById);

// ============================================
// RUTAS PROTEGIDAS (POST, PUT, PATCH, DELETE - solo ADMIN)
// ============================================

/**
 * @route   POST /api/courses
 * @desc    Crear un nuevo curso
 * @access  Admin only
 */
router.post('/', auth, authorize(['ADMIN']), courseController.createCourse);

/**
 * @route   PUT /api/courses/:id
 * @desc    Actualizar un curso completamente
 * @access  Admin only
 */
router.put('/:id', auth, authorize(['ADMIN']), courseController.updateCourse);

/**
 * @route   PATCH /api/courses/:id
 * @desc    Actualizar parcialmente un curso
 * @access  Admin only
 */
router.patch('/:id', auth, authorize(['ADMIN']), courseController.patchCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Eliminar un curso
 * @access  Admin only
 */
router.delete('/:id', auth, authorize(['ADMIN']), courseController.deleteCourse);

export default router;
