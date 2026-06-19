/*
  Warnings:

  - A unique constraint covering the columns `[idTeacher,idSubject,idGroup,schoolYear]` on the table `TeacherOnSubjectOnGroup` will be added. If there are existing duplicate values, this will fail.
  - Made the column `idTeacher` on table `TeacherOnSubjectOnGroup` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idTeacherAssignment` on table `WeekSchedule` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" DROP CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey";

-- DropIndex
DROP INDEX "TeacherOnSubjectOnGroup_idSubject_idGroup_schoolYear_key";

-- AlterTable
ALTER TABLE "TeacherOnSubjectOnGroup" ALTER COLUMN "idTeacher" SET NOT NULL;

-- AlterTable
ALTER TABLE "WeekSchedule" ALTER COLUMN "idTeacherAssignment" SET NOT NULL,
ALTER COLUMN "label" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "TeacherOnSubjectOnGroup_idTeacher_idSubject_idGroup_schoolY_key" ON "TeacherOnSubjectOnGroup"("idTeacher", "idSubject", "idGroup", "schoolYear");

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
