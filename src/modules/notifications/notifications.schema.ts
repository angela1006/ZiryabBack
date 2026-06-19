import { z } from 'zod';

export const updateNotificationBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    message: z.string().trim().min(1).optional(),
    type: z.string().trim().min(1).optional(),
    isRead: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type UpdateNotificationBody = z.infer<typeof updateNotificationBodySchema>;
