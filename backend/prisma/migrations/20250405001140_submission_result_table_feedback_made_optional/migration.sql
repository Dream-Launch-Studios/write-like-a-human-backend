-- AlterTable
ALTER TABLE "SubmissionResult" ADD COLUMN     "rootDocumentId" TEXT,
ALTER COLUMN "feedback" DROP NOT NULL;
