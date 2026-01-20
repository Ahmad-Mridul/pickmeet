/*
  Warnings:

  - Added the required column `co_email` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co_extension` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co_mobile` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co_name` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co_nickname` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `co_telephone` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "co_email" TEXT NOT NULL,
ADD COLUMN     "co_extension" TEXT NOT NULL,
ADD COLUMN     "co_mobile" TEXT NOT NULL,
ADD COLUMN     "co_name" TEXT NOT NULL,
ADD COLUMN     "co_nickname" TEXT NOT NULL,
ADD COLUMN     "co_telephone" TEXT NOT NULL;
