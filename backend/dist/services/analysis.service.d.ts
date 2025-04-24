/**
 * Get analysis by document ID
 */
export declare const getAnalysisByDocumentId: (documentId: string) => Promise<{
    id: string;
    updatedAt: Date;
    documentId: string;
    overallAiScore: number;
    humanWrittenPercent: number;
    aiGeneratedPercent: number;
    analysisDate: Date;
} | null>;
/**
 * Get document sections from analysis
 */
export declare const getDocumentSections: (documentId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    aiAnalysisId: string;
    startOffset: number;
    endOffset: number;
    isAiGenerated: boolean;
    aiConfidence: number;
    suggestions: string | null;
}[]>;
/**
 * Get text metrics for a document
 */
export declare const getTextMetrics: (documentId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    aiAnalysisId: string;
    totalWordCount: number;
    sentenceCount: number;
    averageSentenceLength: number;
    readabilityScore: number | null;
    lexicalDiversity: number | null;
    uniqueWordCount: number | null;
    academicLanguageScore: number | null;
    passiveVoicePercentage: number | null;
    firstPersonPercentage: number | null;
    thirdPersonPercentage: number | null;
    punctuationDensity: number | null;
    grammarErrorCount: number | null;
    spellingErrorCount: number | null;
    predictabilityScore: number | null;
    nGramUniqueness: number | null;
} | null>;
/**
 * Initiate analysis of a document
 * This function starts the analysis process and returns immediately
 * The actual analysis runs in the background
 */
export declare const initiateAnalysis: (document: any) => Promise<{
    id: string;
    updatedAt: Date;
    documentId: string;
    overallAiScore: number;
    humanWrittenPercent: number;
    aiGeneratedPercent: number;
    analysisDate: Date;
}>;
