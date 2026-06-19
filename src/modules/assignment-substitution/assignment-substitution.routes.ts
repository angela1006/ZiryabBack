import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as substitutionController from './assignment-substitution.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assignment Substitutions
 *   description: Gestión de sustituciones de profesorado en una asignación
 */

/**
 * @swagger
 * /api/assignment-substitutions:
 *   get:
 *     summary: Listar todas las sustituciones
 *     tags: [Assignment Substitutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sustituciones
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER']), substitutionController.getAllSubstitutions);

/**
 * @swagger
 * /api/assignment-substitutions/{id}:
 *   get:
 *     summary: Obtener una sustitución por ID
 *     tags: [Assignment Substitutions]
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
 *         description: Sustitución encontrada
 *       404:
 *         description: Sustitución no encontrada
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER']), substitutionController.getSubstitutionById);

/**
 * @swagger
 * /api/assignment-substitutions/assignment/{assignmentId}:
 *   get:
 *     summary: Historial de sustituciones de una asignación
 *     tags: [Assignment Substitutions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial recuperado
 */
router.get(
  '/assignment/:assignmentId',
  auth,
  authorize(['ADMIN', 'TEACHER']),
  substitutionController.getSubstitutionsByAssignment,
);

/**
 * @swagger
 * /api/assignment-substitutions:
 *   post:
 *     summary: Crear una sustitución
 *     tags: [Assignment Substitutions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Sustitución creada
 */
router.post('/', auth, authorize(['ADMIN']), substitutionController.createSubstitution);

/**
 * @swagger
 * /api/assignment-substitutions/{id}:
 *   put:
 *     summary: Reemplazar una sustitución completa
 *     tags: [Assignment Substitutions]
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
 *         description: Sustitución actualizada
 */
router.put('/:id', auth, authorize(['ADMIN']), substitutionController.updateSubstitution);

/**
 * @swagger
 * /api/assignment-substitutions/{id}:
 *   patch:
 *     summary: Actualizar parcialmente una sustitución
 *     tags: [Assignment Substitutions]
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
 *         description: Sustitución actualizada
 */
router.patch('/:id', auth, authorize(['ADMIN']), substitutionController.patchSubstitution);

/**
 * @swagger
 * /api/assignment-substitutions/{id}/close:
 *   patch:
 *     summary: Cerrar sustitución y reactivar titular
 *     tags: [Assignment Substitutions]
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
 *         description: Sustitución cerrada
 */
router.patch('/:id/close', auth, authorize(['ADMIN']), substitutionController.closeSubstitution);

/**
 * @swagger
 * /api/assignment-substitutions/{id}:
 *   delete:
 *     summary: Eliminar una sustitución
 *     tags: [Assignment Substitutions]
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
 *         description: Sustitución eliminada
 */
router.delete('/:id', auth, authorize(['ADMIN']), substitutionController.deleteSubstitution);

export default router;
