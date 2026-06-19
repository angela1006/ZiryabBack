import type { Request, Response } from 'express';
import * as adminService from './admins.service.js';

export const getAllAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await adminService.findAll();
        res.json({
            success: true,
            data: admins,
            count: admins.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener administradores',
            error: error.message,
        });
    }
};

export const getAdminById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const admin = await adminService.findById(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin no encontrado',
            });
        }

        res.json({
            success: true,
            data: admin,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener admin',
            error: error.message,
        });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const adminData = req.body;
        const newAdmin = await adminService.create(adminData);

        res.status(201).json({
            success: true,
            message: 'Admin creado exitosamente',
            data: newAdmin,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al crear Admin',
            error: error.message,
        });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const adminData = req.body;
        const updatedAdmin = await adminService.update(id, adminData);

        res.json({
            success: true,
            message: 'Admin actualizado exitosamente',
            data: updatedAdmin,
        });
    } catch (error: any) {
        if (error.message === 'Admin no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al actualizar admin',
            error: error.message,
        });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        await adminService.remove(id);

        res.json({
            success: true,
            message: 'Admin eliminado exitosamente',
        });
    } catch (error: any) {
        if (error.message === 'Admin no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar admin',
            error: error.message,
        });
    }
};

