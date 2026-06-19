import prisma from '../../config/prisma.js';
import { EvaluationPeriod } from '@prisma/client';

type SubjectEvaluationPayload = {
  idStudentEnrollment: number;
  period: EvaluationPeriod;
  value?: number;
  observations?: string | null;
};

const ensureTeacherIsTutorForEnrollment = async (
  idTeacher: number,
  idStudentEnrollment: number,
) => {
  const enrollment = await prisma.studentOnSubjectOnGroup.findUnique({
    where: { id: idStudentEnrollment },
    include: { subject: true },
  });

  if (!enrollment) {
    throw new Error('Matrícula no encontrada');
  }

  const tutorAssignment = await prisma.teacherOnSubjectOnGroup.findFirst({
    where: {
      idTeacher,
      idGroup: enrollment.idGroup,
      schoolYear: enrollment.schoolYear,
      isTutor: true,
      subject: {
        idCourse: enrollment.subject.idCourse,
        grade: enrollment.subject.grade,
      },
    },
  });

  if (!tutorAssignment) {
    throw new Error('Solo el tutor del grupo puede introducir evaluaciones');
  }

  return enrollment;
};

export const findByStudentEnrollment = async (idStudentEnrollment: number) => {
  return prisma.subjectEvaluation.findMany({
    where: { idStudentEnrollment },
    orderBy: { period: 'asc' },
  });
};

/**
 * Devuelve las clases (course + grade + group + schoolYear) en las que el profesor es tutor.
 */
export const getTutoredGroups = async (idTeacher: number) => {
  const tutorAssignments = await prisma.teacherOnSubjectOnGroup.findMany({
    where: { idTeacher, isTutor: true },
    include: {
      subject: {
        include: { course: true },
      },
      group: true,
    },
    orderBy: [{ schoolYear: 'desc' }, { idGroup: 'asc' }],
  });

  const result = await Promise.all(
    tutorAssignments.map(async (assignment) => {
      const studentEnrollments = await prisma.studentOnSubjectOnGroup.findMany({
        where: {
          idGroup: assignment.idGroup,
          schoolYear: assignment.schoolYear,
          subject: {
            idCourse: assignment.subject.idCourse,
            grade: assignment.subject.grade,
          },
        },
        include: {
          student: true,
          subject: true,
        },
      });

      return {
        id: assignment.id,
        schoolYear: assignment.schoolYear,
        grade: assignment.subject.grade,
        course: assignment.subject.course,
        group: assignment.group,
        studentEnrollments,
      };
    }),
  );

  return result;
};

export const isTutorOfAssignmentClass = async (idTeacher: number, idTutorAssignment: number) => {
  const tutorAssignment = await prisma.teacherOnSubjectOnGroup.findFirst({
    where: {
      id: idTutorAssignment,
      idTeacher,
      isTutor: true,
    },
  });
  return Boolean(tutorAssignment);
};

export const findByTutorAssignmentAndPeriod = async (
  idTutorAssignment: number,
  period: EvaluationPeriod,
) => {
  const tutorAssignment = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id: idTutorAssignment },
    include: { subject: true },
  });

  if (!tutorAssignment || !tutorAssignment.isTutor) {
    throw new Error('Clase no encontrada');
  }

  return prisma.subjectEvaluation.findMany({
    where: {
      period,
      studentEnrollment: {
        idGroup: tutorAssignment.idGroup,
        schoolYear: tutorAssignment.schoolYear,
        subject: {
          idCourse: tutorAssignment.subject.idCourse,
          grade: tutorAssignment.subject.grade,
        },
      },
    },
    include: {
      studentEnrollment: {
        include: {
          student: true,
          subject: true,
        },
      },
    },
  });
};

export const upsertSubjectEvaluation = async (
  idTeacher: number,
  data: SubjectEvaluationPayload,
) => {
  await ensureTeacherIsTutorForEnrollment(idTeacher, data.idStudentEnrollment);

  return prisma.subjectEvaluation.upsert({
    where: {
      idStudentEnrollment_period: {
        idStudentEnrollment: data.idStudentEnrollment,
        period: data.period,
      },
    },
    update: {
      value: data.value,
      observations: data.observations,
    },
    create: {
      idStudentEnrollment: data.idStudentEnrollment,
      period: data.period,
      value: data.value,
      observations: data.observations,
    },
  });
};

export const bulkUpsertSubjectEvaluations = async (
  idTeacher: number,
  evaluations: SubjectEvaluationPayload[],
) => {
  const results = [];
  for (const evaluation of evaluations) {
    results.push(await upsertSubjectEvaluation(idTeacher, evaluation));
  }
  return results;
};
