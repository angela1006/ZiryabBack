import type { Request, Response } from 'express';
import * as studentsService from './students.service.js';

//GET ALL

export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const students = await studentsService.findAll();
        res.json({
            success: true,
            data: students,
            count: students.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes',
            error: error.message,
        });
    }
};

//GET BY ID
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const student = await studentsService.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Estudiante no encontrado',
            });
        }

        res.json({
            success: true,
            data: student,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiante',
            error: error.message,
        });
    }
};

//CREATE
export const createStudent = async (req: Request, res: Response) => {
    try {
        const studentData = req.body;
        const newStudent = await studentsService.create(studentData);

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: newStudent,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al crear estudiante',
            error: error.message,
        });
    }
};

//UPDATE (PUT)
export const updateStudent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const studentData = req.body;
        const updatedStudent = await studentsService.update(id, studentData);

        res.json({
            success: true,
            message: 'Estudiante actualizado exitosamente',
            data: updatedStudent,
        });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al actualizar estudiante',
            error: error.message,
        });
    }
};
//UPDATE (PATCH)
export const patchStudent = async (req: Request, res: Response) => {
    try {

         const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }
        
        const student = await studentsService.patchStudent(id, req.body);
        res.json({ success: true, data: student });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Error al actualizar estudiante', error: error.message });
    }
};

//DELETE
export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

         const deletedStudent = await studentsService.remove(id);

        res.json({
            success: true,
            message: 'Estudiante eliminado exitosamente',
            data: deletedStudent,
        });
    } catch (error: any) {
        if (error.message === 'Estudiante no encontrado') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al eliminar estudiante',
            error: error.message,
        });
    }
};
// OTROS GETS
export const getStudentSubjects = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');

        if (isNaN(id) || id === 0) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido',
            });
        }

        const subjects = await studentsService.findSubjectsByStudentId(id);

        res.json({
            success: true,
            data: subjects,
            count: subjects.length,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener asignaturas del estudiante',
            error: error.message,
        });
    }
};