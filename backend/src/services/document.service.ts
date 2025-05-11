import { PrismaClient } from '@prisma/client';
import {
    DocumentFilter,
    CreateDocumentData,
    UpdateDocumentData,
    CreateVersionData
} from '../types/document.types';
import { openai } from '../lib/openai';
import { getAnalyzeDocumentPrompt } from '../utils/prompt';
import { DocumentSection, TextMetricsData } from '../types/analysis.types';
import { AIWordSuggestion } from '../types/word-suggestion.types';
import { FeedbackMetricsVersion2 } from '../controllers/document.controller';

const prisma = new PrismaClient();


/**
 * Create a new document
 */
export const createDocument = async (data: CreateDocumentData) => {
    return await prisma.$transaction(async (tx) => {
        const document = await tx.document.create({
            data: {
                title: data.title,
                content: data.content,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileSize: data.fileSize,
                userId: data.userId,
                groupId: data.groupId,
                versionNumber: 1,
                createdWith: data.createdWith,
                isLatest: true,
                contentFormat: data.contentFormat

            }
        });

        await tx.document.update({
            where: { id: document.id },
            data: {
                rootDocumentId: document.id
            }
        })

        await tx.documentVersion.create({
            data: {
                rootDocumentId: document.id,
                versionedDocId: document.id,
                versionNumber: 1,
            }
        })

        return document;
    })
};

/**
 * List documents with pagination and filtering
 */
export const listDocuments = async ({
    userId,
    page = 1,
    limit = 10,
    groupId,
    search
}: DocumentFilter) => {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {
        OR: [
            { userId },
            groupId ? { groupId } : {}
        ],
        isLatest: true // Only show latest versions
    };


    if (search && search.trim() !== '') {
        where.title = {
            contains: search,
            mode: 'insensitive'
        };
    }

    // Get documents with pagination
    const documents = await prisma.document.findMany({
        where,
        select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            userId: true,
            groupId: true,
            versionNumber: true,
            isLatest: true,
            createdAt: true,
            rootDocumentId: true,
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            group: groupId ? {
                select: {
                    id: true,
                    name: true
                }
            } : false
        },
        skip,
        take: limit,
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Get total count for pagination
    const total = await prisma.document.count({ where });

    // Calculate pagination info
    const pagination = {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
    };

    return { documents, pagination };
};

/**
 * Get a document by ID with user and group information
 */
export const getDocumentById = async (id: string) => {
    console.log(`id is ${id} 🩸🩸🩸🩸🩸`);
    const document = await prisma.document.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            group: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return document;
};

/**
 * Update a document
 */
export const updateDocument = async (id: string, data: UpdateDocumentData) => {
    const document = await prisma.document.update({
        where: { id },
        data
    });

    return document;
};



/**
 * Helper function to delete a single document with no version handling
 */
const deleteDocumentById = async (id: string) => {
    await prisma.$transaction([
        // Delete any word suggestions
        prisma.wordSuggestion.deleteMany({
            where: { documentId: id }
        }),

        // Delete any comments
        prisma.comment.deleteMany({
            where: { documentId: id }
        }),

        // Delete any feedback
        prisma.feedback.deleteMany({
            where: { documentId: id }
        }),

        // Delete any AI analysis and related data
        prisma.documentSection.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: id
                }
            }
        }),

        prisma.textMetrics.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: id
                }
            }
        }),

        prisma.aIAnalysis.deleteMany({
            where: { documentId: id }
        }),

        // Delete submissions
        prisma.submission.deleteMany({
            where: { documentId: id }
        }),

        // Finally, delete the document
        prisma.document.delete({
            where: { id }
        })
    ]);

    return true;
};

export const deleteDocument = async (id: string) => {
    // First, find the root document ID
    const documentVersion = await prisma.documentVersion.findFirst({
        where: {
            OR: [
                { rootDocumentId: id },
                { versionedDocId: id }
            ]
        }
    });

    if (!documentVersion) {
        // If no version entry exists, just delete the document
        return await deleteDocumentById(id);
    }

    // Get the root document ID
    const rootDocumentId = documentVersion.rootDocumentId;

    // Get all versions of this document
    const allVersions = await prisma.documentVersion.findMany({
        where: { rootDocumentId },
        select: { versionedDocId: true }
    });

    const versionIds = allVersions.map(v => v.versionedDocId);

    // Use a transaction to delete all related data
    await prisma.$transaction([
        // Delete any word suggestions
        prisma.wordSuggestion.deleteMany({
            where: { documentId: { in: versionIds } }
        }),

        // Delete any comments
        prisma.comment.deleteMany({
            where: { documentId: { in: versionIds } }
        }),

        // Delete any feedback
        prisma.feedback.deleteMany({
            where: { documentId: { in: versionIds } }
        }),

        // Delete any AI analysis and related data
        prisma.documentSection.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: { in: versionIds }
                }
            }
        }),

        prisma.textMetrics.deleteMany({
            where: {
                aiAnalysis: {
                    documentId: { in: versionIds }
                }
            }
        }),

        prisma.aIAnalysis.deleteMany({
            where: { documentId: { in: versionIds } }
        }),

        // Delete submissions
        prisma.submission.deleteMany({
            where: { documentId: { in: versionIds } }
        }),

        // Delete all version mappings
        prisma.documentVersion.deleteMany({
            where: { rootDocumentId }
        }),

        // Finally, delete all document versions
        prisma.document.deleteMany({
            where: { id: { in: versionIds } }
        })
    ]);

    return true;
};



