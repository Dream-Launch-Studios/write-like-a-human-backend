import { PrismaClient, SubmissionStatus } from '@prisma/client';
import {
    ResubmitAssignmentData,
    SubmissionFeedbackData,
    SubmissionWithDetails
} from '../types/submission.types';
import { supabase } from '../utils/supabase';

const prisma = new PrismaClient();

/**
 * Upload file to Supabase storage
 */
export const uploadFileToStorage = async (
    fileBuffer: Buffer,
    fileName: string,
    contentType: string
): Promise<string> => {
    const bucketName = 'submissions';
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
 * Get a submission by ID
 */
export const getSubmissionById = async (id: string): Promise<SubmissionWithDetails | null> => {
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
                    groupId: true, // Added this line to include groupId
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
                submittedAt: status === 'SUBMITTED' ? new Date() : undefined,
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
 * Delete a submission
 */
export const deleteSubmission = async (id: string) => {
    try {
        // First get the submission to check if it has a document
        const submission = await prisma.submission.findUnique({
            where: {
                id,
            },
            select: {
                documentId: true,
            },
        });

        if (!submission) {
            return false;
        }

        // Delete the submission
        await prisma.submission.delete({
            where: {
                id,
            },
        });

        // Note: You might want to also delete the document and the file in storage
        // But be careful if documents can be referenced by other entities

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
 * Get submissions for a user
 */
export const getUserSubmissionsByAssignmentId = async (userId: string, assignmentId: string) => {
    const submissions = await prisma.submission.findMany({
        where: {
            userId,
            assignmentId
        },
        include: {
            assignment: {
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    groupId: true,
                    group: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
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
        orderBy: {
            createdAt: 'desc',
        },
    });

    return submissions;
};

/**
 * Resubmit an assignment (create a new document version and update submission)
 */
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
export const resubmitAssignment = async (
    data: ResubmitAssignmentData,
    fileBuffer: Buffer,
    fileName: string,
    fileType: string,
    title: string
) => {
    // Get the current submission
    const submission = await getSubmissionById(data.submissionId);

    if (!submission) {
        throw new Error(`Submission with ID ${data.submissionId} not found`);
    }

    // Upload file to Supabase storage
    const fileUrl = await uploadFileToStorage(fileBuffer, fileName, fileType);

    // Create a new document
    const document = await prisma.document.create({
        data: {
            title,
            fileName,
            fileUrl,
            fileType,
            fileSize: fileBuffer.length,
            userId: data.userId,
            groupId: submission.assignment.groupId, // This should now be available
            versionNumber: 1, // This will be updated by a trigger or in another query
        },
    });

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
        where: {
            id: data.submissionId,
        },
        data: {
            documentId: document.id,
            status: 'SUBMITTED',
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
            assignment: {
                select: {
                    id: true,
                    title: true,
                    groupId: true, // Also ensure it's included in the return result
                },
            },
        },
    });

    return updatedSubmission;
};

/**
 * Get feedback for a submission
 */
export const getSubmissionFeedback = async (submissionId: string) => {
    // Assuming feedback is stored in the Feedback table with a relation to the submission
    const feedback = await prisma.feedback.findMany({
        where: {
            // This assumes you have a submissionId field in your Feedback model
            // If not, you might need to link through the document
            documentId: {
                equals: (await prisma.submission.findUnique({
                    where: { id: submissionId },
                    select: { documentId: true }
                }))?.documentId
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return feedback;
};

/**
 * Add feedback to a submission
 */
export const addSubmissionFeedback = async (data: SubmissionFeedbackData) => {
    // Get the submission
    const submission = await getSubmissionById(data.submissionId);

    if (!submission) {
        throw new Error(`Submission with ID ${data.submissionId} not found`);
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
        data: {
            content: data.content,
            status: 'PENDING',
            userId: data.userId,
            documentId: submission.documentId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });

    return feedback;
};


/**
 * Service function to handle final submission of an assignment
 * Updates submission status and creates a submission result
 */
export const finalSubmitAssignment = async (
    submissionId: string,
    documentId: string,
    userId: string,
) => {
    return await prisma.$transaction(async (tx) => {
        // Find the submission
        const submission = await tx.submission.findUnique({
            where: {
                id: submissionId,
            },
            include: {
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        creatorId: true,
                    },
                },
            },
        });

        if (!submission) {
            throw new Error(`Submission with ID ${submissionId} not found`);
        }

        if (submission.userId !== userId) {
            throw new Error('You are not authorized to submit this assignment');
        }

        const document = await tx.document.findUnique({
            where: {
                id: documentId,
                userId,
            },
        });

        if (!document) {
            throw new Error(`Document with ID ${documentId} not found or you don't have access to it`);
        }

        await tx.document.update({
            where: {
                id: documentId,
            },
            data: {
                submissionId: submissionId,
                assignmentId: submission.assignmentId,
            },
        });

        const updatedSubmission = await tx.submission.update({
            where: {
                id: submissionId,
            },
            data: {
                documentId,
                status: 'SUBMITTED',
                submittedAt: new Date(),
            },
        });

        const submissionResult = await tx.submissionResult.create({
            data: {
                submissionId,
                teacherId: submission.assignment.creatorId,
                feedback: '',
                status: 'COMPLETED',
                documentId,
            },
        });

        return {
            submission: updatedSubmission,
            submissionResult,
        };
    });
};


/**
 * Service function to handle teacher evaluation of a submission
 * Updates submission result with feedback and status
 */
export const evaluateSubmission = async (
    submissionResultId: string,
    teacherId: string,
    evaluationData: SubmissionEvaluationData
) => {
    return await prisma.$transaction(async (tx) => {
        const submissionResult = await tx.submissionResult.findUnique({
            where: {
                id: submissionResultId,
            },
            include: {
                submission: {
                    include: {
                        assignment: true,
                        document: true,
                    },
                },
            },
        });

        if (!submissionResult) {
            throw new Error(`Submission result with ID ${submissionResultId} not found`);
        }

        const isAssignmentCreator = submissionResult.submission.assignment.creatorId === teacherId;

        if (!isAssignmentCreator) {
            const isGroupMember = await tx.groupMember.findFirst({
                where: {
                    userId: teacherId,
                    groupId: submissionResult.submission.assignment.groupId,
                },
            });

            if (!isGroupMember) {
                throw new Error('You are not authorized to evaluate this submission');
            }
        }

        const updatedSubmissionResult = await tx.submissionResult.update({
            where: {
                id: submissionResultId,
            },
            data: {
                feedback: evaluationData.feedback,
                grade: evaluationData.grade,
                status: evaluationData.status,
                updatedAt: new Date(),
            },
        });

        if (evaluationData.status === 'COMPLETED') {
            await tx.submission.update({
                where: {
                    id: submissionResult.submissionId,
                },
                data: {
                    status: 'GRADED',
                },
            });
        } else if (evaluationData.status === 'REQUIRES_REVISION') {
            await tx.submission.update({
                where: {
                    id: submissionResult.submissionId,
                },
                data: {
                    status: 'RETURNED',
                },
            });
        }

        return updatedSubmissionResult;
    });
};

export interface SubmissionEvaluationData {
    feedback?: string;
    grade?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REQUIRES_REVISION';
}