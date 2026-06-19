-- DropForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" DROP CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey";

-- DropIndex
DROP INDEX "TeacherOnSubjectOnGroup_idTeacher_idSubject_idGroup_schoolY_key";

-- AlterTable
ALTER TABLE "WeekSchedule" ALTER COLUMN "idTeacherAssignment" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
