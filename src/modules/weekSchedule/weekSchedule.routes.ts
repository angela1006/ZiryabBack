import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { restrictToSelfOrRoles } from '../../middleware/restrictSelf.js';
import * as horarioSemanalController from './weekSchedule.controller.js';

const router = Router();

/**
 * @swagger
 * /api/horarios-semanales:
 *   get:
 *     summary: Listar horarios semanales
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de horarios
 *   post:
 *     summary: Crear horario semanal
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Horario creado
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.getAllHorarios);
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.createHorario);

/**
 * @swagger
 * /api/horarios-semanales/classes:
 *   get:
 *     summary: Selector de clases (asignaciones agregadas)
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clases disponibles
 */
router.get('/classes', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.getClasses);

/**
 * @swagger
 * /api/horarios-semanales/materialize:
 *   post:
 *     summary: Materializar plantilla de horario vacía
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Plantilla creada
 */
router.post('/materialize', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.materializeHorario);

/**
 * @swagger
 * /api/horarios-semanales/teacher-assignment/{idTeacherAssignment}:
 *   get:
 *     summary: Horarios por asignación de profesor
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeacherAssignment
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Franjas horarias
 */
router.get('/teacher-assignment/:idTeacherAssignment', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), horarioSemanalController.getHorariosByTeacherAssignment);

/**
 * @swagger
 * /api/horarios-semanales/dia/{weekDay}:
 *   get:
 *     summary: Horarios de un día de la semana
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: weekDay
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *     responses:
 *       200:
 *         description: Horarios del día
 */
router.get('/dia/:weekDay', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.getHorariosByDia);

/**
 * @swagger
 * /api/horarios-semanales/teacher/{idTeacher}:
 *   get:
 *     summary: Horarios de un profesor
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTeacher
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horarios del profesor
 */
router.get('/teacher/:idTeacher', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.getHorariosByTeacher);

/**
 * @swagger
 * /api/horarios-semanales/student/{idStudent}:
 *   get:
 *     summary: Horarios de un alumno
 *     tags: [WeekSchedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idStudent
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Horarios del alumno
 */
router.get('/student/:idStudent', auth, restrictToSelfOrRoles(['ADMIN', 'TEACHER'], 'idStudent'), horarioSemanalController.getHorariosByStudent);

/**
 * @swagger
 * /api/horarios-semanales/{id}:
 *   get:
 *     summary: Obtener horario por ID
 *     tags: [WeekSchedule]
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
 *         description: Horario encontrado
 *   put:
 *     summary: Actualizar horario (completo)
 *     tags: [WeekSchedule]
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
 *         description: Horario actualizado
 *   patch:
 *     summary: Actualizar horario (parcial)
 *     tags: [WeekSchedule]
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
 *         description: Horario actualizado
 *   delete:
 *     summary: Eliminar horario
 *     tags: [WeekSchedule]
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
 *         description: Horario eliminado
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.getHorarioById);
router.put('/:id', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.updateHorario);
router.patch('/:id', auth, authorize(['ADMIN', 'TEACHER']), horarioSemanalController.patchHorario);
router.delete('/:id', auth, authorize(['ADMIN']), horarioSemanalController.deleteHorario);

export default router;
