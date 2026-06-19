/** Marca de autor profesor embebida en `body` (sin columna extra en BD). */
const TEACHER_AUTHOR_MARKER = /<!--ziryab-teacher-author:(\d+)-->\s*$/;

export const embedTeacherAuthorMarker = (body: string, teacherId: number): string => {
  const clean = stripTeacherAuthorMarker(body).trimEnd();
  return `${clean}\n<!--ziryab-teacher-author:${teacherId}-->`;
};

export const stripTeacherAuthorMarker = (body: string): string =>
  body.replace(TEACHER_AUTHOR_MARKER, '').trimEnd();

export const extractTeacherAuthorId = (body: string): number | null => {
  const match = body.match(TEACHER_AUTHOR_MARKER);
  if (!match?.[1]) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isNaN(id) ? null : id;
};
