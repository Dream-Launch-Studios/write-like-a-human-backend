import { DocumentCreatedWith, PrismaClient, SubmissionStatus } from '@prisma/client';
import {
    CreateAssignmentData,
    UpdateAssignmentData,
    AssignmentWithCreator,
    AssignmentWithDetails,
    SubmissionWithUserAndDocument
} from '../types/assignment.types';
import { supabase } from '../utils/supabase';
import { openai } from '../lib/openai';
import { getAnalyzeDocumentPrompt } from '../utils/prompt';
import { DocumentSection, TextMetricsData } from '../types/analysis.types';
import { AIWordSuggestion } from '../types/word-suggestion.types';
import { FeedbackMetricsVersion2 } from '../controllers/document.controller';

const prisma = new PrismaClient();

/**
 * Upload file to Supabase storage
 */
export const uploadFileToStorage = async (
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> => {
    const bucketName = 'assignments';
    const filePath = `${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
            contentType,
            upsert: false
        });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

/**
 * Create a new assignment
 */
export const createAssignment = async (
    data: CreateAssignmentData,
) => {
    const groupExists = await prisma.group.findUnique({
        where: {
            id: data.groupId
        }
    });

    if (!groupExists) {
        throw new Error(`Group with ID ${data.groupId} not found`);
    }


    const assignment = await prisma.assignment.create({
        data: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            documentUrl: data.documentUrl,
            documentName: data.documentName,
            creatorId: data.creatorId,
            groupId: data.groupId,
            createdWith: data.createdWith,
            fileType: data.mimeType,
            pastedContent: data.pastedContent,
        },
    });

    return assignment;
};

/**
 * Get assignments for a group
 */
export const getGroupAssignments = async (groupId: string): Promise<AssignmentWithCreator[]> => {
    const assignments = await prisma.assignment.findMany({
        where: {
            groupId,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    submissions: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return assignments.map(assignment => ({
        ...assignment,
        submissionCount: assignment._count.submissions,
    }));
};

/**
 * Get an assignment by ID
 */
export const getAssignmentById = async (id: string): Promise<AssignmentWithDetails | null> => {
    const assignment = await prisma.assignment.findUnique({
        where: {
            id,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                },
            },
            group: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return assignment;
};

/**
 * Update an assignment
 */
export const updateAssignment = async (id: string, data: UpdateAssignmentData) => {
    try {
        const updatedAssignment = await prisma.assignment.update({
            where: {
                id,
            },
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                documentUrl: data.documentUrl,
                documentName: data.documentName,
            },
        });

        return updatedAssignment;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Delete an assignment
 */
export const deleteAssignment = async (id: string) => {
    try {
        // First, delete all submissions related to this assignment
        await prisma.submission.deleteMany({
            where: {
                assignmentId: id,
            },
        });

        // Then delete the assignment
        await prisma.assignment.delete({
            where: {
                id,
            },
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
 * Check if a user is a member of a group
 */
export const isUserInGroup = async (userId: string, groupId: string): Promise<boolean> => {
    const membership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId,
            },
        },
    });

    return !!membership;
};

export const submitAssignment = async (
    assignmentId: string,
    userId: string,
    documentId: string,
    content: string
) => {
    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
        where: {
            id: assignmentId,
        },
    });

    if (!assignment) {
        throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    // Check if document exists
    const document = await prisma.document.findUnique({
        where: {
            id: documentId,
        },
    });

    if (!document) {
        throw new Error(`Document with ID ${documentId} not found`);
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
        where: {
            assignmentId,
            userId,
        },
    });

    let parsedResponse: {
        textMetrics: TextMetricsData;
        sections: Omit<DocumentSection, "id" | "aiAnalysisId">[];
        wordSuggestions: AIWordSuggestion[];
        feedbackMetrics: FeedbackMetricsVersion2;
        overallAiScore: number;
        humanWrittenPercent: number;
        aiGeneratedPercent: number;
    };
    try {
        const prompt = getAnalyzeDocumentPrompt({ content })
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                content: prompt,
                role: "system",
            }],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const responseContent = response.choices[0].message.content || "{}";
        parsedResponse = JSON.parse(responseContent);
    } catch (aiError) {
        throw new Error(aiError instanceof Error ? aiError.message : 'Failed to analyze document content')
    }


    // Use a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
        let submission;

        if (existingSubmission) {
            // Update existing submission
            submission = await tx.submission.update({
                where: {
                    id: existingSubmission.id,
                },
                data: {
                    documentId,
                    status: 'DRAFT',
                    submittedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    document: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            fileUrl: true,
                        },
                    },
                },
            });
        } else {
            // Create new submission
            submission = await tx.submission.create({
                data: {
                    documentId,
                    assignmentId,
                    userId,
                    status: 'DRAFT',
                    submittedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    document: {
                        select: {
                            id: true,
                            title: true,
                            fileName: true,
                            fileUrl: true,
                        },
                    },
                },
            });
        }

        // Update the document to include the assignment reference and submission ID
        await tx.document.update({
            where: {
                id: documentId,
            },
            data: {
                assignmentId: assignmentId,
                submissionId: submission.id,
            },
        });


        // 4. Create AI analysis
        const analysis = await tx.aIAnalysis.create({
            data: {
                documentId: document.id,
                overallAiScore: parsedResponse.overallAiScore ?? 0,
                humanWrittenPercent: parsedResponse.humanWrittenPercent ?? 0,
                aiGeneratedPercent: parsedResponse.aiGeneratedPercent ?? 0,
                analysisDate: new Date()
            }
        });

        // 5. Create text metrics
        await tx.textMetrics.create({
            data: {
                aiAnalysisId: analysis.id,
                totalWordCount: parsedResponse.textMetrics.totalWordCount,
                sentenceCount: parsedResponse.textMetrics.sentenceCount,
                averageSentenceLength: parsedResponse.textMetrics.averageSentenceLength,
                readabilityScore: parsedResponse.textMetrics.readabilityScore,
                lexicalDiversity: parsedResponse.textMetrics.lexicalDiversity,
                uniqueWordCount: parsedResponse.textMetrics.uniqueWordCount,
                academicLanguageScore: parsedResponse.textMetrics.academicLanguageScore,
                passiveVoicePercentage: parsedResponse.textMetrics.passiveVoicePercentage,
                firstPersonPercentage: parsedResponse.textMetrics.firstPersonPercentage,
                thirdPersonPercentage: parsedResponse.textMetrics.thirdPersonPercentage,
                punctuationDensity: parsedResponse.textMetrics.punctuationDensity,
                grammarErrorCount: parsedResponse.textMetrics.grammarErrorCount,
                spellingErrorCount: parsedResponse.textMetrics.spellingErrorCount,
                predictabilityScore: parsedResponse.textMetrics.predictabilityScore,
                nGramUniqueness: parsedResponse.textMetrics.nGramUniqueness
            }
        });

        // 6. Create document sections
        if (parsedResponse.sections.length > 0) {
            await Promise.all(parsedResponse.sections.map(section =>
                tx.documentSection.create({
                    data: {
                        aiAnalysisId: analysis.id,
                        startOffset: section.startOffset,
                        endOffset: section.endOffset,
                        content: section.content,
                        isAiGenerated: section.isAiGenerated,
                        aiConfidence: section.aiConfidence,
                        suggestions: section.suggestions
                    }
                })
            ));
        }

        // 7. Create word suggestions
        if (parsedResponse.wordSuggestions.length > 0) {
            await Promise.all(parsedResponse.wordSuggestions.map(suggestion =>
                tx.wordSuggestion.create({
                    data: {
                        originalWord: suggestion.originalWord,
                        suggestedWord: suggestion.suggestedWord,
                        position: suggestion.position,
                        startOffset: suggestion.startOffset,
                        endOffset: suggestion.endOffset,
                        context: suggestion.context,
                        aiConfidence: suggestion.aiConfidence,
                        documentId: document.id,
                        userId,
                        highlighted: true,
                    }
                })
            ));
        }

        // 8. Create feedback
        const feedback = await tx.feedback.create({
            data: {
                content: "",
                status: 'PENDING',
                userId,
                documentId: document.id,
                // groupId: data.groupId
            }
        });

        // 9. Create feedback metrics
        await tx.feedbackMetrics.create({
            data: {
                feedbackId: feedback.id,
                // Structure metrics
                sentenceLengthChange: parsedResponse.feedbackMetrics.structuralComparison.sentenceLengthChange,
                paragraphStructureScore: parsedResponse.feedbackMetrics.structuralComparison.paragraphStructureScore,
                headingConsistencyScore: parsedResponse.feedbackMetrics.structuralComparison.headingConsistencyScore,

                // Vocabulary metrics
                lexicalDiversityChange: parsedResponse.feedbackMetrics.vocabularyMetrics.lexicalDiversityChange,
                wordRepetitionScore: parsedResponse.feedbackMetrics.vocabularyMetrics.wordRepetitionScore,
                formalityShift: parsedResponse.feedbackMetrics.vocabularyMetrics.formalityShift,

                // Style metrics
                readabilityChange: parsedResponse.feedbackMetrics.styleMetrics.readabilityChange,
                voiceConsistencyScore: parsedResponse.feedbackMetrics.styleMetrics.voiceConsistencyScore,
                perspectiveShift: parsedResponse.feedbackMetrics.styleMetrics.perspectiveShift,
                descriptiveLanguageScore: parsedResponse.feedbackMetrics.styleMetrics.descriptiveLanguageScore,

                // Grammar metrics
                punctuationChangeScore: parsedResponse.feedbackMetrics.grammarAndMechanics.punctuationChangeScore,
                grammarPatternScore: parsedResponse.feedbackMetrics.grammarAndMechanics.grammarPatternScore,
                spellingVariationScore: parsedResponse.feedbackMetrics.grammarAndMechanics.spellingVariationScore,

                // Thematic metrics
                thematicConsistencyScore: parsedResponse.feedbackMetrics.topicThematicElements.thematicConsistencyScore,
                keywordFrequencyChange: parsedResponse.feedbackMetrics.topicThematicElements.keywordFrequencyChange,
                argumentDevelopmentScore: parsedResponse.feedbackMetrics.topicThematicElements.argumentDevelopmentScore,

                // Similarity metrics
                nGramSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.nGramSimilarityScore,
                tfIdfSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.tfIdfSimilarityScore,
                jaccardSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.jaccardSimilarityScore,

                // AI detection
                originalityShiftScore: parsedResponse.feedbackMetrics.aIDetection.originalityShiftScore
            }
        });

        // 10. Update feedback status
        await tx.feedback.update({
            where: { id: feedback.id },
            data: { status: "ANALYZED" }
        });

        // 11. Update document with feedback metrics reference
        await tx.document.update({
            where: { id: document.id },
            data: { feedbackMetricsId: feedback.id }
        });


        return submission;
    });
};


/**
 * Get submissions for an assignment
 */
export const getAssignmentSubmissions = async (assignmentId: string) => {
    const submissions = await prisma.submission.findMany({
        where: {
            assignmentId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            document: {
                select: {
                    id: true,
                    title: true,
                    fileName: true,
                    fileUrl: true,
                },
            },
            submissionResult: {
                select: {
                    id: true,
                    documentId: true,
                    status: true,
                    feedback: true,
                    grade: true,
                },
            }
        },
        orderBy: {
            submittedAt: 'desc',
        },
    });

    return submissions;
};

/**
 * Get a submission by ID
 */
export const getSubmissionById = async (id: string): Promise<SubmissionWithUserAndDocument | null> => {
    const submission = await prisma.submission.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            document: {
                select: {
                    id: true,
                    title: true,
                    fileName: true,
                    fileUrl: true,
                },
            },
            assignment: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });

    return submission;
};

/**
 * Update submission status
 */
export const updateSubmissionStatus = async (id: string, status: SubmissionStatus) => {
    try {
        const submission = await prisma.submission.update({
            where: {
                id,
            },
            data: {
                status,
            },
        });

        return submission;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Get submissions for a user
 */
export const getUserSubmissions = async (userId: string) => {
    const submissions = await prisma.submission.findMany({
        where: {
            userId,
        },
        include: {
            assignment: {
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    groupId: true,
                },
            },
            document: {
                select: {
                    id: true,
                    title: true,
                    fileName: true,
                },
            },
        },
        orderBy: {
            submittedAt: 'desc',
        },
    });

    return submissions;
};