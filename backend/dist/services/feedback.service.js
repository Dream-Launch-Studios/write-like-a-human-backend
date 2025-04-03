"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedbackMetrics = exports.createFeedbackMetrics = exports.getFeedbackMetrics = exports.deleteFeedback = exports.updateFeedback = exports.getFeedbackById = exports.getDocumentFeedback = exports.createFeedback = void 0;
const client_1 = require("@prisma/client");
const openai_1 = require("../lib/openai");
const document_service_1 = require("./document.service");
const prisma = new client_1.PrismaClient();
/**
 * Create feedback for a document
 */
const createFeedback = async (data) => {
    // Create the feedback
    const feedback = await prisma.feedback.create({
        data: {
            content: (data === null || data === void 0 ? void 0 : data.content) || "",
            status: (data === null || data === void 0 ? void 0 : data.status) || 'PENDING',
            userId: data.userId,
            documentId: data.documentId,
            groupId: data.groupId
        }
    });
    await (0, exports.generateFeedbackMetrics)(feedback.id);
    // Update the feedback id in document
    await (0, document_service_1.updateDocument)(data.documentId, { feedbackMetricsId: feedback.id });
    return feedback;
};
exports.createFeedback = createFeedback;
/**
 * Get all feedback for a document
 */
const getDocumentFeedback = async (documentId) => {
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
exports.getDocumentFeedback = getDocumentFeedback;
/**
 * Get feedback by ID
 */
const getFeedbackById = async (id) => {
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
exports.getFeedbackById = getFeedbackById;
/**
 * Update feedback
 */
const updateFeedback = async (id, data) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateFeedback = updateFeedback;
/**
 * Delete feedback
 */
const deleteFeedback = async (id) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return false;
        }
        throw error;
    }
};
exports.deleteFeedback = deleteFeedback;
/**
 * Get feedback metrics
 */
const getFeedbackMetrics = async (feedbackId) => {
    const metrics = await prisma.feedbackMetrics.findUnique({
        where: {
            feedbackId
        }
    });
    return metrics;
};
exports.getFeedbackMetrics = getFeedbackMetrics;
/**
 * Create feedback metrics
 */
const createFeedbackMetrics = async (feedbackId, metrics) => {
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
exports.createFeedbackMetrics = createFeedbackMetrics;
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
const generateFeedbackMetrics = async (feedbackId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
        await (0, exports.updateFeedback)(feedbackId, { status: "PENDING" });
        let documentContent = feedback.document.content;
        console.log(`📃 document content:`);
        console.log(documentContent);
        // If this is a newer version, get the parent document to compare
        let previousDocumentContent = "";
        // if (feedback.document.parentDocumentId && feedback.document.versionNumber > 1) {
        //     const parentDocument = await getDocumentById(feedback.document.parentDocumentId);
        //     if (parentDocument) {
        //         previousDocumentContent = parentDocument.content;
        //     }
        // }
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
        const response = await openai_1.openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [prompt],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });
        // Parse the AI response to get the metrics
        const metricsResponse = JSON.parse(response.choices[0].message.content || "{}");
        console.log(`🦶🦶🦶🦶🦶 metricsResponse from ai`);
        console.log(metricsResponse);
        // Map the AI response to our metrics format
        const metrics = {
            // Structural Comparison
            sentenceLengthChange: (_b = (_a = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.structuralComparison) === null || _a === void 0 ? void 0 : _a.sentenceLengthChange) !== null && _b !== void 0 ? _b : 0,
            paragraphStructureScore: (_d = (_c = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.structuralComparison) === null || _c === void 0 ? void 0 : _c.paragraphStructureScore) !== null && _d !== void 0 ? _d : 0,
            headingConsistencyScore: (_f = (_e = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.structuralComparison) === null || _e === void 0 ? void 0 : _e.headingConsistencyScore) !== null && _f !== void 0 ? _f : 0,
            // Vocabulary Metrics
            lexicalDiversityChange: ((_g = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.vocabularyMetrics) === null || _g === void 0 ? void 0 : _g.lexicalDiversityChange) || 0,
            wordRepetitionScore: ((_h = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.vocabularyMetrics) === null || _h === void 0 ? void 0 : _h.wordRepetitionScore) || 0,
            formalityShift: ((_j = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.vocabularyMetrics) === null || _j === void 0 ? void 0 : _j.formalityShift) || 0,
            // Style Metrics
            readabilityChange: ((_k = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.styleMetrics) === null || _k === void 0 ? void 0 : _k.readabilityChange) || 0,
            voiceConsistencyScore: ((_l = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.styleMetrics) === null || _l === void 0 ? void 0 : _l.voiceConsistencyScore) || 0,
            perspectiveShift: ((_m = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.styleMetrics) === null || _m === void 0 ? void 0 : _m.perspectiveShift) || 0,
            descriptiveLanguageScore: ((_o = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.styleMetrics) === null || _o === void 0 ? void 0 : _o.descriptiveLanguageScore) || 0,
            // Grammar & Mechanics
            punctuationChangeScore: ((_p = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.grammarAndMechanics) === null || _p === void 0 ? void 0 : _p.punctuationChangeScore) || 0,
            grammarPatternScore: ((_q = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.grammarAndMechanics) === null || _q === void 0 ? void 0 : _q.grammarPatternScore) || 0,
            spellingVariationScore: ((_r = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.grammarAndMechanics) === null || _r === void 0 ? void 0 : _r.spellingVariationScore) || 0,
            // Topic & Thematic Elements
            thematicConsistencyScore: ((_s = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.topicThematicElements) === null || _s === void 0 ? void 0 : _s.thematicConsistencyScore) || 0,
            keywordFrequencyChange: ((_t = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.topicThematicElements) === null || _t === void 0 ? void 0 : _t.keywordFrequencyChange) || 0,
            argumentDevelopmentScore: ((_u = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.topicThematicElements) === null || _u === void 0 ? void 0 : _u.argumentDevelopmentScore) || 0,
            // Similarity Metrics
            nGramSimilarityScore: ((_v = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.similarityMetrics) === null || _v === void 0 ? void 0 : _v.nGramSimilarityScore) || 0,
            tfIdfSimilarityScore: ((_w = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.similarityMetrics) === null || _w === void 0 ? void 0 : _w.tfIdfSimilarityScore) || 0,
            jaccardSimilarityScore: ((_x = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.similarityMetrics) === null || _x === void 0 ? void 0 : _x.jaccardSimilarityScore) || 0,
            // AI Detection
            originalityShiftScore: ((_y = metricsResponse === null || metricsResponse === void 0 ? void 0 : metricsResponse.aIDetection) === null || _y === void 0 ? void 0 : _y.originalityShiftScore) || 0,
        };
        // Mark the feedback as reviewed
        await (0, exports.updateFeedback)(feedbackId, { status: "REVIEWED" });
        // Create the metrics in the database
        const feedbackMetrics = await (0, exports.createFeedbackMetrics)(feedbackId, metrics);
        // Update the feedback status to analyzed
        await (0, exports.updateFeedback)(feedbackId, { status: "ANALYZED" });
        return feedbackMetrics;
    }
    catch (error) {
        console.error(`Error generating feedback metrics for ${feedbackId}:`, error);
        // If there's an error, update the feedback status
        await (0, exports.updateFeedback)(feedbackId, { status: "PENDING" });
        return null;
    }
};
exports.generateFeedbackMetrics = generateFeedbackMetrics;
