// src/types/analysis.ts

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
    // Word and Structure Metrics
    totalWordCount: number;
    sentenceCount: number;
    averageSentenceLength: number;
    readabilityScore: number | null;

    // Vocabulary Metrics
    lexicalDiversity: number | null;
    uniqueWordCount: number | null;
    academicLanguageScore: number | null;

    // Style Metrics
    passiveVoicePercentage: number | null;
    firstPersonPercentage: number | null;
    thirdPersonPercentage: number | null;

    // Grammar & Mechanics
    punctuationDensity: number | null;
    grammarErrorCount: number | null;
    spellingErrorCount: number | null;

    // Additional AI Detection Metrics
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
export enum AnalysisStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}