-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM ('TASK', 'STUDENT_TASK', 'ASSISTANCE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationAction" AS ENUM ('TASK_CREATED', 'TASK_DEADLINE_APPROACHING', 'TASK_FINISHED', 'TASK_GRADED', 'TASK_SUBMITTED', 'JUSTIFICATION_SUBMITTED', 'JUSTIFICATION_REVIEWED');

-- AlterTable
ALTER TABLE "StudentTask" ADD COLUMN     "isEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "idStudent" INTEGER,
    "idTeacher" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "entityType" "NotificationEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" "NotificationAction" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_idStudent_isRead_idx" ON "Notification"("idStudent", "isRead");

-- CreateIndex
CREATE INDEX "Notification_idTeacher_isRead_idx" ON "Notification"("idTeacher", "isRead");

-- CreateIndex
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_idStudent_fkey" FOREIGN KEY ("idStudent") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "Notification" ADD CONSTRAINT "notification_user_check" CHECK ("idStudent" IS NOT NULL OR "idTeacher" IS NOT NULL);
