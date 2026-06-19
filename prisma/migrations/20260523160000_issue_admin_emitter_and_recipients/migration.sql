-- Ampliar audiencias: profesor/alumno concreto como destinatario
ALTER TYPE "IssueAudience" ADD VALUE 'TEACHER';
ALTER TYPE "IssueAudience" ADD VALUE 'STUDENT';

-- Receptor concreto (distinto del admin que crea el anuncio)
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "idTargetTeacher" INTEGER;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "idTargetStudent" INTEGER;

-- Emisor siempre admin: rellenar huecos y quitar teacher/emitterType
UPDATE "Issue" SET "idAdmin" = 1 WHERE "idAdmin" IS NULL;

ALTER TABLE "Issue" DROP CONSTRAINT IF EXISTS "Issue_idTeacher_fkey";
ALTER TABLE "Issue" DROP COLUMN IF EXISTS "idTeacher";
ALTER TABLE "Issue" DROP COLUMN IF EXISTS "emitterType";

ALTER TABLE "Issue" ALTER COLUMN "idAdmin" SET NOT NULL;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idTargetTeacher_fkey"
  FOREIGN KEY ("idTargetTeacher") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idTargetStudent_fkey"
  FOREIGN KEY ("idTargetStudent") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Issue_audience_idTargetTeacher_idx" ON "Issue"("audience", "idTargetTeacher");
CREATE INDEX IF NOT EXISTS "Issue_audience_idTargetStudent_idx" ON "Issue"("audience", "idTargetStudent");

DROP TYPE IF EXISTS "IssueEmitterType";
