-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_idAdmin_fkey";

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_idAdmin_fkey" FOREIGN KEY ("idAdmin") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
