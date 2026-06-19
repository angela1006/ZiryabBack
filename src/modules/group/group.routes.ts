import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as groupController from './group.controller.js';

const router = Router();

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Listar grupos
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos
 *   post:
 *     summary: Crear grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Grupo creado
 */
router.get('/', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), groupController.getAllGroups);
router.post('/', auth, authorize(['ADMIN']), groupController.createGroup);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Obtener grupo por ID
 *     tags: [Groups]
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
 *         description: Grupo encontrado
 *   put:
 *     summary: Actualizar grupo (completo)
 *     tags: [Groups]
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
 *         description: Grupo actualizado
 *   patch:
 *     summary: Actualizar grupo (parcial)
 *     tags: [Groups]
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
 *         description: Grupo actualizado
 *   delete:
 *     summary: Eliminar grupo
 *     tags: [Groups]
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
 *         description: Grupo eliminado
 */
router.get('/:id', auth, authorize(['ADMIN', 'TEACHER', 'STUDENT']), groupController.getGroupById);
router.put('/:id', auth, authorize(['ADMIN']), groupController.updateGroup);
router.patch('/:id', auth, authorize(['ADMIN']), groupController.patchGroup);
router.delete('/:id', auth, authorize(['ADMIN']), groupController.deleteGroup);

export default router;
