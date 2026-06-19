import prisma from '../../config/prisma.js';

export const findAll = async () => {
  return prisma.group.findMany({
    select: {
      id: true,
      name: true,
      capacity: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });
};

export const findById = async (id: number) => {
  return prisma.group.findUnique({
    where: { id },
    include: {
      studentEnrollments: {
        include: {
          student: true,
          subject: true,
        },
      },
    },
  });
};

export const create = async (data: { name: string; capacity?: number }) => {
  return prisma.group.create({ data });
};

export const update = async (id: number, data: { name?: string; capacity?: number }) => {
  const exists = await prisma.group.findUnique({ where: { id } });
  if (!exists) throw new Error('Grupo no encontrado');
  return prisma.group.update({ where: { id }, data });
};

export const patch = async (id: number, data: Partial<{ name: string; capacity: number }>) => {
  const exists = await prisma.group.findUnique({ where: { id } });
  if (!exists) throw new Error('Grupo no encontrado');
  return prisma.group.update({ where: { id }, data });
};

export const remove = async (id: number) => {
  const exists = await prisma.group.findUnique({ where: { id } });
  if (!exists) throw new Error('Grupo no encontrado');
  return prisma.group.delete({ where: { id } });
};
