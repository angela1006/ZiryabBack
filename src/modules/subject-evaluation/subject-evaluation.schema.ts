import { z } from 'zod';

export const EvaluationPeriodSchema = z.enum([
  'INITIAL',
  'FIRST_TRIMESTER',
  'SECOND_TRIMESTER',
  'THIRD_TRIMESTER',
  'FINAL',
]);

export const SubjectEvaluationInputSchema = z.object({
  idStudentEnrollment: z.number().int().positive(),
  period: EvaluationPeriodSchema,
  value: z.number().int().min(1).max(10).optional(),
  observations: z.string().max(500).nullable().optional().or(z.literal('')),
});

export const CreateSubjectEvaluationSchema = SubjectEvaluationInputSchema;

export const UpdateSubjectEvaluationSchema = z.object({
  value: z.number().int().min(1).max(10).optional(),
  observations: z.string().max(500).nullable().optional().or(z.literal('')),
});

export const BulkCreateSubjectEvaluationsSchema = z.object({
  evaluations: z.array(SubjectEvaluationInputSchema).min(1),
});

export type SubjectEvaluationInput = z.infer<typeof SubjectEvaluationInputSchema>;
export type BulkCreateSubjectEvaluationsInput = z.infer<typeof BulkCreateSubjectEvaluationsSchema>;
