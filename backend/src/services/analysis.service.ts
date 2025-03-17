import { PrismaClient } from '@prisma/client';
import { c } from '../lib/openai';
import { AnalysisResult, DocumentSection, TextMetricsData } from '../types/analysis.types';
import { calculateReadabilityScore, calculateTextMetrics } from '../utils/text-analysis';

const prisma = new PrismaClient();

/**
 * Get analysis by document ID
 */
export const getAnalysisByDocumentId = async (documentId: string) => {
    const analysis = await prisma.aIAnalysis.findUnique({
        where: {
            documentId
        }
    });

    return analysis;
};

/**
 * Get document sections from analysis
 */
export const getDocumentSections = async (documentId: string) => {
    const analysis = await prisma.aIAnalysis.findUnique({
        where: {
            documentId
        },
        include: {
            sections: true
        }
    });

    return analysis?.sections || [];
};

/**
 * Get text metrics for a document
 */
export const getTextMetrics = async (documentId: string) => {
    const analysis = await prisma.aIAnalysis.findUnique({
        where: {
            documentId
        },
        include: {
            textMetrics: true
        }
    });

    return analysis?.textMetrics || null;
};

/**
 * Initiate analysis of a document
 * This function starts the analysis process and returns immediately
 * The actual analysis runs in the background
 */
export const initiateAnalysis = async (document: any) => {
    // Create a new analysis record in processing state
    const analysis = await prisma.aIAnalysis.create({
        data: {
            documentId: document.id,
            overallAiScore: 0,
            humanWrittenPercent: 0,
            aiGeneratedPercent: 0,
            analysisDate: new Date()
        }
    });

    // Run the analysis in the background
    // In a production environment, this would typically be a job queue
    console.log('⌚ Starting analysis for document', document.id);
    await performAnalysis(document, analysis.id).catch(error => {
        console.error(`Analysis failed for document ${document.id}:`, error);
    });
    console.log('⌚ Analysis complete for document', document.id);

    return analysis;
};

/**
 * Perform the actual analysis using OpenAI
 */
const performAnalysis = async (document: any, analysisId: string) => {
    try {
        const documentContent = document.content;

        // Check if document content is empty
        if (!documentContent || documentContent.trim() === '') {
            await updateAnalysisStatus(analysisId, {
                overallAiScore: 0,
                humanWrittenPercent: 100,
                aiGeneratedPercent: 0
            });
            return;
        }

        // 1. First, calculate basic text metrics
        const textMetrics = calculateTextMetrics(documentContent);

        // 2. Split document into sections for analysis
        const sections = splitIntoSections(documentContent);

        // 3. Analyze each section for AI content
        const analyzePromises = sections.map(section => analyzeSection(section.content));
        const sectionResults = await Promise.all(analyzePromises);

        // 4. Calculate overall scores
        const overallAiScore = calculateOverallScore(sectionResults);
        const aiGeneratedPercent = overallAiScore * 100;
        const humanWrittenPercent = 100 - aiGeneratedPercent;

        // 5. Save analysis results to database
        await prisma.$transaction(async (tx) => {
            // Update main analysis record
            await tx.aIAnalysis.update({
                where: { id: analysisId },
                data: {
                    overallAiScore,
                    humanWrittenPercent,
                    aiGeneratedPercent
                }
            });

            // Create text metrics record
            await tx.textMetrics.create({
                data: {
                    aiAnalysisId: analysisId,
                    totalWordCount: textMetrics.totalWordCount,
                    sentenceCount: textMetrics.sentenceCount,
                    averageSentenceLength: textMetrics.averageSentenceLength,
                    readabilityScore: textMetrics.readabilityScore,
                    lexicalDiversity: textMetrics.lexicalDiversity,
                    uniqueWordCount: textMetrics.uniqueWordCount,
                    academicLanguageScore: textMetrics.academicLanguageScore,
                    passiveVoicePercentage: textMetrics.passiveVoicePercentage,
                    firstPersonPercentage: textMetrics.firstPersonPercentage,
                    thirdPersonPercentage: textMetrics.thirdPersonPercentage,
                    punctuationDensity: textMetrics.punctuationDensity,
                    grammarErrorCount: textMetrics.grammarErrorCount,
                    spellingErrorCount: textMetrics.spellingErrorCount,
                    predictabilityScore: textMetrics.predictabilityScore,
                    nGramUniqueness: textMetrics.nGramUniqueness
                }
            });

            // Create section records
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const result = sectionResults[i];

                await tx.documentSection.create({
                    data: {
                        aiAnalysisId: analysisId,
                        startOffset: section.startOffset,
                        endOffset: section.endOffset,
                        content: section.content,
                        isAiGenerated: result.isAiGenerated,
                        aiConfidence: result.confidence,
                        suggestions: result.suggestions
                    }
                });
            }
        });

    } catch (error) {
        console.error(`Analysis failed for document ${document.id}:`, error);
        // Update analysis record with failure status
        await updateAnalysisStatus(analysisId, {
            overallAiScore: 0,
            humanWrittenPercent: 0,
            aiGeneratedPercent: 0
        });
        throw error;
    }
};

