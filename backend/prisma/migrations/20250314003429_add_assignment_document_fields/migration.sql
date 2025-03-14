-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "overallAiScore" DOUBLE PRECISION NOT NULL,
    "humanWrittenPercent" DOUBLE PRECISION NOT NULL,
    "aiGeneratedPercent" DOUBLE PRECISION NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentSection" (
    "id" TEXT NOT NULL,
    "aiAnalysisId" TEXT NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL,
    "aiConfidence" DOUBLE PRECISION NOT NULL,
    "suggestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "documentName" TEXT,
    "documentType" TEXT,
    "creatorId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TextMetrics" (
    "id" TEXT NOT NULL,
    "aiAnalysisId" TEXT NOT NULL,
    "totalWordCount" INTEGER NOT NULL,
    "sentenceCount" INTEGER NOT NULL,
    "averageSentenceLength" DOUBLE PRECISION NOT NULL,
    "readabilityScore" DOUBLE PRECISION,
    "lexicalDiversity" DOUBLE PRECISION,
    "uniqueWordCount" INTEGER,
    "academicLanguageScore" DOUBLE PRECISION,
    "passiveVoicePercentage" DOUBLE PRECISION,
    "firstPersonPercentage" DOUBLE PRECISION,
    "thirdPersonPercentage" DOUBLE PRECISION,
    "punctuationDensity" DOUBLE PRECISION,
    "grammarErrorCount" INTEGER,
    "spellingErrorCount" INTEGER,
    "predictabilityScore" DOUBLE PRECISION,
    "nGramUniqueness" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TextMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackMetrics" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "sentenceLengthChange" DOUBLE PRECISION,
    "paragraphStructureScore" DOUBLE PRECISION,
    "headingConsistencyScore" DOUBLE PRECISION,
    "lexicalDiversityChange" DOUBLE PRECISION,
    "wordRepetitionScore" DOUBLE PRECISION,
    "formalityShift" DOUBLE PRECISION,
    "readabilityChange" DOUBLE PRECISION,
    "voiceConsistencyScore" DOUBLE PRECISION,
    "perspectiveShift" DOUBLE PRECISION,
    "descriptiveLanguageScore" DOUBLE PRECISION,
    "punctuationChangeScore" DOUBLE PRECISION,
    "grammarPatternScore" DOUBLE PRECISION,
    "spellingVariationScore" DOUBLE PRECISION,
    "thematicConsistencyScore" DOUBLE PRECISION,
    "keywordFrequencyChange" DOUBLE PRECISION,
    "argumentDevelopmentScore" DOUBLE PRECISION,
    "nGramSimilarityScore" DOUBLE PRECISION,
    "tfIdfSimilarityScore" DOUBLE PRECISION,
    "jaccardSimilarityScore" DOUBLE PRECISION,
    "originalityShiftScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_documentId_key" ON "AIAnalysis"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "TextMetrics_aiAnalysisId_key" ON "TextMetrics"("aiAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackMetrics_feedbackId_key" ON "FeedbackMetrics"("feedbackId");

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSection" ADD CONSTRAINT "DocumentSection_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "AIAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TextMetrics" ADD CONSTRAINT "TextMetrics_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "AIAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMetrics" ADD CONSTRAINT "FeedbackMetrics_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
