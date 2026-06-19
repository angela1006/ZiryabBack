/*
  Warnings:

  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseGroup" DROP CONSTRAINT "CourseGroup_idCourse_fkey";

-- DropForeignKey
ALTER TABLE "CourseGroup" DROP CONSTRAINT "CourseGroup_idGroup_fkey";

-- DropForeignKey
ALTER TABLE "CourseGroup" DROP CONSTRAINT "CourseGroup_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_idStudentEnrollment_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_idTeacher_fkey";

-- AlterTable
ALTER TABLE "TeacherOnSubjectOnGroup" ADD COLUMN     "currentSubstituteId" INTEGER,
ADD COLUMN     "isTutor" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Announcement";

-- DropTable
DROP TABLE "CourseGroup";

-- DropTable
DROP TABLE "Grade";

-- CreateTable
CREATE TABLE "SubjectEvaluation" (
    "id" SERIAL NOT NULL,
    "idStudentEnrollment" INTEGER NOT NULL,
    "period" "EvaluationPeriod" NOT NULL,
    "value" INTEGER,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubstitution" (
    "id" SERIAL NOT NULL,
    "idTeacherAssignment" INTEGER NOT NULL,
    "idSubstitute" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignmentSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectEvaluation_idStudentEnrollment_period_key" ON "SubjectEvaluation"("idStudentEnrollment", "period");

-- CreateIndex
CREATE INDEX "AssignmentSubstitution_idTeacherAssignment_idx" ON "AssignmentSubstitution"("idTeacherAssignment");

-- CreateIndex
CREATE INDEX "AssignmentSubstitution_idSubstitute_idx" ON "AssignmentSubstitution"("idSubstitute");

-- CreateIndex
CREATE INDEX "TeacherOnSubjectOnGroup_idGroup_idSubject_schoolYear_isTuto_idx" ON "TeacherOnSubjectOnGroup"("idGroup", "idSubject", "schoolYear", "isTutor");

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_currentSubstituteId_fkey" FOREIGN KEY ("currentSubstituteId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectEvaluation" ADD CONSTRAINT "SubjectEvaluation_idStudentEnrollment_fkey" FOREIGN KEY ("idStudentEnrollment") REFERENCES "StudentOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubstitution" ADD CONSTRAINT "AssignmentSubstitution_idTeacherAssignment_fkey" FOREIGN KEY ("idTeacherAssignment") REFERENCES "TeacherOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubstitution" ADD CONSTRAINT "AssignmentSubstitution_idSubstitute_fkey" FOREIGN KEY ("idSubstitute") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
