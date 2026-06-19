import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveCloudinaryUrlsMiddleware } from '../../middleware/resolve-cloudinary-urls.js';
import * as studentTaskController from './student-task.controller.js';
import { uploadSubmission } from '../../middleware/upload.js';

const router = Router();
router.use(resolveCloudinaryUrlsMiddleware);

/**
 * @swagger
 * /api/student-tasks:
 *   get:
 *     summary: Listar entregas de tareas
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de entregas
 *   post:
 *     summary: Crear entrega individual
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Entrega creada
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), studentTaskController.getAllStudentTasks);
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), studentTaskController.createStudentTask);

/**
 * @swagger
 * /api/student-tasks/bulk:
 *   post:
 *     summary: Crear entregas en masa
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Entregas creadas
 */
router.post('/bulk', auth, authorize(['ADMIN', 'TEACHER']), studentTaskController.createBulkStudentTasks);

/**
 * @swagger
 * /api/student-tasks/upload-submission:
 *   post:
 *     summary: Subir archivo de entrega
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL del fichero subido
 */
router.post('/upload-submission', auth, authorize(['STUDENT']), uploadSubmission.single('file'), studentTaskController.uploadFile);

/**
 * @swagger
 * /api/student-tasks/task/{idTask}:
 *   get:
 *     summary: Entregas de una tarea
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTask
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de entregas
 */
router.get('/task/:idTask', auth, authorize(['ADMIN', 'TEACHER']), studentTaskController.getStudentTasksByTask);

/**
 * @swagger
 * /api/student-tasks/student/{idStudentEnrollment}:
 *   get:
 *     summary: Entregas de un alumno (por matrícula)
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idStudentEnrollment
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de entregas
 */
router.get('/student/:idStudentEnrollment', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), studentTaskController.getStudentTasksByStudent);

/**
 * @swagger
 * /api/student-tasks/{id}/submit:
 *   put:
 *     summary: Entregar tarea (alumno)
 *     tags: [StudentTasks]
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
 *         description: Tarea entregada
 *   delete:
 *     summary: Retirar entrega (alumno)
 *     tags: [StudentTasks]
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
 *         description: Entrega retirada
 */
router.put('/:id/submit', auth, authorize(['STUDENT']), studentTaskController.submitStudentTask);
router.delete('/:id/submit', auth, authorize(['STUDENT']), studentTaskController.unsubmitStudentTask);

/**
 * @swagger
 * /api/student-tasks/{id}/grade:
 *   put:
 *     summary: Calificar entrega (profesor)
 *     tags: [StudentTasks]
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
 *             required: [score]
 *             properties:
 *               score:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Entrega calificada
 */
router.put('/:id/grade', auth, authorize(['TEACHER']), studentTaskController.gradeStudentTask);

/**
 * @swagger
 * /api/student-tasks/{id}:
 *   get:
 *     summary: Obtener entrega por ID
 *     tags: [StudentTasks]
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
 *         description: Entrega encontrada
 *   patch:
 *     summary: Actualizar entrega
 *     tags: [StudentTasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentTask'
 *     responses:
 *       200:
 *         description: Entrega actualizada
 *   delete:
 *     summary: Eliminar entrega
 *     tags: [StudentTasks]
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
 *         description: Entrega eliminada
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), studentTaskController.getStudentTaskById);
router.patch('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), studentTaskController.updateStudentTask);
router.delete('/:id', auth, authorize(['ADMIN']), studentTaskController.deleteStudentTask);

export default router;