/**
 * Update analysis status
 */
const updateAnalysisStatus = async (analysisId: string, data: any) => {
    await prisma.aIAnalysis.update({
        where: { id: analysisId },
        data
    });
};

/**
 * Split document into sections for analysis
 */
const splitIntoSections = (content: string): { startOffset: number; endOffset: number; content: string }[] => {
    // Simple approach: split by paragraphs
    const paragraphs = content.split(/\n\s*\n/);

    const sections = [];
    let currentOffset = 0;

    for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        if (trimmedParagraph) {
            // Find the actual offset in the original text to handle whitespace correctly
            const startOffset = content.indexOf(trimmedParagraph, currentOffset);
            const endOffset = startOffset + trimmedParagraph.length;

            sections.push({
                startOffset,
                endOffset,
                content: trimmedParagraph
            });

            currentOffset = endOffset;
        }
    }

    // If the sections are too small, combine them
    const combinedSections = [];
    let currentSection = null;
    const MAX_SECTION_LENGTH = 1000; // Characters

    for (const section of sections) {
        if (!currentSection) {
            currentSection = { ...section };
        } else if (currentSection.content.length + section.content.length <= MAX_SECTION_LENGTH) {
            // Combine sections if they're small
            currentSection.endOffset = section.endOffset;
            currentSection.content += '\n\n' + section.content;
        } else {
            // Section would be too large, finalize the current one and start a new one
            combinedSections.push(currentSection);
            currentSection = { ...section };
        }
    }

    // Add the last section if it exists
    if (currentSection) {
        combinedSections.push(currentSection);
    }

    return combinedSections;
};

/**
 * Analyze a section of text for AI-generated content using OpenAI
 */
const analyzeSection = async (text: string): Promise<{ isAiGenerated: boolean; confidence: number; suggestions: string }> => {
    try {
        const prompt = `
    You are an AI content detector analyzing the following text for signs of AI generation. Your task is to:
    1. Determine if the text was likely AI-generated or human-written
    2. Assign a confidence score between 0 and 1 (1 = certain AI-generated, 0 = certain human-written)
    3. Provide specific suggestions to make the text appear more human-like if it's detected as AI-generated

    TEXT TO ANALYZE:
    """
    ${text}
    """

    Respond in JSON format with the following structure:
    {
      "isAiGenerated": boolean,
      "confidence": number,
      "analysis": string,
      "suggestions": string
    }
    `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'You are an AI detector assistant that analyzes text to determine if it was AI-generated or human-written.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' }
        });

        const resultText = response.choices[0]?.message?.content || '';

        try {
            const result = JSON.parse(resultText);
            return {
                isAiGenerated: result.isAiGenerated,
                confidence: result.confidence,
                suggestions: result.suggestions
            };
        } catch (jsonError) {
            console.error('Failed to parse AI response as JSON:', jsonError);
            // Fallback response
            return {
                isAiGenerated: false,
                confidence: 0.5,
                suggestions: 'Could not generate suggestions due to processing error.'
            };
        }
    } catch (error) {
        console.error('Error analyzing section with OpenAI:', error);
        // Fallback response
        return {
            isAiGenerated: false,
            confidence: 0.5,
            suggestions: 'Could not analyze text due to processing error.'
        };
    }
};

/**
 * Calculate overall AI score from section results
 */
const calculateOverallScore = (sectionResults: { isAiGenerated: boolean; confidence: number; suggestions: string }[]): number => {
    if (sectionResults.length === 0) {
        return 0;
    }

    // Calculate weighted average based on confidence
    const totalConfidence = sectionResults.reduce((sum, result) => {
        return sum + (result.isAiGenerated ? result.confidence : 1 - result.confidence);
    }, 0);

    return totalConfidence / sectionResults.length;
};