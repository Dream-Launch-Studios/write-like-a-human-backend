import { DocumentCreatedWith, PrismaClient, SubmissionStatus } from '@prisma/client';
import {
    CreateAssignmentData,
    UpdateAssignmentData,
    AssignmentWithCreator,
    AssignmentWithDetails,
    SubmissionWithUserAndDocument
} from '../types/assignment.types';
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

/**
 * Submit an assignment
 */
export const submitAssignment = async (
    assignmentId: string,
    userId: string,
    documentId: string,
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

    if (existingSubmission) {
        // Update existing submission
        const updatedSubmission = await prisma.submission.update({
            where: {
                id: existingSubmission.id,
            },
            data: {
                documentId,
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
            },
        });

        return updatedSubmission;
    } else {
        // Create new submission
        const submission = await prisma.submission.create({
            data: {
                documentId,
                assignmentId,
                userId,
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
            },
        });

        return submission;
    }
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