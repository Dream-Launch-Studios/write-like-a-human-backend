/*
  Warnings:

  - You are about to drop the column `parentDocumentId` on the `Document` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_parentDocumentId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "parentDocumentId";

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "rootDocumentId" TEXT NOT NULL,
    "versionedDocId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_rootDocumentId_versionNumber_key" ON "DocumentVersion"("rootDocumentId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_rootDocumentId_versionedDocId_key" ON "DocumentVersion"("rootDocumentId", "versionedDocId");

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_rootDocumentId_fkey" FOREIGN KEY ("rootDocumentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_versionedDocId_fkey" FOREIGN KEY ("versionedDocId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
