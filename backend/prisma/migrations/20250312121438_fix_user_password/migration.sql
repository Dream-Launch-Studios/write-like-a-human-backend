-- CreateTable
CREATE TABLE "WordSuggestion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalWord" TEXT NOT NULL,
    "suggestedWord" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "startOffset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT true,
    "isAccepted" BOOLEAN,
    "context" TEXT,
    "aiConfidence" DOUBLE PRECISION,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordSuggestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordSuggestion" ADD CONSTRAINT "WordSuggestion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordSuggestion" ADD CONSTRAINT "WordSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
