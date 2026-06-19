import prisma from '../../config/prisma.js';
import { AuthService } from '../auth/auth.service.js';

type BasicUser = {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: string;
  firebaseUID: string;
};

const basicSelect = {
  id: true,
  email: true,
  name: true,
  surname: true,
  role: true,
  firebaseUID: true,
} as const;

export const findAllUsers = async (): Promise<BasicUser[]> => {
  const [students, teachers, admins] = await Promise.all([
    prisma.student.findMany({ select: basicSelect }),
    prisma.teacher.findMany({ select: basicSelect }),
    prisma.admin.findMany({ select: basicSelect }),
  ]);

  return [...students, ...teachers, ...admins];
};

export const findUserById = async (id: number): Promise<BasicUser | null> => {
  const [student, teacher, admin] = await Promise.all([
    prisma.student.findUnique({ where: { id }, select: basicSelect }),
    prisma.teacher.findUnique({ where: { id }, select: basicSelect }),
    prisma.admin.findUnique({ where: { id }, select: basicSelect }),
  ]);

  return student || teacher || admin;
};

export const findCurrentUser = async (id: number, role: string): Promise<BasicUser | null> => {
  return AuthService.getUserById(id, role);
};

export const updateCurrentUser = async (
  id: number,
  role: string,
  data: { name?: string; email?: string }
): Promise<BasicUser | null> => {
  const updateData: { name?: string; email?: string } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;

  if (role === 'STUDENT') {
    return prisma.student.update({ where: { id }, data: updateData, select: basicSelect });
  }
  if (role === 'TEACHER') {
    return prisma.teacher.update({ where: { id }, data: updateData, select: basicSelect });
  }
  if (role === 'ADMIN') {
    return prisma.admin.update({ where: { id }, data: updateData, select: basicSelect });
  }

  return null;
};
