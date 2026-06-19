import { Request, Response } from 'express';
import * as subjectEvaluationService from './subject-evaluation.service.js';
import { EvaluationPeriod } from '@prisma/client';
import prisma from '../../config/prisma.js';

export const getMySubjectEvaluations = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.sub;
    if (!studentId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const enrollments = await prisma.studentOnSubjectOnGroup.findMany({
      where: { idStudent: studentId },
      include: { subject: true },
    });

    const allEvaluations = [];
    for (const enrollment of enrollments) {
      const evaluations = await subjectEvaluationService.findByStudentEnrollment(enrollment.id);
      allEvaluations.push({
        enrollmentId: enrollment.id,
        subjectId: enrollment.idSubject,
        subjectName: enrollment.subject.name,
        evaluations,
      });
    }

    res.json({ message: 'Evaluaciones recuperadas', data: allEvaluations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertSubjectEvaluation = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.sub;
    if (!teacherId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const evaluation = await subjectEvaluationService.upsertSubjectEvaluation(teacherId, req.body);
    res.json({ message: 'Evaluación guardada correctamente', data: evaluation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const bulkUpsertSubjectEvaluations = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.sub;
    if (!teacherId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const results = await subjectEvaluationService.bulkUpsertSubjectEvaluations(
      teacherId,
      req.body.evaluations,
    );
    res.json({ message: 'Evaluaciones guardadas correctamente', data: results });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getTutoredGroups = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user?.sub;
    if (!teacherId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const groups = await subjectEvaluationService.getTutoredGroups(teacherId);
    res.json({ message: 'Grupos tutorados recuperados', data: groups });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjectEvaluationsByTutorAssignmentAndPeriod = async (
  req: Request,
  res: Response,
) => {
  try {
    const teacherId = req.user?.sub;
    const { idTutorAssignment, period } = req.params;

    if (!teacherId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const isTutor = await subjectEvaluationService.isTutorOfAssignmentClass(
      teacherId,
      parseInt(idTutorAssignment),
    );
    if (!isTutor) {
      return res.status(403).json({ message: 'No eres el tutor de este grupo' });
    }

    const evaluations = await subjectEvaluationService.findByTutorAssignmentAndPeriod(
      parseInt(idTutorAssignment),
      period as EvaluationPeriod,
    );
    res.json({ message: 'Evaluaciones del grupo recuperadas', data: evaluations });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
