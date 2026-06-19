import { z } from 'zod';

export const submitSchema = z.object({
  attachmentUrl: z.string().optional().nullable(),
});

export type SubmitInput = z.infer<typeof submitSchema>;

export const submitByEnrollmentSchema = z.object({
  idTask: z.number().int().positive(),
  idStudentEnrollment: z.number().int().positive(),
  attachmentUrl: z.string().url('attachmentUrl debe ser una URL válida').optional(),
});

export type SubmitByEnrollmentInput = z.infer<typeof submitByEnrollmentSchema>;
