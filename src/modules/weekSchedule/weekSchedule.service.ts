import prisma from '../../config/prisma.js';
import { DayOfWeek } from '@prisma/client';
import {
  buildClassLabel,
  buildClassLabelFromAssignment,
} from '../../utils/classLabel.js';

const VALID_DAYS = new Set<string>(Object.values(DayOfWeek));

/**
 * Agregación de clases para el selector del builder de horarios (CURSO-70)
 * Agrupa por (courseId, grade, groupId, schoolYear) y cuenta asignaturas
 */
export const findClassesByAggregation = async (
  schoolYear?: string,
  onlyWithoutSchedule?: boolean
) => {
  const assignments = await prisma.teacherOnSubjectOnGroup.findMany({
    where: schoolYear ? { schoolYear } : undefined,
    include: {
      subject: {
        include: {
          course: true,
        },
      },
      group: true,
    },
  });

  // Incluye plantillas materializadas (idTeacherAssignment null), no solo franjas con asignación.
  const classLabelsForYear = new Set<string>();
  for (const assignment of assignments) {
    classLabelsForYear.add(
      buildClassLabel(
        String(assignment.subject.grade),
        assignment.subject.course.name,
        assignment.group.name
      )
    );
  }

  const scheduledLabels = new Set(
    (
      await prisma.weekSchedule.findMany({
        where: classLabelsForYear.size > 0
          ? { label: { in: [...classLabelsForYear] } }
          : undefined,
        select: { label: true },
        distinct: ['label'],
      })
    ).map((row) => row.label)
  );

  const classMap = new Map<string, {
    courseId: number;
    courseName: string;
    grade: string;
    groupId: number;
    groupName: string;
    schoolYear: string;
    subjectIds: Set<number>;
    hasWeekSchedule: boolean;
  }>();

  for (const assignment of assignments) {
    const course = assignment.subject.course;
    const key = `${course.id}_${assignment.subject.grade}_${assignment.idGroup}_${assignment.schoolYear}`;

    if (!classMap.has(key)) {
      classMap.set(key, {
        courseId: course.id,
        courseName: course.name,
        grade: String(assignment.subject.grade),
        groupId: assignment.idGroup,
        groupName: assignment.group.name,
        schoolYear: assignment.schoolYear,
        subjectIds: new Set<number>(),
        hasWeekSchedule: false,
      });
    }

    const classData = classMap.get(key)!;
    classData.subjectIds.add(assignment.idSubject);

    const classLabel = buildClassLabel(
      String(assignment.subject.grade),
      assignment.subject.course.name,
      assignment.group.name
    );
    if (scheduledLabels.has(classLabel)) {
      classData.hasWeekSchedule = true;
    }
  }

  let classes = Array.from(classMap.values()).map((cls) => ({
    label: buildClassLabel(cls.grade, cls.courseName, cls.groupName),
    grade: cls.grade,
    course: { id: cls.courseId, name: cls.courseName },
    group: { id: cls.groupId, name: cls.groupName },
    schoolYear: cls.schoolYear,
    subjectCount: cls.subjectIds.size,
    hasWeekSchedule: cls.hasWeekSchedule,
  }));

  if (onlyWithoutSchedule) {
    classes = classes.filter((cls) => !cls.hasWeekSchedule);
  }

  return classes;
};

export const findAll = async () => {
  return prisma.weekSchedule.findMany({
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
    orderBy: [
      { weekDay: 'asc' },
      { startTime: 'asc' },
    ],
  });
};

export const findById = async (id: number) => {
  return prisma.weekSchedule.findUnique({
    where: { id },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      sessions: {
        include: {
          assistances: true,
        },
      },
    },
  });
};

export const findByTeacherAssignment = async (idTeacherAssignment: number) => {
  return prisma.weekSchedule.findMany({
    where: { idTeacherAssignment },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
    orderBy: [
      { weekDay: 'asc' },
      { startTime: 'asc' },
    ],
  });
};

