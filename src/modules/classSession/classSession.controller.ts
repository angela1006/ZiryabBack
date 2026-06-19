import type { Request, Response } from 'express';
import * as classSessionService from './classSession.service.js';
import { bulkSuspendBodySchema, bulkGenerateBodySchema } from './classSession.schema.js';

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await classSessionService.findAll();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones',
      error: error.message,
    });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const session = await classSessionService.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesión',
      error: error.message,
    });
  }
};

export const getActiveSession = async (req: Request, res: Response) => {
  try {
    const idTeacherAssignment = parseInt(req.query.idTeacherAssignment as string || '0');
    const weekDay = parseInt(req.query.weekDay as string || '0');
    const horaActual = req.query.horaActual as string;
    const fechaHoy = new Date(req.query.fechaHoy as string);

    if (!idTeacherAssignment || !weekDay || !horaActual || isNaN(fechaHoy.getTime())) {
      return res.status(400).json({ success: false, message: 'Parámetros inválidos o incompletos' });
    }

    const session = await classSessionService.findOrCreateActiveSession(
      idTeacherAssignment, weekDay, horaActual, fechaHoy
    );

    res.json({ success: true, data: session });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};


export const getSessionsBySchedule = async (req: Request, res: Response) => {
  try {
    const idSchedule = parseInt(req.params.idSchedule || '0');

    if (isNaN(idSchedule) || idSchedule === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de horario inválido',
      });
    }

    const sessions = await classSessionService.findBySchedule(idSchedule);

    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener sesiones del horario',
      error: error.message,
    });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const sessionData = req.body;
    const newSession = await classSessionService.create(sessionData);

    res.status(201).json({
      success: true,
      data: newSession,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error al crear sesión',
      error: error.message,
    });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const updatedSession = await classSessionService.update(id, req.body);

    res.json({
      success: true,
      message: 'Sesión actualizada exitosamente',
      data: updatedSession,
    });
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar sesión',
      error: error.message,
    });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    await classSessionService.remove(id);

    res.json({
      success: true,
      message: 'Sesión eliminada exitosamente',
    });
  } catch (error: any) {
    if (error.message === 'Sesión no encontrada') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar sesión',
      error: error.message,
    });
  }
};

export const suspendPreview = async (req: Request, res: Response) => {
  const parsed = bulkSuspendBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Cuerpo inválido',
      errors: parsed.error.flatten(),
    });
  }

  try {
    const count = await classSessionService.countSuspendPreview(parsed.data);
    res.json({ success: true, count });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error al calcular vista previa',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const bulkSuspend = async (req: Request, res: Response) => {
  const parsed = bulkSuspendBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Cuerpo inválido',
      errors: parsed.error.flatten(),
    });
  }

  try {
    const count = await classSessionService.bulkSuspendSessions(parsed.data);
    res.json({ success: true, count });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error al suspender sesiones',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const startSessionForSubject = async (req: Request, res: Response) => {
  try {
    const { idSubject, idTeacher } = req.body;

    if (!idSubject || !idTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren idSubject e idTeacher',
      });
    }

    const session = await classSessionService.findOrCreateSessionForSubjectAndTeacher(
      Number(idSubject),
      Number(idTeacher)
    );

    res.status(200).json({ success: true, data: session });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkGenerate = async (req: Request, res: Response) => {
  const parsed = bulkGenerateBodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: 'Validación fallida',
      message: 'Request body inválido',
    });
  }

  try {
    const { label, schoolYear } = parsed.data;
    const result = await classSessionService.bulkGenerate(label, schoolYear);
    res.status(200).json({
      success: true,
      created: result.created,
      skipped: result.skipped,
      message: `Se han generado ${result.created} sesiones de clase`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json({
      success: false,
      error: message,
      message: 'Error al generar las sesiones',
    });
  }
};