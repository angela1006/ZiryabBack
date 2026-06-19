-- CreateEnum
CREATE TYPE "EvaluationPeriod" AS ENUM ('INITIAL', 'FIRST_TRIMESTER', 'SECOND_TRIMESTER', 'THIRD_TRIMESTER', 'FINAL');

-- CreateTable
CREATE TABLE "CourseGroup" (
    "id" SERIAL NOT NULL,
    "idCourse" INTEGER NOT NULL,
    "idGroup" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "tutorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "idStudentEnrollment" INTEGER NOT NULL,
    "period" "EvaluationPeriod" NOT NULL,
    "value" INTEGER,
    "observations" TEXT,
    "idTeacher" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseGroup_idCourse_idGroup_grade_key" ON "CourseGroup"("idCourse", "idGroup", "grade");

-- CreateIndex
CREATE INDEX "Grade_idTeacher_idx" ON "Grade"("idTeacher");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_idStudentEnrollment_period_key" ON "Grade"("idStudentEnrollment", "period");

-- AddForeignKey
ALTER TABLE "CourseGroup" ADD CONSTRAINT "CourseGroup_idCourse_fkey" FOREIGN KEY ("idCourse") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseGroup" ADD CONSTRAINT "CourseGroup_idGroup_fkey" FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseGroup" ADD CONSTRAINT "CourseGroup_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_idStudentEnrollment_fkey" FOREIGN KEY ("idStudentEnrollment") REFERENCES "StudentOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
