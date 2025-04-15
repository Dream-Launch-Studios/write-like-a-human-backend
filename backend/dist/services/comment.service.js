"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentById = exports.getDocumentComments = exports.createComment = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create a new comment
 */
const createComment = async (data) => {
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
exports.createComment = createComment;
/**
 * Get comments for a document
 */
const getDocumentComments = async (documentId) => {
    const comments = await prisma.comment.findMany({
        where: {
            documentId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return comments;
};
exports.getDocumentComments = getDocumentComments;
/**
 * Get a comment by ID
 */
const getCommentById = async (id) => {
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
exports.getCommentById = getCommentById;
/**
 * Update a comment
 */
const updateComment = async (id, data) => {
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
    }
    catch (error) {
        // @ts-ignore
        if ((error === null || error === void 0 ? void 0 : error.code) === 'P2025') {
            return null;
        }
        throw error;
    }
};
exports.updateComment = updateComment;
/**
 * Delete a comment
 */
const deleteComment = async (id) => {
    try {
        await prisma.comment.delete({
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
exports.deleteComment = deleteComment;
