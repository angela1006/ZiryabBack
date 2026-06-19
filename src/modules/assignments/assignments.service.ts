import { AssignmentStatus } from '@prisma/client';
import prisma from '../../config/prisma.js';
import type { CreateAssignmentBody, PatchAssignmentBody } from './assignments.schema.js';

export type CreateAssignmentResult =
  | { kind: 'created'; assignment: Awaited<ReturnType<typeof prisma.teacherOnSubjectOnGroup.create>> }
  | { kind: 'duplicate'; existing: { id: number } }
  | { kind: 'error'; message: string };

/**
 * Lista todas las asignaciones profesor-asignatura-grupo (TeacherOnSubjectOnGroup).
 */
export const findAllAssignments = async () => {
  return prisma.teacherOnSubjectOnGroup.findMany({
    include: {
      teacher: true,
      group: true,
      subject: {
        include: {
          course: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
};

/**
 * Asignaciones de un profesor en un año académico (tarjetas asignatura/grupo).
 */
/**
 * Asignaciones de un ciclo + grade + año escolar (datagrid wizard Course).
 */
export const findAssignmentsByCourseGrade = async (
  idCourse: number,
  grade: string,
  schoolYear: string,
) => {
  const course = await prisma.course.findUnique({
    where: { id: idCourse },
    select: { id: true },
  });
  if (!course) {
    throw new Error('Curso no encontrado');
  }

  return prisma.teacherOnSubjectOnGroup.findMany({
    where: {
      schoolYear,
      subject: {
        idCourse,
        grade,
      },
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
          grade: true,
          idCourse: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ subject: { name: 'asc' } }, { group: { name: 'asc' } }],
  });
};

export const findAssignmentsByTeacher = async (idTeacher: number, schoolYear: string) => {
  return prisma.teacherOnSubjectOnGroup.findMany({
    where: {
      idTeacher,
      schoolYear,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          grade: true,
          course: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { subject: { course: { name: 'asc' } } },
      { subject: { grade: 'asc' } },
      { subject: { name: 'asc' } },
      { group: { name: 'asc' } },
    ],
  });
};

const assignmentInclude = {
  teacher: true,
  group: true,
  subject: {
    include: {
      course: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

/**
 * Crea una asignación si no existe ya la tripleta (asignatura + grupo + curso escolar).
 * Prisma: @@unique([idSubject, idGroup, schoolYear])
 */
export const createAssignment = async (
  input: CreateAssignmentBody,
): Promise<CreateAssignmentResult> => {
  const [subject, group] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: input.idSubject },
      select: { id: true, idCourse: true, grade: true },
    }),
    prisma.group.findUnique({ where: { id: input.idGroup } }),
  ]);

  if (input.idTeacher != null) {
    const teacher = await prisma.teacher.findUnique({ where: { id: input.idTeacher } });
    if (!teacher) {
      return { kind: 'error', message: 'Profesor no encontrado' };
    }
  }
  if (!subject) {
    return { kind: 'error', message: 'Asignatura no encontrada' };
  }
  if (!group) {
    return { kind: 'error', message: 'Grupo no encontrado' };
  }

  const existing = await prisma.teacherOnSubjectOnGroup.findFirst({
    where: {
      idSubject: input.idSubject,
      idGroup: input.idGroup,
      schoolYear: input.schoolYear,
    },
  });

  if (existing) {
    return { kind: 'duplicate', existing: { id: existing.id } };
  }

  // Validación correcta: solo un tutor por CLASE (course + grade + group + schoolYear)
  if (input.isTutor) {
    const existingTutor = await prisma.teacherOnSubjectOnGroup.findFirst({
      where: {
        idGroup: input.idGroup,
        schoolYear: input.schoolYear,
        isTutor: true,
        subject: {
          idCourse: subject.idCourse,
          grade: subject.grade,
        },
      },
    });

    if (existingTutor) {
      return {
        kind: 'error',
        message: 'Ya existe un tutor asignado a esta clase para este año escolar',
      };
    }
  }

  const assignment = await prisma.teacherOnSubjectOnGroup.create({
    data: {
      idTeacher: input.idTeacher ?? null,
      idSubject: input.idSubject,
      idGroup: input.idGroup,
      schoolYear: input.schoolYear,
      status: input.status ?? AssignmentStatus.STANDBY,
      isTutor: input.isTutor ?? false,
    },
    include: assignmentInclude,
  });

  return { kind: 'created', assignment };
};

export const patchAssignment = async (
  id: number,
  data: PatchAssignmentBody,
): Promise<
  | { kind: 'updated'; assignment: Awaited<ReturnType<typeof prisma.teacherOnSubjectOnGroup.update>> }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string }
> => {
  const existing = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id },
    include: {
      subject: {
        select: {
          idCourse: true,
          grade: true,
        },
      },
    },
  });

  if (!existing) return { kind: 'notFound' };

  if (data.isTutor === true) {
    const existingTutor = await prisma.teacherOnSubjectOnGroup.findFirst({
      where: {
        idGroup: existing.idGroup,
        schoolYear: existing.schoolYear,
        isTutor: true,
        subject: {
          idCourse: existing.subject.idCourse,
          grade: existing.subject.grade,
        },
        NOT: { id },
      },
    });

    if (existingTutor) {
      return {
        kind: 'error',
        message: 'Ya existe un tutor asignado a esta clase para este año escolar',
      };
    }
  }

  const assignment = await prisma.teacherOnSubjectOnGroup.update({
    where: { id },
    data,
    include: assignmentInclude,
  });

  return { kind: 'updated', assignment };
};

export type BulkCreateRowResult = {
  index: number;
  assignment: Awaited<ReturnType<typeof prisma.teacherOnSubjectOnGroup.create>>;
};

export type BulkDuplicateRow = {
  index: number;
  input: CreateAssignmentBody;
  existingId: number;
};

export type BulkErrorRow = {
  index: number;
  input: CreateAssignmentBody;
  message: string;
};

/**
 * Alta masiva: por cada fila, creada / duplicada / error (validación o FK).
 */
export const createAssignmentsBulk = async (items: CreateAssignmentBody[]) => {
  const created: BulkCreateRowResult[] = [];
  const duplicates: BulkDuplicateRow[] = [];
  const errors: BulkErrorRow[] = [];

  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    const result = await createAssignment(row);
    if (result.kind === 'created') {
      created.push({ index: i, assignment: result.assignment });
    } else if (result.kind === 'duplicate') {
      duplicates.push({ index: i, input: row, existingId: result.existing.id });
    } else {
      errors.push({ index: i, input: row, message: result.message });
    }
  }

  return { created, duplicates, errors };
};
