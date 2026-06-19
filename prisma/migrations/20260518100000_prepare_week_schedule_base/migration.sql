-- CURSO-71: idTeacher opcional en assignment, label en WeekSchedule, unique por oferta académica

-- DropUnique
ALTER TABLE "TeacherOnSubjectOnGroup" DROP CONSTRAINT IF EXISTS "TeacherOnSubjectOnGroup_idTeacher_idSubject_idGroup_schoolYear_key";

-- AlterTable: assignment sin profesor obligatorio
ALTER TABLE "TeacherOnSubjectOnGroup" ALTER COLUMN "idTeacher" DROP NOT NULL;

-- AlterTable: label en franjas (nullable → backfill → NOT NULL)
ALTER TABLE "WeekSchedule" ADD COLUMN "label" TEXT;

UPDATE "WeekSchedule" ws
SET "label" = CONCAT(
  CASE
    WHEN TRIM(s."grade") LIKE '%º' THEN TRIM(s."grade")
    ELSE CONCAT(TRIM(s."grade"), 'º')
  END,
  ' ',
  c."name",
  ' — ',
  g."name"
)
FROM "TeacherOnSubjectOnGroup" ta
JOIN "Subject" s ON s."id" = ta."idSubject"
JOIN "Course" c ON c."id" = s."idCourse"
JOIN "Group" g ON g."id" = ta."idGroup"
WHERE ws."idTeacherAssignment" = ta."id";

ALTER TABLE "WeekSchedule" ALTER COLUMN "label" SET NOT NULL;

-- CreateIndex
CREATE INDEX "WeekSchedule_label_idx" ON "WeekSchedule"("label");

-- CreateIndex: una oferta por asignatura+grupo+año
CREATE UNIQUE INDEX "TeacherOnSubjectOnGroup_idSubject_idGroup_schoolYear_key"
  ON "TeacherOnSubjectOnGroup"("idSubject", "idGroup", "schoolYear");
