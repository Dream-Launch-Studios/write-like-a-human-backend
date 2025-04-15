-- CreateEnum
CREATE TYPE "ContentFormat" AS ENUM ('HTML', 'TEXT');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "contentFormat" "ContentFormat" NOT NULL DEFAULT 'HTML';
