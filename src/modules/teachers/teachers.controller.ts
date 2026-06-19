import type { Request, Response } from 'express';
import * as teachersService from './teachers.service.js';



/*

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const subjectData = req.body;
        const updatedSubject = await subjectsService.update(id, subjectData);

        res.json({
            success: true,
            message: 'Asignatura actualizada exitosamente',
            data: updatedSubject,
        });
    } catch (error: any) {
        if (error.message === 'Asignatura no encontrada') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al actualizar asignatura',
            error: error.message,
        });
    }
};

export const patchSubject = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const updatedSubject = await subjectsService.patch(id, req.body);

        res.json({
            success: true,
            message: 'Asignatura actualizada parcialmente',
            data: updatedSubject,
        });
    } catch (error: any) {
        if (error.message === 'Asignatura no encontrada') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al actualizar asignatura',
            error: error.message,
        });
    }
};


export const deleteSubject = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        await subjectsService.remove(id);

        res.json({
            success: true,
            message: 'Asignatura eliminada exitosamente',
        });
    } catch (error: any) {
        if (error.message === 'Asignatura no encontrada') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar asignatura',
            error: error.message,
        });
    }
};

 */


export const getAllTeachers = async (req: Request, res: Response) =>{
    try {
        const teachers = await teachersService.findAll();
        res.json({
            success: true,
            data: teachers,
            count: teachers.length,
        });
    } catch (error: any) {
           res.status(500).json({
            success: false,
            message: 'Error al obtener asignaturas',
            error: error.message,
        });
    }
};

export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const subject = await teachersService.findById(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado',
            });
        }

        res.json({
            success: true,
            data: subject,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener profesor',
            error: error.message,
        });
    }
};


export const createTeacher = async (req: Request, res: Response) => {
    try {
        const teacherData = req.body;
        const newTeacher = await teachersService.create(teacherData);

        res.status(201).json({
            success: true,
            message: 'Profesor creado exitosamente',
            data: newTeacher,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al crear Profesor',
            error: error.message,
        });
    }
};


export const deleteTeacher = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const deletedTeacher = await teachersService.remove(id);

        res.json({
            success: true,
            message: 'Profesor eliminado exitosamente',
            data: deletedTeacher,
        });
    } catch (error: any) {
        if (error.message === 'Profesor no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        // Aquí se controla si falló Firebase o cualquier otro error
        res.status(500).json({
            success: false,
            message: 'Error al eliminar profesor',
            error: error.message,
        });
    }
};

export const patchTeacher = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const teacherData = req.body;

        // Llama al servicio para actualizar el profesor
        const updatedTeacher = await teachersService.update(id, teacherData);

        if (!updatedTeacher) {
            return res.status(404).json({
                success: false,
                message: 'Profesor no encontrado',
            });
        }

        res.json({
            success: true,
            message: 'Profesor actualizado exitosamente',
            data: updatedTeacher,
        });
    } catch (error: any) {
        // Si falla Firebase o cualquier otra cosa
        res.status(500).json({
            success: false,
            message: 'Error al actualizar profesor',
            error: error.message,
        });
    }
};


export const getTeacherSubjects = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const subjects = await teachersService.findSubjectsByTeacherId(id);

        res.json({
            success: true,
            data: subjects,
            count: subjects.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignaturas del profesor',
            error: error.message
        });
    }
};

export const getMyStudentsAbsences = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'TEACHER') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }
        
        const data = await teachersService.findStudentsAbsencesByTeacher(req.user.sub);
        res.json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener alumnos', error: error.message });
    }
};