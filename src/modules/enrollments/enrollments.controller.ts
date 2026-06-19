import type { Request, Response } from 'express';
import * as enrollmentService from './enrollments.service.js';


export const getAllEnrollmentsRaw = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'GET /api/enrollments se sustituye por GET /api/assignments',
    data: {
      deprecated: 'GET /api/enrollments',
      replacement: 'GET /api/assignments',
    },
  });
};

export const getAllEnrollments = async (req: Request, res: Response) => {
  try {
    const { idSubject, idGroup, schoolYear } = req.query;

    const enrollments = await enrollmentService.getEnrollmentsByFilters(
      parseInt(idSubject as string),
      parseInt(idGroup as string),
      schoolYear as string
    );

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener enrollments',
      error: error.message,
    });
  }
};


/**
 * Sustituido por GET /api/assignments/teacher/:idTeacher?schoolYear=...
 */
export const getAssignmentsByTeacher = async (req: Request, res: Response) => {
  const { idTeacher } = req.params;
  const schoolYear = req.query.schoolYear as string | undefined;
  const replacement = schoolYear
    ? `GET /api/assignments/teacher/${idTeacher}?schoolYear=${schoolYear}`
    : `GET /api/assignments/teacher/${idTeacher}?schoolYear={schoolYear}`;

  res.status(200).json({
    success: true,
    message:
      'GET /api/enrollments/teacher/:idTeacher se sustituye por GET /api/assignments/teacher/:idTeacher',
    data: {
      deprecated: `GET /api/enrollments/teacher/${idTeacher}`,
      replacement,
    },
  });
};