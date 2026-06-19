import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as issueController from './issue.controller.js';

const router = Router();

/**
 * @swagger
 * /api/issues:
 *   get:
 *     summary: Listar anuncios activos para el usuario autenticado
 *     description: Devuelve anuncios publicados y vigentes filtrados por rol y audiencia (CENTER, grupo, ciclo, etc.).
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de anuncios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessIssueList'
 *             example:
 *               success: true
 *               count: 2
 *               data:
 *                 - id: 1
 *                   idAdmin: 1
 *                   audience: CENTER
 *                   title: Bienvenida
 *                   body: Texto del anuncio
 *                   isPublished: true
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *   post:
 *     summary: Crear anuncio (ADMIN o TEACHER)
 *     description: Admin usa su idAdmin; profesor registra con admin proxy y marca de autor en body. Los profesores no pueden usar CENTER, ALL_TEACHERS ni ALL_STUDENTS.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIssueInput'
 *           examples:
 *             allStudents:
 *               summary: Todos los alumnos
 *               value:
 *                 audience: ALL_STUDENTS
 *                 title: Aviso general
 *                 body: Contenido del anuncio
 *                 isPublished: true
 *             group:
 *               summary: Grupo concreto
 *               value:
 *                 audience: GROUP
 *                 idGroup: 1
 *                 title: Aviso al grupo Mañana
 *                 body: Solo para ese grupo
 *                 isPublished: false
 *     responses:
 *       201:
 *         description: Anuncio creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessIssue'
 *       400:
 *         description: Cuerpo inválido o regla de negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *       403:
 *         description: Sin permiso para la audiencia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), issueController.getIssues);
router.post('/', auth, authorize(['ADMIN', 'TEACHER']), issueController.createIssue);

/**
 * @swagger
 * /api/issues/{id}:
 *   get:
 *     summary: Detalle de un anuncio
 *     tags: [Issues]
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
 *         description: Anuncio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessIssue'
 *       403:
 *         description: Sin permiso para ver el anuncio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *       404:
 *         description: Anuncio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *   patch:
 *     summary: Editar o publicar anuncio
 *     description: Propietario o ADMIN. Campos opcionales (partial update).
 *     tags: [Issues]
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
 *             properties:
 *               audience:
 *                 $ref: '#/components/schemas/IssueAudience'
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Anuncio actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessIssue'
 *       400:
 *         description: Cuerpo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *       403:
 *         description: Sin permiso para modificar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *       404:
 *         description: Anuncio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *   delete:
 *     summary: Eliminar anuncio
 *     description: Propietario o ADMIN. Devuelve el registro borrado en data.
 *     tags: [Issues]
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
 *         description: Anuncio eliminado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessIssue'
 *       403:
 *         description: Sin permiso para eliminar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 *       404:
 *         description: Anuncio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorIssue'
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), issueController.getIssueById);
router.patch('/:id', auth, authorize(['ADMIN', 'TEACHER']), issueController.updateIssue);
router.delete('/:id', auth, authorize(['ADMIN', 'TEACHER']), issueController.deleteIssue);

export default router;
