import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma.js';
import { emitToUser } from './notifications.sse.js';

export type CreateNotificationData = {
  recipientFirebaseUID: string;
  title: string;
  message: string;
  type?: string;
};

export type UpdateNotificationData = {
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
};

export type NotificationListFilters = {
  recipientFirebaseUID?: string;
  type?: string;
  isRead?: boolean;
};

const buildWhere = (filters: NotificationListFilters = {}): Prisma.NotificationWhereInput => ({
  ...(filters.recipientFirebaseUID ? { recipientFirebaseUID: filters.recipientFirebaseUID } : {}),
  ...(filters.type ? { type: filters.type } : {}),
  ...(filters.isRead !== undefined ? { isRead: filters.isRead } : {}),
});

export const findAll = async (
  page: number,
  limit: number,
  filters: NotificationListFilters = {},
) => {
  const skip = (page - 1) * limit;
  const where = buildWhere(filters);

  const [total, notifications] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findForRecipient = async (
  recipientFirebaseUID: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;

  const [total, notifications] = await prisma.$transaction([
    prisma.notification.count({
      where: { recipientFirebaseUID },
    }),
    prisma.notification.findMany({
      where: { recipientFirebaseUID },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const assertCanAccess = async (
  id: number,
  requesterFirebaseUID: string,
  isAdmin: boolean,
) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) {
    throw new Error('NOT_FOUND');
  }
  if (!isAdmin && notification.recipientFirebaseUID !== requesterFirebaseUID) {
    throw new Error('NOT_FOUND');
  }
  return notification;
};

export const update = async (
  id: number,
  data: UpdateNotificationData,
  requesterFirebaseUID: string,
  isAdmin: boolean,
) => {
  await assertCanAccess(id, requesterFirebaseUID, isAdmin);

  const updateData: Prisma.NotificationUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.message !== undefined) updateData.message = data.message;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isRead !== undefined) {
    updateData.isRead = data.isRead;
    updateData.readAt = data.isRead ? new Date() : null;
  }

  return prisma.notification.update({
    where: { id },
    data: updateData,
  });
};

export const remove = async (
  id: number,
  requesterFirebaseUID: string,
  isAdmin: boolean,
) => {
  await assertCanAccess(id, requesterFirebaseUID, isAdmin);
  return prisma.notification.delete({ where: { id } });
};

export const markAsRead = async (id: number, recipientFirebaseUID: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification || notification.recipientFirebaseUID !== recipientFirebaseUID) {
    throw new Error('NOT_FOUND');
  }

  if (notification.isRead) {
    return notification;
  }

  return prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const create = async (data: CreateNotificationData) => {
  const created = await prisma.notification.create({
    data: {
      recipientFirebaseUID: data.recipientFirebaseUID,
      title: data.title,
      message: data.message,
      type: data.type?.trim() || 'INFO',
    },
  });

  emitToUser(data.recipientFirebaseUID, created);

  return created;
};
