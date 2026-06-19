import type { Request, Response } from 'express';
import * as assistanceService from './assistance.service.js';
import { uploadFromMulter, CLOUDINARY_FOLDERS } from '../../utils/cloudinary.js';

// Controlador para obtener faltas del alumno logueado
export const getMyAbsences = async (req: Request, res: Response) => {
    try {
        if (!req.user || req.user.role !== 'STUDENT') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        const studentId = req.user.sub;
        
        // Reutilizamos el servicio existente que ya excluye presentaciones ('PRESENT')
        const absences = await assistanceService.findAllByStudentId(studentId);
        res.json({ success: true, data: absences, count: absences.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener tus faltas', error: error.message });
    }
};

export const getJustificationStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID de asistencia inválido' });

        const assistance = await assistanceService.findJustificationDetailsById(id);
        if (!assistance) return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });

        // Seguridad: Si es un estudiante, asegurarnos de que la falta es verdaderamente suya
        if (req.user?.role === 'STUDENT' && assistance.studentEnrollment.idStudent !== req.user.sub) {
            return res.status(403).json({ success: false, message: 'Acceso denegado: esta asistencia no te pertenece' });
        }

        res.json({ 
            success: true, 
            data: { 
                idAssistance: assistance.id, 
                status: assistance.status,
                subject: assistance.session.schedule.teacherAssignment.subject.name,
                date: assistance.session.date,
                startTime: assistance.session.schedule.startTime
            } 
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al consultar estado de justificación', error: error.message });
    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        if (req.user?.role === 'TEACHER') {
            const assistances = await assistanceService.findAllByTeacher(req.user.sub);
            return res.json({ success: true, data: assistances, count: assistances.length });
        }
        const assistances = await assistanceService.findAll();
        res.json({ success: true, data: assistances, count: assistances.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener asistencias', error: error.message });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        const assistance = await assistanceService.findById(id);
        if (!assistance) return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkAssistanceOwnership(id, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        res.json({ success: true, data: assistance });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener asistencia', error: error.message });
    }
};

export const getByStudentEnrollment = async (req: Request, res: Response) => {
    try {
        const studentEnrollmentId = parseInt(req.params.idStudentEnrollment || '0');
        if (isNaN(studentEnrollmentId) || studentEnrollmentId === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        const teacherId = req.user?.role === 'TEACHER' ? req.user.sub : undefined;
        const assistances = await assistanceService.findAllByStudentEnrollment(studentEnrollmentId, teacherId);
        res.json({ success: true, data: assistances, count: assistances.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener asistencias', error: error.message });
    }
};

export const getByStudentId = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.idStudent || '0');
        if (isNaN(studentId) || studentId === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        if (req.user?.role === 'STUDENT' && req.user.sub !== studentId) {
            return res.status(403).json({ success: false, message: 'No puedes ver las faltas de otro alumno' });
        }

        const teacherId = req.user?.role === 'TEACHER' ? req.user.sub : undefined;
        const assistances = await assistanceService.findAllByStudentId(studentId, teacherId);
        res.json({ success: true, data: assistances, count: assistances.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener asistencias del alumno', error: error.message });
    }
};

export const getBySessionId = async (req: Request, res: Response) => {
    try {
        const sessionId = parseInt(req.params.idSession || '0');
        if (isNaN(sessionId) || sessionId === 0) return res.status(400).json({ success: false, message: 'ID de sesión inválido' });

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkSessionOwnership(sessionId, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const assistances = await assistanceService.findAllBySessionId(sessionId);
        res.json({ success: true, data: assistances, count: assistances.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al obtener asistencias de la sesión', error: error.message });
    }
};

const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

export const createOne = async (req: Request, res: Response) => {
    try {
        const { idSession, idStudentEnrollment, status } = req.body;

        if (!idSession || !idStudentEnrollment) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: idSession, idStudentEnrollment' });
        }

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Estado de asistencia inválido. Valores permitidos: ${validStatuses.join(', ')}` });
        }

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkSessionOwnership(idSession, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const assistance = await assistanceService.create(req.body);
        res.status(201).json({ success: true, data: assistance });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: 'El alumno ya tiene una asistencia registrada para esta misma sesión.'
            });
        }
        if (error.code === 'P2003') {
            return res.status(404).json({
                success: false,
                message: 'La sesión de clase o la matrícula del alumno referenciada no existe en la base de datos.'
            });
        }
        res.status(400).json({ success: false, message: 'Error al crear asistencia', error: error.message });
    }
};

export const createBulk = async (req: Request, res: Response) => {
    try {
        const { assistances } = req.body;
        if (!Array.isArray(assistances) || assistances.length === 0) {
            return res.status(400).json({ success: false, message: 'Lista de asistencias vacía o inválida' });
        }

        for (const assistance of assistances) {
            if (!assistance.idSession || !assistance.idStudentEnrollment) {
                return res.status(400).json({ success: false, message: 'Todas las asistencias deben tener idSession e idStudentEnrollment' });
            }
            if (assistance.status && !validStatuses.includes(assistance.status)) {
                return res.status(400).json({ success: false, message: `Estado de asistencia inválido en la lista. Valores permitidos: ${validStatuses.join(', ')}` });
            }
        }

        if (req.user?.role === 'TEACHER') {
            const sessionsChecked = new Set<number>();
            for (const assistance of assistances) {
                if (!sessionsChecked.has(assistance.idSession)) {
                    const isOwner = await assistanceService.checkSessionOwnership(assistance.idSession, req.user.sub);
                    if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado para una o más sesiones' });
                    sessionsChecked.add(assistance.idSession);
                }
            }
        }

        const result = await assistanceService.createMany(assistances);
        res.status(201).json({ success: true, count: result.length });
    } catch (error: any) {
        if (error.code === 'P2003') {
            return res.status(404).json({
                success: false,
                message: 'Alguna sesión de clase o matrícula de alumno referenciada en la lista no existe.'
            });
        }
        res.status(400).json({ success: false, message: 'Error al crear asistencias', error: error.message });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        const { status } = req.body;
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}` });
        }

        const updated = await assistanceService.updateStatusById(id, status);
        res.json({ success: true, data: updated });
        
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Error al actualizar asistencia', error: error.message });
    }
};

export const getPendingJustifications = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'No autorizado' });
        }

        const teacherId = req.user.role === 'ADMIN' && req.query.teacherId
            ? parseInt(String(req.query.teacherId))
            : req.user.sub;

        if (req.user.role === 'TEACHER' && teacherId !== req.user.sub) {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const assignmentParam = req.query.idTeacherAssignment;
        const idTeacherAssignment = assignmentParam
            ? parseInt(String(assignmentParam))
            : undefined;

        if (assignmentParam && (isNaN(idTeacherAssignment!) || idTeacherAssignment === 0)) {
            return res.status(400).json({ success: false, message: 'idTeacherAssignment inválido' });
        }

        const items = await assistanceService.findPendingJustificationsByTeacher(
            teacherId,
            idTeacherAssignment
        );

        const data = items.map((item) => {
            const student = item.studentEnrollment.student;
            return {
                id: item.id,
                status: item.status,
                justificationUri: item.justificationUri,
                justificationStatus: item.justificationStatus,
                subjectName: item.session.schedule.teacherAssignment.subject.name,
                sessionDate: item.session.date,
                startTime: item.session.schedule.startTime,
                studentName: `${student.name} ${student.surname}`.trim(),
            };
        });

        res.json({ success: true, data, count: data.length });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener justificaciones pendientes',
            error: error.message,
        });
    }
};

