import type { Request, Response } from 'express';
import * as studentTaskService from './student-task.service.js';
import { submitSchema } from './student-task.schema.js';
import {
  uploadFromMulter,
  CLOUDINARY_FOLDERS,
  toStoredCloudinaryUrl,
} from '../../utils/cloudinary.js';

export const getAllStudentTasks = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.sub;

    let teacherId: number | undefined;
    let studentId: number | undefined;

    if (userRole === 'TEACHER') teacherId = userId;
    if (userRole === 'STUDENT') studentId = userId;

    const studentTasks = await studentTaskService.findAll(teacherId, studentId);
    res.json({
      success: true,
      data: studentTasks,
      count: studentTasks.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener entregas',
      error: error.message,
    });
  }
};

export const getStudentTaskById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const studentTask = await studentTaskService.findById(id);

    if (!studentTask) {
      return res.status(404).json({
        success: false,
        message: 'Entrega no encontrada',
      });
    }

    res.json({
      success: true,
      data: studentTask,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener entrega',
      error: error.message,
    });
  }
};

export const getStudentTasksByTask = async (req: Request, res: Response) => {
  try {
    const idTask = parseInt(req.params.idTask || '0');

    if (isNaN(idTask) || idTask === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de tarea inválido',
      });
    }

    const studentTasks = await studentTaskService.findByTask(idTask);

    res.json({
      success: true,
      data: studentTasks,
      count: studentTasks.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener entregas de la tarea',
      error: error.message,
    });
  }
};

export const getStudentTasksByStudent = async (req: Request, res: Response) => {
  try {
    const idStudentEnrollment = parseInt(req.params.idStudentEnrollment || '0');

    if (isNaN(idStudentEnrollment) || idStudentEnrollment === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de enrollment inválido',
      });
    }

    const requestingStudentId = req.user?.role === 'STUDENT' ? req.user.sub : undefined;

    const studentTasks = await studentTaskService.findByStudent(idStudentEnrollment, requestingStudentId);

    res.json({
      success: true,
      data: studentTasks,
      count: studentTasks.length,
    });
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : 500;
    res.status(status).json({
      success: false,
      message: 'Error al obtener entregas del estudiante',
      error: error.message,
    });
  }
};

export const updateStudentTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const updatedStudentTask = await studentTaskService.update(id, req.body);

    res.json({
      success: true,
      message: 'Entrega actualizada exitosamente',
      data: updatedStudentTask,
    });
  } catch (error: any) {
    if (error.message === 'Entrega de estudiante no encontrada') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar entrega',
      error: error.message,
    });
  }
};

export const deleteStudentTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    await studentTaskService.remove(id);

    res.json({
      success: true,
      message: 'Entrega eliminada exitosamente',
    });
  } catch (error: any) {
    if (error.message === 'Entrega de estudiante no encontrada') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar entrega',
      error: error.message,
    });
  }
};

export const createStudentTask = async (req: Request, res: Response) => {
  try {
    const data = await studentTaskService.create(req.body);
    res.status(201).json({ success: true, message: 'Entrega creada', data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createBulkStudentTasks = async (req: Request, res: Response) => {
  try {
    const { idTask, enrollmentIds } = req.body;
    if (!idTask || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'idTask y enrollmentIds son requeridos' });
    }
    const data = await studentTaskService.createBulk({ idTask, enrollmentIds });
    res.status(201).json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const submitStudentTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const studentTask = await studentTaskService.findById(id);
    if (!studentTask) {
      return res.status(404).json({ success: false, message: 'Entrega de estudiante no encontrada' });
    }

    // Validar propiedad del estudiante
    if (req.user?.role === 'STUDENT' && studentTask.studentEnrollment.idStudent !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'No puedes entregar una tarea de otro alumno' });
    }

    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Body inválido',
        errors: parsed.error.flatten(),
      });
    }

    const { attachmentUrl } = parsed.data;
    const storedUrl = attachmentUrl ? toStoredCloudinaryUrl(attachmentUrl) : undefined;
    const submittedTask = await studentTaskService.submit(id, { attachmentUrl: storedUrl });

    res.json({ success: true, message: 'Tarea entregada exitosamente', data: submittedTask });
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : 400;
    res.status(status).json({ success: false, message: 'Error al entregar tarea', error: error.message });
  }
};

export const unsubmitStudentTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const studentTask = await studentTaskService.findById(id);
    if (!studentTask) {
      return res.status(404).json({ success: false, message: 'Entrega de estudiante no encontrada' });
    }

    if (req.user?.role === 'STUDENT' && studentTask.studentEnrollment.idStudent !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'No puedes borrar una entrega de otro alumno' });
    }

    const unsubmittedTask = await studentTaskService.unsubmit(id);

    res.json({ success: true, message: 'Entrega borrada exitosamente', data: unsubmittedTask });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Error al borrar entrega', error: error.message });
  }
};

export const gradeStudentTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');
    if (isNaN(id) || id === 0) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const studentTask = await studentTaskService.findById(id);
    if (!studentTask) {
      return res.status(404).json({ success: false, message: 'Entrega de estudiante no encontrada' });
    }

    // Validar propiedad del profesor
    if (req.user?.role === 'TEACHER' && studentTask.task.teacherAssignment.idTeacher !== req.user.sub) {
      return res.status(403).json({ success: false, message: 'No puedes calificar tareas de esta asignatura que no impartes' });
    }

    const { score, feedback } = req.body;
    if (score === undefined) {
      return res.status(400).json({ success: false, message: 'La puntuación (score) es requerida' });
    }

    const gradedTask = await studentTaskService.grade(id, { score, feedback });

    res.json({ success: true, message: 'Tarea calificada exitosamente', data: gradedTask });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Error al calificar tarea', error: error.message });
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo válido' });
    }

    const attachmentUrl = await uploadFromMulter(req.file, CLOUDINARY_FOLDERS.submissions);
    
    res.json({
      success: true,
      message: 'Archivo subido con éxito',
      data: { attachmentUrl }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al recibir el archivo', error: error.message });
  }
};