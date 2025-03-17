import { PrismaClient } from '@prisma/client';
import { CreateCommentData, UpdateCommentData } from '../types/comment.types';

const prisma = new PrismaClient();

/**
 * Create a new comment
 */
export const createComment = async (data: CreateCommentData) => {
    // First, check if the document exists
    const documentExists = await prisma.document.findUnique({
        where: {
            id: data.documentId
        }
    });

    if (!documentExists) {
        throw new Error(`Document with ID ${data.documentId} not found`);
    }

    // If feedbackId is provided, check if it exists
    if (data.feedbackId) {
        const feedbackExists = await prisma.feedback.findUnique({
            where: {
                id: data.feedbackId
            }
        });

        if (!feedbackExists) {
            throw new Error(`Feedback with ID ${data.feedbackId} not found`);
        }
    }

    // Create the comment after validation
    const comment = await prisma.comment.create({
        data: {
            content: data.content,
            userId: data.userId,
            documentId: data.documentId,
            feedbackId: data.feedbackId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return comment;
};


/**
 * Get comments for a document
 */
export const getDocumentComments = async (documentId: string) => {
    const comments = await prisma.comment.findMany({
        where: {
            documentId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return comments;
};

/**
 * Get a comment by ID
 */
export const getCommentById = async (id: string) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return comment;
};

/**
 * Update a comment
 */
export const updateComment = async (id: string, data: UpdateCommentData) => {
    try {
        const comment = await prisma.comment.update({
            where: {
                id,
            },
            data: {
                content: data.content,
            },
        });

        return comment;
    } catch (error) {
        // @ts-ignore
        if (error?.code === 'P2025') {
            return null;
        }
        throw error;
    }
};

/**
 * Delete a comment
 */
export const deleteComment = async (id: string) => {
    try {
        await prisma.comment.delete({
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