export const justify = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID de asistencia inválido' });

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkAssistanceOwnership(id, req.user.sub);
            // #region agent log justify ownership
            fetch('http://127.0.0.1:7657/ingest/56110fac-808a-4372-8a92-70be1d970306', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '459916' },
                body: JSON.stringify({
                    sessionId: '459916',
                    runId: 'justify-image-debug-1',
                    hypothesisId: 'H3',
                    location: 'assistance.controller.ts:justify:ownership',
                    message: 'teacher ownership check',
                    data: { assistanceId: id, teacherId: req.user.sub, isOwner },
                    timestamp: Date.now(),
                }),
            }).catch(() => {});
            // #endregion
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const assistance = await assistanceService.findById(id);
        if (!assistance) {
            return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });
        }
        // #region agent log justify payload state
        fetch('http://127.0.0.1:7657/ingest/56110fac-808a-4372-8a92-70be1d970306', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '459916' },
            body: JSON.stringify({
                sessionId: '459916',
                runId: 'justify-image-debug-1',
                hypothesisId: 'H1H2',
                location: 'assistance.controller.ts:justify:state-check',
                message: 'justification state before updating',
                data: {
                    assistanceId: assistance.id,
                    justificationUriExists: !!assistance.justificationUri,
                    justificationStatus: assistance.justificationStatus,
                    currentAssistanceStatus: assistance.status,
                },
                timestamp: Date.now(),
            }),
        }).catch(() => {});
        // #endregion
        if (!assistance.justificationUri || assistance.justificationStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'No hay un justificante pendiente de revisión para esta asistencia',
            });
        }

        const updated = await assistanceService.updateStatusToJustified(id);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Error al justificar asistencia', error: error.message });
    }
};

export const rejectJustification = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID de asistencia inválido' });

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkAssistanceOwnership(id, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const assistance = await assistanceService.findById(id);
        if (!assistance) {
            return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });
        }
        if (!assistance.justificationUri || assistance.justificationStatus !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'No hay un justificante pendiente de revisión para esta asistencia',
            });
        }

        const updated = await assistanceService.rejectJustification(id);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: 'Error al rechazar justificación',
            error: error.message,
        });
    }
};

export const updateOne = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        const { status } = req.body;
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}` });
        }

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkAssistanceOwnership(id, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const updated = await assistanceService.updateStatusById(id, status);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(400).json({ success: false, message: 'Error al actualizar asistencia', error: error.message });
    }
};

export const deleteOne = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        if (req.user?.role === 'TEACHER') {
            const isOwner = await assistanceService.checkAssistanceOwnership(id, req.user.sub);
            if (!isOwner) return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await assistanceService.remove(id);
        res.json({ success: true, message: 'Asistencia eliminada' });
    } catch (error: any) {
        if (error.message === 'Asistencia no encontrada') return res.status(404).json({ success: false, message: error.message });
        res.status(500).json({ success: false, message: 'Error al eliminar asistencia', error: error.message });
    }
};

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id || '0');
        if (isNaN(id) || id === 0) return res.status(400).json({ success: false, message: 'ID inválido' });

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se ha subido ningún documento válido' });
        }

        const assistance = await assistanceService.findById(id);
        if (!assistance) {
             return res.status(404).json({ success: false, message: 'Asistencia no encontrada' });
        }

        const justificationUri = await uploadFromMulter(req.file, CLOUDINARY_FOLDERS.justifications);

        const updated = await assistanceService.updateJustificationOnUpload(id, justificationUri);

        res.json({
            success: true,
            message: 'Documento subido correctamente',
            data: { justificationUri: updated.justificationUri }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error al subir el documento de justificación', error: error.message });
    }
};
