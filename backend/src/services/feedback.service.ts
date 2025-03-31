import { PrismaClient } from '@prisma/client';
import {
    CreateFeedbackData,
    FeedbackMetricsData,
    UpdateFeedbackData
} from '../types/feedback.types';
import { openai } from '../lib/openai';
import { getDocumentById, updateDocument } from './document.service';

const prisma = new PrismaClient();

/**
 * Create feedback for a document
 */
export const createFeedback = async (data: CreateFeedbackData) => {
    // Create the feedback
    const feedback = await prisma.feedback.create({
        data: {
            content: data?.content || "",
            status: data?.status || 'PENDING',
            userId: data.userId,
            documentId: data.documentId,
            groupId: data.groupId
        }
    });

    await generateFeedbackMetrics(feedback.id);

    // Update the feedback id in document
    await updateDocument(data.documentId, { feedbackMetricsId: feedback.id }); 

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
// export const generateFeedbackMetrics = async (feedbackId: string) => {
//     try {
//         await sleep(5000)
//         // Get the feedback
//         const feedback = await prisma.feedback.findUnique({
//             where: { id: feedbackId },
//             include: {
//                 document: true
//             }
//         });

//         if (!feedback || !feedback.document) {
//             return null;
//         }

//         // This is a placeholder for a more complex implementation
//         // In a real system, this would compare the original document
//         // with subsequent versions to generate metrics

//         // For now, we'll create some dummy metrics
//         const dummyMetrics = {
//             sentenceLengthChange: Math.random() * 10 - 5,
//             paragraphStructureScore: Math.random(),
//             headingConsistencyScore: Math.random(),
//             lexicalDiversityChange: Math.random() * 0.2,
//             wordRepetitionScore: Math.random(),
//             formalityShift: Math.random() * 0.4 - 0.2,
//             readabilityChange: Math.random() * 20 - 10,
//             voiceConsistencyScore: Math.random(),
//             perspectiveShift: Math.random() * 0.2 - 0.1,
//             descriptiveLanguageScore: Math.random(),
//             punctuationChangeScore: Math.random() * 0.2 - 0.1,
//             grammarPatternScore: Math.random(),
//             spellingVariationScore: Math.random(),
//             thematicConsistencyScore: Math.random(),
//             keywordFrequencyChange: Math.random() * 0.4 - 0.2,
//             argumentDevelopmentScore: Math.random(),
//             nGramSimilarityScore: Math.random(),
//             tfIdfSimilarityScore: Math.random(),
//             jaccardSimilarityScore: Math.random(),
//             originalityShiftScore: Math.random() * 0.5
//         };

//         // Create the metrics
//         await updateFeedback(feedbackId, { status: "REVIEWED" });

//         const feedbackMetrics = await createFeedbackMetrics(feedbackId, dummyMetrics);
//         await updateFeedback(feedbackId, { status: "ANALYZED" });
//         return feedbackMetrics
//     } catch (error) {
//         console.error(`Error generating feedback metrics for ${feedbackId}:`, error);
//         return null;
//     }
// };



/**
 * Generate feedback metrics by analyzing document content and feedback
 */
export const generateFeedbackMetrics = async (feedbackId: string) => {
    try {
        // Get the feedback
        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        parentDocumentId: true,
                        versionNumber: true
                    }
                }
            }
        });

        if (!feedback || !feedback.document) {
            console.error(`Feedback ${feedbackId} not found or has no document`);
            return null;
        }

        // Update status to show processing
        await updateFeedback(feedbackId, { status: "PENDING" });

        let documentContent = feedback.document.content;
        console.log(`📃 document content:`)
        console.log(documentContent)

        // If this is a newer version, get the parent document to compare
        let previousDocumentContent = "";
        if (feedback.document.parentDocumentId && feedback.document.versionNumber > 1) {
            const parentDocument = await getDocumentById(feedback.document.parentDocumentId);
            if (parentDocument) {
                previousDocumentContent = parentDocument.content;
            }
        }

        // Prepare the payload for OpenAI analysis
        const prompt = {
            role: "system",
            content: `Analyze the following document to generate detailed metrics about writing style, structure, and authenticity. 
            
The metrics should reflect changes between document versions (if available) and the impact of the feedback.

For each metric, provide a specific numerical score between 0 and 1, where appropriate, or percentage changes where measuring differences.

Document Title: ${feedback.document.title}

${previousDocumentContent ? "Previous Document Content: " + previousDocumentContent : ""}
Current Document Content: ${documentContent}

Provide a structured analysis with the following metrics:
1. structuralComparison (sentenceLengthChange, paragraphStructureScore, headingConsistencyScore)
2. vocabularyMetrics (lexicalDiversityChange, wordRepetitionScore, formalityShift)
3. styleMetrics (readabilityChange, voiceConsistencyScore, perspectiveShift, descriptiveLanguageScore)
4. grammarAndMechanics (punctuationChangeScore, grammarPatternScore, spellingVariationScore)
5. topicThematicElements (thematicConsistencyScore, keywordFrequencyChange, argumentDevelopmentScore) 
6. similarityMetrics (nGramSimilarityScore, tfIdfSimilarityScore, jaccardSimilarityScore)
7. aIDetection (originalityShiftScore)

Format the response as a JSON object without explanations, just the metric values.`,
        };

        // Call the OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [prompt as any],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        // Parse the AI response to get the metrics
        const metricsResponse = JSON.parse(response.choices[0].message.content || "{}");
        console.log(`🦶🦶🦶🦶🦶 metricsResponse from ai`)
        console.log(metricsResponse)

        // Map the AI response to our metrics format
        const metrics: FeedbackMetricsData = {
            // Structural Comparison
            sentenceLengthChange: metricsResponse?.structuralComparison?.sentenceLengthChange ?? 0,
            paragraphStructureScore: metricsResponse?.structuralComparison?.paragraphStructureScore ?? 0,
            headingConsistencyScore: metricsResponse?.structuralComparison?.headingConsistencyScore ?? 0,

            // Vocabulary Metrics
            lexicalDiversityChange: metricsResponse?.vocabularyMetrics?.lexicalDiversityChange || 0,
            wordRepetitionScore: metricsResponse?.vocabularyMetrics?.wordRepetitionScore || 0,
            formalityShift: metricsResponse?.vocabularyMetrics?.formalityShift || 0,

            // Style Metrics
            readabilityChange: metricsResponse?.styleMetrics?.readabilityChange || 0,
            voiceConsistencyScore: metricsResponse?.styleMetrics?.voiceConsistencyScore || 0,
            perspectiveShift: metricsResponse?.styleMetrics?.perspectiveShift || 0,
            descriptiveLanguageScore: metricsResponse?.styleMetrics?.descriptiveLanguageScore || 0,

            // Grammar & Mechanics
            punctuationChangeScore: metricsResponse?.grammarAndMechanics?.punctuationChangeScore || 0,
            grammarPatternScore: metricsResponse?.grammarAndMechanics?.grammarPatternScore || 0,
            spellingVariationScore: metricsResponse?.grammarAndMechanics?.spellingVariationScore || 0,

            // Topic & Thematic Elements
            thematicConsistencyScore: metricsResponse?.topicThematicElements?.thematicConsistencyScore || 0,
            keywordFrequencyChange: metricsResponse?.topicThematicElements?.keywordFrequencyChange || 0,
            argumentDevelopmentScore: metricsResponse?.topicThematicElements?.argumentDevelopmentScore || 0,

            // Similarity Metrics
            nGramSimilarityScore: metricsResponse?.similarityMetrics?.nGramSimilarityScore || 0,
            tfIdfSimilarityScore: metricsResponse?.similarityMetrics?.tfIdfSimilarityScore || 0,
            jaccardSimilarityScore: metricsResponse?.similarityMetrics?.jaccardSimilarityScore || 0,

            // AI Detection
            originalityShiftScore: metricsResponse?.aIDetection?.originalityShiftScore || 0,

        };

        // Mark the feedback as reviewed
        await updateFeedback(feedbackId, { status: "REVIEWED" });

        // Create the metrics in the database
        const feedbackMetrics = await createFeedbackMetrics(feedbackId, metrics);

        // Update the feedback status to analyzed
        await updateFeedback(feedbackId, { status: "ANALYZED" });

        return feedbackMetrics;
    } catch (error) {
        console.error(`Error generating feedback metrics for ${feedbackId}:`, error);
        // If there's an error, update the feedback status
        await updateFeedback(feedbackId, { status: "PENDING" });
        return null;
    }
};