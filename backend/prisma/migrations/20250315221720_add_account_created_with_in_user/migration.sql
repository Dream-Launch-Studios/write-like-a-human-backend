-- CreateEnum
CREATE TYPE "AccountCreatedWith" AS ENUM ('EMAIL', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountCreatedWith" "AccountCreatedWith" NOT NULL DEFAULT 'EMAIL';
