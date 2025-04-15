"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSubmissions = exports.updateSubmissionStatus = exports.getSubmissionById = exports.getAssignmentSubmissions = exports.submitAssignment = exports.isUserInGroup = exports.deleteAssignment = exports.updateAssignment = exports.getAssignmentById = exports.getGroupAssignments = exports.createAssignment = exports.uploadFileToStorage = void 0;
const client_1 = require("@prisma/client");
const supabase_1 = require("../utils/supabase");
const prisma = new client_1.PrismaClient();
/**
 * Upload file to Supabase storage
 */
const uploadFileToStorage = async (fileBuffer, fileName, contentType) => {
    const bucketName = 'assignments';
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
 * Create a new assignment
 */
const createAssignment = async (data) => {
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
exports.createAssignment = createAssignment;
/**
 * Get assignments for a group
 */
const getGroupAssignments = async (groupId) => {
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
    return assignments.map(assignment => (Object.assign(Object.assign({}, assignment), { submissionCount: assignment._count.submissions })));
};
exports.getGroupAssignments = getGroupAssignments;
/**
 * Get an assignment by ID
 */
const getAssignmentById = async (id) => {
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
exports.getAssignmentById = getAssignmentById;
/**
 * Update an assignment
 */
const updateAssignment = async (id, data) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateAssignment = updateAssignment;
/**
 * Delete an assignment
 */
const deleteAssignment = async (id) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return false;
        }
        throw error;
    }
};
exports.deleteAssignment = deleteAssignment;
/**
 * Check if a user is a member of a group
 */
const isUserInGroup = async (userId, groupId) => {
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
exports.isUserInGroup = isUserInGroup;
const submitAssignment = async (assignmentId, userId, documentId) => {
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
        }
        else {
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
                submissionId: submission.id, // Set the primary submission ID
            },
        });
        return submission;
    });
};
exports.submitAssignment = submitAssignment;
/**
 * Get submissions for an assignment
 */
const getAssignmentSubmissions = async (assignmentId) => {
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
exports.getAssignmentSubmissions = getAssignmentSubmissions;
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
exports.getUserSubmissions = getUserSubmissions;
