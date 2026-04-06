/*
  Warnings:

  - You are about to drop the column `service_limit` on the `CardHolder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardHolder" DROP COLUMN "service_limit",
ADD COLUMN     "lounge_limit" INTEGER,
ADD COLUMN     "meet_limit" INTEGER,
ADD COLUMN     "pick_limit" INTEGER;
