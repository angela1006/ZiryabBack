import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return prisma.course.findMany({
    include: {
      subjects: true,
    },
  });
};

export const findById = async (id: number) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      subjects: true,
    },
  });
};

const assertCourseExists = async (id: number) => {
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!course) {
    throw new Error('Curso no encontrado');
  }
};

export const findDistinctGradesByCourseId = async (id: number) => {
  await assertCourseExists(id);

  const rows = await prisma.subject.groupBy({
    by: ['grade'],
    where: { idCourse: id },
    orderBy: { grade: 'asc' },
  });

  return rows.map((row) => row.grade);
};

export const findSubjectsByCourseIdAndGrade = async (id: number, grade: string) => {
  await assertCourseExists(id);

  return prisma.subject.findMany({
    where: { idCourse: id, grade },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      grade: true,
      hours: true,
      description: true,
      idCourse: true,
    },
  });
};

export const create = async (data: { name: string }) => {
  return prisma.course.create({
    data,
    include: {
      subjects: true,
    },
  });
};

export const update = async (
  id: number,
  data: {
    name?: string;
  }
) => {
  const exists = await prisma.course.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Curso no encontrado');
  }

  return prisma.course.update({
    where: { id },
    data,
    include: {
      subjects: true,
    },
  });
};

export const patch = async (
  id: number,
  data: Partial<{ name: string }>
) => {
  const exists = await prisma.course.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Curso no encontrado');
  }

  return prisma.course.update({
    where: { id },
    data,
    include: {
      subjects: true,
    },
  });
};

export const remove = async (id: number) => {
  const exists = await prisma.course.findUnique({ where: { id } });
  if (!exists) {
    throw new Error('Curso no encontrado');
  }

  return prisma.course.delete({
    where: { id },
  });
};
