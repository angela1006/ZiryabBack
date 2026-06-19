-- CreateEnum
CREATE TYPE "IssueEmitterType" AS ENUM ('TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "IssueAudience" AS ENUM ('CENTER', 'ALL_TEACHERS', 'ALL_STUDENTS', 'GROUP', 'COURSE', 'SUBJECT_GROUP');

-- CreateTable
CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "emitterType" "IssueEmitterType" NOT NULL,
    "idTeacher" INTEGER,
    "idAdmin" INTEGER,
    "audience" "IssueAudience" NOT NULL,
    "idGroup" INTEGER,
    "idCourse" INTEGER,
    "idSubject" INTEGER,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Issue_audience_idGroup_idx" ON "Issue"("audience", "idGroup");

-- CreateIndex
CREATE INDEX "Issue_createdAt_idx" ON "Issue"("createdAt");

-- CreateIndex
CREATE INDEX "Issue_expiresAt_idx" ON "Issue"("expiresAt");

-- CreateIndex
CREATE INDEX "Issue_isPublished_publishAt_idx" ON "Issue"("isPublished", "publishAt");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idTeacher_fkey" FOREIGN KEY ("idTeacher") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idAdmin_fkey" FOREIGN KEY ("idAdmin") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idGroup_fkey" FOREIGN KEY ("idGroup") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idCourse_fkey" FOREIGN KEY ("idCourse") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idSubject_fkey" FOREIGN KEY ("idSubject") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