/**
 * Create a new version of a document
 */
export const createDocumentVersion = async (data: CreateVersionData) => {
    // First, find the version entry for the document being versioned
    const versionEntry = await prisma.documentVersion.findFirst({
        where: { versionedDocId: data.parentDocumentId }
    });

    if (!versionEntry) {
        throw new Error('Document not found or not properly versioned');
    }

    // Get the root document ID
    const rootDocumentId = versionEntry.rootDocumentId;

    // Find the highest version number for this root document
    const highestVersion = await prisma.documentVersion.findFirst({
        where: { rootDocumentId },
        orderBy: { versionNumber: 'desc' }
    });

    if (!highestVersion) {
        throw new Error('Could not determine version number');
    }

    const nextVersionNumber = highestVersion.versionNumber + 1;

    const prompt = getAnalyzeDocumentPrompt({ content: data.content })

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
        throw new Error(aiError instanceof Error ? aiError.message : 'Failed to analyze document content with ai')
    }



    return await prisma.$transaction(async (tx) => {
        // Set all existing versions to non-latest
        await tx.document.updateMany({
            where: {
                id: {
                    in: (await tx.documentVersion.findMany({
                        where: { rootDocumentId },
                        select: { versionedDocId: true }
                    })).map(v => v.versionedDocId)
                }
            },
            data: {
                isLatest: false
            }
        });

        // Build the document data conditionally
        let documentData: any = {
            title: `${data.title} - version ${nextVersionNumber} `,
            content: data.content,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
            userId: data.userId,
            versionNumber: nextVersionNumber,
            isLatest: true,
            rootDocumentId
        };

        // Add groupId only if it exists
        if (data.groupId) {
            documentData.groupId = data.groupId;
        }

        // If submissionId is provided, process submission-related data
        if (data.submissionId) {
            // Get the submission details
            const submission = await tx.submission.findUnique({
                where: { id: data.submissionId },
                select: { assignmentId: true }
            });

            if (!submission) {
                throw new Error(`Submission with ID ${data.submissionId} not found`);
            }

            // Add the direct submissionId field
            documentData.submissionId = data.submissionId;

            // Add assignmentId if it exists
            if (submission.assignmentId) {
                documentData.assignmentId = submission.assignmentId;
            }

            // Add the relationship through submissions relation
            documentData.submissions = {
                connect: [{ id: data.submissionId }]
            };
        }

        // Create the new document version
        const newVersion = await tx.document.create({
            data: documentData
        });

        // Create the document version record
        await tx.documentVersion.create({
            data: {
                rootDocumentId,
                versionedDocId: newVersion.id,
                versionNumber: nextVersionNumber
            }
        });

        // create analysis
        const analysis = await tx.aIAnalysis.create({
            data: {
                documentId: newVersion.id,
                overallAiScore: parsedResponse.overallAiScore ?? 0,
                humanWrittenPercent: parsedResponse.humanWrittenPercent ?? 0,
                aiGeneratedPercent: parsedResponse.aiGeneratedPercent ?? 0,
                analysisDate: new Date()
            }
        });

        // create text metrics
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

        // create document sections
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

        // create word suggestions
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
                        documentId: newVersion.id,
                        userId: data.userId,
                        highlighted: true,
                    }
                })
            ));
        }

        // create feedback
        const feedback = await tx.feedback.create({
            data: {
                content: "",
                status: 'PENDING',
                userId: data.userId,
                documentId: newVersion.id,
                // groupId: data.groupId
            }
        });


        // create feedback metrics
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

        // update document with feedback metrics reference
        await tx.document.update({
            where: { id: newVersion.id },
            data: { feedbackMetricsId: feedback.id }
        });

        // 10. Update feedback status
        await tx.feedback.update({
            where: { id: feedback.id },
            data: { status: "ANALYZED" }
        });


        return newVersion;
    }, {
        maxWait: 20000, // 20s max wait time
        timeout: 120000 // 120s timeout
    });
};


/**
 * Get all versions of a document
 */
export const getDocumentVersions = async (documentId: string) => {
    // Find the root document ID for this document
    const versionEntry = await prisma.documentVersion.findFirst({
        where: {
            OR: [
                { rootDocumentId: documentId },
                { versionedDocId: documentId }
            ]
        }
    });

    if (!versionEntry) {
        throw new Error('Document not found or not properly versioned');
    }

    const rootDocumentId = versionEntry.rootDocumentId;

    // Get all versions for this root document
    const allVersionEntries = await prisma.documentVersion.findMany({
        where: { rootDocumentId },
        include: {
            versionedDoc: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    userId: true,
                    isLatest: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            versionNumber: 'desc'
        }
    });

    // Format the version data
    return allVersionEntries.map(entry => ({
        id: entry.versionedDoc.id,
        title: entry.versionedDoc.title,
        versionNumber: entry.versionNumber,
        isLatest: entry.versionedDoc.isLatest,
        createdAt: entry.versionedDoc.createdAt,
        userId: entry.versionedDoc.userId,
        user: entry.versionedDoc.user
    }));
};



/**
 * Check if a user is a member of a group
 */
export const isUserInGroup = async (userId: string, groupId: string) => {
    // Check if group exists
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });

    if (!group) {
        return false;
    }

    // If user is the admin of the group, they're a member
    if (group.adminId === userId) {
        return true;
    }

    // Check for group membership
    const membership = await prisma.groupMember.findUnique({
        where: {
            userId_groupId: {
                userId,
                groupId
            }
        }
    });

    return !!membership;
};