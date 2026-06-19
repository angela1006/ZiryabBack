import type { Prisma } from '@prisma/client';
import { DayOfWeek, SessionStatus } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { buildClassLabelFromAssignment } from '../../utils/classLabel.js';
import type { BulkSuspendBody } from './classSession.schema.js';

const SUSPENDABLE_STATUSES: SessionStatus[] = ['SCHEDULED', 'COMPLETED'];

const parseDateRange = (dateFrom: string, dateTo: string) => {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
};

export const buildSuspendWhere = (filters: BulkSuspendBody): Prisma.SessionClassWhereInput => {
  const { from, to } = parseDateRange(filters.dateFrom, filters.dateTo);

  const assignmentWhere: Prisma.TeacherOnSubjectOnGroupWhereInput = {};
  if (filters.idCourse !== undefined) {
    assignmentWhere.subject = { idCourse: filters.idCourse };
  }
  if (filters.idSubject !== undefined) {
    assignmentWhere.idSubject = filters.idSubject;
  }
  if (filters.idGroup !== undefined) {
    assignmentWhere.idGroup = filters.idGroup;
  }
  if (filters.idTeacher !== undefined) {
    assignmentWhere.idTeacher = filters.idTeacher;
  }

  const hasAssignmentFilters = Object.keys(assignmentWhere).length > 0;

  return {
    date: { gte: from, lte: to },
    status: { in: SUSPENDABLE_STATUSES },
    ...(hasAssignmentFilters && {
      schedule: {
        teacherAssignment: assignmentWhere,
      },
    }),
  };
};

export const countSuspendPreview = async (filters: BulkSuspendBody): Promise<number> => {
  return prisma.sessionClass.count({ where: buildSuspendWhere(filters) });
};

export const bulkSuspendSessions = async (filters: BulkSuspendBody): Promise<number> => {
  const result = await prisma.sessionClass.updateMany({
    where: buildSuspendWhere(filters),
    data: { status: 'CANCELLED' },
  });
  return result.count;
};

export const findAll = async () => {
  return prisma.sessionClass.findMany({
    include: {
      schedule: {
        include: {
          teacherAssignment: {
            include: {
              teacher: true,
              subject: true,
              group: true,
            },
          },
        },
      },
      assistances: true,
    },
    orderBy: [
      { date: 'desc' },
    ],
  });
};

export const findById = async (id: number) => {
  return prisma.sessionClass.findUnique({
    where: { id },
    include: {
      schedule: {
        include: {
          teacherAssignment: {
            include: {
              teacher: true,
              subject: true,
              group: true,
            },
          },
        },
      },
      assistances: {
        include: {
          studentEnrollment: {
            include: {
              student: true,
            },
          },
        },
      },
    },
  });
};

export const findBySchedule = async (idSchedule: number) => {
  return prisma.sessionClass.findMany({
    where: { idSchedule },
    include: {
      schedule: true,
      assistances: true,
    },
    orderBy: [
      { date: 'desc' },
    ],
  });
};


export const findOrCreateActiveSession = async (
  idTeacherAssignment: number,
  weekDay: number | string,
  horaActual: string,
  fechaHoy: Date
) => {
  let mappedWeekDay: DayOfWeek | undefined;
  if (typeof weekDay === 'string') {
    mappedWeekDay = Object.values(DayOfWeek).find((value) => value === weekDay as DayOfWeek);
  } else {
    const weekDayValues = Object.values(DayOfWeek);
    mappedWeekDay = weekDayValues[weekDay - 1];
  }

  if (!mappedWeekDay) {
    throw new Error('Día de la semana inválido');
  }

  const schedule = await prisma.weekSchedule.findFirst({
    where: {
      idTeacherAssignment,
      weekDay: mappedWeekDay,
      startTime: { lte: horaActual },
      finishTime: { gte: horaActual },
    },
  });

  if (!schedule) throw new Error('No hay clase activa en este momento');

  const startOfDay = new Date(fechaHoy);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(fechaHoy);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.sessionClass.findFirst({
    where: {
      idSchedule: schedule.id,
      date: { gte: startOfDay, lte: endOfDay },
    },
  });

  if (existing) return existing;

  return prisma.sessionClass.create({
    data: {
      idSchedule: schedule.id,
      date: fechaHoy,
      status: 'SCHEDULED',
    }
    //rama de ángela
    //data: { idSchedule: schedule.id, date: fechaHoy, status: 'SCHEDULED' },
  });
};

export const create = async (data: {
  idSchedule: number;
  date: string; // "2024-09-01"
  status?: string;
  apointments?: string;
}) => {
  // Verificar que el schedule existe
  const scheduleExists = await prisma.weekSchedule.findUnique({
    where: { id: data.idSchedule },
  });

  if (!scheduleExists) {
    throw new Error('El horario no existe');
  }

  return prisma.sessionClass.create({
    data: {
      idSchedule: data.idSchedule,
      date: new Date(data.date),
      status: (data.status as SessionStatus) || 'SCHEDULED',
      apointments: data.apointments || null,
    },
    include: {
      schedule: {
        include: {
          teacherAssignment: {
            include: {
              teacher: true,
              subject: true,
              group: true,
            },
          },
        },
      },
    },
  });
};

