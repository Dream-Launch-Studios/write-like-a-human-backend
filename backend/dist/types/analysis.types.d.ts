/**
 * Interface for AI analysis result
 */
export interface AnalysisResult {
    id: string;
    documentId: string;
    overallAiScore: number;
    humanWrittenPercent: number;
    aiGeneratedPercent: number;
    analysisDate: Date;
}
/**
 * Interface for document section with AI detection
 */
export interface DocumentSection {
    id: string;
    aiAnalysisId: string;
    startOffset: number;
    endOffset: number;
    content: string;
    isAiGenerated: boolean;
    aiConfidence: number;
    suggestions: string | null;
}
/**
 * Interface for text metrics data
 */
export interface TextMetricsData {
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
}
/**
 * Interface for creating an analysis
 */
export interface CreateAnalysisData {
    documentId: string;
    overallAiScore: number;
    humanWrittenPercent: number;
    aiGeneratedPercent: number;
}
/**
 * Interface for creating a document section
 */
export interface CreateSectionData {
    aiAnalysisId: string;
    startOffset: number;
    endOffset: number;
    content: string;
    isAiGenerated: boolean;
    aiConfidence: number;
    suggestions?: string | null;
}
/**
 * Interface for creating text metrics
 */
export interface CreateMetricsData extends TextMetricsData {
    aiAnalysisId: string;
}
/**
 * Analysis status enum
 */
export declare enum AnalysisStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
