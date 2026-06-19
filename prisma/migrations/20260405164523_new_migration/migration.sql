-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ILLNESS', 'EXCEDENCE', 'WITHDRAWN', 'STANDBY');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'EVALUATION_LOST', 'COMPLETED', 'FAILED', 'WITHDRAWN', 'EXPELLED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssistanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "JustificationStatus" AS ENUM ('PENDING', 'VIEWED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PRACTICE', 'THEORY', 'EXAM', 'PROJECT', 'HOMEWORK');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'LATE', 'GRADED', 'NOT_SUBMITTED');

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "ndSurname" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "dni" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "firebaseUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "ndSurname" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEACHER',
    "firebaseUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "ndSurname" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "firebaseUID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "hours" INTEGER,
    "description" TEXT,
    "idCourse" INTEGER NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherOnSubjectOnGroup" (
    "id" SERIAL NOT NULL,
    "idTeacher" INTEGER NOT NULL,
    "idSubject" INTEGER NOT NULL,
    "idGroup" INTEGER NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'STANDBY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherOnSubjectOnGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentOnSubjectOnGroup" (
    "id" SERIAL NOT NULL,
    "idStudent" INTEGER NOT NULL,
    "idGroup" INTEGER NOT NULL,
    "idSubject" INTEGER NOT NULL,
    "schoolYear" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentOnSubjectOnGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekSchedule" (
    "id" SERIAL NOT NULL,
    "idTeacherAssignment" INTEGER NOT NULL,
    "weekDay" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "finishTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeekSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionClass" (
    "id" SERIAL NOT NULL,
    "idSchedule" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "apointments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistance" (
    "id" SERIAL NOT NULL,
    "idSession" INTEGER NOT NULL,
    "idStudentEnrollment" INTEGER NOT NULL,
    "status" "AssistanceStatus" NOT NULL DEFAULT 'PRESENT',
    "justificationUri" TEXT,
    "justificationStatus" "JustificationStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "idTeacherAssignment" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "attachmentUrl" TEXT,
    "schoolYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentTask" (
    "id" SERIAL NOT NULL,
    "idTask" INTEGER NOT NULL,
    "idStudentEnrollment" INTEGER NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submissionDate" TIMESTAMP(3),
    "score" DECIMAL(65,30),
    "feedback" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_dni_key" ON "Student"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Student_firebaseUID_key" ON "Student"("firebaseUID");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_dni_key" ON "Teacher"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_firebaseUID_key" ON "Teacher"("firebaseUID");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_dni_key" ON "Admin"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_firebaseUID_key" ON "Admin"("firebaseUID");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE INDEX "Subject_idCourse_grade_idx" ON "Subject"("idCourse", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_idCourse_grade_key" ON "Subject"("name", "idCourse", "grade");

-- CreateIndex
CREATE INDEX "TeacherOnSubjectOnGroup_schoolYear_idx" ON "TeacherOnSubjectOnGroup"("schoolYear");

-- CreateIndex
CREATE INDEX "TeacherOnSubjectOnGroup_idTeacher_schoolYear_idx" ON "TeacherOnSubjectOnGroup"("idTeacher", "schoolYear");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherOnSubjectOnGroup_idTeacher_idSubject_idGroup_schoolY_key" ON "TeacherOnSubjectOnGroup"("idTeacher", "idSubject", "idGroup", "schoolYear");

-- CreateIndex
CREATE INDEX "StudentOnSubjectOnGroup_schoolYear_status_idx" ON "StudentOnSubjectOnGroup"("schoolYear", "status");

-- CreateIndex
CREATE INDEX "StudentOnSubjectOnGroup_idStudent_schoolYear_idx" ON "StudentOnSubjectOnGroup"("idStudent", "schoolYear");

-- CreateIndex
CREATE UNIQUE INDEX "StudentOnSubjectOnGroup_idStudent_idGroup_idSubject_schoolY_key" ON "StudentOnSubjectOnGroup"("idStudent", "idGroup", "idSubject", "schoolYear");

-- CreateIndex
CREATE INDEX "WeekSchedule_idTeacherAssignment_weekDay_idx" ON "WeekSchedule"("idTeacherAssignment", "weekDay");

-- CreateIndex
CREATE INDEX "SessionClass_date_idx" ON "SessionClass"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SessionClass_idSchedule_date_key" ON "SessionClass"("idSchedule", "date");

-- CreateIndex
CREATE INDEX "Assistance_idStudentEnrollment_idx" ON "Assistance"("idStudentEnrollment");

-- CreateIndex
CREATE INDEX "Assistance_idSession_status_idx" ON "Assistance"("idSession", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Assistance_idSession_idStudentEnrollment_key" ON "Assistance"("idSession", "idStudentEnrollment");

-- CreateIndex
CREATE INDEX "Task_idTeacherAssignment_schoolYear_idx" ON "Task"("idTeacherAssignment", "schoolYear");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "StudentTask_idStudentEnrollment_status_idx" ON "StudentTask"("idStudentEnrollment", "status");

-- CreateIndex
CREATE INDEX "StudentTask_idTask_status_idx" ON "StudentTask"("idTask", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentTask_idTask_idStudentEnrollment_key" ON "StudentTask"("idTask", "idStudentEnrollment");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_idCourse_fkey" FOREIGN KEY ("idCourse") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idSubject_fkey" FOREIGN KEY ("idSubject") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherOnSubjectOnGroup" ADD CONSTRAINT "TeacherOnSubjectOnGroup_idGroup_fkey" FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOnSubjectOnGroup" ADD CONSTRAINT "StudentOnSubjectOnGroup_idStudent_fkey" FOREIGN KEY ("idStudent") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOnSubjectOnGroup" ADD CONSTRAINT "StudentOnSubjectOnGroup_idGroup_fkey" FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOnSubjectOnGroup" ADD CONSTRAINT "StudentOnSubjectOnGroup_idSubject_fkey" FOREIGN KEY ("idSubject") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekSchedule" ADD CONSTRAINT "WeekSchedule_idTeacherAssignment_fkey" FOREIGN KEY ("idTeacherAssignment") REFERENCES "TeacherOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionClass" ADD CONSTRAINT "SessionClass_idSchedule_fkey" FOREIGN KEY ("idSchedule") REFERENCES "WeekSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistance" ADD CONSTRAINT "Assistance_idSession_fkey" FOREIGN KEY ("idSession") REFERENCES "SessionClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistance" ADD CONSTRAINT "Assistance_idStudentEnrollment_fkey" FOREIGN KEY ("idStudentEnrollment") REFERENCES "StudentOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_idTeacherAssignment_fkey" FOREIGN KEY ("idTeacherAssignment") REFERENCES "TeacherOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_idTask_fkey" FOREIGN KEY ("idTask") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_idStudentEnrollment_fkey" FOREIGN KEY ("idStudentEnrollment") REFERENCES "StudentOnSubjectOnGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