export const update = async (
  id: number,
  data: {
    date?: string;
    status?: string;
    apointments?: string;
  }
) => {
  const exists = await prisma.sessionClass.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Sesión no encontrada');
  }

  return prisma.sessionClass.update({
    where: { id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.status && { status: data.status as SessionStatus }),
      ...(data.apointments !== undefined && { apointments: data.apointments }),
    },
    include: {
      schedule: true,
      assistances: true,
    },
  });
};

export const remove = async (id: number) => {
  const exists = await prisma.sessionClass.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Sesión no encontrada');
  }

  return prisma.sessionClass.delete({
    where: { id },
  });
};

export const findOrCreateSessionForSubjectAndTeacher = async (
  idSubject: number,
  idTeacher: number
) => {
  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const todayDay = days[now.getDay()] as DayOfWeek;

  const assignments = await prisma.teacherOnSubjectOnGroup.findMany({
    where: { idSubject, idTeacher },
    include: {
      weekSchedules: true,
      subject: { include: { course: true } },
      group: true,
    },
  });

  if (assignments.length === 0) {
    throw new Error('No se encontró una asignación para ese profesor y asignatura');
  }

  let selectedSchedule = null;

  // Horario de la clase en la franja actual
  for (const assignment of assignments) {
    const match = assignment.weekSchedules.find(s =>
      s.weekDay === todayDay &&
      s.startTime <= currentHour &&
      s.finishTime >= currentHour
    );
    if (match) {
      selectedSchedule = match;
      break;
    }
  }

  // buscamos si hay alguna programada para hoy 
  if (!selectedSchedule) {
    for (const assignment of assignments) {
      const todayMatch = assignment.weekSchedules.find(s => s.weekDay === todayDay);
      if (todayMatch) {
        selectedSchedule = todayMatch;
        break;
      }
    }
  }

  // genérico con la hora actual
  if (!selectedSchedule) {
    const assignmentId = assignments[0].id;
    const currentStartTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    selectedSchedule = await prisma.weekSchedule.findFirst({
      where: { 
        idTeacherAssignment: assignmentId, 
        weekDay: todayDay,
        startTime: { contains: ':' } // Filtro genérico
      }
    });

    if (!selectedSchedule) {
      const assignment = assignments.find((a) => a.id === assignmentId) ?? assignments[0];
      selectedSchedule = await prisma.weekSchedule.create({
        data: {
          idTeacherAssignment: assignmentId,
          label: buildClassLabelFromAssignment(assignment),
          weekDay: todayDay,
          startTime: currentStartTime,
          finishTime: '23:59',
        },
      });
    }
  }

  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const existing = await prisma.sessionClass.findFirst({
    where: { idSchedule: selectedSchedule.id, date: todayDate },
  });

  if (existing) return existing;

  return prisma.sessionClass.create({
    data: {
      idSchedule: selectedSchedule.id,
      date: todayDate,
      status: 'SCHEDULED',
    },
  });
};

export const bulkGenerate = async (label: string, schoolYear: string) => {
  const [startYearStr, endYearStr] = schoolYear.split('-');
  if (!startYearStr || !endYearStr) {
    throw new Error('schoolYear debe ser formato "YYYY-YYYY" (ej: "2024-2025")');
  }

  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);
  if (Number.isNaN(startYear) || Number.isNaN(endYear)) {
    throw new Error('schoolYear contiene años inválidos');
  }

  // Rango de calendario escolar: septiembre (startYear) a junio (endYear)
  const startDate = new Date(startYear, 8, 1); // September 1st
  const endDate = new Date(endYear, 5, 30); // June 30th

  // Buscar todas las WeekSchedule con este label
  const weekSchedules = await prisma.weekSchedule.findMany({
    where: { label },
  });

  if (weekSchedules.length === 0) {
    throw new Error(`No se encontraron franjas horarias para esta clase (label: "${label}")`);
  }

  // Generar fechas para cada weekDay en el rango
  const sessionsToCreate: Prisma.SessionClassCreateManyInput[] = [];

  for (const schedule of weekSchedules) {
    // Día de la semana (0=Sunday, 1=Monday, ..., 6=Saturday en JavaScript)
    const dayOfWeekMap: Record<DayOfWeek, number> = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 0,
    };
    const targetDayOfWeek = dayOfWeekMap[schedule.weekDay];

    let currentDate = new Date(startDate);
    // Ajustar a la primera ocurrencia del weekDay deseado
    while (currentDate.getDay() !== targetDayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generar sesiones para cada semana en el rango
    while (currentDate <= endDate) {
      sessionsToCreate.push({
        date: new Date(currentDate),
        status: 'SCHEDULED',
        idSchedule: schedule.id,
      });
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }

  if (sessionsToCreate.length === 0) {
    throw new Error('No se pudieron generar sesiones para este rango de fechas');
  }

  // Crear sesiones en lotes, ignorando duplicados
  const result = await prisma.sessionClass.createMany({
    data: sessionsToCreate,
    skipDuplicates: true,
  });

  return {
    created: result.count,
    skipped: sessionsToCreate.length - result.count,
  };
};