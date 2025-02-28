-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_groupId_fkey";

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "groupId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