export const findByTeacherId = async (idTeacher: number) => {
  return prisma.weekSchedule.findMany({
    where: {
      teacherAssignment: {
        idTeacher,
      },
    },
    include: {
      teacherAssignment:{
        include: {
          teacher: {
            select: {
              id: true
            }
          },
          subject: true,
          group: true
        }
      }
    },
    orderBy: [
      { weekDay: 'asc' },
      { startTime: 'asc' }
    ]

  });
};
export const findByWeekDay = async (weekDay: DayOfWeek) => {
  return prisma.weekSchedule.findMany({
    where: { weekDay },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
};


export const findByStudentId = async (idStudent: number) => {
  return prisma.weekSchedule.findMany({
    where: {
      teacherAssignment: {
        subject: {
          studentEnrollments: {
            some: {
              idStudent: idStudent
            }
          }
        },
        group: {
          studentEnrollments: {
            some: {
              idStudent: idStudent
            }
          }
        }
      }
    },
    include: {
      teacherAssignment: {
        include: {
          subject: true,
          group: true
        }
      }
    },
    orderBy: [
      { weekDay: 'asc' },
      { startTime: 'asc' }
    ]
  });
};

export const create = async (data: {
  idTeacherAssignment: number;
  weekDay: string;
  startTime: string;
  finishTime: string;
}) => {
  if (!VALID_DAYS.has(data.weekDay)) {
    throw new Error(`Día inválido: ${data.weekDay}. Valores válidos: ${[...VALID_DAYS].join(', ')}`);
  }

  const assignmentExists = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id: data.idTeacherAssignment },
    include: {
      subject: { include: { course: true } },
      group: true,
    },
  });

  if (!assignmentExists) {
    throw new Error('La asignación de profesor no existe');
  }

  const label = buildClassLabelFromAssignment(assignmentExists);

  return prisma.weekSchedule.create({
    data: {
      idTeacherAssignment: data.idTeacherAssignment,
      label,
      weekDay: data.weekDay as DayOfWeek,
      startTime: data.startTime,
      finishTime: data.finishTime,
    },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
  });
};




export const update = async (
  id: number,
  data: {
    idTeacherAssignment?: number;
    weekDay?: string;
    startTime?: string;
    finishTime?: string;
  }
) => {
  const exists = await prisma.weekSchedule.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Horario no encontrado');
  }

  if (data.weekDay && !VALID_DAYS.has(data.weekDay)) {
    throw new Error(`Día inválido: ${data.weekDay}. Valores válidos: ${[...VALID_DAYS].join(', ')}`);
  }

  return prisma.weekSchedule.update({
    where: { id },
    data: {
      ...(data.idTeacherAssignment && { idTeacherAssignment: data.idTeacherAssignment }),
      ...(data.weekDay && { weekDay: data.weekDay as DayOfWeek }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.finishTime && { finishTime: data.finishTime }),
    },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
  });
};

export const patch = async (
  id: number,
  data: Partial<{
    idTeacherAssignment: number;
    weekDay: string;
    startTime: string;
    finishTime: string;
  }>
) => {
  const exists = await prisma.weekSchedule.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Horario no encontrado');
  }

  if (data.weekDay && !VALID_DAYS.has(data.weekDay)) {
    throw new Error(`Día inválido: ${data.weekDay}. Valores válidos: ${[...VALID_DAYS].join(', ')}`);
  }

  return prisma.weekSchedule.update({
    where: { id },
    data: {
      ...(data.idTeacherAssignment && { idTeacherAssignment: data.idTeacherAssignment }),
      ...(data.weekDay && { weekDay: data.weekDay as DayOfWeek }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.finishTime && { finishTime: data.finishTime }),
    },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
    },
  });
};

export const remove = async (id: number) => {
  const exists = await prisma.weekSchedule.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Horario no encontrado');
  }

  return prisma.weekSchedule.delete({
    where: { id },
  });
};

const NUMBER_TO_DAY: Record<number, DayOfWeek> = {
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
  7: DayOfWeek.SUNDAY,
};

export type MaterializeInput = {
  label: string;
  schoolYear: string;
  weekDays: number[];
  slots: { startTime: string; finishTime: string }[];
};

export const materialize = async (data: MaterializeInput) => {
  const label = data.label?.trim();
  const schoolYear = data.schoolYear?.trim();

  if (!label) {
    throw new Error('label es obligatorio');
  }
  if (!schoolYear) {
    throw new Error('schoolYear es obligatorio');
  }
  if (!data.weekDays?.length) {
    throw new Error('weekDays no puede estar vacío');
  }
  if (!data.slots?.length) {
    throw new Error('slots no puede estar vacío');
  }

  for (const day of data.weekDays) {
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      throw new Error(`Día inválido: ${day}. Debe estar entre 1 y 7`);
    }
  }

  const classes = await findClassesByAggregation(schoolYear);
  const targetClass = classes.find((cls) => cls.label === label);

  if (!targetClass) {
    throw new Error(`Clase no encontrada para el año escolar ${schoolYear}`);
  }
  if (targetClass.hasWeekSchedule) {
    throw new Error('La clase ya tiene plantilla de horario');
  }

  const rows = data.weekDays.flatMap((dayNum) => {
    const weekDay = NUMBER_TO_DAY[dayNum];
    return data.slots.map((slot) => ({
      label,
      weekDay,
      startTime: slot.startTime,
      finishTime: slot.finishTime,
      idTeacherAssignment: null,
    }));
  });

  const result = await prisma.weekSchedule.createMany({ data: rows });

  return {
    label,
    schoolYear,
    created: result.count,
    weekDays: data.weekDays,
    slotCount: data.slots.length,
  };
};