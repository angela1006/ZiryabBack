-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "idTaskGroup" INTEGER;

-- CreateTable
CREATE TABLE "TaskGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_idTaskGroup_fkey" FOREIGN KEY ("idTaskGroup") REFERENCES "TaskGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
