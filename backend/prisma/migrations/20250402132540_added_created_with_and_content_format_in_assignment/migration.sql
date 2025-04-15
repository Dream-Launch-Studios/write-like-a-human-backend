/*
  Warnings:

  - You are about to drop the column `documentType` on the `Assignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "documentType",
ADD COLUMN     "contentFormat" "ContentFormat" NOT NULL DEFAULT 'HTML',
ADD COLUMN     "createdWith" "DocumentCreatedWith" NOT NULL DEFAULT 'UPLOAD';
