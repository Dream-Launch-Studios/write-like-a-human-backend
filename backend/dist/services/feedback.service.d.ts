import { CreateFeedbackData, UpdateFeedbackData } from '../types/feedback.types';
/**
 * Create feedback for a document
 */
export declare const createFeedback: (data: CreateFeedbackData) => Promise<{
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
}>;
/**
 * Get all feedback for a document
 */
export declare const getDocumentFeedback: (documentId: string) => Promise<({
    user: {
        id: string;
        name: string | null;
    };
} & {
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
})[]>;
/**
 * Get feedback by ID
 */
export declare const getFeedbackById: (id: string) => Promise<({
    user: {
        id: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    };
    document: {
        id: string;
        title: string;
    } | null;
} & {
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
}) | null>;
/**
 * Update feedback
 */
export declare const updateFeedback: (id: string, data: UpdateFeedbackData) => Promise<{
    status: import(".prisma/client").$Enums.FeedbackStatus;
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    content: string;
    groupId: string | null;
    documentId: string | null;
    response: string | null;
    aiScore: number | null;
} | null>;
/**
 * Delete feedback
 */
export declare const deleteFeedback: (id: string) => Promise<boolean>;
/**
 * Get feedback metrics
 */
export declare const getFeedbackMetrics: (feedbackId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    feedbackId: string;
    sentenceLengthChange: number | null;
    paragraphStructureScore: number | null;
    headingConsistencyScore: number | null;
    lexicalDiversityChange: number | null;
    wordRepetitionScore: number | null;
    formalityShift: number | null;
    readabilityChange: number | null;
    voiceConsistencyScore: number | null;
    perspectiveShift: number | null;
    descriptiveLanguageScore: number | null;
    punctuationChangeScore: number | null;
    grammarPatternScore: number | null;
    spellingVariationScore: number | null;
    thematicConsistencyScore: number | null;
    keywordFrequencyChange: number | null;
    argumentDevelopmentScore: number | null;
    nGramSimilarityScore: number | null;
    tfIdfSimilarityScore: number | null;
    jaccardSimilarityScore: number | null;
    originalityShiftScore: number | null;
} | null>;
/**
 * Create feedback metrics
 */
export declare const createFeedbackMetrics: (feedbackId: string, metrics: any) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    feedbackId: string;
    sentenceLengthChange: number | null;
    paragraphStructureScore: number | null;
    headingConsistencyScore: number | null;
    lexicalDiversityChange: number | null;
    wordRepetitionScore: number | null;
    formalityShift: number | null;
    readabilityChange: number | null;
    voiceConsistencyScore: number | null;
    perspectiveShift: number | null;
    descriptiveLanguageScore: number | null;
    punctuationChangeScore: number | null;
    grammarPatternScore: number | null;
    spellingVariationScore: number | null;
    thematicConsistencyScore: number | null;
    keywordFrequencyChange: number | null;
    argumentDevelopmentScore: number | null;
    nGramSimilarityScore: number | null;
    tfIdfSimilarityScore: number | null;
    jaccardSimilarityScore: number | null;
    originalityShiftScore: number | null;
}>;
/**
 * Generate feedback metrics by comparing document versions
 * This would typically be called when a teacher provides feedback
 * and we want to analyze how the document changed
 */
/**
 * Generate feedback metrics by analyzing document content and feedback
 */
export declare const generateFeedbackMetrics: (feedbackId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    feedbackId: string;
    sentenceLengthChange: number | null;
    paragraphStructureScore: number | null;
    headingConsistencyScore: number | null;
    lexicalDiversityChange: number | null;
    wordRepetitionScore: number | null;
    formalityShift: number | null;
    readabilityChange: number | null;
    voiceConsistencyScore: number | null;
    perspectiveShift: number | null;
    descriptiveLanguageScore: number | null;
    punctuationChangeScore: number | null;
    grammarPatternScore: number | null;
    spellingVariationScore: number | null;
    thematicConsistencyScore: number | null;
    keywordFrequencyChange: number | null;
    argumentDevelopmentScore: number | null;
    nGramSimilarityScore: number | null;
    tfIdfSimilarityScore: number | null;
    jaccardSimilarityScore: number | null;
    originalityShiftScore: number | null;
} | null>;
