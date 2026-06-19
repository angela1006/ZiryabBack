import { z } from 'zod';

export const bulkSuspendBodySchema = z
  .object({
    dateFrom: z.string().min(1, 'dateFrom obligatorio'),
    dateTo: z.string().min(1, 'dateTo obligatorio'),
    idCourse: z.coerce.number().int().positive().optional(),
    idSubject: z.coerce.number().int().positive().optional(),
    idGroup: z.coerce.number().int().positive().optional(),
    idTeacher: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    const from = new Date(data.dateFrom);
    const to = new Date(data.dateTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Fechas inválidas' });
      return;
    }
    if (from > to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dateFrom no puede ser posterior a dateTo',
      });
    }
  });

export type BulkSuspendBody = z.infer<typeof bulkSuspendBodySchema>;

export const bulkGenerateBodySchema = z.object({
  label: z.string().min(1, 'label obligatorio'),
  schoolYear: z.string().min(1, 'schoolYear obligatorio'),
});

export type BulkGenerateBody = z.infer<typeof bulkGenerateBodySchema>;
