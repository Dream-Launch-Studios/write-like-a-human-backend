/*
  Warnings:

  - You are about to drop the column `originalDocumentId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_originalDocumentId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "originalDocumentId",
DROP COLUMN "version",
ADD COLUMN     "content" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "parentDocumentId" TEXT,
ADD COLUMN     "versionNumber" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "groupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
