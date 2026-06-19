-- AlterTable
ALTER TABLE "Issue" ADD COLUMN "grade" TEXT;

-- CreateIndex
CREATE INDEX "Issue_audience_idCourse_grade_idx" ON "Issue"("audience", "idCourse", "grade");
