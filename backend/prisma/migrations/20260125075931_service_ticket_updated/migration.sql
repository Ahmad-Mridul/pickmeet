/*
  Warnings:

  - You are about to drop the column `useCardHolderAddress` on the `ServiceTicket` table. All the data in the column will be lost.
  - Added the required column `dropoffAddress` to the `ServiceTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceTicket" DROP COLUMN "useCardHolderAddress",
ADD COLUMN     "dropoffAddress" TEXT NOT NULL;
