import prisma from '../../config/prisma.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

const assertSubstitutionExists = async (id: number) => {
  const record = await prisma.assignmentSubstitution.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!record) throw new Error('Sustitución no encontrada');
};

const assertAssignmentExists = async (id: number) => {
  const record = await prisma.teacherOnSubjectOnGroup.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!record) throw new Error('Assignment no encontrado');
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const findAll = async () => {
  return prisma.assignmentSubstitution.findMany({
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      substitute: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findById = async (id: number) => {
  return prisma.assignmentSubstitution.findUnique({
    where: { id },
    include: {
      teacherAssignment: {
        include: {
          teacher: true,
          subject: true,
          group: true,
        },
      },
      substitute: true,
    },
  });
};

// Historial completo de sustituciones de un assignment concreto
export const findByAssignmentId = async (assignmentId: number) => {
  await assertAssignmentExists(assignmentId);

  return prisma.assignmentSubstitution.findMany({
    where: { idTeacherAssignment: assignmentId },
    include: { substitute: true },
    orderBy: { createdAt: 'desc' },
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const create = async (data: {
  idTeacherAssignment: number;
  idSubstitute: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}) => {
  await assertAssignmentExists(data.idTeacherAssignment);

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const endDate = data.endDate ? new Date(data.endDate) : undefined;

  if (endDate && endDate < startDate) {
    throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
  }

  const activeSubstitution = await prisma.assignmentSubstitution.findFirst({
    where: {
      idTeacherAssignment: data.idTeacherAssignment,
      OR: [
        { endDate: null },
        { endDate: { gte: startDate } },
      ],
    },
  });

  if (activeSubstitution) {
    throw new Error('Ya existe una sustitución activa para este assignment');
  }

  return prisma.$transaction(async (tx) => {
    await tx.teacherOnSubjectOnGroup.update({
      where: { id: data.idTeacherAssignment },
      data: {
        currentSubstituteId: data.idSubstitute,
        status: 'ILLNESS',
      },
    });

    return tx.assignmentSubstitution.create({
      data: {
        ...data,
        startDate,
        endDate,
      },
      include: {
        teacherAssignment: true,
        substitute: true,
      },
    });
  });
};

export const update = async (
  id: number,
  data: {
    idTeacherAssignment?: number;
    idSubstitute?: number;
    startDate?: Date;
    endDate?: Date;
    notes?: string;
  }
) => {
  await assertSubstitutionExists(id);

  return prisma.assignmentSubstitution.update({
    where: { id },
    data,
    include: {
      teacherAssignment: true,
      substitute: true,
    },
  });
};

export const patch = async (
  id: number,
  data: Partial<{
    idTeacherAssignment: number;
    idSubstitute: number;
    startDate: Date;
    endDate: Date;
    notes: string;
  }>
) => {
  await assertSubstitutionExists(id);

  return prisma.assignmentSubstitution.update({
    where: { id },
    data,
    include: {
      teacherAssignment: true,
      substitute: true,
    },
  });
};

export const remove = async (id: number) => {
  await assertSubstitutionExists(id);

  return prisma.assignmentSubstitution.delete({ where: { id } });
};

// ─── Caso específico: cerrar una sustitución activa ──────────────────────────

// Pone endDate en el registro de auditoría Y limpia currentSubstituteId
// en el assignment. Todo en transacción.
export const closeSubstitution = async (id: number, endDate: Date) => {
  await assertSubstitutionExists(id);

  const substitution = await prisma.assignmentSubstitution.findUnique({
    where: { id },
    select: { idTeacherAssignment: true },
  });

  return prisma.$transaction([
    prisma.assignmentSubstitution.update({
      where: { id },
      data: { endDate },
    }),
    prisma.teacherOnSubjectOnGroup.update({
      where: { id: substitution!.idTeacherAssignment },
      data: {
        currentSubstituteId: null,
        status: 'ACTIVE',
      },
    }),
  ]);
};