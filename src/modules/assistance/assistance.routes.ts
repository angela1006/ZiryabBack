import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { resolveCloudinaryUrlsMiddleware } from '../../middleware/resolve-cloudinary-urls.js';
import { restrictToSelfOrRoles } from '../../middleware/restrictSelf.js';
import * as assistanceController from './assistance.controller.js';

const router = Router();
router.use(resolveCloudinaryUrlsMiddleware);

// ============================================
// RUTAS PROTEGIDAS (TODAS REQUIEREN AUTENTICACIÓN)
// ============================================

/**
 * @swagger
 * /api/assistances:
 *   get:
 *     summary: Obtener todas las asistencias
 *     description: Obtiene todas las asistencias. Admin ve todas, Teacher ve las de sus sesiones.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asistencias
 *       403:
 *         description: Acceso denegado
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.getAll);

/**
 * @swagger
 * /api/assistances/student-enrollment/{idStudentEnrollment}:
 *   get:
 *     summary: Obtener faltas de una matrícula
 *     description: Obtiene las asistencias mediante el id de matrícula (StudentEnrollment).
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idStudentEnrollment
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de asistencias
 */
router.get('/student-enrollment/:idStudentEnrollment', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.getByStudentEnrollment);

/**
 * @swagger
 * /api/assistances/student/{idStudent}:
 *   get:
 *     summary: Obtener faltas de un alumno por idStudent
 *     description: Retorna las asistencias de un alumno por su ID de usuario.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idStudent
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de asistencias
 */
router.get('/student/:idStudent', auth, restrictToSelfOrRoles(['ADMIN', 'TEACHER', 'STUDENT'], 'idStudent'), assistanceController.getByStudentId);

/**
 * @swagger
 * /api/assistances/session/{idSession}:
 *   get:
 *     summary: Obtener asistencias por id de Sesión
 *     description: Obtiene las asistencias de una clase particular.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idSession
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de asistencias
 */
router.get('/session/:idSession', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.getBySessionId);

// ============================================
// RUTAS PROTEGIDAS (POST, PATCH, DELETE, y GET específico)
// ============================================

/**
 * @swagger
 * /api/assistances/my-absences:
 *   get:
 *     summary: Obtener mis faltas
 *     description: Obtiene las faltas (LATE, ABSENT, EXCUSED) del alumno logueado.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de faltas del alumno logueado
 */
router.get('/my-absences', auth, authorize(['STUDENT']), assistanceController.getMyAbsences);

/**
 * @swagger
 * /api/assistances/pending-justifications:
 *   get:
 *     summary: Listar justificaciones pendientes del profesor
 *     description: Devuelve faltas con justificante en estado PENDING de las sesiones del profesor.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: idTeacherAssignment
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de justificaciones pendientes
 */
router.get(
    '/pending-justifications',
    auth,
    authorize(['ADMIN', 'TEACHER']),
    assistanceController.getPendingJustifications
);

/**
 * @swagger
 * /api/assistances/{id}/justification-status:
 *   get:
 *     summary: Consultar estado de justificación
 *     description: Devuelve el estado de la justificación de una falta específica.
 *     tags: [Assistances]
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
 *         description: Estado de la justificación
 */
router.get('/:id/justification-status', auth, authorize(['STUDENT', 'TEACHER', 'ADMIN']), assistanceController.getJustificationStatus);

/**
 * @swagger
 * /api/assistances/{id}:
 *   get:
 *     summary: Obtener una asistencia por ID
 *     description: Obtiene una asistencia por su ID.
 *     tags: [Assistances]
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
 *         description: Objeto de asistencia
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.getById);

// ============================================
// RUTAS DE MODIFICACIÓN (POST, PUT, PATCH, DELETE)
// ============================================

/**
 * @swagger
 * /api/assistances/bulk:
 *   post:
 *     summary: Crear múltiples asistencias en lote
 *     description: Permite registrar las asistencias de múltiples alumnos de una vez.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assistances:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateAssistance'
 *     responses:
 *       201:
 *         description: Asistencias creadas exitosamente
 */
router.post('/bulk', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.createBulk);

/**
 * @swagger
 * /api/assistances:
 *   post:
 *     summary: Crear asistencia individual
 *     description: Registra una asistencia para un alumno.
 *     tags: [Assistances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssistance'
 *     responses:
 *       201:
 *         description: Asistencia creada
 */
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.createOne);

/**
 * @swagger
 * /api/assistances/justify/{id}:
 *   patch:
 *     summary: Justificar una falta
 *     description: Cambia el estado de una falta a EXCUSED/JUSTIFIED.
 *     tags: [Assistances]
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
 *         description: Falta justificada
 */
router.patch('/justify/:id', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.justify);

/**
 * @swagger
 * /api/assistances/reject-justification/{id}:
 *   patch:
 *     summary: Rechazar un justificante
 *     description: Marca la justificación como REJECTED sin cambiar el estado de la falta.
 *     tags: [Assistances]
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
 *         description: Justificación rechazada
 */
router.patch(
    '/reject-justification/:id',
    auth,
    authorize(['ADMIN', 'TEACHER']),
    assistanceController.rejectJustification
);

/**
 * @swagger
 * /api/assistances/assistancestatus/{id}:
 *   patch:
 *     summary: Actualizar estado de asistencia
 *     description: Actualiza el estado (PRESENT, ABSENT, LATE, EXCUSED) de una asistencia existente.
 *     tags: [Assistances]
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
 *             $ref: '#/components/schemas/UpdateAssistanceStatus'
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/assistancestatus/:id', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.updateStatus)



/**
 * @swagger
 * /api/assistances/{id}:
 *   put:
 *     summary: Actualizar asistencia
 *     description: Actualiza una asistencia por ID.
 *     tags: [Assistances]
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
 *             $ref: '#/components/schemas/UpdateAssistanceStatus'
 *     responses:
 *       200:
 *         description: Asistencia actualizada
 */
//router.put('/:id', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.updateOne);

/**
 * @swagger
 * /api/assistances/{id}:
 *   delete:
 *     summary: Eliminar asistencia
 *     description: Elimina un registro de asistencia del sistema.
 *     tags: [Assistances]
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
 *         description: Asistencia eliminada
 */
router.delete('/:id', auth, authorize(['ADMIN', 'TEACHER']), assistanceController.deleteOne);

import { uploadJustification } from '../../middleware/upload.js';

/**
 * @swagger
 * /api/assistances/{id}/justification-document:
 *   post:
 *     summary: Subir justificante
 *     description: Sube un archivo de justificación para una falta (PDF, PNG, JPG).
 *     tags: [Assistances]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Archivo justificante
 *     responses:
 *       200:
 *         description: Documento subido
 */
router.post(
    '/:id/justification-document',
    auth,
    authorize(['STUDENT', 'TEACHER', 'ADMIN']),
    uploadJustification.single('document'),
    assistanceController.uploadDocument
);

export default router;