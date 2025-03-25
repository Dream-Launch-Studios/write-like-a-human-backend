"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSubmissionFeedback = exports.getSubmissionFeedback = exports.resubmitAssignment = exports.getUserSubmissions = exports.deleteSubmission = exports.updateSubmissionStatus = exports.getSubmissionById = exports.uploadFileToStorage = void 0;
const client_1 = require("@prisma/client");
const supabase_1 = require("../utils/supabase");
const prisma = new client_1.PrismaClient();
/**
 * Upload file to Supabase storage
 */
const uploadFileToStorage = async (fileBuffer, fileName, contentType) => {
    const bucketName = 'submissions';
    const filePath = `${Date.now()}-${fileName}`;
    const { data, error } = await supabase_1.supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
    });
    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    // Get the public URL for the file
    const { data: urlData } = supabase_1.supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
    return urlData.publicUrl;
};
exports.uploadFileToStorage = uploadFileToStorage;
/**
 * Get a submission by ID
 */
/**
 * Get a submission by ID
 */
const getSubmissionById = async (id) => {
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
exports.getSubmissionById = getSubmissionById;
/**
 * Update submission status
 */
const updateSubmissionStatus = async (id, status) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateSubmissionStatus = updateSubmissionStatus;
/**
 * Delete a submission
 */
const deleteSubmission = async (id) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return false;
        }
        throw error;
    }
};
exports.deleteSubmission = deleteSubmission;
/**
 * Get submissions for a user
 */
const getUserSubmissions = async (userId) => {
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
exports.getUserSubmissions = getUserSubmissions;
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
/**
 * Resubmit an assignment (create a new document version and update submission)
 */
const resubmitAssignment = async (data, fileBuffer, fileName, fileType, title) => {
    // Get the current submission
    const submission = await (0, exports.getSubmissionById)(data.submissionId);
    if (!submission) {
        throw new Error(`Submission with ID ${data.submissionId} not found`);
    }
    // Upload file to Supabase storage
    const fileUrl = await (0, exports.uploadFileToStorage)(fileBuffer, fileName, fileType);
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
            parentDocumentId: submission.documentId,
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
exports.resubmitAssignment = resubmitAssignment;
/**
 * Get feedback for a submission
 */
const getSubmissionFeedback = async (submissionId) => {
    var _a;
    // Assuming feedback is stored in the Feedback table with a relation to the submission
    const feedback = await prisma.feedback.findMany({
        where: {
            // This assumes you have a submissionId field in your Feedback model
            // If not, you might need to link through the document
            documentId: {
                equals: (_a = (await prisma.submission.findUnique({
                    where: { id: submissionId },
                    select: { documentId: true }
                }))) === null || _a === void 0 ? void 0 : _a.documentId
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
exports.getSubmissionFeedback = getSubmissionFeedback;
/**
 * Add feedback to a submission
 */
const addSubmissionFeedback = async (data) => {
    // Get the submission
    const submission = await (0, exports.getSubmissionById)(data.submissionId);
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
exports.addSubmissionFeedback = addSubmissionFeedback;
