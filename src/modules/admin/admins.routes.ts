import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import * as adminController from './admins.controller.js';

const router = Router();

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Listar administradores
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de admins
 *   post:
 *     summary: Crear administrador
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin creado
 */
router.get('/', auth, authorize(['ADMIN']), adminController.getAllAdmins);
router.post('/', auth, authorize(['ADMIN']), adminController.createAdmin);

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Obtener admin por ID
 *     tags: [Admins]
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
 *         description: Admin encontrado
 *   put:
 *     summary: Actualizar admin
 *     tags: [Admins]
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
 *         description: Admin actualizado
 *   delete:
 *     summary: Eliminar admin
 *     tags: [Admins]
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
 *         description: Admin eliminado
 */
router.get('/:id', auth, authorize(['ADMIN']), adminController.getAdminById);
router.put('/:id', auth, authorize(['ADMIN']), adminController.updateAdmin);
router.delete('/:id', auth, authorize(['ADMIN']), adminController.deleteAdmin);

export default router;
