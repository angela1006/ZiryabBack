-- CreateTable
CREATE TABLE "StudentPassword" (
    "id" SERIAL NOT NULL,
    "idStudent" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "idTutor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPassword_idStudent_key" ON "StudentPassword"("idStudent");

-- CreateIndex
CREATE INDEX "StudentPassword_idTutor_idx" ON "StudentPassword"("idTutor");

-- AddForeignKey
ALTER TABLE "StudentPassword" ADD CONSTRAINT "StudentPassword_idStudent_fkey" FOREIGN KEY ("idStudent") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPassword" ADD CONSTRAINT "StudentPassword_idTutor_fkey" FOREIGN KEY ("idTutor") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
