import { IssueAudience } from '@prisma/client';
import { z } from 'zod';

const issueAudienceSchema = z.nativeEnum(IssueAudience);
const issueGradeSchema = z.enum(['1', '2']).optional();
const positiveInt = z.coerce.number().int().positive();

const mapTeacherAlias = <T extends { idTargetTeacher?: number; idTeacher?: number }>(data: T) => {
  const idTargetTeacher = data.idTargetTeacher ?? data.idTeacher;
  const { idTeacher: _ignored, ...rest } = data;
  return { ...rest, idTargetTeacher };
};

export const createIssueBodySchema = z
  .object({
    audience: issueAudienceSchema,
    title: z.string().min(1, 'title obligatorio'),
    body: z.string().min(1, 'body obligatorio'),
    attachmentUrl: z.string().optional(),
  /** Grupo (GROUP, SUBJECT_GROUP) */
    idGroup: positiveInt.optional(),
  /** Ciclo formativo DAM/DAW… (solo COURSE) */
    idCourse: positiveInt.optional(),
  /** Asignatura; curso 1º/2º en Subject.grade (SUBJECT_GROUP) */
    idSubject: positiveInt.optional(),
  /** Curso 1º o 2º dentro del ciclo (solo COURSE, con idCourse) */
    grade: issueGradeSchema,
    idTargetTeacher: positiveInt.optional(),
    idTargetStudent: positiveInt.optional(),
    /** Alias legacy del front (EQ-319): receptor profesor */
    idTeacher: positiveInt.optional(),
    isPublished: z.boolean().optional(),
    publishAt: z.string().optional(),
    expiresAt: z.string().optional(),
  })
  .transform(mapTeacherAlias);

export const updateIssueBodySchema = z
  .object({
    audience: issueAudienceSchema.optional(),
    title: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    attachmentUrl: z.string().nullable().optional(),
    idGroup: positiveInt.nullable().optional(),
    idCourse: positiveInt.nullable().optional(),
    idSubject: positiveInt.nullable().optional(),
    grade: z.enum(['1', '2']).nullable().optional(),
    idTargetTeacher: positiveInt.nullable().optional(),
    idTargetStudent: positiveInt.nullable().optional(),
    idTeacher: positiveInt.nullable().optional(),
    isPublished: z.boolean().optional(),
    publishAt: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
  })
  .transform(mapTeacherAlias);

export type CreateIssueBody = z.infer<typeof createIssueBodySchema>;
export type UpdateIssueBody = z.infer<typeof updateIssueBodySchema>;
