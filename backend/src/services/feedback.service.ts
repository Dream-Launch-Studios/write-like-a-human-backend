import { PrismaClient, FeedbackStatus } from '@prisma/client';
import {
    CreateFeedbackData,
    UpdateFeedbackData
} from '../types/feedback.types';

const prisma = new PrismaClient();

/**
 * Create feedback for a document
 */
export const createFeedback = async (data: CreateFeedbackData) => {
    // Create the feedback
    const feedback = await prisma.feedback.create({
        data: {
            content: data.content,
            status: data.status || 'PENDING',
            userId: data.userId,
            documentId: data.documentId,
            groupId: data.groupId
        }
    });

    return feedback;
};

/**
 * Get all feedback for a document
 */
export const getDocumentFeedback = async (documentId: string) => {
    const feedback = await prisma.feedback.findMany({
        where: {
            documentId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return feedback;
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (id: string) => {
    const feedback = await prisma.feedback.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            },
            document: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    });

    return feedback;
};

/**
 * Update feedback
 */
export const updateFeedback = async (id: string, data: UpdateFeedbackData) => {
    try {
        const updatedFeedback = await prisma.feedback.update({
            where: { id },
            data: {
                content: data.content,
                status: data.status,
                response: data.response
            }
        });

        return updatedFeedback;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Delete feedback
 */
export const deleteFeedback = async (id: string) => {
    try {
        // First delete any related feedback metrics
        await prisma.feedbackMetrics.deleteMany({
            where: { feedbackId: id }
        });

        // Then delete the feedback
        await prisma.feedback.delete({
            where: { id }
        });

        return true;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return false;
        }
        throw error;
    }
};

/**
 * Get feedback metrics
 */
export const getFeedbackMetrics = async (feedbackId: string) => {
    const metrics = await prisma.feedbackMetrics.findUnique({
        where: {
            feedbackId
        }
    });

    return metrics;
};

/**
 * Create feedback metrics
 */
export const createFeedbackMetrics = async (
    feedbackId: string,
    metrics: any
) => {
    const feedbackMetrics = await prisma.feedbackMetrics.create({
        data: {
            feedbackId,
            // Structure metrics
            sentenceLengthChange: metrics.sentenceLengthChange,
            paragraphStructureScore: metrics.paragraphStructureScore,
            headingConsistencyScore: metrics.headingConsistencyScore,

            // Vocabulary metrics
            lexicalDiversityChange: metrics.lexicalDiversityChange,
            wordRepetitionScore: metrics.wordRepetitionScore,
            formalityShift: metrics.formalityShift,

            // Style metrics
            readabilityChange: metrics.readabilityChange,
            voiceConsistencyScore: metrics.voiceConsistencyScore,
            perspectiveShift: metrics.perspectiveShift,
            descriptiveLanguageScore: metrics.descriptiveLanguageScore,

            // Grammar metrics
            punctuationChangeScore: metrics.punctuationChangeScore,
            grammarPatternScore: metrics.grammarPatternScore,
            spellingVariationScore: metrics.spellingVariationScore,

            // Thematic metrics
            thematicConsistencyScore: metrics.thematicConsistencyScore,
            keywordFrequencyChange: metrics.keywordFrequencyChange,
            argumentDevelopmentScore: metrics.argumentDevelopmentScore,

            // Similarity metrics
            nGramSimilarityScore: metrics.nGramSimilarityScore,
            tfIdfSimilarityScore: metrics.tfIdfSimilarityScore,
            jaccardSimilarityScore: metrics.jaccardSimilarityScore,

            // AI detection
            originalityShiftScore: metrics.originalityShiftScore
        }
    });

    return feedbackMetrics;
};

/**
 * Generate feedback metrics by comparing document versions
 * This would typically be called when a teacher provides feedback
 * and we want to analyze how the document changed
 */
export const generateFeedbackMetrics = async (feedbackId: string) => {
    try {
        // Get the feedback
        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                document: true
            }
        });

        if (!feedback || !feedback.document) {
            return null;
        }

        // This is a placeholder for a more complex implementation
        // In a real system, this would compare the original document
        // with subsequent versions to generate metrics

        // For now, we'll create some dummy metrics
        const dummyMetrics = {
            sentenceLengthChange: Math.random() * 10 - 5,
            paragraphStructureScore: Math.random(),
            headingConsistencyScore: Math.random(),
            lexicalDiversityChange: Math.random() * 0.2,
            wordRepetitionScore: Math.random(),
            formalityShift: Math.random() * 0.4 - 0.2,
            readabilityChange: Math.random() * 20 - 10,
            voiceConsistencyScore: Math.random(),
            perspectiveShift: Math.random() * 0.2 - 0.1,
            descriptiveLanguageScore: Math.random(),
            punctuationChangeScore: Math.random() * 0.2 - 0.1,
            grammarPatternScore: Math.random(),
            spellingVariationScore: Math.random(),
            thematicConsistencyScore: Math.random(),
            keywordFrequencyChange: Math.random() * 0.4 - 0.2,
            argumentDevelopmentScore: Math.random(),
            nGramSimilarityScore: Math.random(),
            tfIdfSimilarityScore: Math.random(),
            jaccardSimilarityScore: Math.random(),
            originalityShiftScore: Math.random() * 0.5
        };

        // Create the metrics
        return await createFeedbackMetrics(feedbackId, dummyMetrics);
    } catch (error) {
        console.error(`Error generating feedback metrics for ${feedbackId}:`, error);
        return null;
    }
};