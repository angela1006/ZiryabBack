import type { Request, Response } from 'express';
import * as subjectsService from './subjects.service.js';
import { success } from 'zod';
import { count } from 'console';

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await subjectsService.findAll();
        res.json({
            success: true,
            data: subjects,
            count: subjects.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignaturas',
            error: error.message,
        });
    }
};

export const getSubjectById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const subject = await subjectsService.findById(id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Asignatura no encontrada',
            });
        }

        res.json({
            success: true,
            data: subject,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignatura',
            error: error.message,
        });
    }
};

export const createSubject = async (req: Request, res: Response) => {
    try {
        const subjectData = req.body;
        const newSubject = await subjectsService.create(subjectData);

        res.status(201).json({
            success: true,
            message: 'Asignatura creada exitosamente',
            data: newSubject,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al crear asignatura',
            error: error.message,
        });
    }
};

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

export const getSubjectTeachers = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const teachers = await subjectsService.findTeachersBySubjectId(id);

        res.json({
            success: true,
            data: teachers,
            count: teachers.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener profesores de la asignatura',
            error: error.message,
        });
    }
};

export const getSubjectStudents = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const students = await subjectsService.findStudentsBySubjectId(id);

        res.json({
            success: true,
            data: students,
            count: students.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes de la asignatura',
            error: error.message,
        });
    }
};

export const getSubjectCourse = async (req: Request, res: Response) => {
    try{
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id == 0) {
            return res.status(400).json({
                success: false,
                message: 'Id invalido'
            });
        }

        const course = await subjectsService.findSubjectByCourseId(id);

        res.json({
            success: true,
            data: course,
            count: course.length,
        });
    }catch (error: any){
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignaturas por curso(getSubjectCourse() subjects.controller.ts)',
            error: error.message,
        });
    }
};
