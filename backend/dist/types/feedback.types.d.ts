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
    sentenceLengthChange?: number;
    paragraphStructureScore?: number;
    headingConsistencyScore?: number;
    lexicalDiversityChange?: number;
    wordRepetitionScore?: number;
    formalityShift?: number;
    readabilityChange?: number;
    voiceConsistencyScore?: number;
    perspectiveShift?: number;
    descriptiveLanguageScore?: number;
    punctuationChangeScore?: number;
    grammarPatternScore?: number;
    spellingVariationScore?: number;
    thematicConsistencyScore?: number;
    keywordFrequencyChange?: number;
    argumentDevelopmentScore?: number;
    nGramSimilarityScore?: number;
    tfIdfSimilarityScore?: number;
    jaccardSimilarityScore?: number;
    originalityShiftScore?: number;
}
/**
 * Interface for creating feedback metrics
 */
export interface CreateFeedbackMetricsData extends FeedbackMetricsData {
    feedbackId: string;
}
