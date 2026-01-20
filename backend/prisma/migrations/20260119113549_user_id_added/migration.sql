/*
  Warnings:

  - Added the required column `userId` to the `CardHolder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardHolder" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CardHolder" ADD CONSTRAINT "CardHolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
