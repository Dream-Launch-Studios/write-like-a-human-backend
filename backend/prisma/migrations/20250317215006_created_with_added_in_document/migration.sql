-- CreateEnum
CREATE TYPE "DocumentCreatedWith" AS ENUM ('PASTE', 'UPLOAD');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "createdWith" "DocumentCreatedWith" NOT NULL DEFAULT 'PASTE';
