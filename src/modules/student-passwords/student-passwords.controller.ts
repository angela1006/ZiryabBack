import type { Request, Response } from 'express';
import * as studentPasswordsService from './student-passwords.service.js';

export type StudentPasswordItem = {
  idStudent: number;
  studentName: string;
  password: string;
  idTutor: number | null;
};

const toStudentPasswordItem = (row: {
  idStudent: number;
  password: string;
  idTutor: number | null;
  student: { name: string; surname: string };
}): StudentPasswordItem => ({
  idStudent: row.idStudent,
  studentName: `${row.student.name} ${row.student.surname}`.trim(),
  password: row.password,
  idTutor: row.idTutor,
});

const parseId = (value: string | undefined): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('ID inválido');
  }
  return parsed;
};

const parseBodyId = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('ID inválido');
  }
  return parsed;
};

export const savePassword = async (req: Request, res: Response) => {
  try {
    const idStudent = parseBodyId(req.body.idStudent);
    const password =
      typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!password) {
      return res.status(400).json({ success: false, data: [] });
    }

    await studentPasswordsService.save({ idStudent, password });

    const credential = await studentPasswordsService.findByStudent(idStudent);
    if (!credential) {
      return res.status(500).json({ success: false, data: [] });
    }

    return res.status(201).json({
      success: true,
      data: [toStudentPasswordItem(credential)],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    if (message === 'ID inválido') {
      return res.status(400).json({ success: false, data: [] });
    }
    return res.status(500).json({ success: false, data: [], error: message });
  }
};

export const patchTutor = async (req: Request, res: Response) => {
  try {
    const idStudent = parseId(req.params.idStudent);
    const idTutor = parseBodyId(req.body.idTutor);

    const updated = await studentPasswordsService.updateTutorByStudent({
      idStudent,
      idTutor,
    });

    return res.status(200).json({
      success: true,
      data: [toStudentPasswordItem(updated)],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    if (message === 'ID inválido') {
      return res.status(400).json({ success: false, data: [] });
    }
    if (message.includes('No record was found')) {
      return res.status(404).json({ success: false, data: [] });
    }
    return res.status(500).json({ success: false, data: [], error: message });
  }
};

export const getByTutor = async (req: Request, res: Response) => {
  try {
    const idTutor = parseId(req.params.idTutor);
    const requesterId = req.user?.sub;
    const requesterRole = req.user?.role;

    if (requesterRole === 'TEACHER' && requesterId !== idTutor) {
      return res.status(403).json({ success: false, data: [] });
    }

    const rows = await studentPasswordsService.findByTutor(idTutor);
    const data = rows.map(toStudentPasswordItem);

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message === 'ID inválido' ? 400 : 500;
    return res.status(status).json({ success: false, data: [] });
  }
};

export const getByStudent = async (req: Request, res: Response) => {
  try {
    const idStudent = parseId(req.params.idStudent);
    const requesterId = req.user?.sub;
    const requesterRole = req.user?.role;

    const credential = await studentPasswordsService.findByStudent(idStudent);
    if (!credential) {
      return res.status(404).json({ success: false, data: [] });
    }

    if (
      requesterRole === 'TEACHER' &&
      (credential.idTutor === null || credential.idTutor !== requesterId)
    ) {
      return res.status(403).json({ success: false, data: [] });
    }

    return res.status(200).json({
      success: true,
      data: [toStudentPasswordItem(credential)],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const status = message === 'ID inválido' ? 400 : 500;
    return res.status(status).json({ success: false, data: [] });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const idStudent = parseId(req.params.idStudent);
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!password) {
      return res.status(400).json({ success: false, data: [] });
    }

    const updated = await studentPasswordsService.updatePasswordByStudent(idStudent, password);

    return res.status(200).json({
      success: true,
      data: [toStudentPasswordItem(updated)],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    if (message === 'ID inválido') {
      return res.status(400).json({ success: false, data: [] });
    }
    if (message.includes('No record was found')) {
      return res.status(404).json({ success: false, data: [] });
    }
    return res.status(500).json({ success: false, data: [] });
  }
};
