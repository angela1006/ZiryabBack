import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveCloudinaryUrlsMiddleware } from '../../middleware/resolve-cloudinary-urls.js';
import { uploadTaskAttachment } from '../../middleware/upload.js';
import * as taskController from './task.controller.js';

const router = Router();
router.use(resolveCloudinaryUrlsMiddleware);

// ============================================
// RUTAS PÚBLICAS (GET - sin autenticación)
// ============================================

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener todas las tareas
 *     description: Obtiene todas las tareas (Admin ve todas, Teacher ve las suyas).
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtener una tarea por ID
 *     description: Obtiene los detalles completos de una tarea.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Tarea encontrada
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), taskController.getTaskById);

/**
 * @swagger
 * /api/tasks/teacher-assignment/{idTeacherAssignment}:
 *   get:
 *     summary: Obtener tareas por asignación de profesor
 *     description: Obtiene las tareas creadas dentro de una asignatura grupo específica.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeacherAssignment
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de tareas
 */
router.get('/teacher-assignment/:idTeacherAssignment', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), taskController.getTasksByTeacherAssignment);

// ============================================
// RUTAS PROTEGIDAS (POST, PATCH, DELETE - solo ADMIN y TEACHER)
// ============================================

/**
 * @route   POST /api/tasks
 * @desc    Crear una nueva tarea con sus StudentTask asociados
 * @access  TEACHER | ADMIN
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     description: Permite al profesor crear una tarea/evaluación/material para un grupo.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Tarea creada
 */
// NOTA: Se ha añadido el middleware "uploadTaskAttachment.single('file')"
// Esto hace que antes de llegar al controlador, Node intercepte la petición, agarre el archivo que viene
// bajo el nombre 'file', y lo guarde físicamente en tu disco duro si cumple las validaciones.
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), uploadTaskAttachment.single('file'), taskController.createTask);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Actualizar campos de una tarea (solo el profesor dueño o ADMIN)
 * @access  TEACHER | ADMIN
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Actualizar una tarea
 *     description: Edita los detalles de una tarea. Solo el creador o un Admin pueden hacerlo.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTask'
 *     responses:
 *       200:
 *         description: Tarea actualizada
 */
// Lo mismo aquí, permitimos subir o sobreescribir el archivo adjunto al actualizar
router.patch('/:id', auth, authorize(['ADMIN', 'TEACHER']), uploadTaskAttachment.single('file'), taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Eliminar una tarea (solo el profesor dueño o ADMIN)
 * @access  TEACHER | ADMIN
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Eliminar una tarea
 *     description: Elimina una tarea permanentemente.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Tarea eliminada
 */
router.delete('/:id', auth, authorize(['ADMIN', 'TEACHER']), taskController.deleteTask);

// ============================================
// RUTAS DE CONSULTA — autenticado
// ============================================

export default router;