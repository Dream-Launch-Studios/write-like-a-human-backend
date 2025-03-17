import { FeedbackStatus } from '@prisma/client';

/**
 * Interface for creating feedback
 */
export interface CreateFeedbackData {
    content: string;
    status?: FeedbackStatus;
    userId: string;
    documentId: string;
    groupId?: string | null;
}

/**
 * Interface for updating feedback
 */
export interface UpdateFeedbackData {
    content?: string;
    status?: FeedbackStatus;
    response?: string;
}

/**
 * Interface for feedback metrics
 */
export interface FeedbackMetricsData {
    // Structural Comparison
    sentenceLengthChange?: number;
    paragraphStructureScore?: number;
    headingConsistencyScore?: number;

    // Vocabulary Metrics
    lexicalDiversityChange?: number;
    wordRepetitionScore?: number;
    formalityShift?: number;

    // Style Metrics
    readabilityChange?: number;
    voiceConsistencyScore?: number;
    perspectiveShift?: number;
    descriptiveLanguageScore?: number;

    // Grammar & Mechanics
    punctuationChangeScore?: number;
    grammarPatternScore?: number;
    spellingVariationScore?: number;

    // Topic & Thematic Elements
    thematicConsistencyScore?: number;
    keywordFrequencyChange?: number;
    argumentDevelopmentScore?: number;

    // Similarity Metrics
    nGramSimilarityScore?: number;
    tfIdfSimilarityScore?: number;
    jaccardSimilarityScore?: number;

    // AI Detection
    originalityShiftScore?: number;
}

/**
 * Interface for creating feedback metrics
 */
export interface CreateFeedbackMetricsData extends FeedbackMetricsData {
    feedbackId: string;
}