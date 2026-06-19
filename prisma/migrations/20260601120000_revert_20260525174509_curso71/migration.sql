-- Revierte los efectos de 20260525174509_ (vuelta a CURSO-71)

-- DropForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" DROP CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey";

-- DropIndex
DROP INDEX "TeacherOnSubjectOnGroup_idTeacher_idSubject_idGroup_schoolY_key";

-- AlterTable
ALTER TABLE "TeacherOnSubjectOnGroup" ALTER COLUMN "idTeacher" DROP NOT NULL;

-- AlterTable (idempotente si ya aplicó 20260601092959)
ALTER TABLE "WeekSchedule" ALTER COLUMN "idTeacherAssignment" DROP NOT NULL;

-- CreateIndex: una oferta por asignatura + grupo + año
CREATE UNIQUE INDEX "TeacherOnSubjectOnGroup_idSubject_idGroup_schoolYear_key" ON "TeacherOnSubjectOnGroup"("idSubject", "idGroup", "schoolYear");

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
