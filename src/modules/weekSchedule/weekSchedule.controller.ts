import type { Request, Response } from 'express';
import * as horarioSemanalService from './weekSchedule.service.js';

/**
 * GET /api/horarios-semanales/classes — selector de clases (CURSO-70)
 */
export const getClasses = async (req: Request, res: Response) => {
  try {
    const schoolYear = (req.query.schoolYear as string) || undefined;
    const onlyWithoutSchedule = req.query.onlyWithoutSchedule === 'true';

    const classes = await horarioSemanalService.findClassesByAggregation(
      schoolYear,
      onlyWithoutSchedule
    );

    res.json({
      success: true,
      data: classes,
      count: classes.length,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener clases',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

export const getAllHorarios = async (req: Request, res: Response) => {
  try {
    const horarios = await horarioSemanalService.findAll();
    res.json({
      success: true,
      data: horarios,
      count: horarios.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios',
      error: error.message,
    });
  }
};

export const getHorarioById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const horario = await horarioSemanalService.findById(id);

    if (!horario) {
      return res.status(404).json({
        success: false,
        message: 'Horario no encontrado',
      });
    }

    res.json({
      success: true,
      data: horario,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horario',
      error: error.message,
    });
  }
};

export const getHorariosByTeacherAssignment = async (req: Request, res: Response) => {
  try {
    const idTeacherAssignment = parseInt(req.params.idTeacherAssignment || '0');

    if (isNaN(idTeacherAssignment) || idTeacherAssignment === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de asignación inválido',
      });
    }

    const horarios = await horarioSemanalService.findByTeacherAssignment(idTeacherAssignment);

    res.json({
      success: true,
      data: horarios,
      count: horarios.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios del profesor',
      error: error.message,
    });
  }
};

export const getHorariosByDia = async (req: Request, res: Response) => {
  try {
    const weekDay = req.params.weekDay?.toUpperCase();

    if (!weekDay) {
      return res.status(400).json({
        success: false,
        message: 'Día de la semana requerido',
      });
    }

    const horarios = await horarioSemanalService.findByWeekDay(weekDay as any);

    res.json({
      success: true,
      data: horarios,
      count: horarios.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener horarios del día',
      error: error.message,
    });
  }
};

export const createHorario = async (req: Request, res: Response) => {
  try {
    const horarioData = req.body;
    const newHorario = await horarioSemanalService.create(horarioData);

    res.status(201).json({
      success: true,
      data: newHorario,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error al crear horario',
      error: error.message,
    });
  }
};

export const updateHorario = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const horarioData = req.body;
    const updatedHorario = await horarioSemanalService.update(id, horarioData);

    res.json({
      success: true,
      message: 'Horario actualizado exitosamente',
      data: updatedHorario,
    });
  } catch (error: any) {
    if (error.message === 'Horario no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar horario',
      error: error.message,
    });
  }
};

export const patchHorario = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const updatedHorario = await horarioSemanalService.patch(id, req.body);

    res.json({
      success: true,
      message: 'Horario actualizado parcialmente',
      data: updatedHorario,
    });
  } catch (error: any) {
    if (error.message === 'Horario no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar horario',
      error: error.message,
    });
  }
};

export const deleteHorario = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id || '0');

    if (isNaN(id) || id === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    await horarioSemanalService.remove(id);

    res.json({
      success: true,
      message: 'Horario eliminado exitosamente',
    });
  } catch (error: any) {
    if (error.message === 'Horario no encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar horario',
      error: error.message,
    });
  }
};

export const getHorariosByTeacher = async (req: Request, res: Response) => {
  try {
    const idTeacher = parseInt(req.params.idTeacher || '0');
    if (isNaN(idTeacher) || idTeacher === 0) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    const horarios = await horarioSemanalService.findByTeacherId(idTeacher);
    res.json({ success: true, data: horarios, count: horarios.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener horarios', error: error.message });
  }
};

export const getHorariosByStudent = async (req: Request, res: Response) => {
  try {
    const idStudent = parseInt(req.params.idStudent || '0');
    if (isNaN(idStudent) || idStudent === 0) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }
    const horarios = await horarioSemanalService.findByStudentId(idStudent);
    res.json({ success: true, data: horarios, count: horarios.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener horarios', error: error.message });
  }
};

/**
 * POST /api/horarios-semanales/materialize — plantilla vacía por clase (CURSO-146)
 */
export const materializeHorario = async (req: Request, res: Response) => {
  try {
    const result = await horarioSemanalService.materialize(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};