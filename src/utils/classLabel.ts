/**
 * Etiqueta de clase agregada (CURSO-70 / CURSO-71).
 * Formato: "1º DAM — Mañana" (grade sin duplicar º si ya lo trae).
 *
 * Reglas de dominio (validar en services al materializar horarios):
 * - El assignment referenciado debe pertenecer al mismo course/grade/group/year que el label.
 * - Solapes de mismo profesor en franjas del mismo día solo cuando idTeacher esté informado.
 */
export const buildClassLabel = (
  grade: string,
  courseName: string,
  groupName: string
): string => {
  const normalizedGrade = grade.trim().endsWith('º') ? grade.trim() : `${grade.trim()}º`;
  return `${normalizedGrade} ${courseName} — ${groupName}`;
};

export type ClassLabelSource = {
  subject: { grade: string | number; course: { name: string } };
  group: { name: string };
};

export const buildClassLabelFromAssignment = (assignment: ClassLabelSource): string =>
  buildClassLabel(
    String(assignment.subject.grade),
    assignment.subject.course.name,
    assignment.group.name
  );
