-- Alinea SessionStatus con schema.prisma (sin SUSPENDED; cancelación masiva usa CANCELLED)
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "SessionClass" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SessionClass" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "SessionStatus_old";
ALTER TABLE "SessionClass" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;
